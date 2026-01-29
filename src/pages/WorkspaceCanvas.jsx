import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
import { validateProjectDescription } from '../utils/validation/intentValidator';

import FeedbackStep from '../components/FeedbackStep';
import TerraformStep from '../components/TerraformStep';
import RequirementsStep from '../components/RequirementsStep';
import ArchitectureStep from '../components/ArchitectureStep';
import DeploymentGuide from '../components/DeploymentGuide';
import DeployStep from '../components/DeployStep';

const WorkspaceCanvas = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState('input'); // input, processing, question, processing_spec, review_spec, deploy
    const [description, setDescription] = useState('');
    const [history, setHistory] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [infraSpec, setInfraSpec] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [usageProfile, setUsageProfile] = useState(null); // Step 2.5 data

    const [aiSnapshot, setAiSnapshot] = useState(null);
    const [costEstimation, setCostEstimation] = useState(null);
    const [costProfile, setCostProfile] = useState('cost_effective');
    const [workspaceId, setWorkspaceId] = useState(id === 'new' ? null : id);
    const [selectedProvider, setSelectedProvider] = useState(null); // Explicit selection
    const [architectureData, setArchitectureData] = useState(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [requirementsData, setRequirementsData] = useState(null);
    const [isDeployed, setIsDeployed] = useState(false); // 🔥 Track deployment status
    const [deploymentMethod, setDeploymentMethod] = useState(null); // 'self' or 'oneclick'
    const [isProjectLive, setIsProjectLive] = useState(false); // Track if project is live

    // Polish-to-Production States
    const [isAssumptionsDrifted, setIsAssumptionsDrifted] = useState(false);
    const [isUsageUserModified, setIsUsageUserModified] = useState(false);
    const [initialDescription, setInitialDescription] = useState('');
    const [serverError, setServerError] = useState(null); // 🔥 Track critical connectivity errors
    const [isMarkingDeployed, setIsMarkingDeployed] = useState(false);

    // V2 State
    const [domains, setDomains] = useState([]);
    const [traffic, setTraffic] = useState('medium');
    const [dbExcluded, setDbExcluded] = useState(false); // Simple boolean for now
    const [removedServices, setRemovedServices] = useState([]); // 🔥 Recycle Bin for services
    const [diagramImage, setDiagramImage] = useState(null); // 🔥 Store high-res architecture snapshot

    // Detect Drift
    useEffect(() => {
        // Only show drift warning if cost estimation exists AND description has actually changed
        // after initial load (not on page refresh when both values are set simultaneously)
        if (costEstimation && initialDescription && description !== initialDescription) {
            setIsAssumptionsDrifted(true);
        } else if (costEstimation && initialDescription && description === initialDescription) {
            // If they match, clear any drift warning
            setIsAssumptionsDrifted(false);
        }
    }, [description, initialDescription, costEstimation]);

    const handleApiError = (err, fallbackMsg = "An error occurred") => {
        console.error('[API ERROR]', err);
        setIsProcessing(false);

        let errMsg = fallbackMsg;
        if (err.response?.status === 401) {
            errMsg = "Your session has expired. Please login again.";
            toast.error(errMsg);
            setTimeout(() => navigate('/login'), 1500);
        } else if (err.response?.status === 500) {
            errMsg = "Server error occurred. Our team has been notified.";
            setServerError(errMsg);
        } else if (!err.response) {
            errMsg = "Cannot connect to server. Please ensure the backend is running.";
            setServerError(errMsg);
        } else {
            errMsg = err.response?.data?.msg || err.response?.data?.error || errMsg;
            toast.error(errMsg);
        }
        return errMsg;
    };

    // STEP 2.5: Usage Prediction Handler
    const handleAnalyzeUsage = async () => {
        if (isDeployed) {
            setStep('usage_review');
            return;
        }
        if (usageProfile) {
            console.log("Usage profile already exists, skipping redundant AI call.");
            setStep('usage_review');
            return;
        }
        setIsProcessing(true);
        setStep('processing_usage');

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await axios.post(`${API_BASE}/api/workflow/predict-usage`, {
                intent: aiSnapshot,
                infraSpec: infraSpec
            }, { headers });

            setTimeout(() => {
                setUsageProfile(res.data.data); // Store { usage_profile, rationale }
                setStep('usage_review');
                setIsProcessing(false);
                toast.success("Usage estimates generated!");
            }, 1000);

        } catch (err) {
            handleApiError(err, "Failed to estimate usage.");
            setStep('review_spec');
        }
    };

    // 🔥 SIRI ANIMATION HELPER: Triggers "thinking" state for synchronous transitions
    const transitionToStep = (nextStep) => {
        setIsProcessing(true); // Triggers .is-thinking class
        setTimeout(() => {
            setStep(nextStep);
            setIsProcessing(false);
        }, 800); // 800ms artificial delay for "intelligence" feel
    };

    // STEP 3: Cost Estimation Handler (Updated to use Usage Profile)
    const handleProceedToCostEstimation = async () => {
        if (isDeployed) {
            transitionToStep('cost_estimation');
            return;
        }

        if (!infraSpec || !aiSnapshot) {
            toast.error("Missing infrastructure data. Please restart.");
            return;
        }

        setIsProcessing(true);
        setStep('processing_cost');
        toast.loading("Analyzing costs across providers...", { id: 'cost-analysis' });

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Send usage profile if available (Layer B activation)
            const payload = {
                infraSpec,
                intent: aiSnapshot,
                cost_profile: costProfile, // Pass the selected cost profile to backend
                usage_profile: {
                    ...usageProfile?.usage_profile,
                    source: isUsageUserModified ? 'user_provided' : 'ai_inferred'
                }
            };

            // Reset drift states on new analysis
            setIsAssumptionsDrifted(false);
            setInitialDescription(description);

            const response = await axios.post(`${API_BASE}/api/workflow/cost-analysis`, payload, { headers });

            toast.dismiss('cost-analysis');

            if (response.data.step === 'cost_estimation') {
                setTimeout(() => {
                    const data = response.data.data;
                    setCostEstimation(data);

                    // Update infraSpec with sizing data from cost analysis
                    // This ensures TerraformStep has the required sizing information
                    if (data.sizing) {
                        setInfraSpec(prev => ({
                            ...prev,
                            sizing: data.sizing
                        }));
                    }

                    const providerFromRes = data.recommended?.provider || data.recommended_provider;
                    setSelectedProvider(providerFromRes ? providerFromRes.toUpperCase() : null);
                    transitionToStep('cost_estimation');
                    toast.success("Cost analysis complete!");
                }, 100);
            } else {
                throw new Error("Unexpected response from cost analysis");
            }

        } catch (err) {
            toast.dismiss('cost-analysis');
            handleApiError(err, "Failed to analyze costs.");
            transitionToStep('usage_review');
        } finally {
            setIsProcessing(false);
        }
    };


    // Load Workspace Data if ID is present
    useEffect(() => {
        const loadWorkspace = async () => {
            if (!id) return;

            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await axios.get(`${API_BASE}/api/workspaces/${id}`, { headers });
                const ws = res.data;

                // 🔥 Check if workspace is deployed
                const deploymentStatus = ws.state_json?.deployment?.status || ws.step;
                if (deploymentStatus === 'active' || ws.step === 'active_deployment') {
                    setIsDeployed(true);
                    console.log('[WORKSPACE] Deployed workspace - editing disabled');
                }

                setWorkspaceId(ws.id);
                setProjectData({ id: ws.project_id, name: ws.name }); // Ensure projectId is set

                // Hydrate State from JSON
                if (ws.state_json) {
                    const savedState = ws.state_json;
                    let hydratedStep = savedState.step || ws.step || 'input';

                    // MIGRATION: 'confirm_intent' is deprecated. Reset to input to restart flow.
                    if (hydratedStep === 'confirm_intent') {
                        hydratedStep = 'input';
                    }

                    setStep(hydratedStep);
                    setDescription(savedState.description || '');
                    setHistory(savedState.history || []);
                    setCurrentQuestion(savedState.currentQuestion || null);
                    setInfraSpec(savedState.infraSpec || null);

                    // Restore AI snapshot for cost estimation (prevents "missing infrastructure" error)
                    if (savedState.aiSnapshot) {
                        setAiSnapshot(savedState.aiSnapshot);
                    }

                    // Restore cost estimation data
                    if (savedState.costEstimation) {
                        setCostEstimation(savedState.costEstimation);
                    }
                    if (savedState.costProfile) {
                        setCostProfile(savedState.costProfile);
                    }
                    if (savedState.deploymentMethod) {
                        setDeploymentMethod(savedState.deploymentMethod);
                    }
                    // Restore selected provider
                    if (savedState.selectedProvider) {
                        setSelectedProvider(savedState.selectedProvider);
                    } else if (savedState.costEstimation?.recommended?.provider) {
                        // Fallback: extract from cost estimation
                        setSelectedProvider(savedState.costEstimation.recommended.provider.toUpperCase());
                    }

                    // Restore project live status
                    if (savedState.is_live !== undefined) {
                        setIsProjectLive(savedState.is_live);
                    }
                    if (savedState.is_deployed) {
                        setIsDeployed(savedState.is_deployed);
                    }

                    // Merge saved projectData (spec data) with structural data
                    if (savedState.projectData) {
                        setProjectData(prev => ({ ...prev, ...savedState.projectData }));
                    }

                    // Restore Usage Profile
                    if (savedState.usageProfile) {
                        setUsageProfile(savedState.usageProfile);
                    }

                    // Restore Removed Services (Recycle Bin)
                    if (savedState.removedServices) {
                        setRemovedServices(savedState.removedServices);
                    }

                    // Restore Architecture Snapshot
                    if (savedState.diagramImage) {
                        setDiagramImage(savedState.diagramImage);
                    }
                }

                // Set initial description to prevent false assumption drift warnings
                setInitialDescription(description);

                // If loading into a completed state, ensure toast doesn't annoy user, 
                // but console log success
                console.log("Workspace loaded:", ws.name);

            } catch (err) {
                handleApiError(err, "Failed to load workspace.");
                if (err.response?.status === 404) {
                    navigate('/workspaces');
                }
            }
        };

        loadWorkspace();
    }, [id, navigate]);

    const handleAnalyze = async () => {
        if (isDeployed) return;

        if (isDeployed) return;

        // 🔥 VALIDATION GATE
        const validation = validateProjectDescription(description);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }

        setIsProcessing(true);

        setStep('processing');

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const payload = {
                description: description,
                domains: domains, // Need to add UI for this
                toggles: {
                    traffic: traffic,
                    scaling: 'auto'
                },
                exclusions: {
                    database: dbExcluded
                }
            };

            // V2 API Call
            const res = await axios.post(`${API_BASE}/api/workflow/v2/analyze`, payload, { headers });

            setTimeout(() => {
                const { step: nextStep, data } = res.data;
                setIsProcessing(false);

                // Mapping V2 response to V1 frontend state logic
                if (nextStep === 'infra_spec_generated') {
                    setInfraSpec(data);
                    setProjectData({ name: data.project_name });
                    setAiSnapshot(data.intent); // 🔥 Ensure badges and features load
                    // V2 doesn't have intermediate confirmation step, goes straight to spec
                    transitionToStep('review_spec');
                    toast.success("V2 Architecture Generated Successfully!");
                } else {
                    // Fallback/Legacy logic if V2 behaves differently
                }
                // Fallback for unknown steps
                console.warn("Unknown Step:", nextStep);
                // Stay on processing or go back to input?
                // If we got data but unknown step, maybe error?
                if (!nextStep && !data) {
                    toast.error("Server returned empty response.");
                    transitionToStep('input');
                }
            }, 1200);

        } catch (err) {
            handleApiError(err, "Failed to analyze your request.");
            transitionToStep('input');
        }
    };

    // DEPRECATED: handleConfirmation removed.
    // If we ever need it back, look at git history.
    // RESTORED: As per Step1.txt "User Confirmation Gate"
    const handleConfirmation = async (approvedAnalysis) => {
        if (isDeployed) return;

        setIsProcessing(true);
        setStep('processing');

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // 🔥 FIX: Ensure description exists (fallback to stored description or workspace name)
            const finalDescription = description || projectData?.name || "User confirmed intent";

            const res = await axios.post(`${API_BASE}/api/workflow/analyze`, {
                userInput: finalDescription,
                conversationHistory: history,
                input_type: 'CONFIRMATION', // Tell backend user confirmed the intent
                approvedIntent: approvedAnalysis // Send back the logic gate approval
            }, { headers });

            setTimeout(() => {
                const { step: nextStep, data } = res.data;
                setIsProcessing(false);

                // Note: Step 2 returns 'infra_spec_generated' now.
                if (nextStep === 'refine_requirements') {
                    setCurrentQuestion(data);
                    transitionToStep('question');
                } else if (nextStep === 'infra_spec_generated') {
                    setInfraSpec(data);
                    setProjectData({ name: data.project_name });
                    transitionToStep('review_spec');
                    toast.success("Architecture Generated Successfully!");
                }
            }, 1000);
        } catch (err) {
            console.error('[CONFIRMATION ERROR]', err);
            setIsProcessing(false);
            setStep('confirm_intent');

            // Enhanced error messages
            let errMsg = "Failed to confirm and generate architecture.";

            if (err.response?.status === 400) {
                errMsg = err.response?.data?.msg || err.response?.data?.error || "Invalid confirmation data. Please try again.";
            } else if (err.response?.status === 401) {
                errMsg = "Session expired. Please login again.";
                setTimeout(() => navigate('/'), 1500);
            } else if (err.response?.status === 500) {
                errMsg = "Server error during architecture generation. Please try again.";
            } else if (!err.response) {
                errMsg = "Network error. Please check your connection.";
            } else {
                errMsg = err.response?.data?.msg || err.response?.data?.error || errMsg;
            }

            toast.error(errMsg, { duration: 5000 });
        }
    };
    const handleAnswerQuestion = async (answer) => {
        if (isDeployed) return;

        setSelectedOption(answer);

        setTimeout(async () => {
            const newHistory = [
                ...history,
                { role: 'user', content: description },
                { role: 'assistant', content: currentQuestion.clarifying_question },
                { role: 'user', content: answer }
            ];
            setHistory(newHistory);
            setCurrentQuestion(null);
            setSelectedOption(null);
            setIsProcessing(true);
            setStep('processing_spec');

            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await axios.post(`${API_BASE}/api/workflow/analyze`, {
                    // DO NOT send answer as userInput - it causes AI re-analysis
                    userInput: description, // Keep original description for context
                    conversationHistory: newHistory,
                    input_type: 'AXIS_ANSWER', // Tell backend this is an MCQ answer, NOT a description
                    ai_snapshot: aiSnapshot || currentQuestion?.full_analysis // Send frozen snapshot
                }, { headers });

                setTimeout(() => {
                    const { step: nextStep, data } = res.data;
                    setIsProcessing(false);

                    // Update snapshot if backend returns a new one
                    if (data?.full_analysis) {
                        setAiSnapshot(data.full_analysis);
                    }

                    if (nextStep === 'refine_requirements') {
                        setCurrentQuestion(data);
                        transitionToStep('question');
                    } else if (nextStep === 'confirm_intent') {
                        setCurrentQuestion(data);
                        transitionToStep('confirm_intent');
                    } else if (nextStep === 'infra_spec_generated') {
                        setInfraSpec(data);
                        setProjectData({ name: data.project_name });
                        transitionToStep('review_spec');
                        toast.success("Architecture Refined & Generated!");
                    }
                }, 1200);

            } catch (err) {
                handleApiError(err, "Failed to process your answer.");
                transitionToStep('question');
            }
        }, 600);
    };

    const handleSaveDraft = async (silent = false) => {
        if (isDeployed) {
            console.log("Draft save skipped: Project is deployed (read-only)");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const payload = {
                workspaceId, // Send existing ID if available to perform UPDATE
                projectId: projectData?.id, // Send project ID if available
                name: projectData?.name || `Draft ${new Date().toLocaleTimeString()}`,
                step: step,
                state: {
                    history,
                    description,
                    currentQuestion,
                    infraSpec,
                    projectData,
                    aiSnapshot,
                    costEstimation,
                    costProfile,
                    usageProfile, // 🔥 Persist Usage Profile
                    removedServices, // 🔥 Persist Removed Services
                    diagramImage, // 🔥 Persist high-res snapshot for report
                    step
                }
            };

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await axios.post(`${API_BASE}/api/workspaces/save`, payload, { headers });

            // Update local state with the returned ID so future saves are Updates
            setWorkspaceId(res.data.workspaceId);
            if (res.data.projectId) {
                setProjectData(prev => ({ ...prev, id: res.data.projectId }));
            }

            if (!silent) {
                toast.success(`Draft ${workspaceId ? 'Updated' : 'Saved'} Successfully!`);
            }

        } catch (err) {
            if (!silent) {
                handleApiError(err, "Failed to save draft.");
            } else {
                console.error("Silent Save Error:", err);
            }
        }
    };

    // Auto-save when step changes
    useEffect(() => {
        if (step && workspaceId && step !== 'input' && step !== 'processing' && !isDeployed) {
            // Debounce auto-save to prevent spam
            const timer = setTimeout(() => {
                handleSaveDraft(true); // Silent save
                console.log(`[Auto-save] Step: ${step}`);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [step, infraSpec, costEstimation, isDeployed]);




    // 🔥 NEW: Auto-Deployment Handler (Triggered by Terraform Load)
    // 🔥 NEW: Auto-Deployment Handler (Triggered by Terraform Load)
    const handleAutoDeploy = async () => {
        if (isDeployed) return;

        // Optimistic UI Update: Show "Live" toggle immediately
        setIsDeployed(true);
        toast.success('🚀 Project marked as Live!', { duration: 3000 });

        try {
            console.log('[DEPLOY] Auto-deploying workspace...');
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.put(`${API_BASE}/api/workspaces/${id}/deploy`, {
                deployment_method: 'self',
                provider: selectedProvider
            }, { headers });

        } catch (error) {
            console.error('[DEPLOY ERROR]', error);
            // Revert on critical failure (optional, but safer to keep it "Live" for UX if just a network blip)
            // setIsDeployed(false); 
            // handleApiError(error, "Failed to sync deployment status.");
        }
    };

    // 🔥 NEW: Handle Module Removal from Specification Step
    const handleRemoveModule = async (moduleName) => {
        if (isDeployed) return;

        // Find the module object
        const moduleToRemove = infraSpec.modules.find(m => (m.service_name || m.type) === moduleName);
        if (!moduleToRemove) return;

        // Critical Service Warning
        const isCritical = ['compute', 'database', 'storage'].includes(moduleToRemove.category);
        const warningMsg = isCritical
            ? `⚠️ WARNING: You are removing a CRITICAL component (${moduleName}).\n\nThis may make your architecture non-functional or cause data loss logic gaps.\n\nAre you sure you want to move this to the Removed Bin?`
            : `Are you sure you want to remove ${moduleName}? It will be moved to the Removed Bin and excluded from costs.`;

        if (!window.confirm(warningMsg)) {
            return;
        }

        try {
            console.log(`[SPEC] Removing module: ${moduleName}`);

            // 1. Optimistic Update
            setInfraSpec(prev => {
                const updatedModules = prev.modules.filter(m => (m.service_name || m.type) !== moduleName);
                return { ...prev, modules: updatedModules };
            });

            // 2. Add to Removed Bin
            setRemovedServices(prev => [...prev, moduleToRemove]);

            // 3. Trigger Save
            toast.success(`${moduleName} moved to Removed Services.`);
            setTimeout(() => handleSaveDraft(true), 100);

        } catch (err) {
            console.error('[REMOVE ERROR]', err);
            toast.error("Failed to remove module.");
        }
    };

    // 🔥 NEW: Check for Restore
    const handleRestoreModule = (moduleName) => {
        if (isDeployed) return;
        const moduleRestored = removedServices.find(m => (m.service_name || m.type) === moduleName);
        if (!moduleRestored) return;

        setInfraSpec(prev => ({
            ...prev,
            modules: [...(prev.modules || []), moduleRestored]
        }));

        setRemovedServices(prev => prev.filter(m => (m.service_name || m.type) !== moduleName));
        toast.success(`${moduleName} restored to architecture.`);
        setTimeout(() => handleSaveDraft(true), 100);
    };



    return (
        <div className="flex h-screen bg-background text-white font-inter relative selection:bg-primary/30 transition-all duration-500">
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: 'var(--color-surface, #171E2B)',
                    color: '#fff',
                    border: '1px solid var(--color-border, #2E3645)'
                }
            }} />

            {/* Global Error Banner */}
            {serverError && (
                <div className="fixed top-0 left-0 right-0 z-[1000] bg-red-600/95 backdrop-blur-md text-white p-4 shadow-2xl flex items-center justify-center gap-6 animate-slide-down border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="material-icons text-white animate-pulse">report_problem</span>
                        <span className="font-bold text-lg tracking-wide">{serverError}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setServerError(null); window.location.reload(); }}
                            className="px-6 py-2 bg-white text-red-600 rounded-xl text-sm font-black hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            RECONNECT NOW
                        </button>
                        <button
                            onClick={() => setServerError(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Dismiss"
                        >
                            <span className="material-icons text-xl">close</span>
                        </button>
                    </div>
                </div>
            )}
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Sidebar (Glass) */}
            <div className="w-64 bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col justify-between p-6 hidden md:flex z-10">
                <div className="space-y-8">
                    <div className="flex items-center space-x-3 text-primary font-bold text-xl tracking-tight">
                        <div className="flex items-center">
                            <a href={'/'}><img
                                src="/cloudiverse.png"
                                alt="Cloudiverse Architect"
                                className="h-12 w-auto"
                            /></a>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all cursor-pointer 
                            ${(step === 'input' || step === 'question' || step === 'processing')
                                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                    : 'text-gray-400 hover:bg-white/5'}`}
                            onClick={() => transitionToStep('input')}
                        >
                            <span className="material-icons text-sm">edit_note</span>
                            <span>Requirements</span>
                            {(infraSpec && step !== 'input' && step !== 'question' && step !== 'processing') && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                        </div>

                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                            ${step === 'review_spec'
                                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                    : ((!infraSpec && !isDeployed) ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 cursor-pointer')}`}
                            onClick={() => (infraSpec || isDeployed) && transitionToStep('review_spec')}
                        >
                            <span className="material-icons text-sm">schema</span>
                            <span>Specification</span>
                            {((infraSpec || isDeployed) && step !== 'review_spec') && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                        </div>

                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                            ${(step === 'cost_estimation' || step === 'processing_cost')
                                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                    : ((!infraSpec && !isDeployed) ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 cursor-pointer')}`}
                            onClick={() => (costEstimation || isDeployed) && transitionToStep('cost_estimation')}
                        >
                            <span className="material-icons text-sm">savings</span>
                            <span>Cost Estimator</span>
                            {((costEstimation || isDeployed) && step !== 'cost_estimation' && step !== 'processing_cost') && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                        </div>

                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                            ${step === 'architecture'
                                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                    : ((!costEstimation && !isDeployed) ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 cursor-pointer')}`}
                            onClick={() => (costEstimation || isDeployed) && transitionToStep('architecture')}
                        >
                            <span className="material-icons text-sm">account_tree</span>
                            <span>Diagram</span>
                            {((architectureData || isDeployed) && step !== 'architecture') && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                        </div>

                        {/* Terraform - Only show for Self Deployment path */}
                        {deploymentMethod === 'self' && (
                            <div
                                className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                                ${(step === 'terraform_view' || step === 'deployment_ready')
                                        ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                        : ((!feedbackSubmitted && !isDeployed) ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 cursor-pointer')}`}
                                onClick={() => (feedbackSubmitted || isDeployed) && transitionToStep('terraform_view')}
                            >
                                <span className="material-icons text-sm">code</span>
                                <span>Terraform</span>
                                {((feedbackSubmitted || isDeployed) && step !== 'terraform_view' && step !== 'deployment_ready') && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                            </div>
                        )}

                        {/* Connection - Show ONLY if 'oneclick' is selected */}
                        {(deploymentMethod === 'oneclick' || step === 'deploy' || step === 'deployment_processing') && (
                            <div
                                className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                                ${(step === 'deploy')
                                        ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                        : ((!costEstimation && !isDeployed) ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 cursor-pointer')}`}
                                onClick={() => (costEstimation || isDeployed) && transitionToStep('deploy')}
                            >
                                <span className="material-icons text-sm">link</span>
                                <span>Connection</span>
                                {(step === 'deployment_processing' || isDeployed) && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                            </div>
                        )}

                        {/* Resource Deployment - Show ONLY after connection or during processing */}
                        {(deploymentMethod === 'oneclick' && (step === 'deployment_processing' || isDeployed)) && (
                            <div
                                className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                                ${(step === 'deployment_processing' || step === 'deployment_ready')
                                        ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                        : 'text-gray-400 hover:bg-white/5 cursor-pointer'}`}
                                onClick={() => transitionToStep('deployment_processing')}
                            >
                                <span className="material-icons text-sm">rocket_launch</span>
                                <span>Deployment</span>
                                {(isDeployed && step !== 'deployment_processing') && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                            </div>
                        )}

                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all cursor-pointer text-gray-400 hover:bg-white/5`}
                            onClick={() => navigate(`/workspace/${workspaceId}/settings`)}
                        >
                            <span className="material-icons text-sm">settings</span>
                            <span>Settings</span>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Canvas */}
            <div className={`flex-1 flex flex-col relative overflow-y-auto z-10 backdrop-blur-sm ${(isProcessing || step.startsWith('processing')) ? 'is-thinking' : ''}`}>

                {/* Header */}
                <header className="min-h-[72px] py-4 border-b border-white/5 flex items-center justify-between px-8 bg-black/30 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-gray-200 tracking-wide">{projectData?.name || 'Untitled Project'}</span>
                        <div className="flex items-center space-x-2">
                            {isDeployed ? (
                                <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 tracking-wider uppercase flex items-center space-x-1">
                                    <span className="material-icons text-[10px]">check_circle</span>
                                    <span>Self-Deployed</span>
                                </span>
                            ) : (
                                <>
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 tracking-wider uppercase">Draft Mode</span>
                                    <button
                                        onClick={() => handleSaveDraft(false)}
                                        className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors uppercase tracking-wider flex items-center space-x-1"
                                    >
                                        <span className="material-icons text-[10px]">save</span>
                                        <span>{workspaceId ? 'Update Draft' : 'Save Draft'}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/workspaces')}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors flex items-center space-x-2"
                    >
                        <span className="material-icons text-sm">dashboard</span>
                        <span>Workspace Dashboard</span>
                    </button>
                </header>

                {/* Content Area - Siri Border Root */}
                <div className="flex-1 flex siri-border-active overflow-hidden relative">
                    <div className="w-full overflow-y-auto p-6 pt-4">
                        <div className="max-w-5xl space-y-8 mx-auto">
                            {/* 🔥 GLOBAL: Deployed Project Banner (View-Only Mode) */}
                            {isDeployed && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="material-icons text-green-400">verified</span>
                                        <div>
                                            <span className="text-green-400 font-bold">Deployed Project</span>
                                            <span className="text-gray-400 ml-2 text-sm">• View-only mode. Navigate using the sidebar to review all details.</span>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full">READ-ONLY</span>
                                </div>
                            )}

                            {/* OPTION A: ASSUMPTION DRIFT WARNING - Only show if NOT deployed */}
                            {!isDeployed && isAssumptionsDrifted && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between animate-shake">
                                    <div className="flex items-center space-x-3">
                                        <span className="material-icons text-yellow-500">warning</span>
                                        <div className="text-sm text-yellow-200">
                                            <b>Assumption Drift:</b> The project description has changed. Previous cost estimates may no longer be valid.
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAnalyze()}
                                        className="px-4 py-2 bg-yellow-500 text-black font-bold text-xs rounded-lg hover:bg-yellow-400 transition-colors"
                                    >
                                        Re-Analyze
                                    </button>
                                </div>
                            )}

                            {/* STEP: PROCESSING ANIMATION */}
                            {(step === 'processing' || step === 'processing_spec') && (
                                <div className="flex flex-col items-center justify-center h-[60vh] space-y-8 animate-fade-in">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="material-icons text-4xl text-white animate-pulse">grain</span>
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h2 className="text-2xl font-bold text-white">
                                            {step === 'processing' ? 'Analyzing Intent...' : 'Generating Blueprint...'}
                                        </h2>
                                        <p className="text-gray-400 animate-pulse">Architecting your production-grade infrastructure</p>
                                    </div>
                                </div>
                            )}

                            {/* STEP: INPUT */}
                            {step === 'input' && (
                                <div className="space-y-8 animate-fade-in-up mt-6">

                                    <div className="text-center space-y-4">
                                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
                                            {isDeployed ? 'Deployed Architecture' : 'Architect Your Vision'}
                                        </h1>
                                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                            {isDeployed
                                                ? 'Review your deployed infrastructure configuration below.'
                                                : 'Describe your application in plain English. Our AI Discovery Engine will analyze your intent and generate a production-grade infrastructure specification.'
                                            }
                                        </p>
                                    </div>
                                    {/* V2 Intent Controls (New Location) */}
                                    {/* V2 Intent Controls (New Location) */}
                                    <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                        {/* Domain Control - Full Width */}
                                        <div className="bg-surface border border-border rounded-xl p-6 hover:border-blue-500/30 transition-colors group/card">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover/card:bg-blue-500/20 transition-colors">
                                                        <span className="material-icons text-xl">category</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-bold text-white">Industry Domains</div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Domains add contextual bias (compliance, data patterns).<br />
                                                            They do not restrict architecture. You can select multiple.
                                                        </div>
                                                    </div>
                                                </div>
                                                <select
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val && !domains.includes(val)) {
                                                            setDomains([...domains, val]);
                                                        }
                                                    }}
                                                    className="bg-black/40 text-gray-200 text-sm font-medium rounded-lg px-4 py-2 border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer min-w-[160px]"
                                                    disabled={isDeployed}
                                                    value=""
                                                >
                                                    <option value="" disabled className="bg-surface text-gray-500">+ Add Tag</option>
                                                    <option value="commerce" className="bg-surface text-gray-200">E-Commerce</option>
                                                    <option value="saas" className="bg-surface text-gray-200">SaaS</option>
                                                    <option value="fintech" className="bg-surface text-gray-200">Fintech</option>
                                                    <option value="healthcare" className="bg-surface text-gray-200">Healthcare</option>
                                                    <option value="media" className="bg-surface text-gray-200">Media</option>
                                                    <option value="analytics" className="bg-surface text-gray-200">Analytics</option>
                                                    <option value="gaming" className="bg-surface text-gray-200">Gaming</option>
                                                    <option value="iot" className="bg-surface text-gray-200">IoT</option>
                                                    <option value="other" className="bg-surface text-gray-200">Other</option>
                                                </select>
                                            </div>

                                            {/* Chips */}
                                            <div className="flex flex-wrap gap-2 pl-[60px]">
                                                {domains.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-400 flex items-center space-x-2 animate-fade-in transition-all hover:bg-blue-500/20"
                                                    >
                                                        <span className="capitalize">{tag}</span>
                                                        <button
                                                            onClick={() => setDomains(domains.filter(d => d !== tag))}
                                                            className="hover:text-white transition-colors flex items-center"
                                                        >
                                                            <span className="material-icons text-[14px]">close</span>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>


                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative bg-surface border border-border rounded-2xl p-2 shadow-2xl">
                                            <textarea
                                                className="w-full h-48 bg-transparent text-xl p-8 focus:outline-none resize-none placeholder-gray-600 text-gray-200 font-light leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
                                                placeholder="e.g., I need a highly scalable e-commerce backend with microservices, handling 50k concurrent users, and strict PCI compliance..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                disabled={isDeployed}
                                                readOnly={isDeployed}
                                            />
                                            <div className="flex justify-between items-center px-8 py-5 bg-white/5 rounded-b-xl border-t border-white/5">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        disabled={isDeployed}
                                                    >
                                                        <span className="material-icons text-xl">mic</span>
                                                    </button>

                                                    <button
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        disabled={isDeployed}
                                                    >
                                                        <span className="material-icons text-xl">attach_file</span>
                                                    </button>
                                                </div>
                                                {!isDeployed && (
                                                    <button
                                                        onClick={handleAnalyze}
                                                        className="flex items-center space-x-3 px-8 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/20"
                                                    >
                                                        <span>Generate Architecture</span>
                                                        <span className="material-icons text-lg">auto_awesome</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP: QUESTION (AI Clarification) */}
                            {step === 'question' && currentQuestion && (
                                <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto mt-12 pb-20">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="material-icons text-primary text-3xl">psychology</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">Clarifying Requirements</h2>
                                        <p className="text-gray-400">{currentQuestion.clarifying_question}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {currentQuestion.suggested_options?.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerQuestion(typeof opt === 'object' ? (opt.value || opt.label) : opt)}
                                                className={`p-6 bg-surface border rounded-2xl text-left transition-all group relative overflow-hidden
                                                ${selectedOption === (typeof opt === 'object' ? (opt.value || opt.label) : opt) ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-white/20'}`}
                                            >
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-lg font-bold text-white mb-1">{typeof opt === 'object' ? opt.label : opt}</div>
                                                        {opt.description && <div className="text-sm text-gray-400 line-clamp-2">{opt.description}</div>}
                                                    </div>
                                                    <span className="material-icons text-gray-600 group-hover:text-primary transition-colors">arrow_forward</span>
                                                </div>
                                                {selectedOption === (typeof opt === 'object' ? (opt.value || opt.label) : opt) && (
                                                    <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP: CONFIRM INTENT (Mandatory per Doc) */}
                            {step === 'confirm_intent' && currentQuestion && (
                                <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto mt-12 pb-20">
                                    <div className="text-center space-y-4">
                                        <h2 className="text-3xl font-bold text-white">Confirm Project Scope</h2>
                                        <p className="text-gray-400">We've analyzed your requirements. Please confirm this summary before we generate the infrastructure.</p>
                                    </div>

                                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                                        {/* Summary Card */}
                                        <div className="space-y-8 relative z-10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                    AI Intent Snapshot
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center space-x-1">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        <span className="text-[10px] text-gray-500 uppercase">Confirmed</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        <span className="text-[10px] text-gray-500 uppercase">Excluded</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Goal</h4>
                                                        <p className="text-white font-medium capitalize prose prose-invert">{currentQuestion.intent?.primary_domain?.replace(/_/g, ' ') || 'Building an application'}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">Workload Pattern</h4>
                                                        <p className="text-white/80 text-sm italic">{currentQuestion.intent?.workload_type?.replace(/_/g, ' ') || 'Standard Workload'}</p>
                                                    </div>

                                                    {/* Explicit Exclusions Section */}
                                                    {currentQuestion.exclusions && currentQuestion.exclusions.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-bold text-red-500/70 uppercase tracking-widest mb-2 flex items-center">
                                                                <span className="material-icons text-xs mr-1">block</span>
                                                                Explicit Exclusions
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {currentQuestion.exclusions.map((ex, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-bold uppercase tracking-wider line-through decoration-red-500/50">
                                                                        {ex.replace(/_/g, ' ')}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Feature Resolution</h4>
                                                        <div className="space-y-4">
                                                            {/* Confirmed Features */}
                                                            <div className="space-y-2">
                                                                <div className="text-[10px] text-green-500 font-bold uppercase">Confirmed Present</div>
                                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {Object.entries(currentQuestion.features || {}).filter(([_, v]) => v === true).map(([f, _], i) => (
                                                                        <li key={i} className="flex items-center text-xs text-gray-200 bg-green-500/5 px-2 py-1 rounded">
                                                                            <span className="material-icons text-[12px] text-green-500 mr-2">check_circle</span>
                                                                            <span className="capitalize">{f.replace(/_/g, ' ')}</span>
                                                                        </li>
                                                                    ))}
                                                                    {Object.values(currentQuestion.features || {}).filter(v => v === true).length === 0 && (
                                                                        <li className="text-xs text-gray-500 italic">None detected.</li>
                                                                    )}
                                                                </ul>
                                                            </div>

                                                            {/* Unknown / Not Assumed */}
                                                            <div className="space-y-2">
                                                                <div className="text-[10px] text-gray-500 font-bold uppercase">What we did NOT assume</div>
                                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-60">
                                                                    {Object.entries(currentQuestion.features || {}).filter(([_, v]) => v === 'unknown' || v === false).map(([f, v], i) => (
                                                                        <li key={i} className="flex items-center text-xs text-gray-400">
                                                                            <span className="material-icons text-[12px] text-gray-600 mr-2">
                                                                                {v === false ? 'block' : 'help_outline'}
                                                                            </span>
                                                                            <span className="capitalize">{f.replace(/_/g, ' ')}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/5 flex flex-col space-y-4">
                                                <p className="text-xs text-gray-400 text-center">
                                                    <span className="material-icons text-[10px] align-middle mr-1">lock</span>
                                                    Confirming locks this intent as the <b>Single Source of Truth</b>.
                                                </p>
                                                <button
                                                    onClick={() => handleConfirmation(currentQuestion.full_analysis)}
                                                    className="w-full py-4 bg-primary hover:bg-primary-hover text-black font-extrabold rounded-2xl transition-all transform hover:scale-[1.01] shadow-xl shadow-primary/20 flex items-center justify-center space-x-3"
                                                >
                                                    <span>Confirm & Generate Blueprint</span>
                                                    <span className="material-icons">rocket_launch</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* STEP 2: REVIEW SPEC (Architecture) */}
                            {step === 'review_spec' && infraSpec && (
                                <div className="space-y-8 animate-fade-in">

                                    {/* SECTION 1: PROJECT SNAPSHOT */}
                                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -mr-10 -mt-10"></div>
                                        <button
                                            onClick={() => navigate(`/workspace/${workspaceId}/settings`)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-lg p-2 hover:bg-white/5"
                                        >
                                            <span className="material-icons text-sm">settings</span>
                                        </button>

                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Project Snapshot</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                                            <div className="md:col-span-2">
                                                <div className="text-xs text-gray-500 mb-1">Project Name</div>
                                                <div className="text-xl font-bold text-white tracking-tight flex items-center space-x-2 group">
                                                    <span>{projectData?.name || infraSpec.project_name || 'My Cloud Project'}</span>
                                                </div>

                                                {/* Description Display */}
                                                <div className="mt-2 group">
                                                    <div className="text-xs text-gray-500 mb-1">Description</div>
                                                    <p className="text-sm text-gray-400 line-clamp-2" title={projectData?.description}>
                                                        {projectData?.description || infraSpec.project_summary || description || "No description provided."}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Project Type</div>
                                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5">
                                                    <span className="material-icons text-xs">category</span>
                                                    <span className="capitalize">{infraSpec.architecture_pattern?.replace(/_/g, ' ') || 'Web App'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Client Type</div>
                                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5">
                                                    <span className="material-icons text-xs">devices</span>
                                                    <span className="capitalize">{aiSnapshot?.intent?.client_type || 'Web'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features Badges */}
                                        <div className="mt-6 pt-4 border-t border-white/5">
                                            <div className="flex flex-wrap gap-2">
                                                {aiSnapshot?.features && Object.entries(aiSnapshot.features).map(([key, val]) => {
                                                    if (val === true) {
                                                        return (
                                                            <span key={key} className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                {key.replace(/_/g, ' ')}
                                                            </span>
                                                        );
                                                    } else if (val === false) {
                                                        return (
                                                            <span key={key} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                                <span className="material-icons text-[10px]">block</span>
                                                                NO {key.replace(/_/g, ' ')}
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: HOW WE UNDERSTOOD YOUR PROJECT (Understanding) */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">✓</span>
                                            <h3 className="text-lg font-bold text-white">How we understood your project</h3>
                                        </div>

                                        <div className="bg-surface/50 border border-border rounded-2xl p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {infraSpec.explanations?.slice(0, 4).map((exp, idx) => (
                                                    <div key={idx} className="flex items-start space-x-3">
                                                        <span className="material-icons text-gray-500 text-sm mt-0.5">check</span>
                                                        <span className="text-sm text-gray-300 leading-relaxed">{exp}</span>
                                                    </div>
                                                ))}
                                                <div className="flex items-start space-x-3">
                                                    <span className="material-icons text-gray-500 text-sm mt-0.5">check</span>
                                                    <span className="text-sm text-gray-300 leading-relaxed">
                                                        Traffic scale assumption: <span className="text-white font-medium">{infraSpec.assumptions?.traffic_tier || 'Medium'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-4 italic">Based on your description and selected options.</p>
                                    </div>


                                    {/* SECTION 3: ARCHITECTURE OVERVIEW (Service List) */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="material-icons text-primary">schema</span>
                                            <h3 className="text-lg font-bold text-white">Architecture Overview</h3>
                                        </div>

                                        <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden hover:border-primary/30 transition-all duration-500">

                                            {/* AI Project Summary (Concise) */}
                                            <p className="text-white font-medium text-lg leading-relaxed border-b border-white/5 pb-4 mb-6">
                                                "{infraSpec.project_summary || 'Optimized cloud infrastructure.'}"
                                            </p>

                                            {/* Service List Grid */}
                                            <div className="mb-6">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Included Services & Infrastructure</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {infraSpec.modules?.map((mod, idx) => (
                                                        <div key={idx} className="flex items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-colors group relative">
                                                            {/* Remove Button - Only if NOT deployed */}
                                                            {!isDeployed && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveModule(mod.service_name || mod.type);
                                                                    }}
                                                                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all z-10"
                                                                    title="Remove from Specification"
                                                                >
                                                                    <span className="material-icons text-xs">delete</span>
                                                                </button>
                                                            )}
                                                            <span className="material-icons text-gray-500 text-sm mr-3">
                                                                {mod.category === 'compute' ? 'memory' :
                                                                    mod.category === 'storage' ? 'storage' :
                                                                        mod.category === 'database' ? 'database' : 'cloud'}
                                                            </span>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-bold text-white pr-6">{mod.service_name || mod.type}</div>
                                                                <div className="text-xs text-primary/80 uppercase font-bold tracking-wider">{mod.category}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* REMOVED SERVICES BIN (Recycle Bin) */}
                                            {removedServices.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-white/5 animate-fade-in-up mb-8">
                                                    <h4 className="text-xs font-bold text-red-400/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="material-icons text-sm">delete_outline</span>
                                                        Removed Services
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70 hover:opacity-100 transition-opacity">
                                                        {removedServices.map((mod, idx) => (
                                                            <div key={idx} className="flex items-center p-3 bg-red-500/5 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all group relative dashed-border animate-drop-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                                                {/* Restore Button */}
                                                                {!isDeployed && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRestoreModule(mod.service_name || mod.type);
                                                                        }}
                                                                        className="absolute top-2 right-2 p-1.5 bg-green-500/10 text-green-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-green-500/20 transition-all z-10"
                                                                        title="Restore to Specification"
                                                                    >
                                                                        <span className="material-icons text-xs">restore</span>
                                                                    </button>
                                                                )}
                                                                <span className="material-icons text-gray-600 text-sm mr-3 grayscale">
                                                                    {mod.category === 'compute' ? 'memory' :
                                                                        mod.category === 'storage' ? 'storage' :
                                                                            mod.category === 'database' ? 'database' : 'cloud'}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-bold text-gray-400 line-through decoration-red-500/30">{mod.service_name || mod.type}</div>
                                                                    <div className="text-xs text-gray-600 uppercase font-bold tracking-wider">{mod.category}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start space-x-2 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                                <span className="material-icons text-blue-400 text-sm mt-0.5">info</span>
                                                <p className="text-xs text-gray-400">
                                                    This architecture is designed for <strong>{infraSpec.assumptions?.traffic_tier}</strong> traffic.
                                                    Proceed to usage estimation to see detailed costs.
                                                </p>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Next Action */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleAnalyzeUsage}
                                            disabled={isProcessing || isDeployed}
                                            className={`px-8 py-4 bg-gradient-to-r from-primary to-purple-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <span>Estimate Usage & Costs</span>
                                            <span className="material-icons">analytics</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP: PROCESSING USAGE */}
                            {step === 'processing_usage' && (
                                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fade-in">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-4 border-primary/20"></div>
                                        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-semibold text-white">Analyzing Usage Patterns</p>
                                        <p className="text-gray-400 mt-2">AI is predicting realistic user traffic, storage, and bandwidth...</p>
                                    </div>
                                </div>
                            )}

                            {/* STEP: USAGE REVIEW (The Missing Link) */}
                            {step === 'usage_review' && usageProfile && (
                                <div className="space-y-8 animate-fade-in pb-20 max-w-4xl mx-auto">
                                    <div className="text-center space-y-4 mb-8">
                                        <div className="flex items-center justify-center space-x-2">
                                            <h2 className="text-3xl font-bold text-white">Estimated Usage Profile</h2>
                                            <div className="relative group">
                                                <span className="material-icons text-gray-400 cursor-help hover:text-primary transition-colors">info</span>
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-800 text-white text-xs rounded-xl shadow-lg w-72 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                    <strong className="text-primary">Infracost Integration</strong>
                                                    <p className="mt-1 text-gray-300 leading-relaxed">
                                                        These values are used to generate Infracost usage inputs for accurate, usage-based cloud pricing. Adjust to match your expected workload.
                                                    </p>
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 max-w-2xl mx-auto">
                                            Based on your project description ("{projectData?.name}"), we've inferred the following usage patterns to generate accurate costs.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Monthly Users */}
                                        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col hover:border-primary/50 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3">
                                                <span className="material-icons text-primary/20 group-hover:text-primary/40 transition-colors text-4xl">group</span>
                                            </div>
                                            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-4">Scale: Monthly Users</h3>
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Min</span>
                                                    <input
                                                        type="number"
                                                        disabled={isDeployed}
                                                        className={`w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-primary outline-none transition-colors ${isDeployed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={usageProfile?.usage_profile?.monthly_users?.min || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setUsageProfile(prev => ({
                                                                ...prev,
                                                                usage_profile: {
                                                                    ...(prev?.usage_profile || {}),
                                                                    monthly_users: {
                                                                        ...(prev?.usage_profile?.monthly_users || {}),
                                                                        min: val
                                                                    }
                                                                }
                                                            }));
                                                            setIsUsageUserModified(true);
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-gray-600 self-end mb-2">to</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Max</span>
                                                    <input
                                                        type="number"
                                                        disabled={isDeployed}
                                                        className={`w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-primary outline-none transition-colors ${isDeployed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={usageProfile?.usage_profile?.monthly_users?.max || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setUsageProfile(prev => ({
                                                                ...prev,
                                                                usage_profile: {
                                                                    ...(prev?.usage_profile || {}),
                                                                    monthly_users: {
                                                                        ...(prev?.usage_profile?.monthly_users || {}),
                                                                        max: val
                                                                    }
                                                                }
                                                            }));
                                                            setIsUsageUserModified(true);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 mt-auto">
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Expected Traffic</span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 italic leading-relaxed">
                                                    "{usageProfile.rationale?.monthly_users || "Based on typical growth for this workload type."}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Data Transfer */}
                                        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col hover:border-blue-500/50 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3">
                                                <span className="material-icons text-blue-500/20 group-hover:text-blue-500/40 transition-colors text-4xl">swap_horiz</span>
                                            </div>
                                            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-4">Network: Data Transfer (GB)</h3>
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Min</span>
                                                    <input
                                                        type="number"
                                                        disabled={isDeployed}
                                                        className={`w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-blue-500 outline-none transition-colors ${isDeployed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={usageProfile?.usage_profile?.data_transfer_gb?.min || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setUsageProfile(prev => ({
                                                                ...prev,
                                                                usage_profile: {
                                                                    ...(prev?.usage_profile || {}),
                                                                    data_transfer_gb: {
                                                                        ...(prev?.usage_profile?.data_transfer_gb || {}),
                                                                        min: val
                                                                    }
                                                                }
                                                            }));
                                                            setIsUsageUserModified(true);
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-gray-600 self-end mb-2">to</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Max</span>
                                                    <input
                                                        type="number"
                                                        disabled={isDeployed}
                                                        className={`w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-blue-500 outline-none transition-colors ${isDeployed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={usageProfile?.usage_profile?.data_transfer_gb?.max || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setUsageProfile(prev => ({
                                                                ...prev,
                                                                usage_profile: {
                                                                    ...(prev?.usage_profile || {}),
                                                                    data_transfer_gb: {
                                                                        ...(prev?.usage_profile?.data_transfer_gb || {}),
                                                                        max: val
                                                                    }
                                                                }
                                                            }));
                                                            setIsUsageUserModified(true);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 mt-auto">
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Egress/Bandwidth</span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 italic leading-relaxed">
                                                    "{usageProfile.rationale?.data_transfer_gb || "Simulates content delivery and API interactions."}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Storage */}
                                        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col hover:border-purple-500/50 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3">
                                                <span className="material-icons text-purple-500/20 group-hover:text-purple-500/40 transition-colors text-4xl">storage</span>
                                            </div>
                                            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-4">Capacity: Storage (GB)</h3>
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Min</span>
                                                    <input
                                                        type="number"
                                                        disabled={isDeployed}
                                                        className={`w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-purple-500 outline-none transition-colors ${isDeployed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={usageProfile?.usage_profile?.data_storage_gb?.min || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setUsageProfile(prev => ({
                                                                ...prev,
                                                                usage_profile: {
                                                                    ...(prev?.usage_profile || {}),
                                                                    data_storage_gb: {
                                                                        ...(prev?.usage_profile?.data_storage_gb || {}),
                                                                        min: val
                                                                    }
                                                                }
                                                            }));
                                                            setIsUsageUserModified(true);
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-gray-600 self-end mb-2">to</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Max</span>
                                                    <input
                                                        type="number"
                                                        disabled={isDeployed}
                                                        className={`w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-purple-500 outline-none transition-colors ${isDeployed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={usageProfile?.usage_profile?.data_storage_gb?.max || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setUsageProfile(prev => ({
                                                                ...prev,
                                                                usage_profile: {
                                                                    ...(prev?.usage_profile || {}),
                                                                    data_storage_gb: {
                                                                        ...(prev?.usage_profile?.data_storage_gb || {}),
                                                                        max: val
                                                                    }
                                                                }
                                                            }));
                                                            setIsUsageUserModified(true);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 mt-auto">
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Data Footprint</span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 italic leading-relaxed">
                                                    "{usageProfile.rationale?.data_storage_gb || usageProfile.rationale?.storage_gb || "Accounts for both database and file assets."}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                        <button
                                            onClick={() => transitionToStep('review_spec')} // Go back to architecture
                                            disabled={isDeployed}
                                            className={`px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium transition-colors flex items-center space-x-2 ${isDeployed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                                        >
                                            <span className="material-icons">arrow_back</span>
                                            <span>Back to Architecture</span>
                                        </button>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => {
                                                    setCostProfile('cost_effective');
                                                    handleProceedToCostEstimation();
                                                }}
                                                disabled={isProcessing || isDeployed}
                                                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span>Cost Effective</span>
                                                <span className="material-icons">trending_down</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCostProfile('high_performance');
                                                    handleProceedToCostEstimation();
                                                }}
                                                disabled={isProcessing || isDeployed}
                                                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span>High Performance</span>
                                                <span className="material-icons">speed</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP: COST ESTIMATION (Sections 4-8) */}
                            {step === 'cost_estimation' && costEstimation && (
                                <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto">

                                    {/* SECTION 5: CLOUD COMPARISON & SELECTION */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="material-icons text-primary">cloud</span>
                                                <h3 className="text-lg font-bold text-white">Cloud Provider Comparison</h3>
                                            </div>
                                            <div className="text-xs text-gray-500 italic">Select a provider to see specific details</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {(costEstimation.rankings || []).map(rank => {
                                                const isSelected = selectedProvider === rank.provider;

                                                return (
                                                    <div
                                                        key={rank.provider}
                                                        onClick={() => setSelectedProvider(rank.provider.toUpperCase())}
                                                        className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between
                                                        ${isSelected
                                                                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                                                : 'bg-surface border-border hover:border-white/20'}`}
                                                    >
                                                        {rank.recommended && (
                                                            <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-[10px] font-bold text-black uppercase tracking-tighter rounded-bl-xl shadow-lg">
                                                                Recommended
                                                            </div>
                                                        )}

                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold
                                                            ${rank.provider === 'AWS' ? 'bg-[#FF9900]/20 text-[#FF9900]' :
                                                                    rank.provider === 'GCP' ? 'bg-[#4285F4]/20 text-[#4285F4]' : 'bg-[#0078D4]/20 text-[#0078D4]'}`}>
                                                                {rank.provider === 'AWS' ? 'AWS' : rank.provider === 'GCP' ? 'GCP' : 'AZ'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{rank.provider === 'AZURE' ? 'Azure' : rank.provider}</div>
                                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest">{rank.score}% Score</div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="text-xl font-bold text-white leading-tight">
                                                                {rank.cost_range?.formatted || rank.formatted_cost}
                                                                {(rank.monthly_cost && rank.monthly_cost < 1) && (
                                                                    <div className="text-[10px] text-amber-400">
                                                                        {rank.cost_intent === 'hobby' ? 'Hobby-scale lower bound' : 'Estimated minimum'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 uppercase">{rank.recommended ? 'Recommended configuration (Cost-Effective)' : 'Estimated Monthly Cost'}</div>
                                                            {/* Show the cost profile used for this provider */}
                                                            {(() => {
                                                                // Try to find which profile was used for this provider
                                                                let profileUsed = 'standard'; // default fallback

                                                                if (costEstimation.scenarios) {
                                                                    // Check each profile to see if this provider has data
                                                                    for (const [profileName, providers] of Object.entries(costEstimation.scenarios)) {
                                                                        if (providers[rank.provider]) {
                                                                            profileUsed = profileName;
                                                                            break;
                                                                        }
                                                                    }
                                                                }

                                                                return (
                                                                    <div className="text-[10px] text-gray-400">
                                                                        {profileUsed.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} profile
                                                                    </div>
                                                                );
                                                            })()}
                                                            {rank.recommended && costEstimation?.recommendation_facts?.facts?.dominant_drivers?.[0] && (
                                                                <div className="text-[10px] text-amber-400 italic mt-1">
                                                                    {`${costEstimation.recommendation_facts.facts.dominant_drivers[0].name} is a key cost driver at your usage level.`}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {isSelected && (
                                                            <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between text-[10px] text-primary font-bold uppercase tracking-wider">
                                                                <span>Selected</span>
                                                                <span className="material-icons text-[12px]">check_circle</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 🆕 WHY THIS PROVIDER? - Collapsible Dropdown */}
                                    {(() => {
                                        const recommended = (costEstimation.rankings || []).find(r => r.recommended);
                                        const selected = (costEstimation.rankings || []).find(r => r.provider === selectedProvider);
                                        const target = selected || recommended;

                                        if (!target) return null;

                                        // Provider strengths database
                                        const providerStrengths = {
                                            'AWS': {
                                                strengths: ['Largest service catalog', 'Most mature ML/AI services', 'Best-in-class serverless (Lambda)', 'Global infrastructure'],
                                                bestFor: ['Enterprise workloads', 'ML/AI applications', 'Scalable architectures', 'Multi-region deployments']
                                            },
                                            'GCP': {
                                                strengths: ['Cost-effective compute', 'Superior Kubernetes (GKE)', 'Advanced analytics', 'Strong ML tooling'],
                                                bestFor: ['Data analytics', 'Machine learning', 'Container workloads', 'Startups & scale-ups']
                                            },
                                            'AZURE': {
                                                strengths: ['Enterprise integration', 'Hybrid cloud leader', 'Microsoft ecosystem', 'Strong compliance'],
                                                bestFor: ['Enterprise IT', 'Hybrid deployments', 'Microsoft stack users', 'Regulated industries']
                                            }
                                        };

                                        const sortedByPrice = [...(costEstimation.rankings || [])].sort((a, b) => (a.monthly_cost || 0) - (b.monthly_cost || 0));
                                        const cheapest = sortedByPrice[0];
                                        const isCheapest = target.provider === cheapest?.provider;
                                        const providerName = target.provider === 'AZURE' ? 'Azure' : target.provider;
                                        const targetInfo = {
                                            strengths: target.pros?.length > 0 ? target.pros : (providerStrengths[target.provider]?.strengths || []),
                                            bestFor: target.best_for?.length > 0 ? target.best_for : (providerStrengths[target.provider]?.bestFor || [])
                                        };

                                        return (
                                            <details className="group bg-gradient-to-br from-surface/80 to-surface/40 border border-border rounded-2xl transition-all hover:border-primary/30">
                                                <summary className="px-6 py-4 cursor-pointer flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold
                                                        ${target.provider === 'AWS' ? 'bg-[#FF9900]/20 text-[#FF9900]' :
                                                                target.provider === 'GCP' ? 'bg-[#4285F4]/20 text-[#4285F4]' : 'bg-[#0078D4]/20 text-[#0078D4]'}`}>
                                                            {target.provider === 'AWS' ? 'AWS' : target.provider === 'GCP' ? 'GCP' : 'AZ'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white">Why {providerName}?</h4>
                                                            <p className="text-xs text-gray-400">Click to see why this provider is recommended</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {target.recommended && (
                                                            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold rounded-full">
                                                                ✓ Best Match
                                                            </span>
                                                        )}
                                                        <span className="material-icons text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                                    </div>
                                                </summary>

                                                <div className="px-6 pb-6 space-y-4 animate-fade-in">
                                                    {/* Main Explanation */}
                                                    <p className="text-sm text-gray-200 leading-relaxed">
                                                        Based on your <span className="text-primary font-semibold">{costProfile.replace('_', ' ')}</span> profile
                                                        and project requirements, <span className="text-white font-semibold">{providerName}</span> is
                                                        {isCheapest ?
                                                            ` the most cost-effective option at ${target.formatted_cost || `$${target.monthly_cost?.toFixed(2)}/mo`}` :
                                                            ` your best choice at ${target.formatted_cost || `$${target.monthly_cost?.toFixed(2)}/mo`}`
                                                        }.
                                                    </p>

                                                    {/* Provider Strengths */}
                                                    {(targetInfo.strengths || []).length > 0 && (
                                                        <div className="space-y-2">
                                                            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Why {providerName} Works For You</div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {targetInfo.strengths.slice(0, 4).map((strength, idx) => (
                                                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                                                                        <span className="material-icons text-green-400 text-sm">check_circle</span>
                                                                        {strength}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Best For */}
                                                    {Array.isArray(targetInfo.bestFor) && targetInfo.bestFor.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                            {targetInfo.bestFor.slice(0, 4).map((use, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] rounded-full border border-white/10">
                                                                    {use}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Score Summary */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                        <div className="flex items-center gap-6 text-xs">
                                                            <div>
                                                                <span className="text-gray-400">Overall Score</span>
                                                                <div className="text-lg font-bold text-primary">{target.score || target.final_score}%</div>
                                                            </div>
                                                            {target.cost_score && (
                                                                <div>
                                                                    <span className="text-gray-400">Cost</span>
                                                                    <div className="text-lg font-bold text-green-400">{target.cost_score}</div>
                                                                </div>
                                                            )}
                                                            {target.performance_score && (
                                                                <div>
                                                                    <span className="text-gray-400">Performance</span>
                                                                    <div className="text-lg font-bold text-blue-400">{target.performance_score}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 uppercase">Estimated Monthly</div>
                                                            <div className="text-xl font-bold text-white">{target.formatted_cost || `$${target.monthly_cost?.toFixed(2)}`}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </details>
                                        );
                                    })()}

                                    {/* 🆕 CONFIDENCE DETAILS COLLAPSIBLE */}
                                    <details className="group bg-surface/50 border border-border rounded-2xl transition-all hover:border-primary/30">
                                        <summary className="px-6 py-4 cursor-pointer flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="material-icons text-green-400 text-lg">verified</span>
                                                <span className="font-bold text-white">Confidence Details</span>
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">
                                                    {costEstimation.confidence_percentage || Math.round((costEstimation.confidence || 0) * 100)}%
                                                </span>
                                            </div>
                                            <span className="material-icons text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                        </summary>
                                        <div className="px-6 pb-6 space-y-4 animate-fade-in">
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                Confidence is based on the <strong className="text-white">"weakest link"</strong> principle — the overall score is capped by the lowest individual factor.
                                            </p>
                                            <div className="space-y-3">
                                                <div className="space-y-3">
                                                    {(() => {
                                                        const breakdown = costEstimation.confidence_breakdown || (costEstimation.breakdown ? {
                                                            usage_completeness: {
                                                                label: 'Based on input density',
                                                                score: Math.round((costEstimation.breakdown.usage_confidence || 0.5) * 100)
                                                            },
                                                            pricing_method: {
                                                                label: 'Based on provider API coverage',
                                                                score: Math.round((costEstimation.breakdown.estimate_type_score || 0.8) * 100)
                                                            },
                                                            architecture_completeness: {
                                                                label: 'Based on service definitions',
                                                                score: Math.round((costEstimation.breakdown.architecture_score || 0.7) * 100)
                                                            }
                                                        } : null);

                                                        if (breakdown) {
                                                            return (
                                                                <>
                                                                    {/* Usage Completeness */}
                                                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                                        <div className="flex items-center space-x-3">
                                                                            <span className="material-icons text-blue-400 text-lg">data_usage</span>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-white">Usage Data Completeness</div>
                                                                                <div className="text-xs text-gray-400">{breakdown.usage_completeness?.label || 'Inferred from description'}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-lg font-bold text-blue-400">{breakdown.usage_completeness?.score || 0}%</div>
                                                                    </div>
                                                                    {/* Pricing Method */}
                                                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                                        <div className="flex items-center space-x-3">
                                                                            <span className="material-icons text-green-400 text-lg">calculate</span>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-white">Pricing Method Reliability</div>
                                                                                <div className="text-xs text-gray-400">{breakdown.pricing_method?.label || 'Heuristic Estimation'}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-lg font-bold text-green-400">{breakdown.pricing_method?.score || 0}%</div>
                                                                    </div>
                                                                    {/* Architecture Completeness */}
                                                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                                        <div className="flex items-center space-x-3">
                                                                            <span className="material-icons text-purple-400 text-lg">architecture</span>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-white">Architecture Completeness</div>
                                                                                <div className="text-xs text-gray-400">{breakdown.architecture_completeness?.label || 'Pattern-based Standard'}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-lg font-bold text-purple-400">{breakdown.architecture_completeness?.score || 0}%</div>
                                                                    </div>
                                                                </>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="text-sm text-gray-500 italic">
                                                                    {costEstimation.confidence_explanation?.[0] || "Detailed breakdown not generated, but overall confidence is calculated."}
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                    </details>

                                    {/* SECTION 5: COST ESTIMATE & CONFIDENCE */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="material-icons text-green-400">paid</span>
                                            <h3 className="text-lg font-bold text-white">Cost Details & Confidence</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Confidence Card */}
                                            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                                                <div className="relative w-24 h-24 mb-3">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2E3645" strokeWidth="4" />
                                                        <path
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke={
                                                                (typeof costEstimation.confidence === "number" && costEstimation.confidence > 0.8) ? "#22c55e" :
                                                                    (typeof costEstimation.confidence === "number" && costEstimation.confidence > 0.5) ? "#eab308" : "#ef4444"
                                                            }
                                                            strokeWidth="4"
                                                            strokeDasharray={`${(costEstimation.confidence || 0) * 100}, 100`}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-xl font-bold text-white">
                                                            {typeof costEstimation.confidence === "number" ? ((costEstimation.confidence * 100).toFixed(0)) : "0"}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                                                    <span>Confidence</span>
                                                    <div className="relative group">
                                                        <span className="material-icons text-xs text-gray-400 cursor-help">info</span>
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg w-64 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            {costEstimation.confidence_explanation?.join('. ') || 'Confidence based on service resolution, data quality, and estimate type.'}
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                                    {costEstimation.confidence_explanation?.[0] || 'Based on architecture completeness and data quality.'}
                                                </p>
                                                {/* ✅ NEW: Show estimate type */}
                                                {(costEstimation.recommended?.estimate_type || costEstimation.providers?.[selectedProvider]?.estimate_type) && (
                                                    <div className="mt-3 w-full">
                                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${(costEstimation.recommended?.estimate_type === 'exact' || costEstimation.providers?.[selectedProvider]?.estimate_type === 'exact')
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                            }`}>
                                                            {(costEstimation.recommended?.estimate_type === 'exact' || costEstimation.providers?.[selectedProvider]?.estimate_type === 'exact')
                                                                ? '✅ Exact (Terraform-based)'
                                                                : '⚠️ Estimated (Heuristic)'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Score Card */}
                                            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                                                <div className="text-3xl font-bold text-white mb-3">
                                                    {(() => {
                                                        // Find the selected provider's score from rankings
                                                        const selectedRank = costEstimation.rankings?.find(rank => rank.provider === selectedProvider);
                                                        // If not found in rankings, try to get from scenarios
                                                        if (!selectedRank?.score) {
                                                            const scenarioResult = costEstimation.scenarios
                                                                ? Object.values(costEstimation.scenarios)
                                                                    .map(profile => profile[selectedProvider])
                                                                    .find(result => result)
                                                                : null;
                                                            return scenarioResult?.score || costEstimation.recommended?.score || 'N/A';
                                                        }
                                                        return selectedRank.score;
                                                    })()}
                                                </div>
                                                <div className="text-sm font-bold text-white uppercase tracking-wider">% Score</div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {selectedProvider || 'Provider'} competitiveness
                                                </p>
                                            </div>

                                            {/* Basis Card */}
                                            <div className="col-span-1 md:col-span-2 bg-surface border border-border rounded-2xl p-6">
                                                <h4 className="text-xs text-gray-500 uppercase font-bold mb-4">Estimate Based On</h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <div className="text-2xl font-bold text-white">
                                                            {usageProfile?.usage_profile?.monthly_users
                                                                ? (typeof usageProfile.usage_profile.monthly_users === 'object'
                                                                    ? `${(usageProfile.usage_profile.monthly_users.min || 0).toLocaleString()} - ${(usageProfile.usage_profile.monthly_users.max || 0).toLocaleString()}`
                                                                    : usageProfile.usage_profile.monthly_users.toLocaleString())
                                                                : (costEstimation?.recommendation_facts?.facts?.usage?.monthly_users
                                                                    ? (typeof costEstimation.recommendation_facts.facts.usage.monthly_users === 'object'
                                                                        ? `${(costEstimation.recommendation_facts.facts.usage.monthly_users.min || 0).toLocaleString()} - ${(costEstimation.recommendation_facts.facts.usage.monthly_users.max || 0).toLocaleString()}`
                                                                        : costEstimation.recommendation_facts.facts.usage.monthly_users.toLocaleString())
                                                                    : '5,000')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Monthly Users</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-white">
                                                            {usageProfile?.usage_profile?.data_transfer_gb
                                                                ? (typeof usageProfile.usage_profile.data_transfer_gb === 'object'
                                                                    ? `${usageProfile.usage_profile.data_transfer_gb.min || 0} - ${usageProfile.usage_profile.data_transfer_gb.max || 0} GB`
                                                                    : `${usageProfile.usage_profile.data_transfer_gb} GB`)
                                                                : (costEstimation?.recommendation_facts?.facts?.usage?.data_transfer_gb
                                                                    ? (typeof costEstimation.recommendation_facts.facts.usage.data_transfer_gb === 'object'
                                                                        ? `${costEstimation.recommendation_facts.facts.usage.data_transfer_gb.min || 0} - ${costEstimation.recommendation_facts.facts.usage.data_transfer_gb.max || 0} GB`
                                                                        : `${costEstimation.recommendation_facts.facts.usage.data_transfer_gb} GB`)
                                                                    : '50 GB')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Data Transfer</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-white">
                                                            {usageProfile?.usage_profile?.data_storage_gb
                                                                ? (typeof usageProfile.usage_profile.data_storage_gb === 'object'
                                                                    ? `${usageProfile.usage_profile.data_storage_gb.min || 0} - ${usageProfile.usage_profile.data_storage_gb.max || 0} GB`
                                                                    : `${usageProfile.usage_profile.data_storage_gb} GB`)
                                                                : (costEstimation?.recommendation_facts?.facts?.usage?.data_storage_gb
                                                                    ? (typeof costEstimation.recommendation_facts.facts.usage.data_storage_gb === 'object'
                                                                        ? `${costEstimation.recommendation_facts.facts.usage.data_storage_gb.min || 0} - ${costEstimation.recommendation_facts.facts.usage.data_storage_gb.max || 0} GB`
                                                                        : `${costEstimation.recommendation_facts.facts.usage.data_storage_gb} GB`)
                                                                    : '10 GB')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Storage</div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-white/5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(() => {
                                                            // Try to get services from recommended path first
                                                            const recommendedServices = costEstimation.recommended?.provider === selectedProvider
                                                                ? costEstimation.recommended.services
                                                                : null;

                                                            // Fallback to provider_details if recommended doesn't match or doesn't have services
                                                            const services = recommendedServices || costEstimation.provider_details?.[selectedProvider || 'aws']?.services || [];

                                                            return services
                                                                .slice(0, 6)
                                                                .map((s, idx) => (
                                                                    <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                                                                        {s.cloud_service || s.display_name}
                                                                    </span>
                                                                ));
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Recommendation Details - Collapsible with Cost */}
                                                {costEstimation?.recommendation_facts && costEstimation.recommendation_facts.provider && (
                                                    <div className="mt-4 pt-4 border-t border-amber-500/20">
                                                        <details className="group">
                                                            <summary className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2 cursor-pointer flex items-center justify-between list-none">
                                                                <div className="flex items-center">
                                                                    <span className="material-icons text-xs mr-1 group-open:rotate-180 transition-transform">expand_more</span>
                                                                    <span>Why {(costEstimation.recommendation_facts.provider || 'This Provider').toUpperCase()}?</span>
                                                                </div>
                                                                <span className="text-[10px] text-gray-500 font-normal normal-case group-open:hidden">Click to see rationale & cost</span>
                                                            </summary>

                                                            <div className="space-y-3 mt-3 animate-fade-in">
                                                                <div className="space-y-1 text-xs text-gray-300">
                                                                    {(costEstimation.recommendation_facts.pros || []).map((pro, idx) => (
                                                                        <div key={idx} className="flex items-start">
                                                                            <span className="text-green-400 mr-1">•</span>
                                                                            <span>{pro}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                                                                    <div>
                                                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Estimated Cost</div>
                                                                        <div className="text-sm font-bold text-white">
                                                                            {(() => {
                                                                                const target = costEstimation?.rankings?.find(r => r.provider === selectedProvider);
                                                                                return target?.formatted_cost || `$${target?.monthly_cost?.toFixed(2) || '0.00'}`;
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Competitiveness</div>
                                                                        <div className="text-sm font-bold text-primary">{(costEstimation.rankings?.find(r => r.provider === selectedProvider)?.score || 0)}%</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </details>
                                                    </div>
                                                )}


                                                {/* Warnings / Recommendations */}
                                                {costEstimation?.recommendation_facts?.warnings?.length > 0 && (
                                                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="material-icons text-yellow-500 text-sm">lightbulb</span>
                                                            <span className="text-xs font-bold text-yellow-500 uppercase">Optimization Tips</span>
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {costEstimation.recommendation_facts.warnings.slice(0, 2).map((w, i) => (
                                                                <li key={i} className="text-xs text-gray-400 pl-4 relative">
                                                                    <span className="absolute left-0 top-1 w-1 h-1 rounded-full bg-yellow-500/50"></span>
                                                                    {w}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                            </div>
                                        </div>

                                        {/* Action Buttons Footer */}
                                        <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                            <button
                                                onClick={() => transitionToStep('usage_review')}
                                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                                            >
                                                <span className="material-icons">arrow_back</span>
                                                <span>Back to Usage Review</span>
                                            </button>

                                            <button
                                                onClick={() => transitionToStep('architecture')}
                                                className="px-8 py-4 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
                                            >
                                                <span>View Architecture Diagram</span>
                                                <span className="material-icons text-sm">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: REQUIREMENTS CAPTURE */}
                            {step === 'requirements' && (
                                <RequirementsStep
                                    workspaceId={id}
                                    infraSpec={infraSpec}
                                    costEstimation={costEstimation}
                                    onNext={() => transitionToStep('architecture')}
                                    onBack={() => transitionToStep('cost_estimation')}
                                    onRequirementsCaptured={setRequirementsData}
                                    isDeployed={isDeployed}
                                />
                            )}

                            {/* STEP 5: ARCHITECTURE DIAGRAM (Design Confirmation) */}
                            {step === 'architecture' && (
                                <ArchitectureStep
                                    workspaceId={id}
                                    infraSpec={infraSpec}
                                    costEstimation={costEstimation}
                                    selectedProvider={selectedProvider}
                                    selectedProfile={costProfile}
                                    usageProfile={usageProfile}
                                    requirementsData={requirementsData}
                                    architectureData={architectureData}
                                    onArchitectureDataLoaded={setArchitectureData}
                                    onInfraSpecUpdate={setInfraSpec}
                                    onDiagramImageSave={setDiagramImage}
                                    onNext={(method) => {
                                        setDeploymentMethod(method);
                                        if (method === 'self') {
                                            transitionToStep('feedback');
                                        } else if (method === 'oneclick') {
                                            transitionToStep('deploy');
                                        }
                                    }}
                                    onBack={() => transitionToStep('cost_estimation')}
                                    isDeployed={isDeployed}
                                />
                            )}

                            {/* STEP: DEPLOY */}
                            {step === 'deploy' && (
                                <DeployStep
                                    workspace={{
                                        id,
                                        project_name: projectData?.name || infraSpec?.project_name,
                                        state_json: {
                                            infraSpec,
                                            costEstimation,
                                            connection: infraSpec?.connection || costEstimation?.connection || {}
                                        }
                                    }}
                                    selectedProvider={selectedProvider}
                                    onBack={() => transitionToStep('architecture')}
                                    onUpdateWorkspace={() => handleSaveDraft(true)}
                                    onDeploySuccess={() => transitionToStep('deployment_processing')}
                                />
                            )}

                            {/* STEP 5: FEEDBACK (Pre-Terraform) */}
                            {step === 'feedback' && (
                                <FeedbackStep
                                    workspaceId={id}
                                    costEstimation={costEstimation}
                                    selectedProvider={selectedProvider}
                                    costIntent={usageProfile?.intent}
                                    onFeedbackSubmitted={() => setFeedbackSubmitted(true)}
                                    onNext={() => transitionToStep('terraform_view')}
                                    onBack={() => transitionToStep('architecture')}
                                    isDeployed={isDeployed}
                                />
                            )}

                            {/* STEP 5: TERRAFORM VIEW */}
                            {step === 'terraform_view' && (
                                <TerraformStep
                                    workspaceId={id}
                                    infraSpec={infraSpec}
                                    selectedProvider={selectedProvider}
                                    costEstimation={costEstimation}
                                    onComplete={() => transitionToStep('deployment_summary')}
                                    onBack={() => transitionToStep('feedback')}
                                    isDeployed={isDeployed}
                                    onDeploy={() => setIsDeployed(true)}
                                />
                            )}

                            {/* Processing Cost State */}
                            {step === 'processing_cost' && (
                                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fade-in">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-4 border-primary/20"></div>
                                        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-semibold text-white">Analyzing Cloud Costs</p>
                                        <p className="text-gray-400 mt-2">Comparing AWS, GCP, and Azure pricing...</p>
                                    </div>
                                </div>
                            )}

                            {/* STEP: DEPLOYMENT PROCESSING (Transition Step) */}
                            {step === 'deployment_processing' && (
                                <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 animate-fade-in py-20">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-3xl border-2 border-primary/20 rotate-12 animate-pulse"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-2xl border-4 border-transparent border-t-primary animate-spin"></div>
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-lg animate-bounce">
                                            <span className="material-icons text-primary">rocket_launch</span>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-4 max-w-md">
                                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Provisioning Infrastructure</h2>
                                        <p className="text-gray-400 leading-relaxed">
                                            Launching your {selectedProvider} stack with optimized configurations.
                                            This usually takes a few minutes.
                                        </p>

                                        <div className="pt-8">
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-primary animate-progress-indefinite"></div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <span>Initializing API</span>
                                                <span className="text-primary animate-pulse">Running</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsDeployed(true);
                                            transitionToStep('deployment_ready');
                                        }}
                                        className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-4 decoration-gray-700 mt-10"
                                    >
                                        Simulate Completion
                                    </button>
                                </div>
                            )}

                            {/* Deployment Ready Step */}
                            {step === 'deployment_ready' && (
                                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-fade-in">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                                            <span className="material-icons text-4xl text-green-400">check_circle</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">Deployment Active</h2>
                                        <p className="text-gray-400 mt-3 max-w-md">
                                            Your infrastructure is live and running.
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col items-center space-y-4">
                                        <button
                                            onClick={() => navigate('/workspaces')}
                                            className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-green-500/20"
                                        >
                                            <span className="material-icons">dashboard</span>
                                            <span>Return to Dashboard</span>
                                        </button>
                                        <button
                                            onClick={() => transitionToStep('terraform_view')}
                                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                                        >
                                            <span className="material-icons">code</span>
                                            <span>View Code</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP: DEPLOYMENT SUMMARY (Self-Deployment with Terraform Preview) */}
                            {step === 'deployment_summary' && (
                                <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto">
                                    {/* Success Header */}
                                    <div className="text-center mb-10">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                                            <span className="material-icons text-5xl text-green-400">rocket_launch</span>
                                        </div>
                                        <h2 className="text-4xl font-bold text-white tracking-tight">Deployment Ready</h2>
                                        <p className="text-gray-400 mt-3 text-lg">
                                            Your infrastructure configuration for <span className="text-primary font-bold">{infraSpec.project_name || 'Cloudiverse Project'}</span> is complete.
                                        </p>
                                    </div>

                                    {/* Unified Deployment Summary Box */}
                                    <div className="max-w-2xl mx-auto bg-surface/50 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5 mb-10">
                                        {/* Provider Section */}
                                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                                    <span className="material-icons text-cyan-400">cloud</span>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Provider</div>
                                                    <div className="text-white font-bold text-lg">{selectedProvider?.toUpperCase()}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-500/20">Active</span>
                                            </div>
                                        </div>

                                        {/* Region Section */}
                                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                    <span className="material-icons text-purple-400">public</span>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Region</div>
                                                    <div className="text-white font-bold text-lg">{infraSpec.region?.resolved_region || 'Discovery Needed'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cost Section */}
                                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                    <span className="material-icons text-green-400">payments</span>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Est. Monthly Cost</div>
                                                    <div className="text-white font-bold text-lg">
                                                        {(() => {
                                                            const target = costEstimation?.rankings?.find(r => r.provider === selectedProvider);
                                                            return target?.formatted_cost || `$${target?.monthly_cost?.toFixed(2) || '0.00'}`;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 font-bold">OPTIMIZED BY AI</div>
                                                <div className="text-green-400 text-[10px] font-bold">READY FOR PRODUCTION</div>
                                            </div>
                                        </div>

                                        {/* Confidence Section */}
                                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                    <span className="material-icons text-amber-400">verified</span>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Architecture Confidence</div>
                                                    <div className="text-white font-bold text-lg">
                                                        {typeof costEstimation?.confidence === "number" ? ((costEstimation.confidence * 100).toFixed(0)) : "0"}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-center items-center space-x-6 pt-10 border-t border-white/5 mt-8">
                                        <button
                                            onClick={() => transitionToStep('terraform_view')}
                                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                                        >
                                            <span className="material-icons">arrow_back</span>
                                            <span>Review Code</span>
                                        </button>

                                        {!isDeployed && (
                                            <button
                                                onClick={async () => {
                                                    if (isMarkingDeployed) return;
                                                    setIsMarkingDeployed(true);
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const headers = token ? { Authorization: `Bearer ${token}` } : {};

                                                        await axios.put(`${API_BASE}/api/workspaces/${id}/deploy`, {
                                                            deployment_method: 'self',
                                                            provider: selectedProvider
                                                        }, { headers });

                                                        toast.success('🚀 Project marked as Self-Deployed!', { duration: 4000 });
                                                        setIsDeployed(true);
                                                        navigate('/workspaces');
                                                    } catch (error) {
                                                        handleApiError(error, 'Failed to confirm deployment.');
                                                    } finally {
                                                        setIsMarkingDeployed(false);
                                                    }
                                                }}
                                                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-green-500/20"
                                            >
                                                {isMarkingDeployed ? (
                                                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                ) : (
                                                    <span className="material-icons">check_circle</span>
                                                )}
                                                <span>{isMarkingDeployed ? 'Processing...' : 'Mark as Self-Deployed'}</span>
                                            </button>
                                        )}

                                        {isDeployed && (
                                            <button
                                                onClick={() => navigate('/workspaces')}
                                                className="px-10 py-4 bg-primary text-black font-bold rounded-xl flex items-center space-x-2 hover:bg-primary-hover transition-colors shadow-lg"
                                            >
                                                <span className="material-icons">dashboard</span>
                                                <span>Return to Dashboard</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default WorkspaceCanvas;
