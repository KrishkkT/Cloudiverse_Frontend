import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
    onBack
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
                
                {/* Simple SVG Diagram */}
                <div className="bg-black/20 rounded-xl p-6 min-h-[300px] relative overflow-hidden">
                    <svg width="100%" height="300" viewBox="0 0 800 300" className="overflow-visible">
                        {/* Background grid pattern */}
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2E3645" strokeWidth="1" opacity="0.3"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* Nodes */}
                        {architectureData?.architecture?.nodes?.map((node, index) => {
                            const x = node.position?.x || (index * 150) + 100;
                            const y = node.position?.y || 150;
                            
                            // Determine icon based on node type
                            let icon = 'cloud';
                            if (node.type.includes('compute')) icon = 'memory';
                            else if (node.type.includes('database')) icon = 'database';
                            else if (node.type.includes('storage')) icon = 'storage';
                            else if (node.type.includes('auth')) icon = 'lock';
                            else if (node.type.includes('cdn')) icon = 'public';
                            else if (node.type.includes('load_balancer')) icon = 'swap_horiz';
                            
                            return (
                                <g key={node.id}>
                                    <circle cx={x} cy={y} r="30" fill="#1F2937" stroke="#3B82F6" strokeWidth="2" />
                                    <text x={x} y={y-35} textAnchor="middle" fill="#9CA3AF" fontSize="12" className="font-medium">
                                        {node.label}
                                    </text>
                                    <text x={x} y={y} textAnchor="middle" fill="#F9FAFB" fontSize="16" className="font-bold">
                                        {icon && <tspan dy="-2">{icon}</tspan>}
                                    </text>
                                </g>
                            );
                        })}
                        
                        {/* Edges */}
                        {architectureData?.architecture?.edges?.map((edge, index) => {
                            // Find source and target node positions
                            const sourceNode = architectureData.architecture.nodes.find(n => n.id === edge.from);
                            const targetNode = architectureData.architecture.nodes.find(n => n.id === edge.to);
                            
                            if (!sourceNode || !targetNode) return null;
                            
                            const x1 = sourceNode.position?.x || (architectureData.architecture.nodes.indexOf(sourceNode) * 150) + 100;
                            const y1 = sourceNode.position?.y || 150;
                            const x2 = targetNode.position?.x || (architectureData.architecture.nodes.indexOf(targetNode) * 150) + 100;
                            const y2 = targetNode.position?.y || 150;
                            
                            return (
                                <g key={index}>
                                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5" />
                                    <text x={(x1+x2)/2} y={(y1+y2)/2 - 10} textAnchor="middle" fill="#9CA3AF" fontSize="10">
                                        {edge.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
                
                <div className="text-xs text-gray-500 mt-4 text-center italic">
                    Visual representation of your cloud architecture. This diagram shows how services connect and interact.
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
                        <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-white">{service.name}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                                    <div className="text-xs text-gray-500 mt-2 capitalize">
                                        {service.category} service
                                    </div>
                                </div>
                                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                                    {service.type?.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Architecture Notes */}
            {architectureData?.notes && (
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <span className="material-icons mr-2">sticky_note_2</span>
                        Architecture Notes
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {architectureData.notes.map((note, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <span className="material-icons text-primary text-sm mt-0.5">info</span>
                                <p className="text-sm text-gray-300">{note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
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
                    <span>Confirm Architecture</span>
                    <span className="material-icons">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default ArchitectureStep;