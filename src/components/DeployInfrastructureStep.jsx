import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const DeployInfrastructureStep = ({
    workspaceId,
    selectedProvider,
    onComplete,
    onBack,
    userPlan = 'free', // Accept user plan from parent
    savedState = {},   // Accept persisted provisioning state
    onUpdateWorkspace  // Callback to persist state
}) => {
    // ─── STATE ───────────────────────────────────────────────────────────────────
    const [deployStatus, setDeployStatus] = useState('idle'); // idle, running, success, failed
    const [destroyStatus, setDestroyStatus] = useState('idle'); // idle, running, success, failed
    const [logs, setLogs] = useState([]);
    const [deployJobId, setDeployJobId] = useState(null);
    const [showDestroyConfirm, setShowDestroyConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const logEndRef = useRef(null);
    const pollingRef = useRef(null); // 🔥 Track active polling interval
    const isPro = userPlan === 'pro' || userPlan === 'enterprise';

    // ─── HYDRATE STATE ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (savedState && Object.keys(savedState).length > 0) {
            console.log("[DEPLOY] Hydrating state:", savedState);

            if (savedState.deployStatus) setDeployStatus(savedState.deployStatus);
            if (savedState.destroyStatus) setDestroyStatus(savedState.destroyStatus);
            if (savedState.logs) setLogs(savedState.logs);

            if (savedState.deployJobId) {
                setDeployJobId(savedState.deployJobId);

                // Resume polling if needed, but only if not already polling
                if (!pollingRef.current) {
                    if (savedState.deployStatus === 'running') {
                        console.log("[DEPLOY] Resuming deployment polling...");
                        startPollingDeployment(savedState.deployJobId);
                    } else if (savedState.destroyStatus === 'running') {
                        console.log("[DEPLOY] Resuming destroy polling...");
                        startPollingDestroy(savedState.deployJobId);
                    }
                }
            }
        }
    }, [savedState]); // 🔥 Depend on savedState to catch updates from parent async load

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    // Helper to persist state
    const persistState = (updates) => {
        if (onUpdateWorkspace) {
            onUpdateWorkspace(updates);
        }
    };

    // ─── PROVISIONING LOGIC ──────────────────────────────────────────────────────

    const handleProvision = async () => {
        try {
            setDeployStatus('running');
            setLogs([]);
            persistState({ deployStatus: 'running', logs: [] });

            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/workflow/deploy/terraform`, {
                workspace_id: workspaceId,
                provider: selectedProvider
            }, { headers: { Authorization: `Bearer ${token}` } });

            const jobId = res.data.jobId;
            setDeployJobId(jobId);
            toast.success("Provisioning started...");

            persistState({ deployJobId: jobId, deployStatus: 'running' });
            startPollingDeployment(jobId);

        } catch (err) {
            console.error("Provisioning error:", err);
            setDeployStatus('failed');
            persistState({ deployStatus: 'failed' });

            const errorMsg = err.response?.data?.error || err.response?.data?.msg || "Failed to start provisioning";
            const errorDetails = err.response?.data?.details ? ` - ${err.response.data.details}` : "";
            toast.error(errorMsg + errorDetails);
        }
    };

    const startPollingDeployment = (jobId) => {
        // Clear existing interval if any
        if (pollingRef.current) clearInterval(pollingRef.current);

        pollingRef.current = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/workflow/deploy/${jobId}/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const job = res.data;
                setLogs(job.logs || []);

                // Only persist logs occasionally or on completion to avoid spamming saves if logs are huge?
                // For now, let's persist status updates. Ideally we debit logs saving.

                if (job.status === 'completed') {
                    setDeployStatus('success');
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    persistState({ deployStatus: 'success', logs: job.logs });
                    toast.success("Infrastructure Ready");
                } else if (job.status === 'failed') {
                    setDeployStatus('failed');
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    persistState({ deployStatus: 'failed', logs: job.logs });
                    toast.error("Provisioning Failed");
                } else {
                    // Still running, maybe update logs in UI but limit persistence rate?
                    // For simplicity, let's not persist logs every 2s to DB, only on completion/fail or manual save.
                    // But if user reloads, they lose logs? 
                    // Let's persist logs every poll for correctness as requested.
                    persistState({ logs: job.logs });
                }
            } catch (err) {
                console.error("Poll Error:", err);
            }
        }, 2000);
    };

    // ─── DESTROY LOGIC ────────────────────────────────────────────────────────────

    const handleDestroy = async () => {
        try {
            setDestroyStatus('running');
            setShowDestroyConfirm(false);
            setLogs([]);
            persistState({ destroyStatus: 'running', logs: [] });

            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/workflow/deploy/terraform/destroy`, {
                workspace_id: workspaceId,
                provider: selectedProvider
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.upgradeRequired) {
                toast.error('Upgrade to Pro to access Destroy Infrastructure');
                setDestroyStatus('idle');
                persistState({ destroyStatus: 'idle' });
                return;
            }

            const jobId = res.data.jobId;
            setDeployJobId(jobId); // Re-use ID for tracking
            toast.success("Destroy operation started...");

            persistState({ deployJobId: jobId, destroyStatus: 'running' });
            startPollingDestroy(jobId);

        } catch (err) {
            console.error("Destroy error:", err);
            setDestroyStatus('failed');
            persistState({ destroyStatus: 'failed' });

            if (err.response?.data?.upgradeRequired) {
                toast.error('Upgrade to Pro to access Destroy Infrastructure');
            } else {
                toast.error(err.response?.data?.error || "Failed to start destroy");
            }
        }
    };

    const startPollingDestroy = (jobId) => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        pollingRef.current = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/workflow/deploy/${jobId}/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const job = res.data;
                setLogs(job.logs || []);

                if (job.status === 'completed') {
                    setDestroyStatus('success');
                    setDeployStatus('idle'); // Reset deploy status
                    setLogs([]); // 🔥 Clear logs to show clean state for new provisioning
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    persistState({ destroyStatus: 'success', deployStatus: 'idle', logs: [] });
                    toast.success("Infrastructure Destroyed");
                } else if (job.status === 'failed') {
                    setDestroyStatus('failed');
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    persistState({ destroyStatus: 'failed', logs: job.logs });
                    toast.error("Destroy Failed");
                } else {
                    persistState({ logs: job.logs });
                }
            } catch (err) {
                console.error("Poll Error:", err);
            }
        }, 2000);
    };

    // Auto-scroll logs extracted to a separate component or disabled to allow manual scrolling
    // useEffect(() => {
    //     if (logEndRef.current) {
    //         logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [logs]);

    // ─── RENDER ──────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fade-in space-y-8">

            {/* PROGRESS STEPPER */}
            <div className="flex items-center justify-between px-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Provision Infrastructure</h2>
                    <p className="text-text-secondary text-sm">Create the actual cloud resources.</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-secondary/10 border-secondary/20 text-secondary opacity-50">
                        <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-[10px] text-black font-bold">✓</span>
                        Connect Cloud
                    </div>
                    <div className="w-8 h-[2px] bg-secondary/50"></div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${deployStatus === 'success' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                        <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-[10px] text-background font-bold">2</span>
                        Provision
                    </div>
                </div>
            </div>

            {/* Provisioning Card */}
            <div className="card bg-surface border-border">
                <div className="card-header flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deployStatus !== 'idle' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-subtle'}`}>
                            <span className="material-icons text-sm">cloud_upload</span>
                        </div>
                        <h3 className="font-semibold text-text-primary">Infrastructure Provisioning</h3>
                    </div>
                    {/* Status Logic */}
                    <div className="flex gap-2">
                        {deployStatus === 'idle' && <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">Ready to Deploy</span>}
                        {deployStatus === 'running' && <span className="badge badge-primary animate-pulse">Running</span>}
                        {deployStatus === 'success' && <span className="badge badge-success">Completed</span>}
                        {deployStatus === 'failed' && <span className="badge badge-danger">Failed</span>}
                    </div>
                </div>

                <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-text-secondary max-w-lg">
                            Apply the generated Terraform configuration to create the necessary resources in your {selectedProvider} account.
                        </p>

                        {deployStatus === 'idle' && (
                            <button
                                onClick={handleProvision}
                                className="btn-primary px-6 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            >
                                Start Provisioning
                            </button>
                        )}

                        {deployStatus === 'failed' && (
                            <button
                                onClick={handleProvision}
                                className="btn-danger px-6 py-2.5 shadow-lg"
                            >
                                Retry Provisioning
                            </button>
                        )}
                    </div>

                    {/* Logs Area */}
                    {(deployStatus !== 'idle' || logs.length > 0) && (
                        <div className="bg-background rounded-lg border border-border overflow-hidden shadow-inner">
                            <div className="px-4 py-2 bg-surface/50 border-b border-border flex justify-between items-center">
                                <span className="text-xs font-mono text-text-secondary flex items-center gap-2">
                                    <span className="material-icons text-[10px]">terminal</span>
                                    Terraform Output
                                </span>
                            </div>
                            <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1">
                                {logs.length === 0 && (
                                    <div className="text-text-subtle italic text-center py-10 opacity-50">Initializing Terraform runner...</div>
                                )}
                                {logs.map((log, i) => (
                                    <div key={i} className="text-text-secondary border-l-2 border-transparent pl-2 hover:bg-surface/50">
                                        <span className="text-text-subtle mr-2 select-none opacity-50">&gt;</span>{log.message}
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    )}

                    {/* Created Services Summary (Success Only) */}
                    {deployStatus === 'success' && (
                        <div className="mt-6 space-y-4 animate-fade-in mb-6">
                            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
                                <h4 className="font-semibold text-secondary flex items-center gap-2 mb-3">
                                    <span className="material-icons text-lg">check_circle</span>
                                    Successfully Created Resources
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {logs
                                        .filter(log => log.message && log.message.includes('Initializing modules...'))
                                        .length > 0 ? (
                                        logs
                                            .filter(log => log.message && log.message.match(/^- \w+ in modules/))
                                            .map((log, i) => {
                                                const match = log.message.match(/^- (\w+) in modules/);
                                                const serviceName = match ? match[1].replace(/_/g, ' ') : 'Resource';
                                                return (
                                                    <div key={i} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-border">
                                                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                                        <span className="text-sm text-text-primary capitalize">{serviceName}</span>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div className="col-span-full text-sm text-text-secondary">
                                            Infrastructure resources created. Check logs for details.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Destroy Button (Visible for Success AND Failed) */}
                    {(deployStatus === 'success' || deployStatus === 'failed') && (
                        <div className="mt-4 p-4 border border-border rounded-lg bg-surface/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="font-medium text-text-primary flex items-center gap-2">
                                        <span className="material-icons text-lg text-red-500">delete_forever</span>
                                        Destroy Infrastructure
                                    </h5>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Remove all deployed resources (clean up failure or teardown)
                                    </p>
                                </div>
                                {isPro ? (
                                    <button
                                        onClick={() => { setShowDestroyConfirm(true); setConfirmText(''); }}
                                        disabled={destroyStatus === 'running'}
                                        className="px-4 py-2 text-sm flex items-center gap-2 rounded-md border border-red-500 text-red-500 transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600"
                                    >
                                        {destroyStatus === 'running' ? (
                                            <>
                                                <span className="animate-spin material-icons text-sm">refresh</span>
                                                Destroying...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-icons text-sm">delete</span>
                                                Destroy
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-subtle bg-primary/10 text-primary px-2 py-1 rounded">
                                            Pro Only
                                        </span>
                                        <button
                                            onClick={() => window.location.href = '/pricing'}
                                            className="btn-primary btn-sm text-xs"
                                        >
                                            Upgrade
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {deployStatus === 'success' && (
                        <div className="flex justify-end mt-6">
                            <button onClick={onComplete} className="btn-success btn-lg flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                Continue to Application <span className="material-icons">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Destroy Dialog */}
            {showDestroyConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-surface rounded-xl p-6 max-w-md mx-4 shadow-2xl border border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-icons text-3xl text-red-500">warning</span>
                            <h3 className="text-lg font-semibold text-text-primary">Confirm Destroy</h3>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-text-secondary mb-2">
                                To confirm, type <strong>DELETE</strong> below:
                            </label>
                            <input
                                type="text"
                                className="w-full bg-background border border-border rounded p-2 text-text-primary focus:border-red-500 focus:outline-none"
                                placeholder="DELETE"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDestroyConfirm(false)}
                                className="btn-secondary px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDestroy}
                                disabled={confirmText !== 'DELETE'}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Yes, Destroy Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-start">
                <button onClick={onBack} className="text-text-secondary hover:text-text-primary text-sm flex items-center gap-2">
                    <span className="material-icons text-sm">arrow_back</span> Back to Connection
                </button>
            </div>

        </div>
    );
};

export default DeployInfrastructureStep;
