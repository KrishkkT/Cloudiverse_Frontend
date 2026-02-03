import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactFlowDiagram from './ReactFlowDiagram';

import ServiceInfoButton from './ServiceInfoButton';

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
    onInfraSpecUpdate,
    onDiagramImageSave,
    onNext,
    onBack,
    isDeployed
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const diagramRef = useRef(null);

    // New State for Service Addition Flow
    const [selectedAvailableService, setSelectedAvailableService] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // AI Suggestions State
    const [suggestedServices, setSuggestedServices] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

    // New: Fetch AI Suggestions Effect
    useEffect(() => {
        const fetchSuggestions = async () => {
            // Only fetch if we have the architecture data loaded and base inputs
            if (!infraSpec?.original_input || !architectureData?.services) return;
            if (suggestedServices.length > 0) return; // Don't refetch if already present (memoize roughly)

            setLoadingSuggestions(true);
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await axios.post(`${API_BASE}/architecture/validate-completeness`, {
                    description: infraSpec.original_input,
                    current_services: architectureData.services,
                    catalog: {} // Backend has access/can treat empty as "use internal"
                }, { headers });

                if (res.data.suggestions) {
                    setSuggestedServices(res.data.suggestions);
                }
            } catch (e) {
                console.error("Failed to fetch suggestions:", e);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        // Small delay to ensure main data is settled? Or just run it.
        if (!loading) {
            fetchSuggestions();
        }
    }, [loading, infraSpec, architectureData]);

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

    // IMPLEMENTATION: Service Removal Handler
    const handleRemoveService = async (serviceId, serviceName) => {
        if (isDeployed) return;

        const toastId = toast.loading(`Checking if ${serviceName} can be removed...`);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // 1. Validate Removal
            // We use the validation endpoint first to check guardrails
            // However, verify logic in server: reconcile checks valid-removal internally too.
            // But let's be explicit for better UX messages.

            // Construct current_infra mockup from what we have. 
            // Note: Validation relies on 'services' list with 'state' and 'canonical_type'
            // architectureData.services usually has these fields.
            const currentInfra = {
                services: architectureData.services || [],
                // Pass full infraSpec if needed, but 'services' array is key for guardrails
            };

            const action = { type: 'REMOVE_SERVICE', serviceId };

            // 2. Reconcile (This will fail if validation fails)
            const res = await axios.post(`${API_BASE}/architecture/reconcile`, {
                action,
                current_infra: currentInfra
            }, { headers });

            const { services_contract, deployable_services } = res.data;

            // 3. Success - Update State
            toast.success(`${serviceName} removed successfully!`, { id: toastId });

            // Update Architecture Data (Local View)
            // We need to update the services list to reflect the disabled state
            // and potentially remove it from the visual graph nodes if we want to be fancy.
            // For now, let's update the services list.
            const updatedServices = architectureData.services.map(s => {
                const updatedContract = services_contract.services.find(c => c.id === s.id);
                if (updatedContract) {
                    return { ...s, ...updatedContract };
                }
                return s;
            });

            // Re-construct architectureData
            const newArchData = {
                ...architectureData,
                services: updatedServices
            };

            onArchitectureDataLoaded(newArchData);

            // Update InfraSpec (Global Persisted State)
            if (onInfraSpecUpdate && infraSpec) {
                onInfraSpecUpdate({
                    ...infraSpec,
                    // We must update the canonical architecture to reflect the removal
                    // This creates a sync point for Terraform generation
                    canonical_architecture: {
                        ...infraSpec.canonical_architecture,
                        deployable_services: deployable_services, // This is the CLEAN list (no disabled services)
                    },
                    // Also update the full services contract if present
                    services_contract: services_contract
                });
            }

        } catch (err) {
            console.error("Removal Error:", err);
            const msg = err.response?.data?.error || err.message;
            toast.error(msg, { id: toastId, duration: 4000 });
        }
    };

    // IMPLEMENTATION: Service Addition Handler
    const handleAddService = async () => {
        if (!selectedAvailableService || isDeployed) return;

        const serviceId = selectedAvailableService.service_id || selectedAvailableService.id;
        const serviceName = selectedAvailableService.name || serviceId;

        setIsPopupOpen(false); // Close popup immediately
        const toastId = toast.loading(`Adding ${serviceName}...`);

        try {
            // Mockup current infra as before
            const currentInfra = {
                services: architectureData.services || [],
                services_contract: architectureData.services_contract
            };

            const action = { type: 'ADD_SERVICE', serviceId: serviceId };

            // Reconcile
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await axios.post(`${API_BASE}/architecture/reconcile`, {
                action,
                current_infra: currentInfra
            }, { headers });

            const { services_contract, deployable_services } = res.data;

            // Success
            toast.success(`${serviceName} added successfully!`, { id: toastId });

            // Update Local Data (Optimistic or based on result)
            // We need to move it from remaining to services
            // But simpler is to allow Architecture reloading OR manually patch it.
            // Let's manually patch to avoid full reload flicker, but reloading is safer for diagram.
            // Actually, Reconcile returns the new services list.

            // Update Architecture Data
            const newArchData = {
                ...architectureData,
                services: services_contract.services,
                // Remove from remaining?
                remaining_services: architectureData.remaining_services.filter(s => s.service_id !== serviceId && s.id !== serviceId)
            };

            onArchitectureDataLoaded(newArchData);

            // Update Global InfraSpec
            if (onInfraSpecUpdate && infraSpec) {
                onInfraSpecUpdate({
                    ...infraSpec,
                    canonical_architecture: {
                        ...infraSpec.canonical_architecture,
                        deployable_services: deployable_services,
                    },
                    services_contract: services_contract
                });
            }

            setSelectedAvailableService(null);

        } catch (err) {
            console.error("Add Service Error:", err);
            const msg = err.response?.data?.error || err.message;
            toast.error(msg, { id: toastId });
        }
    };

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
                    ref={diagramRef}
                    services={architectureData?.architecture?.nodes || []}
                    edges={architectureData?.architecture?.edges || []}
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
                    {architectureData?.services?.map((service, index) => {
                        const isDisabled = service.state === 'USER_DISABLED';
                        if (isDisabled) return null;

                        return (
                            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors group relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-bold text-white text-lg">
                                                {service.name || service.pretty_name || service.canonical_type}
                                            </h4>
                                            <ServiceInfoButton
                                                serviceId={service.canonical_type || service.name}
                                                provider={selectedProvider}
                                                serviceName={service.name || service.pretty_name}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                                        <div className="text-xs text-gray-500 mt-2 capitalize font-mono">
                                            {service.category}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* AI Suggested Services Section */}
                {suggestedServices.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in">
                        <h4 className="text-md font-bold text-yellow-500 mb-4 flex items-center">
                            <span className="material-icons mr-2 text-sm">lightbulb</span>
                            AI Suggestions (Correctness Check)
                        </h4>
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-4">
                            <p className="text-sm text-yellow-200/80">
                                The AI analyzed your project description and suggests these services might be missing.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suggestedServices.map((suggestion, index) => {
                                // Find full service details from remaining services if possible
                                const fullService = architectureData.remaining_services?.find(s => s.service_id === suggestion.service_id || s.id === suggestion.service_id);
                                const serviceName = fullService?.name || suggestion.service_id;
                                const serviceCategory = fullService?.category || 'Suggested';

                                return (
                                    <div key={index} className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20 hover:bg-yellow-500/10 transition-colors group relative border-dashed">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-bold text-gray-200 text-lg">
                                                        {serviceName}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">{suggestion.reason}</p>
                                                <div className="text-xs text-yellow-600 mt-2 capitalize font-mono flex items-center">
                                                    {serviceCategory}
                                                    <button
                                                        onClick={() => {
                                                            if (fullService) {
                                                                setSelectedAvailableService(fullService);
                                                                handleAddService(); // Auto add logic or open popup? Let's just add it.
                                                                // Actually reusing handleAddService requires state set.
                                                                // Better: Open popup for them to verify.
                                                                setIsPopupOpen(true);
                                                            } else {
                                                                toast.error("Service details not found in catalog.");
                                                            }
                                                        }}
                                                        className="ml-auto bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Add Service
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Available Services Dropdown Removed per user request - only show AI suggestions */}
            {/* {architectureData?.remaining_services?.length > 0 && ( ... )} */}

            {/* Service Details Popup */}
            <AnimatePresence>
                {isPopupOpen && selectedAvailableService && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsPopupOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1A1D24] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Popup Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-white/5 to-transparent">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {selectedAvailableService.name || selectedAvailableService.service_id}
                                    </h3>
                                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded mt-2 inline-block capitalize">
                                        {selectedAvailableService.category}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsPopupOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            {/* Popup Content */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        {selectedAvailableService.description || "No description available for this service."}
                                    </p>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                    <div className="flex items-start space-x-3">
                                        <span className="material-icons text-blue-400 text-sm mt-0.5">info</span>
                                        <div className="text-sm text-blue-200/80">
                                            Adding this service will update your <strong>Terraform Configuration</strong> and include it in your <strong>Cost Estimation</strong>.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Popup Footer */}
                            <div className="p-6 border-t border-white/10 bg-black/20 flex space-x-3">
                                <button
                                    onClick={() => setIsPopupOpen(false)}
                                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddService}
                                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02]"
                                >
                                    Add Service
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            onClick={async () => {
                                // 📸 Capture Diagram for Report
                                if (diagramRef.current) {
                                    const toastId = 'snapshot-save';
                                    try {
                                        if (!workspaceId) {
                                            console.error('Missing workspaceId for snapshot save');
                                            onNext('self');
                                            return;
                                        }

                                        toast.loading('Saving architecture snapshot...', { id: toastId });
                                        const dataUrl = await diagramRef.current.captureScreenshot();

                                        // Save to backend state_json
                                        const token = localStorage.getItem('token');
                                        const headers = token ? { Authorization: `Bearer ${token}` } : {};

                                        // Fetch latest workspace to get full state
                                        const wsRes = await axios.get(`${API_BASE}/workspaces/${workspaceId}`, { headers });
                                        const currentState = typeof wsRes.data.state_json === 'string'
                                            ? JSON.parse(wsRes.data.state_json)
                                            : wsRes.data.state_json || {};

                                        const updatedState = {
                                            ...currentState,
                                            diagramImage: dataUrl // Store base64 image
                                        };

                                        await axios.post(`${API_BASE}/workspaces/save`, {
                                            workspaceId,
                                            step: wsRes.data.step,
                                            state: updatedState,
                                            name: wsRes.data.name,
                                            projectId: wsRes.data.project_id
                                        }, { headers });

                                        // 🔥 Sync with parent state immediately so subsequent auto-saves pick it up
                                        if (onDiagramImageSave) {
                                            onDiagramImageSave(dataUrl);
                                        }

                                        toast.success('Snapshot saved', { id: toastId });

                                    } catch (e) {
                                        console.error('Failed to save diagram snapshot:', e);
                                        const errorMsg = e.response?.data?.msg || 'Could not save diagram snapshot';
                                        toast.error(errorMsg, { id: toastId });
                                    }
                                }
                                onNext('self');
                            }}
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
                            onClick={() => onNext('oneclick')}
                            disabled={isDeployed}
                            className={`p-6 bg-surface border border-border rounded-2xl transition-all group text-left relative hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer`}
                        >
                            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-black text-[10px] font-bold rounded-full animate-pulse">
                                NEW
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