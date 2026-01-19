import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactFlowDiagram from './ReactFlowDiagram';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const ArchitectureStep = ({
    workspaceId,
    infraSpec,
    costEstimation,
    selectedProvider,
    selectedProfile,
    usageProfile,
    requirementsData,
    architectureData,
    onArchitectureDataLoaded,
    onNext,
    onBack,
    isDeployed
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadArchitecture = async () => {
            if (!infraSpec || !selectedProvider || !selectedProfile) return;

            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const response = await axios.post(`${API_BASE}/workflow/architecture`, {
                    workspace_id: workspaceId,
                    infraSpec,
                    provider: selectedProvider,
                    profile: selectedProfile,
                    usage_profile: usageProfile?.usage_profile || {},
                    intent: infraSpec?.locked_intent || {},
                    requirements: requirementsData || {}
                }, { headers });

                // Validate response structure
                if (!response.data || !response.data.data) {
                    throw new Error('Invalid response structure from architecture endpoint');
                }

                // Update parent state
                if (onArchitectureDataLoaded) {
                    onArchitectureDataLoaded(response.data.data);
                }
                setError(null);
            } catch (err) {
                console.error('Architecture loading error:', err);
                setError('Failed to load architecture diagram. Using fallback view.');
                toast.error('Failed to load architecture diagram');
            } finally {
                setLoading(false);
            }
        };

        loadArchitecture();
    }, [workspaceId, infraSpec, selectedProvider, selectedProfile, usageProfile, requirementsData, onArchitectureDataLoaded]);

    if (error) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                <div className="text-center space-y-4 mb-8">
                    <h2 className="text-3xl font-bold text-white">Architecture Design</h2>
                    <p className="text-gray-400">Architecture diagram could not be loaded, but you can continue to Terraform generation.</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                        <span className="material-icons text-amber-400 text-sm mt-0.5">warning</span>
                        <div>
                            <h3 className="font-bold text-amber-200 mb-1">Architecture Not Available</h3>
                            <p className="text-sm text-amber-200/80">The architecture diagram could not be generated, but your infrastructure specification is ready for Terraform generation.</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                    >
                        <span className="material-icons">arrow_back</span>
                        <span>Back to Cost</span>
                    </button>
                    <button
                        onClick={onNext}
                        className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        <span>Continue to Feedback</span>
                        <span className="material-icons">arrow_forward</span>
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !architectureData) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                <div className="text-center space-y-4 mb-8">
                    <h2 className="text-3xl font-bold text-white">Architecture Design Confirmation</h2>
                    <p className="text-gray-400">Generating your cloud architecture diagram...</p>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                    </div>
                    <p className="text-xl font-semibold text-white">Generating Architecture</p>
                    <p className="text-gray-400">Creating your provider-specific diagram...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
                <h2 className="text-3xl font-bold text-white">Architecture Design Confirmation</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    This architecture reflects the recommended setup based on your requirements and usage.
                </p>
            </div>

            {/* Architecture Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Provider</h3>
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold
                            ${selectedProvider === 'AWS' ? 'bg-[#FF9900]/20 text-[#FF9900]' :
                                selectedProvider === 'GCP' ? 'bg-[#4285F4]/20 text-[#4285F4]' : 'bg-[#0078D4]/20 text-[#0078D4]'}`}>
                            {selectedProvider === 'AWS' ? 'AWS' : selectedProvider === 'GCP' ? 'GCP' : 'AZ'}
                        </div>
                        <div>
                            <div className="font-bold text-white text-lg">{selectedProvider === 'AZURE' ? 'Azure' : selectedProvider}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Scenario</h3>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <span className="material-icons text-primary">tune</span>
                        </div>
                        <div>
                            <div className="font-bold text-white text-lg capitalize">
                                {selectedProfile?.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-400">Cost optimization profile</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Architecture Diagram Section */}
            <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <span className="material-icons mr-2">design_services</span>
                    Architecture Diagram
                </h3>

                {/* React Flow Professional Diagram */}
                <ReactFlowDiagram
                    architectureData={architectureData}
                    provider={selectedProvider}
                    pattern={infraSpec?.architecture_pattern || 'SERVERLESS_WEB_APP'}
                />

                <div className="text-xs text-gray-500 mt-4 text-center italic">
                    Interactive architecture diagram. Use mouse wheel to zoom, drag to pan. Click "Download PNG" to export.
                </div>
            </div>

            {/* Services List */}
            <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <span className="material-icons mr-2">inventory</span>
                    Services Used ({selectedProvider === 'AZURE' ? 'Azure' : selectedProvider})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {architectureData?.services?.map((service, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-bold text-white text-lg">
                                            {service.pretty_name || service.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </h4>
                                        <a
                                            href={`/docs?section=cloud-services&provider=${selectedProvider?.toLowerCase()}&service=${service.name.toLowerCase()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-500 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="View Documentation"
                                        >
                                            <span className="material-icons text-sm">info</span>
                                        </a>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                                    <div className="text-xs text-gray-500 mt-2 capitalize font-mono">
                                        {service.category}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



            {/* Deployment Choice Buttons */}
            <div className="flex flex-col space-y-6 pt-8 border-t border-white/5">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">Choose Your Deployment Method</h3>
                    <p className="text-sm text-gray-400">How would you like to deploy this infrastructure?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Self Deployment Option */}
                    {isDeployed ? (
                        <div className="p-6 bg-surface border border-border rounded-2xl opacity-60 cursor-not-allowed">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <span className="material-icons text-blue-400 text-2xl">visibility</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">View Configuration</h4>
                                    <p className="text-xs text-gray-400">View Terraform & Setup</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                Review the generated Terraform code and deployment details.
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={() => onNext('self')}
                            className="p-6 bg-surface border border-border rounded-2xl hover:border-primary/50 transition-all group text-left"
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <span className="material-icons text-blue-400 text-2xl group-hover:text-primary transition-colors">download_done</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">Self Deployment</h4>
                                    <p className="text-xs text-gray-400">Download & deploy manually</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                Get the Terraform code and deploy it yourself using your own credentials and workflow.
                            </p>
                        </button>
                    )}

                    {/* One-Click Deployment Option */}
                    {isDeployed ? (
                        <div className="p-6 bg-surface border border-border rounded-2xl opacity-40 cursor-not-allowed text-left relative">
                            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-[10px] font-bold rounded-full">
                                DISABLED
                            </div>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <span className="material-icons text-green-400 text-2xl">rocket_launch</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">One-Click Deploy</h4>
                                    <p className="text-xs text-gray-400">Automated cloud deployment</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                We handle the deployment for you. Just connect your cloud account and we'll do the rest.
                            </p>
                            <div className="mt-4 flex items-center text-xs text-gray-500">
                                <span className="material-icons text-sm mr-1">check</span>
                                Zero DevOps required
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => !isDeployed && onNext('oneclick')}
                            disabled={isDeployed}
                            className={`p-6 bg-surface border border-border rounded-2xl transition-all group text-left relative hover:border-green-500/50`}
                        >
                            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-black text-[10px] font-bold rounded-full">
                                COMING SOON
                            </div>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <span className="material-icons text-green-400 text-2xl">rocket_launch</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">One-Click Deploy</h4>
                                    <p className="text-xs text-gray-400">Automated cloud deployment</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                We handle the deployment for you. Just connect your cloud account and we'll do the rest.
                            </p>
                            <div className="mt-4 flex items-center text-xs text-gray-500">
                                <span className="material-icons text-sm mr-1">check</span>
                                Zero DevOps required
                            </div>
                        </button>
                    )}
                </div>

                {!isDeployed && (
                    <button
                        onClick={onBack}
                        className="mx-auto px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                    >
                        <span className="material-icons">arrow_back</span>
                        <span>Back to Cost Estimation</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ArchitectureStep;