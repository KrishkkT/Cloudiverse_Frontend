import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const WorkspaceCanvas = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState('input'); // input, processing, question, processing_spec, review_spec
    const [description, setDescription] = useState('');
    const [history, setHistory] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [infraSpec, setInfraSpec] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [workspaceId, setWorkspaceId] = useState(null); // Track ID for updates
    const [aiSnapshot, setAiSnapshot] = useState(null); // Frozen AI intent snapshot
    const [costEstimation, setCostEstimation] = useState(null); // Step 3 cost data
    const [costProfile, setCostProfile] = useState('COST_EFFECTIVE'); // COST_EFFECTIVE | HIGH_PERFORMANCE

    // Load Workspace Data if ID is present
    useEffect(() => {
        const loadWorkspace = async () => {
            if (!id) return;

            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await axios.get(`${API_BASE}/api/workspaces/${id}`, { headers });
                const ws = res.data;

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

                    // Merge saved projectData (spec data) with structural data
                    if (savedState.projectData) {
                        setProjectData(prev => ({ ...prev, ...savedState.projectData }));
                    }
                }

                // If loading into a completed state, ensure toast doesn't annoy user, 
                // but console log success
                console.log("Workspace loaded:", ws.name);

            } catch (err) {
                console.error("Load Error:", err);
                if (err.response) {
                    if (err.response.status === 401) {
                        toast.error("Session expired. Please login again.");
                        navigate('/'); // Or /login
                    } else if (err.response.status === 403) {
                        toast.error("You do not have permission to view this workspace.");
                        navigate('/workspaces');
                    } else if (err.response.status === 404) {
                        toast.error("Workspace not found. It may have been deleted.");
                        navigate('/workspaces');
                    } else {
                        toast.error("Failed to load workspace. Server error.");
                    }
                } else {
                    toast.error("Connection failed. Please check your internet.");
                }
                // navigate('/workspaces'); // Don't always redirect if it's just a transient error? 
                // Actually for load failure on canvas, we generally want to exit.
            }
        };

        loadWorkspace();
    }, [id, navigate]);

    const handleAnalyze = async () => {
        if (!description.trim()) {
            toast.error("Please describe your project first!");
            return;
        }
        setIsProcessing(true);
        setStep('processing');

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await axios.post(`${API_BASE}/api/workflow/analyze`, {
                userInput: description,
                conversationHistory: history,
                input_type: 'DESCRIPTION' // Tell backend this is initial description
            }, { headers });

            setTimeout(() => {
                const { step: nextStep, data } = res.data;
                setIsProcessing(false);

                // Store AI snapshot for future use (avoid re-calling AI)
                if (data?.full_analysis) {
                    setAiSnapshot(data.full_analysis);
                }

                if (nextStep === 'refine_requirements') {
                    setCurrentQuestion(data);
                    setStep('question');
                } else if (nextStep === 'confirm_intent') {
                    setCurrentQuestion(data);
                    setStep('confirm_intent');
                } else if (nextStep === 'infra_spec_generated') {
                    setInfraSpec(data);
                    setProjectData({ name: data.project_name });
                    setStep('review_spec');
                    toast.success("Architecture Generated Successfully!");
                } else {
                    // Fallback for unknown steps
                    console.warn("Unknown Step:", nextStep);
                    // Stay on processing or go back to input?
                    // If we got data but unknown step, maybe error?
                    if (!nextStep && !data) {
                        toast.error("Server returned empty response.");
                        setStep('input');
                    }
                }
            }, 1200);

        } catch (err) {
            console.error(err);
            setIsProcessing(false);
            setStep('input');
            const errMsg = err.response?.data?.msg || "Error analyzing request.";
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                navigate('/');
            } else {
                toast.error(errMsg);
            }
        }
    };

    // DEPRECATED: handleConfirmation removed.
    // If we ever need it back, look at git history.
    // RESTORED: As per Step1.txt "User Confirmation Gate"
    const handleConfirmation = async (approvedAnalysis) => {
        setIsProcessing(true);
        setStep('processing');

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await axios.post(`${API_BASE}/api/workflow/analyze`, {
                userInput: description,
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
                    setStep('question');
                } else if (nextStep === 'infra_spec_generated') {
                    setInfraSpec(data);
                    setProjectData({ name: data.project_name });
                    setStep('review_spec');
                    toast.success("Architecture Generated Successfully!");
                }
            }, 1000);
        } catch (err) {
            console.error("Confirmation Error", err);
            setIsProcessing(false);
            toast.error("Error proceeding with confirmation.");
        }
    };
    const handleAnswerQuestion = async (answer) => {
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
                        setStep('question');
                    } else if (nextStep === 'confirm_intent') {
                        setCurrentQuestion(data);
                        setStep('confirm_intent');
                    } else if (nextStep === 'infra_spec_generated') {
                        setInfraSpec(data);
                        setProjectData({ name: data.project_name });
                        setStep('review_spec');
                        toast.success("Architecture Refined & Generated!");
                    }
                }, 1200);

            } catch (err) {
                console.error(err);
                setIsProcessing(false);
                toast.error("Failed to process answer. Please try again.");
            }
        }, 600);
    };

    const handleSaveDraft = async (silent = false) => {
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
            console.error("Save Error:", err);
            if (!silent) {
                const errMsg = err.response?.data?.msg || err.message || "Unknown error";
                toast.error(`Failed to save draft: ${errMsg}`);
            }
        }
    };

    // Auto-save when step changes
    useEffect(() => {
        if (step && workspaceId && step !== 'input' && step !== 'processing') {
            // Debounce auto-save to prevent spam
            const timer = setTimeout(() => {
                handleSaveDraft(true); // Silent save
                console.log(`[Auto-save] Step: ${step}`);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [step, infraSpec, costEstimation]);

    // STEP 3: Cost Estimation Handler
    const handleProceedToCostEstimation = async () => {
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

            const response = await axios.post(`${API_BASE}/api/workflow/cost-analysis`, {
                infraSpec,
                intent: aiSnapshot,
                cost_profile: costProfile
            }, { headers });

            toast.dismiss('cost-analysis');

            if (response.data.step === 'cost_estimation') {
                setCostEstimation(response.data.data);
                setStep('cost_estimation');
                toast.success("Cost analysis complete!");
            } else {
                throw new Error("Unexpected response from cost analysis");
            }

        } catch (err) {
            console.error("Cost Analysis Error:", err);
            toast.dismiss('cost-analysis');
            toast.error("Failed to analyze costs. Please try again.");
            setStep('review_spec');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white font-inter overflow-hidden relative selection:bg-primary/30">
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#1A1A1A',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            }} />
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Sidebar (Glass) */}
            <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-6 hidden md:flex z-10">
                <div className="space-y-8">
                    <div className="flex items-center space-x-3 text-primary font-bold text-xl tracking-tight">
                        <span className="material-icons text-2xl">cloud_circle</span>
                        <span>Cloudiverse</span>
                    </div>

                    <nav className="space-y-3">
                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all cursor-pointer 
                            ${(step === 'input' || step === 'question' || step === 'processing')
                                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                    : 'text-gray-400 hover:bg-white/5'}`}
                            onClick={() => infraSpec && setStep('input')}
                        >
                            <span className="material-icons text-sm">edit_note</span>
                            <span>Requirements</span>
                            {infraSpec && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                        </div>

                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                            ${step === 'review_spec'
                                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                    : (!infraSpec ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 cursor-pointer')}`}
                            onClick={() => infraSpec && setStep('review_spec')}
                        >
                            <span className="material-icons text-sm">schema</span>
                            <span>Architecture</span>
                            {costEstimation && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                        </div>

                        <div
                            className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-3 transition-all 
                            ${(step === 'cost_estimation' || step === 'processing_cost')
                                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                    : (!infraSpec ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 cursor-pointer')}`}
                            onClick={() => costEstimation && setStep('cost_estimation')}
                        >
                            <span className="material-icons text-sm">savings</span>
                            <span>Cost Estimator</span>
                            {costEstimation && <span className="material-icons text-xs text-green-500 ml-auto">check_circle</span>}
                        </div>
                    </nav>
                </div>
                <div>
                    <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-400 font-medium mb-1">MONOPOLY CORE</div>
                        <div className="flex items-center space-x-2 text-green-400 text-xs">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span>System Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col relative overflow-y-auto z-10 backdrop-blur-sm">

                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-gray-200 tracking-wide">{projectData?.name || 'Untitled Project'}</span>
                        <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 tracking-wider uppercase">Draft Mode</span>
                            <button
                                onClick={() => handleSaveDraft(false)}
                                className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors uppercase tracking-wider flex items-center space-x-1"
                            >
                                <span className="material-icons text-[10px]">save</span>
                                <span>{workspaceId ? 'Update Draft' : 'Save Draft'}</span>
                            </button>
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

                {/* Content Area */}
                <div className="flex-1 p-8 flex justify-center">
                    <div className="w-full max-w-5xl space-y-12">

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
                                    <p className="text-gray-400 animate-pulse">Applying Layers 1-14 (Monopoly Logic)</p>
                                </div>
                            </div>
                        )}

                        {/* STEP: INPUT */}
                        {step === 'input' && (
                            <div className="space-y-8 animate-fade-in-up mt-10">
                                <div className="text-center space-y-4">
                                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
                                        Architect Your Vision
                                    </h1>
                                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                        Describe your application in plain English. Our AI Discovery Engine will analyze your intent and generate a production-grade infrastructure specification.
                                    </p>
                                </div>
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative bg-[#0F0F0F] border border-white/10 rounded-2xl p-2 shadow-2xl">
                                        <textarea
                                            className="w-full h-48 bg-transparent text-xl p-8 focus:outline-none resize-none placeholder-gray-600 text-gray-200 font-light leading-relaxed"
                                            placeholder="e.g., I need a highly scalable e-commerce backend with microservices, handling 50k concurrent users, and strict PCI compliance..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                        <div className="flex justify-between items-center px-8 py-5 bg-white/5 rounded-b-xl border-t border-white/5">
                                            <div className="flex space-x-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400"><span className="material-icons text-xl">mic</span></button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400"><span className="material-icons text-xl">attach_file</span></button>
                                            </div>
                                            <button
                                                onClick={handleAnalyze}
                                                className="flex items-center space-x-3 px-8 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/20"
                                            >
                                                <span>Generate Architecture</span>
                                                <span className="material-icons text-lg">auto_awesome</span>
                                            </button>
                                        </div>
                                    </div>
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

                                <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                    {/* Summary Card */}
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                AI Intent Snapshot
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Primary Domain</div>
                                                    <div className="text-white font-medium capitalize">{currentQuestion.intent?.primary_domain?.replace(/_/g, ' ') || 'General'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Workload Type</div>
                                                    <div className="text-white font-medium capitalize">{currentQuestion.intent?.workload_type?.replace(/_/g, ' ') || 'Web App'}</div>
                                                </div>
                                            </div>

                                            {currentQuestion.features && (
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Detected Features</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(currentQuestion.features).filter(([_, v]) => v).map(([key]) => (
                                                            <span key={key} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300 capitalize">
                                                                {key.replace(/_/g, ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {currentQuestion.risk_domains && currentQuestion.risk_domains.length > 0 && (
                                                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                                                    <div className="text-xs text-red-400 uppercase font-bold flex items-center space-x-2">
                                                        <span className="material-icons text-sm">warning</span>
                                                        <span>Identified Risks</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentQuestion.risk_domains.map((risk, idx) => (
                                                            <span key={idx} className="text-sm text-gray-300 capitalize">{risk}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                                            <button
                                                onClick={() => handleConfirmation(currentQuestion.full_analysis)}
                                                className="flex-1 py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
                                            >
                                                <span>Correct, Generate Spec</span>
                                                <span className="material-icons">check_circle</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Reset entire flow to start fresh
                                                    setStep('input');
                                                    setAiSnapshot(null);
                                                    setHistory([]);
                                                    setCurrentQuestion(null);
                                                }}
                                                className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <span>Incorrect, Edit Description</span>
                                                <span className="material-icons">edit</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP: QUESTION (Refine) */}
                        {step === 'question' && currentQuestion && (
                            <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto mt-12 pb-20">
                                <div className="flex items-start space-x-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                                        <span className="material-icons text-3xl">psychology</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-primary/10 transition-all duration-700"></div>

                                        <div className="flex items-center space-x-3 mb-4 relative z-10">
                                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                AI Reasoning
                                            </span>
                                            <span className="text-gray-500 text-xs uppercase tracking-wider">Clarification Needed</span>
                                        </div>

                                        <h3 className="text-3xl font-medium text-white mb-4 leading-tight tracking-tight">
                                            Let's fine-tune the details.
                                        </h3>
                                        <p className="text-gray-300 text-lg font-light leading-relaxed max-w-2xl">
                                            {currentQuestion.clarifying_question}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pl-0 md:pl-8 transition-all animate-fade-in-up delay-100">
                                    {currentQuestion.suggested_options?.map((option, idx) => {
                                        const isOther = option.toLowerCase().includes("other") || option.toLowerCase().includes("specify");
                                        const isSelected = selectedOption === option;

                                        return (
                                            <div key={idx} className="space-y-4">
                                                <button
                                                    onClick={() => !isOther ? handleAnswerQuestion(option) : setSelectedOption(option)}
                                                    className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 group relative overflow-hidden flex items-center justify-between
                                                ${isSelected
                                                            ? 'bg-primary border-primary text-black shadow-xl shadow-primary/20 scale-[1.01]'
                                                            : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10 text-gray-300 hover:text-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isSelected ? 'border-black/20 bg-black/10' : 'border-white/10 bg-white/5'}`}>
                                                            <span className="text-sm font-bold">{String.fromCharCode(65 + idx)}</span>
                                                        </div>
                                                        <span className="text-lg font-medium">{option}</span>
                                                    </div>

                                                    {!isOther && (
                                                        <span className={`material-icons transition-all duration-300 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-50'}`}>
                                                            arrow_forward
                                                        </span>
                                                    )}
                                                    {isOther && (
                                                        <span className={`material-icons transition-all duration-300 ${isSelected ? 'rotate-90' : ''}`}>
                                                            expand_more
                                                        </span>
                                                    )}
                                                </button>

                                                {/* Custom Input Field for Other */}
                                                {isOther && isSelected && (
                                                    <div className="animate-fade-in bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 ml-0 md:ml-4 border-l-4 border-l-primary shadow-inner">
                                                        <label className="text-xs text-gray-500 uppercase font-bold mb-3 block tracking-wider">Specific Requirement Details</label>
                                                        <div className="flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-3">
                                                            <textarea
                                                                className="w-full md:flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary/50 min-h-[100px] resize-none text-base"
                                                                placeholder="Please describe your specific constraints or requirements..."
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        if (e.target.value.trim()) handleAnswerQuestion(e.target.value);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                className="w-full md:w-auto p-4 bg-primary text-black rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 font-bold"
                                                                onClick={(e) => {
                                                                    const textarea = e.currentTarget.previousElementSibling;
                                                                    if (textarea.value.trim()) handleAnswerQuestion(textarea.value);
                                                                }}
                                                            >
                                                                <span>Submit</span>
                                                                <span className="material-icons">send</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP: REVIEW SPEC (Tiered View per Step2.txt) */}
                        {step === 'review_spec' && infraSpec && (
                            <div className="space-y-10 animate-fade-in pb-20">
                                {/* TIER 1: DEFAULT VIEW - Summary & Scores */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Main Summary Card */}
                                    <div className="lg:col-span-2 bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    Production Ready
                                                </span>
                                                <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                                    {infraSpec.architecture_pattern?.replace(/_/g, ' ') || 'Three Tier Web'}
                                                </span>
                                            </div>

                                            <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">{infraSpec.project_name || 'Design Complete'}</h2>
                                            <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xl">{infraSpec.project_summary || 'No summary available.'}</p>

                                            {/* Explanation Bullets */}
                                            {infraSpec.explanations && infraSpec.explanations.length > 0 && (
                                                <div className="space-y-2 mb-6">
                                                    {infraSpec.explanations.slice(0, 4).map((exp, idx) => (
                                                        <div key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                                                            <span className="material-icons text-green-400 text-sm mt-0.5">check_circle</span>
                                                            <span>{exp}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-12 border-t border-white/5 pt-6">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Availability</div>
                                                    <div className="text-white font-mono text-lg flex items-center space-x-2">
                                                        <span className="material-icons text-sm text-green-400">verified</span>
                                                        <span>{infraSpec.nfr?.reliability?.availability_target || '99.9'}%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Scale Tier</div>
                                                    <div className="text-white font-mono text-lg flex items-center space-x-2">
                                                        <span className="material-icons text-sm text-blue-400">equalizer</span>
                                                        <span>{infraSpec.assumptions?.traffic_tier || 'Medium'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overall Score Card */}
                                    <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center shadow-xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/10 opacity-50"></div>
                                        <div className="relative w-32 h-32 mb-6">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray={`${infraSpec.scores?.overall || 85}, 100`} className="animate-[dash_1.5s_ease-out_forwards]" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold text-white tracking-tighter">{infraSpec.scores?.overall || 85}</span>
                                                <span className="text-[10px] text-gray-500 uppercase">/ 100</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-300 tracking-wide uppercase">Overall Score</span>
                                        <div className="mt-4 flex space-x-4 text-xs">
                                            <span className="text-green-400">Security: {infraSpec.scores?.security || 85}</span>
                                            <span className="text-blue-400">Arch: {infraSpec.scores?.architecture || 85}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* TIER 2: ENGINEERING VIEW - Expandable Details */}
                                <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden">
                                    <button
                                        onClick={() => setSelectedOption(selectedOption === 'tier2' ? null : 'tier2')}
                                        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="material-icons text-primary">engineering</span>
                                            <span className="text-xl font-bold text-white">Engineering Details</span>
                                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-400">Tier 2</span>
                                        </div>
                                        <span className={`material-icons text-gray-400 transition-transform ${selectedOption === 'tier2' ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>

                                    {selectedOption === 'tier2' && (
                                        <div className="p-6 pt-0 border-t border-white/5 animate-fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="p-4 bg-white/5 rounded-xl">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Compute</div>
                                                    <div className="text-white font-medium">{infraSpec.components?.compute?.execution_model?.replace(/_/g, ' ') || 'Orchestrated'}</div>
                                                    <div className="text-sm text-gray-400 mt-1">Scaling: {infraSpec.components?.compute?.scaling_driver || 'CPU'}</div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-xl">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Database</div>
                                                    <div className="text-white font-medium capitalize">{infraSpec.components?.data?.database_type || 'Relational'}</div>
                                                    <div className="text-sm text-gray-400 mt-1">Consistency: {infraSpec.components?.data?.consistency || 'Strong'}</div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-xl">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Cache</div>
                                                    <div className="text-white font-medium">{infraSpec.components?.cache?.recommended ? 'Enabled' : 'Disabled'}</div>
                                                    <div className="text-sm text-gray-400 mt-1">Purpose: {infraSpec.components?.cache?.purpose?.replace(/_/g, ' ') || 'N/A'}</div>
                                                </div>
                                            </div>

                                            <div className="mt-6 grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/5 rounded-xl">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">NFRs</div>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between"><span className="text-gray-400">Encryption at Rest</span><span className="text-green-400">Enabled</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-400">Encryption in Transit</span><span className="text-green-400">Enabled</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-400">Horizontal Scaling</span><span className="text-green-400">Enabled</span></div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-xl">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Backup Policy</div>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between"><span className="text-gray-400">Required</span><span className="text-green-400">Yes</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-400">Retention</span><span className="text-white">{infraSpec.constraints?.minimum_backup_retention_days || 7} days</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* TIER 3: ADVANCED/AUDIT VIEW - Full Details */}
                                <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden">
                                    <button
                                        onClick={() => setSelectedOption(selectedOption === 'tier3' ? null : 'tier3')}
                                        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="material-icons text-yellow-400">security</span>
                                            <span className="text-xl font-bold text-white">Advanced / Audit</span>
                                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-400">Tier 3</span>
                                        </div>
                                        <span className={`material-icons text-gray-400 transition-transform ${selectedOption === 'tier3' ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>

                                    {selectedOption === 'tier3' && (
                                        <div className="p-6 pt-0 border-t border-white/5 animate-fade-in space-y-6">
                                            {/* Constraints */}
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold mb-3">Constraints & Policies</div>
                                                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm font-mono">
                                                    {Object.entries(infraSpec.constraints || {}).map(([key, val]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="text-gray-400">{key.replace(/_/g, ' ')}</span>
                                                            <span className={val === 'forbidden' ? 'text-red-400' : 'text-green-400'}>{String(val)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Decision Provenance */}
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold mb-3">Decision Provenance</div>
                                                <div className="space-y-2">
                                                    {(infraSpec.decision_trace || []).map((decision, idx) => (
                                                        <div key={idx} className="bg-white/5 rounded-xl p-3 flex items-center justify-between text-sm">
                                                            <div className="flex items-center space-x-3">
                                                                <span className={`px-2 py-0.5 rounded text-xs ${decision.source === 'ai_signal' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                                                    {decision.source === 'ai_signal' ? 'AI' : 'Rule'}
                                                                </span>
                                                                <span className="text-white">{decision.decision.replace(/_/g, ' ')}</span>
                                                            </div>
                                                            <span className="text-gray-400">{decision.reason.replace(/_/g, ' ')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Full JSON */}
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold mb-3">Full InfraSpec JSON</div>
                                                <pre className="bg-black/50 rounded-xl p-4 text-xs text-gray-300 overflow-auto max-h-96 font-mono border border-white/5">
                                                    {JSON.stringify(infraSpec, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modules List (Condensed) */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white px-2 flex items-center space-x-2">
                                        <span className="material-icons text-primary">layers</span>
                                        <span>Infrastructure Blueprint</span>
                                        <span className="text-sm font-normal text-gray-400">({infraSpec.modules?.length || 0} components)</span>
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {infraSpec.modules?.slice(0, 8).map((module, index) => (
                                            <div key={index} className="bg-white/5 border border-white/5 p-4 rounded-xl hover:border-primary/30 transition-all">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{module.category}</span>
                                                <h4 className="text-base font-semibold text-white mt-1">{module.service_name || module.type}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Next Step Action */}
                                <div className="pt-8 border-t border-white/5">
                                    {/* Cost Profile Selection */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Optimization Strategy</h4>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setCostProfile('COST_EFFECTIVE')}
                                                className={`flex-1 p-4 rounded-xl border transition-all ${costProfile === 'COST_EFFECTIVE'
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span className="material-icons">savings</span>
                                                    <span className="font-bold">Cost Effective</span>
                                                </div>
                                                <p className="text-xs mt-1 opacity-70">Optimize for lower monthly costs</p>
                                            </button>
                                            <button
                                                onClick={() => setCostProfile('HIGH_PERFORMANCE')}
                                                className={`flex-1 p-4 rounded-xl border transition-all ${costProfile === 'HIGH_PERFORMANCE'
                                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span className="material-icons">speed</span>
                                                    <span className="font-bold">High Performance</span>
                                                </div>
                                                <p className="text-xs mt-1 opacity-70">Optimize for speed & reliability</p>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleProceedToCostEstimation}
                                            disabled={isProcessing}
                                            className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            <span>Proceed to Cost Estimation</span>
                                            <span className="material-icons">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ====== STEP 3: COST ESTIMATION ====== */}
                        {step === 'cost_estimation' && costEstimation && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Header */}
                                <div className="text-center pb-6 border-b border-white/5">
                                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                                        <span className="material-icons text-sm">paid</span>
                                        <span className="text-sm font-bold uppercase tracking-wider">Cost Analysis</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">Cloud Comparison</h2>
                                    <p className="text-gray-400 mt-2">
                                        {costEstimation.scale_tier} tier • {costEstimation.deployment_type?.replace(/_/g, ' ')} deployment • {costEstimation.cost_profile === 'HIGH_PERFORMANCE' ? 'Performance optimized' : 'Cost optimized'}
                                    </p>
                                </div>

                                {/* Provider Rankings */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {costEstimation.rankings?.map((provider, index) => (
                                        <div
                                            key={provider.provider}
                                            className={`relative rounded-2xl border p-6 transition-all ${provider.recommended
                                                ? 'bg-gradient-to-br from-primary/20 to-purple-500/10 border-primary/50 scale-105'
                                                : 'bg-[#0F0F0F] border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {provider.recommended && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                                    Recommended
                                                </div>
                                            )}

                                            <div className="text-center mt-2">
                                                <h3 className="text-2xl font-bold text-white">{provider.provider}</h3>
                                                {/* Cost Range instead of single number */}
                                                <div className="mt-2">
                                                    <div className="text-2xl font-bold text-primary">
                                                        {provider.cost_range?.formatted || provider.formatted_cost}
                                                    </div>
                                                    {/* FIX 5: Confidence with explanation for low */}
                                                    <div className="flex flex-col items-center mt-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${provider.cost_range?.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                                                            provider.cost_range?.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {provider.cost_range?.confidence || 'low'} confidence
                                                        </span>
                                                        {(provider.cost_range?.confidence === 'low' || !provider.cost_range?.confidence) && (
                                                            <span className="text-[9px] text-gray-500 mt-1 max-w-[140px] text-center">
                                                                Some assumptions were inferred
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-2">{provider.service_count} services</p>
                                            </div>

                                            <div className="mt-6 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-400">Overall Score</span>
                                                    <span className="font-bold text-white">{provider.score}/100</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${provider.recommended ? 'bg-primary' : 'bg-gray-500'}`}
                                                        style={{ width: `${provider.score}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Cost: {provider.cost_score}</span>
                                                    <span>Performance: {provider.performance_score}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedOption(selectedOption === provider.provider ? null : provider.provider)}
                                                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <span>View Services</span>
                                                <span className="material-icons text-sm">{selectedOption === provider.provider ? 'expand_less' : 'expand_more'}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Service Details (Expandable) */}
                                {selectedOption && costEstimation.providers?.[selectedOption] && (
                                    <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 animate-fade-in">
                                        <h3 className="text-lg font-bold text-white mb-4">{selectedOption} Services</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {costEstimation.providers[selectedOption].services?.map((service, idx) => (
                                                <div key={idx} className="bg-white/5 rounded-xl p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="text-[10px] text-primary uppercase font-bold">{service.category}</span>
                                                            <h4 className="text-white font-medium">{service.display_name}</h4>
                                                        </div>
                                                        <span className="text-green-400 font-bold">{service.cost?.formatted}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">{service.sizing}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* FIX 6: Service-Level Cost Breakdown Table */}
                                {costEstimation.providers?.[costEstimation.recommended?.provider]?.services?.length > 0 && (
                                    <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                                            <span className="material-icons text-primary">receipt_long</span>
                                            <span>Service Cost Breakdown ({costEstimation.recommended?.provider})</span>
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-white/10">
                                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Category</th>
                                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Service</th>
                                                        <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">Monthly Cost</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {costEstimation.providers[costEstimation.recommended?.provider].services.map((svc, idx) => (
                                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                            <td className="py-3 px-4">
                                                                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary uppercase font-bold">
                                                                    {svc.category}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className="text-white font-medium">{svc.display_name}</span>
                                                                <span className="text-gray-500 text-xs ml-2">({svc.sizing})</span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <span className="text-green-400 font-bold">{svc.cost?.formatted || '$0/mo'}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="border-t border-white/20 bg-white/5">
                                                        <td colSpan={2} className="py-3 px-4 text-right">
                                                            <span className="text-gray-400 font-medium">Total Estimate</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-xl text-green-400 font-bold">
                                                                {costEstimation.recommended?.cost_range?.formatted || costEstimation.recommended?.formatted_cost}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Missing Components Warning (Future Cost Risks) */}
                                {costEstimation.missing_components && costEstimation.missing_components.length > 0 && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="material-icons text-yellow-400">warning</span>
                                            <h3 className="text-lg font-bold text-yellow-400">Future Cost Considerations</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4">
                                            {costEstimation.future_cost_warning}
                                        </p>
                                        <div className="space-y-2">
                                            {costEstimation.missing_components.map((comp, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`w-2 h-2 rounded-full ${comp.impact === 'high' ? 'bg-red-400' :
                                                            comp.impact === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                                                            }`}></span>
                                                        <span className="text-white font-medium">{comp.name}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-400">{comp.estimated_additional_cost}/mo</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Explanation */}
                                {costEstimation.explanation && (
                                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="material-icons text-blue-400">auto_awesome</span>
                                            <h3 className="text-lg font-bold text-white">AI Insights</h3>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">{costEstimation.explanation.recommendation_reason}</p>

                                        {costEstimation.explanation.tradeoffs && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Tradeoffs</h4>
                                                <p className="text-sm text-gray-400">{costEstimation.explanation.tradeoffs}</p>
                                            </div>
                                        )}

                                        {costEstimation.explanation.cost_optimization_tips && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Cost Optimization Tips</h4>
                                                <ul className="space-y-1">
                                                    {costEstimation.explanation.cost_optimization_tips.map((tip, idx) => (
                                                        <li key={idx} className="text-sm text-gray-400 flex items-start space-x-2">
                                                            <span className="material-icons text-green-400 text-sm mt-0.5">check_circle</span>
                                                            <span>{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {costEstimation.explanation.future_considerations && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Looking Ahead</h4>
                                                <p className="text-sm text-gray-400 italic">{costEstimation.explanation.future_considerations}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Continue Button */}
                                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                                    <button
                                        onClick={() => setStep('review_spec')}
                                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                                    >
                                        <span className="material-icons">arrow_back</span>
                                        <span>Back to Spec</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            toast.success(`Selected ${costEstimation.recommended?.provider} as cloud provider!`);
                                            // Store the selected provider for next steps
                                            setStep('deployment_ready');
                                        }}
                                        className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all"
                                    >
                                        <span>Continue with {costEstimation.recommended?.provider}</span>
                                        <span className="material-icons">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
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

                        {/* Deployment Ready Step */}
                        {step === 'deployment_ready' && (
                            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-fade-in">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                                        <span className="material-icons text-4xl text-green-400">check_circle</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">Ready for Deployment</h2>
                                    <p className="text-gray-400 mt-3 max-w-md">
                                        Your infrastructure specification is complete.
                                        Selected provider: <span className="text-primary font-bold">{costEstimation?.recommended?.provider}</span>
                                    </p>
                                </div>

                                <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 max-w-lg w-full">
                                    <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Cloud Provider</span>
                                            <span className="text-white font-medium">{costEstimation?.recommended?.provider}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Monthly Estimate</span>
                                            <span className="text-green-400 font-bold">{costEstimation?.recommended?.formatted_cost}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Services</span>
                                            <span className="text-white font-medium">{costEstimation?.recommended?.service_count} services</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Cost Profile</span>
                                            <span className="text-white font-medium capitalize">{costEstimation?.cost_profile?.replace('_', ' ').toLowerCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setStep('cost_estimation')}
                                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                                    >
                                        <span className="material-icons">arrow_back</span>
                                        <span>Back to Cost Analysis</span>
                                    </button>
                                    <button
                                        disabled
                                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-500 font-bold uppercase tracking-wider cursor-not-allowed flex items-center space-x-3"
                                    >
                                        <span>Generate Terraform</span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-2">Coming Soon</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceCanvas;
