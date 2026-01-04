import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const FeedbackStep = ({
    workspaceId,
    costEstimation,
    selectedProvider,
    onNext,
    onBack,
    costIntent,
    onFeedbackSubmitted
}) => {
    const [feedback, setFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!feedback) {
            toast.error('Please select an option');
            return;
        }

        setIsSubmitting(true);
        try {
            // Get cost range for selected provider
            const providerDetails = costEstimation.provider_details?.[selectedProvider];
            const costRange = providerDetails?.cost_range || { min: 0, max: 0 };

            // Find selected profile more reliably
            let selectedProfile = 'cost_effective'; // default to cost_effective since that's the default state
            
            // Try to get profile from costEstimation if available
            if (costEstimation.cost_profile) {
                selectedProfile = costEstimation.cost_profile;
            } else if (costEstimation.selected_profile) {
                selectedProfile = costEstimation.selected_profile;
            } else {
                // Look for the profile that matches the selected provider's data
                if (costEstimation.scenarios) {
                    const displayedCost = providerDetails?.total_monthly_cost;
                    
                    // Look through all profiles to find the one matching the selected provider
                    for (const [profileName, providers] of Object.entries(costEstimation.scenarios)) {
                        const providerData = providers[selectedProvider];
                        if (providerData && displayedCost) {
                            const scenarioCost = providerData.monthly_cost || providerData.estimated_cost;
                            if (scenarioCost && Math.abs(displayedCost - scenarioCost) < 0.01) {
                                selectedProfile = profileName;
                                break;
                            }
                        }
                    }
                }
            }
            
            // Normalize profile name to expected format
            if (selectedProfile === 'costeffective' || selectedProfile === 'cost_effective' || selectedProfile === 'costEffective') {
                selectedProfile = 'cost_effective';
            } else if (selectedProfile === 'highperformance' || selectedProfile === 'high_performance' || selectedProfile === 'highPerformance') {
                selectedProfile = 'high_performance';
            } else if (selectedProfile === 'standard' || selectedProfile === 'Standard') {
                selectedProfile = 'standard';
            } else {
                // Default fallback
                selectedProfile = 'cost_effective';
            }
                        
            // Ensure API_BASE doesn't have trailing slash to avoid double slashes
            const normalizedApiBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
                        
            try {
                await axios.post(`${normalizedApiBase}/feedback`, {
                    workspace_id: workspaceId,
                    cost_intent: costIntent?.type || 'startup',
                    estimated_min: costRange.min || 0,
                    estimated_max: costRange.max || 0,
                    selected_provider: selectedProvider,
                    selected_profile: selectedProfile,
                    user_feedback: feedback
                });
                toast.success('Feedback recorded');
                if (onFeedbackSubmitted) {
                    onFeedbackSubmitted();
                }
            } catch (error) {
                console.warn('Feedback failed (non-blocking):', error);
                toast.success('Proceeding to code generation...');
                if (onFeedbackSubmitted) {
                    onFeedbackSubmitted();
                }
            }
                        
            onNext();
        } catch (error) {
            console.error('Feedback submission error:', error);
            toast.error('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="text-center space-y-4 mb-8">
                <h2 className="text-3xl font-bold text-white">One Quick Question</h2>
                <p className="text-gray-400">
                    Before we generate your Terraform code, help us calibrate our estimator.
                </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-8">
                <h3 className="text-lg font-medium text-white mb-6 text-center">
                    Is this cost estimate within your expected budget?
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => setFeedback('within_budget')}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${feedback === 'within_budget'
                                ? 'bg-green-500/10 border-green-500 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <span className="font-medium">Yes, it looks reasonable</span>
                        {feedback === 'within_budget' && <span className="material-icons text-green-500">check_circle</span>}
                    </button>

                    <button
                        onClick={() => setFeedback('slightly_high')}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${feedback === 'slightly_high'
                                ? 'bg-yellow-500/10 border-yellow-500 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <span className="font-medium">It's a bit higher than expected</span>
                        {feedback === 'slightly_high' && <span className="material-icons text-yellow-500">check_circle</span>}
                    </button>

                    <button
                        onClick={() => setFeedback('too_high')}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${feedback === 'too_high'
                                ? 'bg-red-500/10 border-red-500 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <span className="font-medium">No, it's significantly too high</span>
                        {feedback === 'too_high' && <span className="material-icons text-red-500">check_circle</span>}
                    </button>

                    <button
                        onClick={() => setFeedback('unknown')}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${feedback === 'unknown'
                                ? 'bg-blue-500/10 border-blue-500 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <span className="font-medium">I'm not sure / I have no baseline</span>
                        {feedback === 'unknown' && <span className="material-icons text-blue-500">check_circle</span>}
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-white/5">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                    <span className="material-icons">arrow_back</span>
                    <span>Back to Estimate</span>
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!feedback || isSubmitting}
                    className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>Generate Terraform</span>
                            <span className="material-icons">code</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FeedbackStep;