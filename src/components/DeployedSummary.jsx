import React from 'react';
import { ExternalLink, Cloud, MapPin, Clock, Trash2, Server } from 'lucide-react';

/**
 * DeployedSummary - Shows deployed project summary with live URL and delete option
 * Displayed when workspace.deployment_status === 'DEPLOYED'
 */
const DeployedSummary = ({
    workspace,
    infraOutputs,
    onDeleteClick
}) => {
    const deploymentTarget = infraOutputs?.deployment_target;
    const deploymentHistory = workspace?.deployment_history || [];

    // Resolve live URL - PRIORITY: deployment history > deployment_target config
    const getLiveUrl = () => {
        // 1. First check deployment_history for actual live_url (set by backend after successful deploy)
        const lastDeploySuccess = deploymentHistory.filter(h => h.action === 'DEPLOY_SUCCESS').pop();
        if (lastDeploySuccess?.live_url) {
            return lastDeploySuccess.live_url;
        }

        // 2. Fallback to deployment_target configuration
        if (!deploymentTarget) return null;

        switch (deploymentTarget.type) {
            case 'STATIC_STORAGE':
                const cdnDomain = deploymentTarget.static?.cdn_domain;
                const bucketName = deploymentTarget.static?.bucket_name;
                return cdnDomain ? `https://${cdnDomain}` : (bucketName ? `http://${bucketName}.s3-website.${deploymentTarget.static?.bucket_region || 'us-east-1'}.amazonaws.com` : null);
            case 'CONTAINER_SERVICE':
                return deploymentTarget.container?.service_url || deploymentTarget.container?.load_balancer_url;
            case 'SERVERLESS_API':
                return deploymentTarget.api?.endpoint;
            default:
                return null;
        }
    };

    const liveUrl = getLiveUrl();
    const provider = deploymentTarget?.provider?.toUpperCase() || 'UNKNOWN';
    const region = deploymentTarget?.region || workspace?.state_json?.region || 'Unknown';
    const deploymentType = deploymentTarget?.type || 'UNKNOWN';

    // Get deployed timestamp
    const deployedAt = workspace?.deployed_at ? new Date(workspace.deployed_at) : null;
    const lastDeployEvent = deploymentHistory.filter(h => h.action === 'DEPLOY_SUCCESS').pop();

    // Get deployed services list from infraSpec
    const services = workspace?.state_json?.infraSpec?.services || [];
    const serviceNames = services.map(s => s.name || s.id).filter(Boolean);

    return (
        <div className="bg-surface border border-white/10 rounded-2xl p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <span className="material-icons text-2xl text-green-400">cloud_done</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Deployed</h2>
                        <p className="text-sm text-gray-400">Your infrastructure is live and running</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-green-400 font-medium text-sm">Live</span>
                </div>
            </div>

            {/* Live URL - Primary CTA */}
            {liveUrl && (
                <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 hover:border-green-500/50 transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Live Website</div>
                            <div className="text-lg text-green-400 font-mono truncate max-w-md">{liveUrl}</div>
                        </div>
                        <ExternalLink className="w-6 h-6 text-green-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </a>
            )}

            {/* Deployment Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                        <Cloud className="w-4 h-4" />
                        Provider
                    </div>
                    <div className="text-white font-bold">{provider}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                        <MapPin className="w-4 h-4" />
                        Region
                    </div>
                    <div className="text-white font-bold">{region}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                        <Server className="w-4 h-4" />
                        Type
                    </div>
                    <div className="text-white font-bold text-sm">{deploymentType.replace('_', ' ')}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                        <Clock className="w-4 h-4" />
                        Deployed
                    </div>
                    <div className="text-white font-bold text-sm">
                        {deployedAt ? deployedAt.toLocaleDateString() : 'Unknown'}
                    </div>
                </div>
            </div>

            {/* Deployed Services */}
            {serviceNames.length > 0 && (
                <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Deployed Services</div>
                    <div className="flex flex-wrap gap-2">
                        {serviceNames.map((name, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Danger Zone - Delete */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-300">Danger Zone</div>
                        <div className="text-xs text-gray-500">Permanently delete all cloud resources</div>
                    </div>
                    <button
                        onClick={onDeleteClick}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Deployment</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeployedSummary;
