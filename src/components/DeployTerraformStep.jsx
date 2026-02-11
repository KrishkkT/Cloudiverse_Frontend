import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const DeployTerraformStep = ({
    workspaceId,
    infraSpec,
    selectedProvider,
    setConnection,
    onComplete,
    onBack,
    onResetWorkspace
}) => {
    // ─── STATE ───────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);

    // Connection State
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [connectionData, setConnectionData] = useState(null);
    const [awsSetup, setAwsSetup] = useState({ url: '', externalId: '', accountId: '' });
    const [azureTenantId, setAzureTenantId] = useState('');
    const [showAzureAdvanced, setShowAzureAdvanced] = useState(false);

    // AWS Manual Verification State
    const [awsAccountId, setAwsAccountId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Saved Connection State
    const [savedConnection, setSavedConnection] = useState(null);
    const [isApplyingSaved, setIsApplyingSaved] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const pollInterval = useRef(null);
    const hasInitialized = useRef(false);

    // Reset refs and check status on mount/navigation
    useEffect(() => {
        // Reset initialization flag when component mounts (navigation)
        hasInitialized.current = false;

        if (workspaceId && selectedProvider) {
            console.log('[DeployTerraformStep] Component mounted, checking for saved connection...');
            checkForSavedConnection();
        }
        return () => stopPolling();
    }, [workspaceId, selectedProvider]);

    // ─── CHECK FOR SAVED USER CONNECTION ──────────────────────────────────────────

    const checkForSavedConnection = async () => {
        try {
            const token = localStorage.getItem('token');
            const providerKey = selectedProvider?.toLowerCase() || 'aws';

            // First check if workspace already has connection
            const wsRes = await axios.get(`${API_BASE}/workspaces/${workspaceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const existingConn = wsRes.data.state_json?.connection;

            if (existingConn?.status === 'connected' && existingConn.provider?.toLowerCase() === providerKey) {
                console.log('[DeployTerraformStep] Workspace already connected with matching provider');
                setConnectionStatus('connected');
                setConnectionData(existingConn);
                if (setConnection) setConnection(existingConn);
                setLoading(false);
                ensureTerraformGenerated();
                return;
            } else if (existingConn?.status === 'connected') {
                console.log('[DeployTerraformStep] Workspace connected to different provider:', existingConn.provider);
            }

            // Check for saved user-level connection
            const savedRes = await axios.get(`${API_BASE}/cloud/connections/${providerKey}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (savedRes.data.found && savedRes.data.connection) {
                console.log('[DeployTerraformStep] Found saved connection, auto-applying...');
                setSavedConnection(savedRes.data.connection);

                // Auto-apply saved connection to this workspace
                await applySavedConnection(savedRes.data.connection);
            } else {
                console.log('[DeployTerraformStep] No saved connection found');
                setLoading(false);
                ensureTerraformGenerated();
            }
        } catch (err) {
            // 404 means no saved connection - that's fine
            if (err.response?.status !== 404) {
                console.error('[DeployTerraformStep] Error checking saved connection:', err);
            }
            setLoading(false);
            ensureTerraformGenerated();
        }
    };

    const applySavedConnection = async (connection) => {
        try {
            setIsApplyingSaved(true);
            const token = localStorage.getItem('token');
            const providerKey = selectedProvider?.toLowerCase() || 'aws';

            const res = await axios.post(`${API_BASE}/cloud/connections/${providerKey}/apply`, {
                workspace_id: workspaceId
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                setConnectionStatus('connected');
                setConnectionData(res.data.connection);
                if (setConnection) setConnection(res.data.connection);
                toast.success('Saved connection applied!');
            }
        } catch (err) {
            console.error('[DeployTerraformStep] Failed to apply saved connection:', err);
            toast.error('Failed to apply saved connection');
        } finally {
            setIsApplyingSaved(false);
            setLoading(false);
            ensureTerraformGenerated();
        }
    };

    // ─── CONNECTION LOGIC ────────────────────────────────────────────────────────

    const checkConnectionStatus = async (isInitialCall = false) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/workspaces/${workspaceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const conn = res.data.state_json?.connection;

            console.log('[DeployTerraformStep] Connection check:', {
                hasConnection: !!conn,
                connProvider: conn?.provider,
                selectedProvider,
                connStatus: conn?.status
            });

            // Check if connected - prioritize saved connection status
            // Allow connection to persist if status is 'connected', even if switching providers
            if (conn && conn.status === 'connected') {
                // If providers match or no selected provider yet, use saved connection
                if (!selectedProvider || conn.provider?.toLowerCase() === selectedProvider?.toLowerCase()) {
                    setConnectionStatus('connected');
                    setConnectionData(conn);
                    if (setConnection) setConnection(conn); // 🔥 Sync to parent
                    stopPolling();
                } else {
                    // Different provider selected - need to reconnect (silent check)
                    // console.log('[DeployTerraformStep] Provider mismatch, needs reconnection for:', selectedProvider);
                    if (connectionStatus !== 'disconnected') setConnectionStatus('disconnected');
                    if (connectionData !== null) setConnectionData(null);
                    if (setConnection) setConnection(null);
                }
            } else {
                setConnectionStatus('disconnected');
            }

            // Only generate Terraform on initial load
            if (isInitialCall && !hasInitialized.current) {
                hasInitialized.current = true;
                ensureTerraformGenerated();
            } else if (isInitialCall) {
                setLoading(false);
            }
        } catch (err) {
            console.error("Status check failed", err);
            if (isInitialCall) setLoading(false);
        }
    };

    const handleAwsVerify = async () => {
        if (!awsAccountId || awsAccountId.length < 12) {
            toast.error("Please enter a valid AWS Account ID");
            return;
        }
        setIsVerifying(true);
        try {
            const token = localStorage.getItem('token');
            const roleArn = `arn:aws:iam::${awsAccountId}:role/CloudiverseAccessRole-${awsSetup.externalId}`;

            const res = await axios.post(`${API_BASE}/cloud/aws/verify`, {
                workspace_id: workspaceId,
                role_arn: roleArn,
                external_id: awsSetup.externalId,
                account_id: awsAccountId
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success("AWS Connection Verified!");
            // Sync connection state immediately
            checkConnectionStatus();
        } catch (err) {
            console.error("Verification failed", err);
            toast.error("Verification failed: " + (err.response?.data?.msg || err.message));
        } finally {
            setIsVerifying(false);
        }
    };

    // Auto-Verify Polling for AWS (if Account ID is present)
    useEffect(() => {
        let interval;
        // Only poll if we have the URL (setup started), a valid ID, and aren't connected yet
        if (awsSetup.url && awsAccountId.length === 12 && connectionStatus !== 'connected') {
            interval = setInterval(() => {
                if (!isVerifying) handleAwsVerify();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [awsSetup, awsAccountId, connectionStatus, isVerifying]);

    const handleConnect = async () => {
        try {
            const token = localStorage.getItem('token');
            const providerKey = selectedProvider?.toLowerCase() || 'aws';
            const res = await axios.post(`${API_BASE}/cloud/${providerKey}/connect`,
                {
                    workspace_id: workspaceId,
                    tenant_id: providerKey === 'azure' ? azureTenantId : undefined
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (providerKey === 'aws') {
                setAwsSetup({
                    url: res.data.url,
                    externalId: res.data.extra.externalId,
                    accountId: res.data.extra.accountId
                });
            } else if (res.data.url) {
                window.open(res.data.url, 'CloudAuth', 'width=600,height=700');
                startPollingConnection();
            }
        } catch (err) {
            toast.error("Failed to initiate connection. Please try again.");
        }
    };

    const startPollingConnection = () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
        pollInterval.current = setInterval(checkConnectionStatus, 3000);
    };

    const stopPolling = () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
    };

    const handleDisconnect = async (deleteStack = false) => {
        const providerKey = selectedProvider?.toLowerCase() || connectionData?.provider || 'aws';

        // Different confirmation based on action
        const message = deleteStack
            ? `⚠️ PERMANENT ACTION: This will delete the CloudFormation stack from your AWS account and remove all saved connection data. Are you sure?`
            : `Disconnect from ${providerKey.toUpperCase()}? You can reconnect using your saved credentials.`;

        if (!window.confirm(message)) return;

        try {
            setIsDisconnecting(true);
            const token = localStorage.getItem('token');

            // 1. Disconnect workspace
            await axios.post(`${API_BASE}/cloud/disconnect`, {
                workspace_id: workspaceId
            }, { headers: { Authorization: `Bearer ${token}` } });

            // 2. If deleteStack requested and AWS, delete CloudFormation stack + saved connection
            if (deleteStack && providerKey === 'aws' && connectionData?.account_id) {
                try {
                    // Call backend to delete CloudFormation stack
                    await axios.post(`${API_BASE}/cloud/aws/delete-stack`, {
                        account_id: connectionData.account_id,
                        external_id: connectionData.external_id,
                        workspace_id: workspaceId
                    }, { headers: { Authorization: `Bearer ${token}` } });

                    toast.success('CloudFormation stack deletion initiated');
                } catch (stackErr) {
                    console.warn('Stack deletion warning:', stackErr);
                    const manualSteps = stackErr.response?.data?.manual_steps || 'Please delete the CloudiverseAccess-* stack manually from AWS Console > CloudFormation';
                    const errorDetails = stackErr.response?.data?.details || stackErr.message;

                    toast.error(
                        <div>
                            <div className="font-bold">Stack Deletion Failed</div>
                            <div className="text-xs mt-1">{errorDetails}</div>
                            <div className="mt-2 text-xs bg-white/10 p-2 rounded">
                                <strong>Action Required:</strong><br />
                                {manualSteps}
                            </div>
                        </div>,
                        { duration: 10000 }
                    );
                }

                // Delete saved user connection
                await axios.delete(`${API_BASE}/cloud/connections/${providerKey}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setConnectionStatus('disconnected');
            setConnectionData(null);
            setSavedConnection(null);
            setAwsSetup({ url: '', externalId: '', accountId: '' });
            setAwsAccountId('');
            if (setConnection) setConnection(null);
            if (onResetWorkspace) onResetWorkspace();

            toast.success(deleteStack ? "Fully disconnected and stack deleted" : "Disconnected successfully");
        } catch (err) {
            console.error("Disconnect error:", err);
            toast.error("Failed to disconnect: " + (err.response?.data?.error || err.message));
        } finally {
            setIsDisconnecting(false);
        }
    };

    const ensureTerraformGenerated = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE}/workflow/terraform`, {
                workspace_id: workspaceId,
                infraSpec: infraSpec,
                provider: selectedProvider,
                profile: 'standard',
                project_name: infraSpec.project_name || 'cloudiverse-project'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data.success) {
                console.warn("Backend reported partial success generating Terraform.");
            }
        } catch (err) {
            console.error("Terraform generation warning:", err);
        } finally {
            setLoading(false);
        }
    };

    // ─── RENDER ──────────────────────────────────────────────────────────────────

    if (loading) return (
        <div className="flex justify-center p-12 text-text-secondary animate-fade-in">
            <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                Loading Deployment Context...
            </span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fade-in space-y-8">

            {/* PROGRESS STEPPER */}
            <div className="flex items-center justify-between px-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Connect Cloud Provider</h2>
                    <p className="text-text-secondary text-sm">Link your {selectedProvider} account to continue.</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${connectionStatus === 'connected' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                        <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-[10px] text-black font-bold">1</span>
                        Connect Cloud
                    </div>
                    <div className="w-8 h-[2px] bg-border"></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-surface border-border text-text-subtle">
                        <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-[10px] text-background font-bold">2</span>
                        Provision
                    </div>
                </div>
            </div>

            {/* Connection Card */}
            <div className={`card transition-all duration-300 ${connectionStatus === 'connected' ? 'border-secondary/30 ring-1 ring-secondary/20' : 'border-border'}`}>
                <div className="card-header flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connectionStatus === 'connected' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                            <span className="material-icons text-sm">{connectionStatus === 'connected' ? 'check' : 'cloud'}</span>
                        </div>
                        <h3 className="font-semibold text-text-primary">Cloud Connection</h3>
                    </div>
                    {connectionStatus === 'connected' ? (
                        <span className="badge badge-success gap-1">Connected</span>
                    ) : (
                        <span className="badge badge-warning">Action Required</span>
                    )}
                </div>

                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Provider Icon Area */}
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-xl bg-background border border-border flex items-center justify-center">
                                {selectedProvider?.toLowerCase() === 'aws' ? (
                                    <svg className="w-8 h-8 text-[#FF9900]" viewBox="0 0 24 24" fill="currentColor"><path d="M16.992 13.985h-2.308l-.893 2.502h-2.124l3.193-8.152h2.001l3.197 8.152h-2.174l-.893-2.502zm-1.154-3.232l-.768 2.155h1.536l-.768-2.155zm-11.75 3.232h-2.126l3.196-8.152h2.001l3.196 8.152h-2.175l-.892-2.502h-2.308l-.892 2.502zm1.902-3.232l-.768 2.155h1.536l-.768-2.155zm14.332-1.22c.866.456 1.309 1.157 1.309 2.067 0 2.226-2.227 3.015-4.49 2.953l-1.074-.031.026-.817.96.028c1.32.036 2.65-.28 2.65-1.154 0-.492-.373-.855-1.603-1.037l-.986-.145c-1.637-.247-2.362-1.04-2.362-2.164 0-1.886 1.83-2.735 4.314-2.735 1.144 0 2.09.206 2.766.529l-.273 1.546c-.521-.247-1.3-.497-2.33-.497-1.284 0-2.362.438-2.362 1.346 0 .506.402.825 1.565.98l.94.134c1.657.234 2.564.938 2.564 2.224l-.151-5.45z" /></svg>
                                ) : selectedProvider?.toLowerCase() === 'gcp' ? (
                                    <span className="font-bold text-xl text-text-primary">GCP</span>
                                ) : (
                                    <span className="material-icons text-3xl text-text-secondary">cloud</span>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 space-y-4">
                            {connectionStatus === 'connected' ? (
                                <div>
                                    <h4 className="text-text-primary font-medium">Successfully Connected</h4>
                                    <p className="text-text-secondary text-sm mt-1">
                                        Your {selectedProvider} account (ID: <span className="font-mono text-text-primary">{connectionData?.account_id || connectionData?.subscription_id || connectionData?.project_id}</span>) is linked and ready for provisioning.
                                    </p>

                                    {/* CONTINUE BUTTON */}
                                    <div className="mt-6 flex flex-wrap items-center gap-3 animate-fade-in">
                                        <button
                                            onClick={onComplete}
                                            className="btn-success px-4 py-2 md:px-6 md:py-2.5 flex items-center gap-2 shadow-lg hover:translate-x-1 transition-transform text-sm md:text-base"
                                        >
                                            Start Provisioning <span className="material-icons text-sm">arrow_forward</span>
                                        </button>

                                        {/* Disconnect Dropdown for AWS */}
                                        {selectedProvider?.toLowerCase() === 'aws' ? (
                                            <div className="relative group">
                                                <button
                                                    disabled={isDisconnecting}
                                                    className="px-3 py-2 md:px-4 md:py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg border border-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {isDisconnecting ? (
                                                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                                    ) : (
                                                        <span className="material-icons text-xs">link_off</span>
                                                    )}
                                                    Disconnect <span className="material-icons text-xs">expand_more</span>
                                                </button>

                                                {/* Dropdown Menu - opens upward to avoid container clipping */}
                                                <div className="absolute bottom-full left-0 mb-1 w-64 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                                    <button
                                                        onClick={() => handleDisconnect(false)}
                                                        className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-background transition-colors rounded-t-lg"
                                                    >
                                                        <div className="font-medium">Quick Disconnect</div>
                                                        <div className="text-xs text-text-subtle mt-0.5">Keep saved credentials for other projects</div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDisconnect(true)}
                                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-b-lg border-t border-border"
                                                    >
                                                        <div className="font-medium flex items-center gap-1">
                                                            <span className="material-icons text-xs">delete_forever</span>
                                                            Delete CloudFormation Stack
                                                        </div>
                                                        <div className="text-xs text-red-400/70 mt-0.5">Remove stack from AWS & clear saved connection</div>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDisconnect(false)}
                                                disabled={isDisconnecting}
                                                className="px-3 py-2 md:px-4 md:py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg border border-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isDisconnecting ? (
                                                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                                ) : (
                                                    <span className="material-icons text-xs">link_off</span>
                                                )}
                                                Disconnect
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-text-primary font-medium mb-1">
                                        Link your {selectedProvider} Account
                                    </h4>
                                    <p className="text-text-secondary text-sm">
                                        No cloud account connected. Authorization is required to deploy resources.
                                    </p>

                                    {/* AWS Specific Setup with Account ID Input */}
                                    <div className="mt-4">
                                        {awsSetup.url ? (
                                            <div className="bg-background rounded-lg p-4 border border-border space-y-4">
                                                <div>
                                                    <h5 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                                                        <span className="material-icons text-sm text-warning">warning_amber</span>
                                                        Complete Setup in AWS
                                                    </h5>
                                                    <ol className="list-decimal list-inside text-xs text-text-secondary space-y-1.5 mb-2">
                                                        <li>Click the button below to open the console</li>
                                                        <li>Create the CloudFormation stack</li>
                                                        <li>Enter your AWS Account ID below</li>
                                                    </ol>
                                                    <a href={awsSetup.url} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center py-2 text-sm">
                                                        Open AWS Console
                                                    </a>
                                                </div>

                                                <div className="pt-2 border-t border-border">
                                                    <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                                                        Your AWS Account ID (Required for Verification)
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. 123456789012"
                                                            value={awsAccountId}
                                                            onChange={(e) => setAwsAccountId(e.target.value.replace(/[^0-9]/g, ''))}
                                                            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                            maxLength={12}
                                                        />
                                                        <button
                                                            onClick={handleAwsVerify}
                                                            disabled={isVerifying || awsAccountId.length < 12}
                                                            className="btn-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isVerifying ? (
                                                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                                            ) : (
                                                                <span className="material-icons text-sm">refresh</span>
                                                            )}
                                                            Verify
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <button onClick={handleConnect} className="btn-primary px-4 py-2 md:px-6 md:py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all text-sm md:text-base whitespace-nowrap">
                                                    Connect {selectedProvider}
                                                </button>

                                                {/* Azure Tenant ID Override */}
                                                {selectedProvider?.toLowerCase() === 'azure' && (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => setShowAzureAdvanced(!showAzureAdvanced)}
                                                            className="text-xs text-text-subtle hover:text-text-primary transition flex items-center gap-1"
                                                        >
                                                            <span className="material-icons text-[14px]">{showAzureAdvanced ? 'expand_less' : 'settings'}</span>
                                                            {showAzureAdvanced ? 'Hide Advanced Settings' : 'Using a Personal Account? Click here'}
                                                        </button>

                                                        {showAzureAdvanced && (
                                                            <div className="mt-3 p-4 bg-surface border border-border rounded-xl animate-slide-down">
                                                                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Azure Tenant ID (GUID)</label>
                                                                <input
                                                                    type="text"
                                                                    value={azureTenantId}
                                                                    onChange={(e) => setAzureTenantId(e.target.value)}
                                                                    placeholder="e.g. 12345678-abcd-1234-abcd-1234567890ab"
                                                                    className="w-full bg-background border border-border rounded-lg p-3 text-sm text-text-primary focus:border-primary outline-none"
                                                                />
                                                                <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">
                                                                    Personal accounts often require a specific Tenant ID for Management API access.
                                                                    Find it in your <a href="https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview" target="_blank" rel="noreferrer" className="text-primary hover:underline">Azure Portal Overview</a>.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-text-subtle mt-4 flex items-center gap-1.5">
                                        <span className="material-icons text-[12px]">lock</span>
                                        Cloudiverse uses secure, read-limited access. You can revoke permissions anytime.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DeployTerraformStep;
