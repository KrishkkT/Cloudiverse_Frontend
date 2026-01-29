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
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [connectionData, setConnectionData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const infraSpec = workspace?.state_json?.infraSpec || {};
    const costEstimation = workspace?.state_json?.costEstimation || {};

    const provider = (
        selectedProvider ||
        infraSpec.resolved_region?.provider ||
        costEstimation.recommended?.provider ||
        'aws'
    ).toLowerCase();

    useEffect(() => {
        const savedConnection = workspace?.state_json?.connection;
        if (savedConnection && savedConnection.status === 'connected') {
            setConnectionStatus('connected');
            setConnectionData(savedConnection);
        } else {
            const params = new URLSearchParams(window.location.search);
            if (params.get('connection') === 'success') {
                setConnectionStatus('connected');
            }
        }
    }, [workspace]);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const payload = {
                workspace_id: workspace.id,
                redirect_url: window.location.href
            };

            const res = await axios.post(`${API_BASE}/api/cloud/${provider}/connect`, payload, { headers });

            if (res.data.url) {
                window.location.href = res.data.url;
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
                            value={costEstimation.recommended?.formatted_cost || 'N/A'}
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
                            <h2 className="text-2xl font-bold text-white mb-3">Connect your {provider.toUpperCase()} Account</h2>
                            <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                                To proceed with the automated deployment, we need to securely link your cloud credentials.
                                You will be directed to the official {provider === 'aws' ? 'AWS IAM' : provider === 'gcp' ? 'Google Cloud' : 'Azure'} portal to authorize this request.
                            </p>

                            <button
                                onClick={handleConnect}
                                disabled={isLoading}
                                className="px-12 py-5 bg-white text-black hover:bg-gray-100 rounded-2xl font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 mx-auto"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                        <span>ESTABLISHING SECURE LINK...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="uppercase tracking-widest text-sm">Authorize {provider.toUpperCase()} Connection</span>
                                        <span className="material-icons text-sm">arrow_forward</span>
                                    </>
                                )}
                            </button>

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
