import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { generateProjectReport } from '../utils/pdfGenerator';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReportDownloadPage = () => {
    const { workspaceId } = useParams();
    const { token } = useAuth(); // Assuming context provides token, or we grab from localStorage
    const [status, setStatus] = useState('loading'); // loading, generating, success, error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const processDownload = async () => {
            try {
                // 1. Fetch Workspace Data
                const authToken = localStorage.getItem('token');
                if (!authToken) {
                    setStatus('error');
                    setErrorMsg('Authentication required. Please log in.');
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces/${workspaceId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                const fullWorkspace = response.data;
                // Parse state if string
                if (typeof fullWorkspace.state_json === 'string') {
                    fullWorkspace.state_json = JSON.parse(fullWorkspace.state_json);
                }

                // 2. Generate Report
                setStatus('generating');

                const projectData = {
                    name: fullWorkspace.name,
                    description: fullWorkspace.description || fullWorkspace.state_json?.description,
                    infraSpec: fullWorkspace.state_json?.infraSpec,
                    costEstimation: fullWorkspace.state_json?.costEstimation,
                    state_json: fullWorkspace.state_json
                };

                // Use the high-res diagram if available from our capture step
                const diagramImage = fullWorkspace.state_json?.diagramImage;
                console.log('[REPORT] Diagram image presence:', !!diagramImage);
                if (diagramImage) {
                    console.log('[REPORT] Diagram image format:', diagramImage.substring(0, 50) + '...');
                }

                await generateProjectReport(projectData, diagramImage);

                setStatus('success');

                // 3. Redirect after delay
                setTimeout(() => {
                    window.location.href = 'https://cloudiverse.app';
                }, 4000);

            } catch (err) {
                console.error('Download workflow failed:', err);
                setStatus('error');
                setErrorMsg('Failed to generate report. Project might not exist or you lack permissions.');
            }
        };

        if (workspaceId) {
            processDownload();
        }
    }, [workspaceId]);

    return (
        <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl">

                {/* Loading / Generating State */}
                {(status === 'loading' || status === 'generating') && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                {status === 'loading' ? 'Locating Project...' : 'Generating PDF Report...'}
                            </h2>
                            <p className="text-gray-400">Please wait while we prepare your professional documentation.</p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Report Downloaded!</h2>
                            <p className="text-gray-400 mb-6">Your download has started automatically.</p>
                            <div className="text-sm text-gray-500 animate-pulse">
                                Redirecting to Cloudiverse Home...
                            </div>
                        </div>
                        <a href="https://cloudiverse.app" className="inline-block text-blue-400 hover:text-blue-300 underline">
                            Go there now
                        </a>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="space-y-6 animate-shake">
                        <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Download Failed</h2>
                            <p className="text-red-400">{errorMsg}</p>
                        </div>
                        <button
                            onClick={() => window.location.href = 'https://cloudiverse.app'}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors"
                        >
                            Return Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportDownloadPage;
