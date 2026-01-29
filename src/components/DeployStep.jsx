import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const InfoCard = ({ label, value, subtext, icon }) => (
    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center space-x-3">
        <div className="p-2 bg-white/5 rounded-lg">
            {typeof icon === 'string' ? (
                <span className="material-icons text-gray-400 text-lg">{icon}</span>
            ) : (
                icon
            )}
        </div>
        <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</div>
            <div className="text-sm font-bold text-white">{value}</div>
            {subtext && <div className="text-[10px] text-gray-400">{subtext}</div>}
        </div>
    </div>
);

const DeployStep = ({
    workspace,
    selectedProvider,
    onBack,
    onUpdateWorkspace,
    onDeploySuccess
}) => {
    const provider = selectedProvider;
    const { costEstimation, infraSpec } = workspace?.state_json || {};
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [connectionData, setConnectionData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [awsSetup, setAwsSetup] = useState({
        url: '',
        externalId: '',
        accountId: '',
        roleArn: ''
    });

    const pollInterval = React.useRef(null);

    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    // Listen for popup success message
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'CLOUD_AUTH_SUCCESS' && event.data.workspaceId === workspace.id) {
                toast.success("Authentication successful!");
                onUpdateWorkspace(); // Trigger parent refresh
                checkConnectionStatus(); // Immediate local check
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [workspace.id, onUpdateWorkspace]);

    const checkConnectionStatus = async () => {
        if (!workspace?.id) return;
        try {
            const res = await axios.get(`${API_BASE}/api/workspaces/${workspace.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const wsState = res.data.state_json || {};
            const conn = wsState.connection;

            if (conn && conn.provider && conn.provider.toLowerCase() === provider.toLowerCase()) {
                if (conn.status === 'connected') {
                    setConnectionStatus('connected');
                    setConnectionData(conn);
                    if (pollInterval.current) clearInterval(pollInterval.current);
                } else if (conn.status === 'pending') {
                    setConnectionStatus('pending');
                }
            }
        } catch (err) {
            console.error("Failed to check status", err);
        }
    };

    const startPolling = () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
        pollInterval.current = setInterval(checkConnectionStatus, 3000);
    };

    useEffect(() => {
        const savedConnection = workspace?.state_json?.connection;
        if (savedConnection && savedConnection.status === 'connected') {
            setConnectionStatus('connected');
            setConnectionData(savedConnection);
        } else {
            // Check query params for manual return
            const params = new URLSearchParams(window.location.search);
            if (params.get('connection') === 'success') {
                setConnectionStatus('connected');
                // Clean up URL to keep it "proper"
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [workspace, provider]);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const payload = {
                workspace_id: workspace.id
            };

            const res = await axios.post(`${API_BASE}/api/cloud/${provider.toLowerCase()}/connect`, payload, { headers });

            if (provider === 'aws') {
                // AWS doesn't redirect, it shows a link + input
                setAwsSetup({
                    url: res.data.url,
                    externalId: res.data.extra.externalId,
                    accountId: res.data.extra.accountId,
                    roleArn: ''
                });
                toast.success("AWS setup link generated. Please create the role in your AWS console.");
            } else if (res.data.url) {
                // Open in new window/tab as requested
                // remove noopener to allow communication back to parent
                window.open(res.data.url, 'CloudAuth', 'width=600,height=700');
                toast.success(`Opening ${provider.toUpperCase()} Authorization in a new tab...`);
                startPolling();
            } else {
                toast.error("Failed to generate connection URL");
            }
        } catch (err) {
            console.error("Connect Error:", err);
            toast.error("Failed to initiate connection");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAwsVerify = async () => {
        if (!awsSetup.accountId) {
            toast.error("Please enter your AWS Account ID");
            return;
        }

        const roleArn = `arn:aws:iam::${awsSetup.accountId}:role/CloudiverseAccessRole-${awsSetup.externalId}`;
        console.log("Verifying ARN:", roleArn);

        await performVerification({
            role_arn: roleArn,
            external_id: awsSetup.externalId,
            account_id: awsSetup.accountId
        });
    };

    const handleManualVerify = async () => {
        // For AWS, we need the form data, so we stick to the specific handler if it's AWS
        if (provider === 'aws') {
            handleAwsVerify();
        } else {
            // GCP/Azure just need workspace context, handled in performVerification
            await performVerification({});
        }
    };

    const performVerification = async (extraMetadata = {}) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const payload = {
                workspace_id: workspace.id,
                ...extraMetadata
            };

            // Call the NEW generic verification endpoint
            const res = await axios.post(`${API_BASE}/api/cloud/${provider.toLowerCase()}/verify`, payload, { headers });

            setConnectionStatus('connected');
            setConnectionData(res.data.connection);
            toast.success(`${provider.toUpperCase()} Connection Verified!`);

            if (onUpdateWorkspace) {
                onUpdateWorkspace({
                    ...workspace,
                    state_json: {
                        ...workspace.state_json,
                        connection: res.data.connection
                    }
                });
            }
        } catch (err) {
            console.error("Verification Error:", err);
            const msg = err.response?.data?.msg || err.response?.data?.error || "Verification failed";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const getProviderIcon = (p) => {
        if (p === 'aws') return <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" className="w-5 h-5 grayscale opacity-70" alt="AWS" />;
        if (p === 'gcp') return <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" className="w-5 h-5" alt="GCP" />;
        if (p === 'azure') return <img src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg" className="w-5 h-5" alt="Azure" />;
        return "cloud";
    };

    return (
        <div className="animate-fade-in w-full pb-20">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {connectionStatus === 'connected' ? 'Resource Deployment' : 'Cloud Connection'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {connectionStatus === 'connected'
                            ? `Your ${provider.toUpperCase()} account is connected. Review and launch your infrastructure.`
                            : `Connecting your ${provider.toUpperCase()} environment for secure deployment.`}
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition flex items-center gap-2"
                >
                    <span className="material-icons text-sm">arrow_back</span>
                    <span>Back</span>
                </button>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* SECTION 1: Review (Read-Only) */}
                <div className="bg-surface-light border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <span className="material-icons text-blue-400">analytics</span>
                        </div>
                        Deployment Configuration
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoCard
                            label="Target Provider"
                            value={provider.toUpperCase()}
                            icon={getProviderIcon(provider)}
                            subtext="Selected from Cost Estimation"
                        />
                        <InfoCard
                            label="Estimated Monthly Cost"
                            value={(() => {
                                const target = costEstimation?.rankings?.find(r => r.provider?.toLowerCase() === provider.toLowerCase());
                                return target?.formatted_cost || (target?.monthly_cost ? `$${target.monthly_cost.toFixed(2)}` : 'N/A');
                            })()}
                            subtext="Optimized Profile"
                            icon="payments"
                        />
                        <InfoCard
                            label="Deployment Region"
                            value={provider === 'gcp' ? 'Asia (Mumbai)' : provider === 'azure' ? 'Central India' : 'ap-south-1'}
                            subtext="Fixed (Compliance Locked)"
                            icon="public"
                        />
                        <InfoCard
                            label="Architecture Stack"
                            value={`${infraSpec?.modules?.length || 0} Cloud Services`}
                            subtext={infraSpec?.architecture_pattern?.replace(/_/g, ' ') || 'Web Application'}
                            icon="layers"
                        />
                    </div>
                </div>

                {/* SECTION 2: Connection / Action Area */}
                <div className={`bg-surface-light border ${connectionStatus === 'connected' ? 'border-green-500/20 shadow-green-500/5' : 'border-blue-500/20 shadow-blue-500/5'} rounded-2xl p-8 relative overflow-hidden transition-all duration-500 shadow-2xl`}>

                    {/* Animated Background Pulse */}
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-1000 ${connectionStatus === 'connected' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}></div>

                    {connectionStatus === 'connected' ? (
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                                <div className="w-24 h-24 bg-green-500/10 border border-green-500/30 rounded-3xl flex items-center justify-center flex-shrink-0 rotate-3 shadow-inner">
                                    <span className="material-icons text-5xl text-green-400">verified_user</span>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h2 className="text-2xl font-bold text-white mb-2">Account Verified</h2>
                                    <p className="text-gray-400 mb-4 max-w-md">
                                        Your <span className="text-white font-bold">{provider.toUpperCase()}</span> account (<span className="text-blue-400 font-mono italic">{connectionData?.account_id || 'active-session'}</span>) is ready for deployment.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30 uppercase tracking-tighter">Connection Active</span>
                                        <span className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-bold rounded-full border border-white/10 uppercase tracking-tighter" title="Enforced to India region">Region Validated</span>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={() => {
                                            toast.success("Initiating deployment pipeline...");
                                            if (onDeploySuccess) onDeploySuccess();
                                        }}
                                        className="w-full px-10 py-5 bg-gradient-to-r from-primary to-primary-hover text-black font-black rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                                    >
                                        <span>DEPLOY RESOURCES</span>
                                        <span className="material-icons group-hover:translate-x-1 transition-transform">rocket_launch</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 relative z-10">
                            <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <span className="material-icons text-4xl text-blue-400">cloud_done</span>
                            </div>
                            {awsSetup.url ? (
                                <div className="space-y-6 animate-slide-up">
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left">
                                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                            <span className="material-icons text-sm">info</span>
                                            Step 1: Create IAM Role (Quick Create)
                                        </h4>
                                        <p className="text-xs text-gray-400 mb-4">
                                            Click the button below to open the AWS Console. It will create a cross-account role with safe permissions for Cloudiverse.
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={awsSetup.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => {
                                                    toast.success("Opening CloudFormation Quick Create...");
                                                    startPolling();
                                                }}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors w-fit"
                                            >
                                                <span className="material-icons text-xs">open_in_new</span>
                                                Launch CloudFormation Stack
                                            </a>
                                            <div className="text-[10px] text-gray-500">
                                                * You will be redirected to AWS Console. Click "Create stack" on the review page.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-left space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Step 2: Enter Your AWS Account ID
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-icons text-gray-500 text-sm">badge</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={awsSetup.accountId || ''}
                                                onChange={(e) => setAwsSetup(prev => ({ ...prev, accountId: e.target.value }))}
                                                placeholder="e.g. 123456789012"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500">
                                            We need this to construct the Role ARN (`arn:aws:iam::YOUR_ID:role/cloudiverse-deploy-role`).
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleAwsVerify}
                                        disabled={isLoading || !awsSetup.accountId}
                                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${isLoading || !awsSetup.accountId
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Verifying...
                                            </span>
                                        ) : (
                                            "Verify & Connect"
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-white mb-3">Connect your {provider.toUpperCase()} Account</h2>
                                    <div className="bg-white/5 rounded-2xl p-5 mb-10 text-left border border-white/5 max-w-lg mx-auto">
                                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="material-icons text-xs">verified</span>
                                            Authorization Guide
                                        </h4>
                                        <ul className="space-y-4">
                                            <li className="flex items-start gap-4">
                                                <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-xs font-bold text-blue-400">1</span>
                                                </div>
                                                <p className="text-sm text-gray-400 leading-snug">Click the button below to open the official portal in a new tab.</p>
                                            </li>
                                            <li className="flex items-start gap-4">
                                                <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-xs font-bold text-blue-400">2</span>
                                                </div>
                                                <p className="text-sm text-gray-400 leading-snug">Sign in and grant permissions. You don't need to copy any codes.</p>
                                            </li>
                                            <li className="flex items-start gap-4">
                                                <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-xs font-bold text-blue-400">3</span>
                                                </div>
                                                <p className="text-sm text-gray-400 leading-snug">Once authorized, <strong>come back to this tab</strong> or wait for the new tab to refetch your status.</p>
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={handleConnect}
                                        disabled={isLoading}
                                        className="px-12 py-5 bg-white text-black hover:bg-gray-100 rounded-2xl font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 mx-auto"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                                <span>PREPARING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="uppercase tracking-widest text-sm">Authorize {provider.toUpperCase()} Connection</span>
                                                <span className="material-icons text-sm">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {/* Manual Verify / Fallback Button for ALL Providers */}
                            <div className="mt-8 flex flex-col items-center">
                                {connectionStatus === 'pending' && (
                                    <div className="mb-4 text-amber-400 text-sm font-bold flex items-center gap-2 animate-pulse">
                                        <span className="material-icons text-sm">hourglass_empty</span>
                                        Verification Pending...
                                    </div>
                                )}

                                <button
                                    onClick={handleManualVerify}
                                    disabled={isLoading}
                                    className="text-xs text-gray-500 hover:text-white underline underline-offset-4 transition-colors flex items-center gap-2"
                                >
                                    <span className={`material-icons text-sm ${isLoading ? 'animate-spin' : ''}`}>
                                        {isLoading ? 'sync' : 'refresh'}
                                    </span>
                                    {isLoading ? 'Verifying...' : 'Verify Connection Manually'}
                                </button>
                                <p className="text-[10px] text-gray-600 mt-2">
                                    Click if auto-verification takes too long.
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-8 opacity-50">
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                    <span className="material-icons text-xs">lock</span>
                                    256-bit Encryption
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                    <span className="material-icons text-xs">shield</span>
                                    SOC2 Compliant flow
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeployStep;
