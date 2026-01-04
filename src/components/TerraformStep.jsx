import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const TerraformStep = ({
    workspaceId,
    infraSpec,
    selectedProvider,
    costEstimation,
    onComplete,
    onBack
}) => {
    const [loading, setLoading] = useState(true);
    const [terraformCode, setTerraformCode] = useState('');
    const [services, setServices] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTerraform = async () => {
            try {
                // Determine profile logic same as feedback step
                const providerDetails = costEstimation.provider_details?.[selectedProvider];
                const selectedProfile = Object.entries(costEstimation.scenarios || {}).find(
                    ([_, providers]) => providers[selectedProvider]?.monthly_cost === providerDetails?.total_monthly_cost
                )?.[0] || 'standard';

                try {
                    const response = await axios.post(`${API_BASE}/workflow/terraform`, {
                        workspace_id: workspaceId,
                        infraSpec: infraSpec,
                        provider: selectedProvider,
                        profile: selectedProfile,
                        project_name: infraSpec.project_name || 'cloudiverse-project'
                    });

                    if (response.data.success) {
                        setTerraformCode(response.data.terraform.code);
                        setServices(response.data.services || []);
                    }
                } catch (err) {
                    console.warn('Terraform generation failed (non-blocking):', err);
                    setError('Failed to generate Terraform code. Please try again later.');
                    throw err; // Re-throw to be caught by the outer catch
                }
            } catch (err) {
                console.error('Terraform generation failed:', err);
                setError('Failed to generate Terraform code. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTerraform();
    }, [workspaceId, infraSpec, selectedProvider, costEstimation]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(terraformCode);
        toast.success('Terraform code copied to clipboard');
    };

    const downloadFile = () => {
        const element = document.createElement("a");
        const file = new Blob([terraformCode], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "main.tf";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
        toast.success('Downloaded main.tf');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fade-in">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                </div>
                <div className="text-center">
                    <p className="text-xl font-semibold text-white">Generating Infrastructure Code</p>
                    <p className="text-gray-400 mt-2">Creating Terraform configuration for {selectedProvider}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fade-in">
                <div className="text-red-500 text-6xl material-icons">error_outline</div>
                <div className="text-center">
                    <p className="text-xl font-semibold text-white">Generation Failed</p>
                    <p className="text-red-400 mt-2">{error}</p>
                    <button
                        onClick={onBack}
                        className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white">Your Infrastructure Code</h2>
                    <p className="text-sm text-gray-400">Ready-to-deploy Terraform for {selectedProvider}</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                    >
                        <span className="material-icons text-sm">content_copy</span>
                        <span className="text-sm">Copy</span>
                    </button>
                    <button
                        onClick={downloadFile}
                        className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-colors flex items-center space-x-2"
                    >
                        <span className="material-icons text-sm">download</span>
                        <span className="text-sm">Download .tf</span>
                    </button>
                </div>
            </div>

            <div className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/5">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="ml-4 text-xs font-mono text-gray-400">main.tf</span>
                </div>
                <div className="p-4 overflow-x-auto">
                    <pre className="font-mono text-sm text-gray-300 leading-relaxed">
                        {terraformCode}
                    </pre>
                </div>
            </div>

            {services.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Included Resources</h3>
                    <div className="flex flex-wrap gap-2">
                        {services.map((service, idx) => (
                            <div key={idx} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300 font-mono">
                                {service.terraform_resource || service.cloud_service || service.generic_name || service}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                    <span className="material-icons">arrow_back</span>
                    <span>Back</span>
                </button>
                
                {/* Deployment Section */}
                <div className="flex flex-col items-end space-y-4">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Deployment Options</div>
                    <div className="flex space-x-4">
                        {/* Self Deployment */}
                        <button
                            onClick={onComplete}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                        >
                            <span className="material-icons text-lg">download_done</span>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold">Self Deployment</span>
                                <span className="text-xs text-gray-400">Download & deploy manually</span>
                            </div>
                        </button>
                        
                        {/* One-Click Deployment (Coming Soon) */}
                        <button
                            disabled
                            className="px-6 py-3 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-xl text-primary/50 font-medium cursor-not-allowed flex items-center space-x-2 relative"
                        >
                            <span className="material-icons text-lg">rocket_launch</span>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold flex items-center space-x-2">
                                    <span>One-Click Deployment</span>
                                    <span className="px-2 py-0.5 bg-primary/20 rounded text-xs text-primary">Coming Soon</span>
                                </span>
                                <span className="text-xs text-gray-500">Automated cloud deployment</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerraformStep;
