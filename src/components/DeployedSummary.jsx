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

    const { costEstimation, infraSpec } = workspace?.state_json || {};
    const connection = workspace?.state_json?.connection || infraSpec?.connection || costEstimation?.connection || {};

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

    // ─── SERVICE MAPPING ──────────────────────────────────────────────────────────
    const SERVICE_MAPPING = {
        'computecontainer': 'ECS Fargate (Container)',
        'computevm': 'EC2 Virtual Machine',
        'computeserverless': 'Lambda Functions',
        'computebatch': 'AWS Batch',
        'relationaldatabase': 'RDS Database',
        'nosqldatabase': 'DynamoDB NoSQL',
        'objectstorage': 'S3 Bucket',
        'blockstorage': 'EBS Volume',
        'filestorage': 'EFS File System',
        'vpcnetworking': 'VPC Network',
        'loadbalancer': 'Load Balancer (ALB)',
        'cdn': 'CloudFront CDN',
        'apigateway': 'API Gateway',
        'dns': 'Route53 DNS',
        'identityauth': 'Cognito Auth',
        'secretsmanagement': 'Secrets Manager',
        'keymanagement': 'KMS Keys',
        'waf': 'WAF Firewall',
        'shield': 'Shield Protection',
        'networkfirewall': 'Network Firewall',
        'messagequeue': 'SQS Queue',
        'eventbus': 'EventBridge',
        'workfloworchestration': 'Step Functions',
        'logging': 'CloudWatch Logs',
        'monitoring': 'CloudWatch Metrics',
        'mlinference': 'SageMaker Inference',
        'cache': 'ElastiCache (Redis)',
        'vpngateway': 'VPN Gateway',
        'natgateway': 'NAT Gateway'
    };

    const getServiceName = (key) => {
        // Handle names like "objectstorage_0", "cdn_1" -> "Object Storage", "CDN"
        const cleanKey = key.replace(/_\d+$/, '').toLowerCase();
        return SERVICE_MAPPING[cleanKey] ||
            key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // Fallback: "my_service" -> "My Service"
    };

    const liveUrl = getLiveUrl();
    const provider = (deploymentTarget?.provider || connection?.provider || costEstimation?.provider || 'AWS').toUpperCase();
    const region = deploymentTarget?.region || workspace?.state_json?.region || costEstimation?.region || 'us-east-1';

    // Determine deployment type friendly name
    const getDeploymentTypeLabel = () => {
        const type = deploymentTarget?.type || workspace?.state_json?.architecture_pattern || 'Custom';
        if (type === 'STATIC_STORAGE') return 'Static Website';
        if (type === 'CONTAINER_SERVICE') return 'Container App';
        if (type === 'SERVERLESS_API') return 'Serverless API';
        return type.replace(/_/g, ' ');
    };

    const deploymentType = getDeploymentTypeLabel();

    // Get deployed timestamp
    const deployedAt = workspace?.deployed_at ? new Date(workspace.deployed_at) : (
        workspace.updated_at ? new Date(workspace.updated_at) : null
    );

    // Get deployed services list from infraSpec OR costEstimation
    // Prioritize infraSpec.services which explicitly lists selected services
    const services = workspace?.state_json?.infraSpec?.services || [];

    // Extract names. If services is array of strings, use as is. If objects, use .name or .id
    const serviceKeys = services.map(s => (typeof s === 'string' ? s : (s.name || s.id))).filter(Boolean);
    // Determine unique human readable names
    const displayServices = [...new Set(serviceKeys.map(getServiceName))].sort();

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
                {/* ... (rest of header) ... */}
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
                    <div className="text-white font-bold text-sm truncate" title={deploymentType}>{deploymentType}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                        <Clock className="w-4 h-4" />
                        Deployed
                    </div>
                    <div className="text-white font-bold text-sm">
                        {deployedAt ? deployedAt.toLocaleDateString() : 'Just now'}
                    </div>
                </div>
            </div>

            {/* Deployed Services */}
            {displayServices.length > 0 && (
                <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Deployed Services</div>
                    <div className="flex flex-wrap gap-2">
                        {displayServices.map((name, idx) => (
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
