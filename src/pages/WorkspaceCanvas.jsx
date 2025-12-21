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
                    setStep(savedState.step || ws.step || 'input');
                    setDescription(savedState.description || '');
                    setHistory(savedState.history || []);
                    setCurrentQuestion(savedState.currentQuestion || null);
                    setInfraSpec(savedState.infraSpec || null);

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
                toast.error("Failed to load workspace. It may have been deleted.");
                navigate('/workspaces');
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
                conversationHistory: history
            }, { headers });

            setTimeout(() => {
                const { step: nextStep, data } = res.data;
                setIsProcessing(false);

                if (nextStep === 'refine_requirements') {
                    setCurrentQuestion(data);
                    setStep('question');
                } else if (nextStep === 'infra_spec_generated') {
                    setInfraSpec(data);
                    setProjectData({ name: data.project_name });
                    setStep('review_spec');
                    toast.success("Architecture Generated Successfully!");
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
                    userInput: answer,
                    conversationHistory: newHistory
                }, { headers });

                setTimeout(() => {
                    const { step: nextStep, data } = res.data;
                    setIsProcessing(false);

                    if (nextStep === 'refine_requirements') {
                        setCurrentQuestion(data);
                        setStep('question');
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

    const handleSaveDraft = async () => {
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

            toast.success(`Draft ${workspaceId ? 'Updated' : 'Saved'} Successfully! Redirecting...`);
            setTimeout(() => navigate('/workspaces'), 1000); // Small delay to see toast

        } catch (err) {
            console.error("Save Error:", err);
            const errMsg = err.response?.data?.msg || err.message || "Unknown error";
            toast.error(`Failed to save draft: ${errMsg}`);
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
                        </div>

                        <div className="px-4 py-3 rounded-xl text-gray-500 flex items-center space-x-3 cursor-not-allowed opacity-50 border border-transparent">
                            <span className="material-icons text-sm">savings</span>
                            <span>Cost Estimator</span>
                            <span className="text-[10px] uppercase bg-white/5 px-2 py-0.5 rounded ml-auto">Soon</span>
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
                                onClick={handleSaveDraft}
                                className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors uppercase tracking-wider flex items-center space-x-1"
                            >
                                <span className="material-icons text-[10px]">save</span>
                                <span>{workspaceId ? 'Update Draft' : 'Save Draft'}</span>
                            </button>
                        </div>
                    </div>
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

                        {/* STEP: QUESTION (Refine) */}
                        {step === 'question' && currentQuestion && (
                            <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto mt-12">
                                <div className="flex items-start space-x-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                                        <span className="material-icons text-3xl">psychology</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Decision Required</span>
                                        </div>
                                        <h3 className="text-2xl font-medium text-white mb-4 leading-tight">
                                            We need to clarify a trade-off.
                                        </h3>
                                        <p className="text-gray-300 text-xl font-light leading-relaxed">
                                            {currentQuestion.clarifying_question}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pl-20">
                                    {currentQuestion.suggested_options?.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerQuestion(option)}
                                            className={`p-6 rounded-xl border text-left transition-all duration-300 group relative overflow-hidden
                                                ${selectedOption === option
                                                    ? 'bg-primary border-primary text-black scale-[1.02] shadow-xl shadow-primary/20'
                                                    : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10 text-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <span className="text-lg font-medium">{option}</span>
                                                <span className={`material-icons transition-all duration-300 ${selectedOption === option ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-50'}`}>
                                                    arrow_forward
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP: REVIEW SPEC (Detailed) */}
                        {step === 'review_spec' && infraSpec && (
                            <div className="space-y-10 animate-fade-in pb-20">
                                {/* Top Summary Card */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    Production Ready
                                                </span>
                                                <span className="text-gray-500 text-sm">Generated by Monopoly Engine</span>
                                            </div>

                                            <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">{infraSpec.project_name || 'Design Complete'}</h2>
                                            <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xl">{infraSpec.project_summary || 'No summary available.'}</p>

                                            <div className="flex items-center space-x-12 border-t border-white/5 pt-6">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Compliance</div>
                                                    <div className="text-white font-mono text-lg flex items-center space-x-2">
                                                        <span className="material-icons text-sm text-green-400">verified</span>
                                                        <span>{infraSpec.compliance?.level || 'Standard'}</span>
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

                                    {/* Security Score Card */}
                                    <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center shadow-xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/10 opacity-50"></div>
                                        <div className="relative w-32 h-32 mb-6">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray={`${infraSpec.scores?.security || 85}, 100`} className="animate-[dash_1.5s_ease-out_forwards]" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold text-white tracking-tighter">{infraSpec.scores?.security || 85}</span>
                                                <span className="text-[10px] text-gray-500 uppercase">/ 100</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-300 tracking-wide uppercase">Security Score</span>
                                        <span className="text-xs text-green-500 mt-2">Passed 8 Checks</span>
                                    </div>
                                </div>

                                {/* Modules List */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white px-2 flex items-center space-x-2">
                                        <span className="material-icons text-primary">layers</span>
                                        <span>Infrastructure Blueprint</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {infraSpec.modules?.map((module, index) => (
                                            <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:border-primary/30 hover:bg-white/10 transition-all duration-300 group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-1 bg-primary/10 rounded border border-primary/20">
                                                        {module.category || 'Module'}
                                                    </span>
                                                    {module.required && <span className="text-[10px] text-gray-500 border border-white/10 px-2 py-0.5 rounded-full">MANDATORY</span>}
                                                </div>
                                                <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">{module.service_name || module.type}</h4>
                                                <p className="text-sm text-gray-400 mb-5 leading-relaxed">{module.reason}</p>

                                                {/* Specs Mini-Table */}
                                                {module.specs && (
                                                    <div className="bg-[#050505] rounded-xl p-4 text-xs font-mono text-gray-300 space-y-2 border border-white/5">
                                                        {Object.entries(module.specs).map(([key, val]) => (
                                                            <div key={key} className="flex justify-between items-center border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                                                <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                                                <span className="text-primary/90">{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Next Step Action */}
                                <div className="pt-8 border-t border-white/5 flex justify-end">
                                    <button
                                        disabled
                                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-500 font-bold uppercase tracking-wider cursor-not-allowed flex items-center space-x-3 hover:bg-white/5"
                                    >
                                        <span>Proceed to Cost Estimation</span>
                                        <span className="material-icons">arrow_forward</span>
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
