import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import GitHubRepoSelector from './GitHubRepoSelector';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const DeployResourcesStep = ({
    workspace,
    selectedProvider,
    onBack,
    onUpdateWorkspace
}) => {
    const provider = selectedProvider || 'aws';
    const { costEstimation, infraSpec, infra_outputs } = workspace?.state_json || {};
    const region = workspace?.state_json?.region || infraSpec?.region?.resolved_region || 'Unknown';

    // Connection State
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Source Configuration
    const [sourceType, setSourceType] = useState('github'); // 'github' | 'docker'

    // GitHub Form
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [repoUrl, setRepoUrl] = useState('');
    const [branch, setBranch] = useState('main');
    const [branches, setBranches] = useState([{ name: 'main' }]);
    const [isFetchingBranches, setIsFetchingBranches] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [buildType, setBuildType] = useState('static'); // static, node, react
    const [buildCommand, setBuildCommand] = useState('npm run build');
    const [outputDir, setOutputDir] = useState('dist');

    // Docker Form
    const [dockerImage, setDockerImage] = useState('');
    const [containerPort, setContainerPort] = useState('80');
    const [envVars, setEnvVars] = useState('');

    // Deployment State
    const [deployJobId, setDeployJobId] = useState(null);
    const [deployStatus, setDeployStatus] = useState('idle'); // idle, running, success, failed
    const [deployStage, setDeployStage] = useState('init');
    const [logs, setLogs] = useState([]);

    const logEndRef = useRef(null);
    const pollInterval = useRef(null);

    // ─── VALIDATION LOGIC ─────────────────────────────────────────────────────────
    const isFormValid = () => {
        if (sourceType === 'github') {
            const hasUrl = selectedRepo?.html_url || (repoUrl?.startsWith('https://github.com/'));
            return hasUrl && branch?.length > 0;
        } else if (sourceType === 'docker') {
            return dockerImage?.length > 0 && !dockerImage.includes(' ');
        }
        return false;
    };

    // ─── CONNECTION LOGIC ─────────────────────────────────────────────────────────

    useEffect(() => {
        checkConnectionStatus();
        return () => stopPolling();
    }, [workspace.id]);

    const checkConnectionStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/workspaces/${workspace.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const conn = res.data.state_json?.connection;
            if (conn && conn.provider?.toLowerCase() === provider.toLowerCase() && conn.status === 'connected') {
                setConnectionStatus('connected');
            }
        } catch (err) {
            console.error("Status check failed", err);
        }
    };

    // Fetch branches when repo is selected
    useEffect(() => {
        if (selectedRepo) {
            fetchBranches(selectedRepo);
        }
    }, [selectedRepo]);

    const fetchBranches = async (repo) => {
        if (!repo) return;
        try {
            setIsFetchingBranches(true);
            const token = localStorage.getItem('token');
            // Support both nested owner.login (API) and potential flat structure or full_name
            const owner = repo.owner?.login || repo.owner || repo.full_name?.split('/')[0];
            const name = repo.name || repo.full_name?.split('/')[1];

            if (!owner || !name) {
                console.error("Incomplete repo data:", repo);
                return;
            }

            const res = await axios.get(`${API_BASE}/api/github/branches/${owner}/${name}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBranches(res.data);
            if (res.data.length > 0) {
                // Default to main or master if available
                const defaultBranch = res.data.find(b => b.name === 'main' || b.name === 'master') || res.data[0];
                setBranch(defaultBranch.name);
                detectConfig(repo, defaultBranch.name);
            }
        } catch (err) {
            console.error("Failed to fetch branches", err);
            toast.error("Failed to fetch repository branches");
        } finally {
            setIsFetchingBranches(false);
        }
    };

    const detectConfig = async (repo, branchName) => {
        if (!repo || !branchName) return;
        try {
            setIsDetecting(true);
            const token = localStorage.getItem('token');
            const owner = repo.owner?.login || repo.owner || repo.full_name?.split('/')[0];
            const name = repo.name || repo.full_name?.split('/')[1];

            if (!owner || !name) return;

            const res = await axios.get(`${API_BASE}/api/github/detect/${owner}/${name}?branch=${branchName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const config = res.data;
            if (config.buildCommand) setBuildCommand(config.buildCommand);
            if (config.type) setBuildType(config.type);
            if (config.outputDir) setOutputDir(config.outputDir);
            if (config.dockerfilePath) setDockerImage(config.dockerfilePath); // Actually for Docker sourceType
            if (config.port) setContainerPort(config.port.toString());

            toast.success("Build configuration detected!");
        } catch (err) {
            console.error("Detection failed:", err);
            // Non-critical: User can still type manually
        } finally {
            setIsDetecting(false);
        }
    };

    const stopPolling = () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
    };

    // ─── DEPLOYMENT ACTION ───────────────────────────────────────────────────────

    const handleDeploySubmit = async () => {
        if (!isFormValid()) return;

        try {
            setDeployStatus('running');
            setDeployStage('init');
            setLogs([]);

            const config = sourceType === 'github' ? {
                repo: selectedRepo?.html_url || repoUrl,
                branch,
                build_type: buildType,
                build_command: buildCommand,
                output_dir: outputDir
            } : {
                image: dockerImage,
                port: containerPort,
                env: envVars
            };

            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/deploy`, {
                workspace_id: workspace.id,
                source: sourceType,
                config
            }, { headers: { Authorization: `Bearer ${token}` } });

            const jobId = res.data.deploymentId;
            setDeployJobId(jobId);
            toast.success("Application deployment started!");

            startPollingDeployment(jobId);

        } catch (err) {
            console.error(err);
            setDeployStatus('failed');
            toast.error(err.response?.data?.error || "Deployment failed to start");
        }
    };

    const startPollingDeployment = (jobId) => {
        if (pollInterval.current) clearInterval(pollInterval.current);

        pollInterval.current = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/deploy/${jobId}/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const job = res.data;
                setDeployStage(job.status);
                setLogs(job.logs || []);

                if (job.status === 'success') {
                    setDeployStatus('success');
                    clearInterval(pollInterval.current);
                    toast.success("Application Deployed Successfully!");
                } else if (job.status === 'failed') {
                    setDeployStatus('failed');
                    clearInterval(pollInterval.current);
                    toast.error("Deployment Failed");
                }

            } catch (err) {
                console.error("Poll Error:", err);
            }
        }, 2000);
    };

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);


    // ─── RENDER ──────────────────────────────────────────────────────────────────

    return (
        <div className="animate-fade-in w-full pb-20 relative">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Deploy Application
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Deploy your code to the provisioned infrastructure.
                    </p>
                </div>
                <button onClick={onBack} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition flex items-center gap-2">
                    <span className="material-icons text-sm">arrow_back</span>
                    <span>Back</span>
                </button>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">

                {/* 🔍 INFRA SUMMARY BLOCK */}
                <div className="bg-surface border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-icons text-9xl">dns</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                        <div>
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Provider</div>
                            <div className="text-white font-bold text-lg">{provider.toUpperCase()}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Region</div>
                            <div className="text-white font-bold text-lg">{region}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cluster / App</div>
                            <div className="text-white font-bold text-lg truncate" title={infra_outputs?.computecontainer?.cluster_name || 'N/A'}>
                                {infra_outputs?.computecontainer?.cluster_name || infra_outputs?.computecontainer?.service_name || 'Provisioned'}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Status</div>
                            <div className="text-green-400 font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Ready to Deploy
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📝 DEPLOYMENT FORM (INLINE) */}
                {deployStatus === 'idle' && (
                    <div className="bg-[#1e212b] border border-white/10 rounded-2xl p-8 shadow-xl">
                        {/* Source Tabs */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => setSourceType('github')}
                                className={`flex-1 py-4 rounded-xl border transition-all flex items-center justify-center gap-3 text-lg font-bold ${sourceType === 'github' ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'}`}
                            >
                                <span className="material-icons">code</span> GitHub Repository
                            </button>
                            <button
                                onClick={() => setSourceType('docker')}
                                className={`flex-1 py-4 rounded-xl border transition-all flex items-center justify-center gap-3 text-lg font-bold ${sourceType === 'docker' ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/10' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'}`}
                            >
                                <span className="material-icons">layers</span> Docker Image
                            </button>
                        </div>

                        {/* GitHub Inputs */}
                        {sourceType === 'github' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold mb-3 block">GitHub Repository</label>
                                    <GitHubRepoSelector
                                        selectedRepo={selectedRepo}
                                        onSelect={(repo) => {
                                            setSelectedRepo(repo);
                                            setRepoUrl(''); // Clear manual URL if any
                                        }}
                                    />
                                </div>

                                {selectedRepo && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-down">
                                        <div>
                                            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Select Branch</label>
                                            <div className="relative">
                                                <select
                                                    value={branch}
                                                    onChange={(e) => {
                                                        const b = e.target.value;
                                                        setBranch(b);
                                                        detectConfig(selectedRepo, b);
                                                    }}
                                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer pr-10"
                                                    disabled={isFetchingBranches || isDetecting}
                                                >
                                                    {isFetchingBranches ? (
                                                        <option>Loading branches...</option>
                                                    ) : (
                                                        branches.map(b => (
                                                            <option key={b.name} value={b.name} className="bg-gray-900">{b.name}</option>
                                                        ))
                                                    )}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center gap-2">
                                                    {(isFetchingBranches || isDetecting) && <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />}
                                                    <span className="material-icons">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block flex items-center justify-between">
                                                Build Command
                                                {isDetecting && <span className="text-[10px] text-blue-400 animate-pulse font-normal lowercase">Detecting optimal settings...</span>}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={buildCommand}
                                                    onChange={e => setBuildCommand(e.target.value)}
                                                    placeholder="npm run build"
                                                    className={`w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors ${isDetecting ? 'opacity-50' : ''}`}
                                                />
                                                {isDetecting && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Docker Inputs */}
                        {sourceType === 'docker' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Docker Image <span className="text-red-400">*</span></label>
                                    <input type="text" value={dockerImage} onChange={e => setDockerImage(e.target.value)} placeholder="e.g. nginx:latest, myrepo/app:v1" className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Container Port</label>
                                    <input type="text" value={containerPort} onChange={e => setContainerPort(e.target.value)} placeholder="80" className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors" />
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                            <button
                                onClick={handleDeploySubmit}
                                disabled={!isFormValid()}
                                className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${isFormValid()
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02]'
                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                            >
                                <span className="material-icons">rocket_launch</span>
                                {isFormValid() ? 'Deploy Application' : 'Enter Details to Deploy'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 🚀 EXECUTION CONSOLE (Replaces Form when running) */}
                {deployStatus !== 'idle' && (
                    <div className="bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                        <div className="bg-[#1a1d26] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-icons text-gray-400">terminal</span>
                                <span className="font-mono font-bold text-gray-300">Deployment Logs</span>
                                {deployStatus === 'running' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></span>}
                            </div>
                            {deployStatus === 'failed' && (
                                <button onClick={() => setDeployStatus('idle')} className="text-red-400 text-xs hover:underline flex items-center gap-1">
                                    <span className="material-icons text-sm">refresh</span> Try Again
                                </button>
                            )}
                        </div>
                        <div className="p-6 h-[400px] overflow-y-auto font-mono text-xs space-y-2 bg-black/40">
                            {logs.map((log, idx) => (
                                <div key={idx} className="text-gray-300 border-l-2 border-transparent pl-3 hover:bg-white/5 py-1">
                                    <span className="text-gray-600 mr-3 inline-block w-[80px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span dangerouslySetInnerHTML={{ __html: log.message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-400 underline">$1</a>') }}></span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>
                )}

                {/* 🔴 FAILED STATE UI */}
                {deployStatus === 'failed' && (() => {
                    const lastLog = logs[logs.length - 1]?.message || '';
                    const errorDetails = ((logMsg) => {
                        if (logMsg.includes('INVALID_REPO_URL')) return {
                            reason: 'Invalid GitHub repository URL or inaccessible repository.',
                            fixes: ['Check if the repository is private and requires a token', 'Verify the URL starts with https://github.com/', 'Ensure the branch exists']
                        };
                        return {
                            reason: lastLog.replace('❌ Deployment Failed:', '').trim() || 'An unexpected error occurred.',
                            fixes: ['Check the deployment logs for more details', 'Retry the deployment']
                        };
                    })(logs.find(l => l.message.includes('❌'))?.message || lastLog);

                    return (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center animate-fade-in mt-6">
                            <h3 className="text-2xl font-bold text-red-500 mb-2">❌ Deployment Failed</h3>
                            <p className="text-gray-400 mb-4">{errorDetails.reason}</p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setDeployStatus('idle')} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                                    <span className="material-icons">refresh</span> Retry
                                </button>
                            </div>
                        </div>
                    );
                })()}

                {/* 🟢 SUCCESS STATE UI */}
                {deployStatus === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center animate-fade-in mt-6">
                        <div className="inline-block p-4 bg-green-500/20 rounded-full mb-4">
                            <span className="material-icons text-4xl text-green-400">check_circle</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">Deployed Successfully!</h3>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Your application is now live. It may take a few minutes for DNS to propagate globally.</p>

                        <a
                            href={logs.find(l => l.message?.includes('http'))?.message?.split(' ').pop()}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-green-500/20 hover:scale-105 transition-all text-lg"
                        >
                            Visit Live Website <span className="material-icons">open_in_new</span>
                        </a>

                        <div className="mt-6 text-sm text-gray-500 hover:text-gray-400 cursor-pointer" onClick={() => setDeployStatus('idle')}>
                            Deploy Another Version
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DeployResourcesStep;
