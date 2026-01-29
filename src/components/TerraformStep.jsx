import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import DeploymentGuide from './DeploymentGuide';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const TerraformStep = ({
    workspaceId,
    infraSpec,
    selectedProvider,
    costEstimation,
    onComplete,
    onBack,
    isDeployed,
    onTerraformLoaded, // 🔥 New prop
    onDeploy // 🔥 New prop for self-deploy updates
}) => {
    const [loading, setLoading] = useState(true);
    const [terraformProject, setTerraformProject] = useState(null); // V2: Folder structure
    const [selectedFile, setSelectedFile] = useState('main.tf'); // Currently viewed file
    const [services, setServices] = useState([]);
    const [error, setError] = useState(null);
    const [isComingSoon, setIsComingSoon] = useState(false);

    // UI States
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSelfDeployed, setIsSelfDeployed] = useState(false); // Toggle state

    // ... existing useEffect ...
    const fetchTerraform = async () => {
        try {
            // 🔒 PRE-CHECK: Verify Step 3 completed (sizing exists)
            if (!infraSpec?.sizing) {
                console.warn('[TERRAFORM] Skipping generation - Step 3 not completed (missing sizing)');
                setError('Cost analysis must be completed before generating Terraform. Please go back and complete Step 3.');
                setLoading(false);
                return;
            }

            // 🔒 PRE-CHECK: Verify Step 2 region resolution completed
            // 🔥 AUTO-FIX: If region missing, determine based on provider (Project uses India defaults)
            const resolvedRegion = infraSpec?.region?.resolved_region ||
                (selectedProvider?.toUpperCase() === 'AWS' ? 'ap-south-1' :
                    selectedProvider?.toUpperCase() === 'GCP' ? 'asia-south1' :
                        selectedProvider?.toUpperCase() === 'AZURE' ? 'Central India' : null);

            if (!resolvedRegion) {
                console.warn('[TERRAFORM] Skipping generation - Step 2 region resolution not completed');
                setError('Region resolution must be completed before generating Terraform. Please go back and ensure Step 2 is completed.');
                setLoading(false);
                return;
            }

            // Patch infraSpec for the request if needed
            const requestSpec = { ...infraSpec };
            if (!requestSpec.region) requestSpec.region = {};
            if (!requestSpec.region.resolved_region) requestSpec.region.resolved_region = resolvedRegion;

            // Determine profile logic same as feedback step
            const providerDetails = costEstimation.provider_details?.[selectedProvider];
            const selectedProfile = Object.entries(costEstimation.scenarios || {}).find(
                ([_, providers]) => providers[selectedProvider]?.monthly_cost === providerDetails?.total_monthly_cost
            )?.[0] || 'standard';

            try {
                const response = await axios.post(`${API_BASE}/workflow/terraform`, {
                    workspace_id: workspaceId,
                    infraSpec: requestSpec, // 🔥 FIX: Use patched spec with region
                    provider: selectedProvider,
                    profile: selectedProfile,
                    project_name: infraSpec.project_name || 'cloudiverse-project',
                    requirements: {} // NFR requirements
                });

                if (response.data.success) {
                    // Helper to nested file structure
                    const unflatten = (data) => {
                        const result = {};
                        for (const [path, content] of Object.entries(data)) {
                            const parts = path.split('/');
                            let current = result;
                            for (let i = 0; i < parts.length - 1; i++) {
                                const part = parts[i];
                                if (!current[part]) current[part] = {};
                                current = current[part];
                            }
                            current[parts[parts.length - 1]] = content;
                        }
                        return result;
                    };

                    // V2: Handle modular project structure with hash and manifest
                    if (response.data.terraform.structure === 'modular') {
                        // Fix: Unflatten the flat path structure from backend
                        setTerraformProject(unflatten(response.data.terraform.project));

                        // Store hash and manifest for audit (optional)
                        console.log('[TERRAFORM] Hash:', response.data.terraform_hash?.substring(0, 16) + '...');
                        console.log('[TERRAFORM] Manifest:', response.data.deployment_manifest);
                    } else {
                        // Legacy single-file support
                        setTerraformProject({ 'main.tf': response.data.terraform.code });
                    }
                    setServices(response.data.services || []);

                    // 🔥 Trigger Deployment Status Update
                    if (onTerraformLoaded) {
                        onTerraformLoaded();
                    }
                }
            } catch (err) {
                console.warn('Terraform generation failed (non-blocking):', err);
                console.error('[TERRAFORM ERROR] Full error:', err.response?.data);

                // 🔒 FIX 4: Check if this is a "pattern not available" error
                const errorMessage = err.response?.data?.message || err.message || '';
                const errorDetails = err.response?.data?.details || '';

                console.error('[TERRAFORM ERROR] Message:', errorMessage);
                console.error('[TERRAFORM ERROR] Details:', errorDetails);

                if (errorMessage.includes('No template for pattern') ||
                    errorMessage.includes('not available') ||
                    errorMessage.includes('under construction')) {
                    // This is expected for new patterns - show coming soon message
                    setIsComingSoon(true);
                    console.log('[TERRAFORM UX] Pattern template not available - showing coming soon message');
                } else {
                    // Unexpected error - show error with details
                    const displayError = `Failed to generate Terraform code: ${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`;
                    setError(displayError);
                }
                throw err; // Re-throw to be caught by the outer catch
            }
        } catch (err) {
            console.error('Terraform generation failed:', err);
            setError('Failed to generate Terraform code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerraform();
    }, [workspaceId, infraSpec, selectedProvider, costEstimation]);

    // Get currently displayed file content
    const getCurrentFileContent = () => {
        if (!terraformProject) return '';

        // Navigate nested structure (modules/xxx/main.tf)
        const parts = selectedFile.split('/');
        let content = terraformProject;

        for (const part of parts) {
            if (typeof content === 'object' && content[part]) {
                content = content[part];
            } else {
                return '';
            }
        }

        return typeof content === 'string' ? content : '';
    };

    // Get flat list of all files for file tree
    const getAllFiles = (obj, prefix = '') => {
        let files = [];

        for (const [key, value] of Object.entries(obj)) {
            const path = prefix ? `${prefix}/${key}` : key;

            if (typeof value === 'string') {
                files.push(path);
            } else if (typeof value === 'object') {
                files = files.concat(getAllFiles(value, path));
            }
        }

        return files;
    };

    // Get file tree with folders and files organized
    const getFileTree = (obj, prefix = '') => {
        const items = [];

        for (const [key, value] of Object.entries(obj)) {
            const path = prefix ? `${prefix}/${key}` : key;

            if (typeof value === 'string') {
                // It's a file
                items.push({ path, name: key, type: 'file', depth: path.split('/').length - 1 });
            } else if (typeof value === 'object') {
                // It's a folder
                items.push({ path, name: key, type: 'folder', depth: path.split('/').length - 1 });
                // Add nested items
                items.push(...getFileTree(value, path));
            }
        }

        return items;
    };

    const copyToClipboard = () => {
        const content = getCurrentFileContent();
        navigator.clipboard.writeText(content);
        toast.success(`Copied ${selectedFile} to clipboard`);
    };

    const downloadZip = async () => {
        if (!terraformProject) return;

        setIsDownloading(true);
        try {
            const loadingId = toast.loading('Preparing deployment package...');

            // Use server-side export to get the full bundle including Deployment Guide
            const response = await axios.get(`${API_BASE}/workflow/export-terraform?provider=${selectedProvider}&workspaceId=${workspaceId}`, {
                responseType: 'blob'
            });

            // Create filename from project name
            const projectName = infraSpec.project_name || 'cloudiverse-project';
            const filename = `${projectName}-terraform.zip`;

            // Trigger download via file-saver
            saveAs(response.data, filename);

            toast.success('Downloaded Terraform project with Deployment Guide', { id: loadingId });

            // 🔥 Requirement: Toggle on self-deployed after download
            // Persist to backend so Dashboard knows
            setTimeout(async () => { // Added async here
                try {
                    const token = localStorage.getItem('token');
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                    // Use the deploy endpoint to mark as 'deployed'
                    await axios.put(`${API_BASE}/workspaces/${workspaceId}/deploy`, {
                        deployment_method: 'self',
                        provider: selectedProvider
                    }, { headers });

                    console.log('Backend marked as deployed (self).');
                } catch (deployErr) {
                    console.error('Failed to mark as deployed in backend:', deployErr);
                    // Non-blocking, just log
                }

                setIsSelfDeployed(true);
                if (onDeploy) onDeploy();
                toast.success('Project marked as Self-Deployed');
            }, 1000);

        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Failed to download export package', { id: 'dl_zip' });

            // Fallback to client-side zip if server fails
            console.warn('Falling back to client-side zip generation...');
            const zip = new JSZip();
            const projectName = infraSpec.project_name || 'cloudiverse-project';

            // Recursively add files to ZIP
            const addToZip = (obj, folder) => {
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === 'string') {
                        folder.file(key, value);
                    } else if (typeof value === 'object') {
                        const subfolder = folder.folder(key);
                        addToZip(value, subfolder);
                    }
                }
            };

            addToZip(terraformProject, zip);
            // Add a basic README for fallback
            zip.file("README.txt", "Generated by Cloudiverse (Client-side Fallback).\nPlease refer to online documentation for deployment instructions.");

            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, `${projectName}-terraform-fallback.zip`);
            toast.dismiss();
            toast.success('Downloaded backup zip (client-side generated)');

            // Fallback also triggers state
            setIsSelfDeployed(true);
        } finally {
            setIsDownloading(false);
        }
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

    // 🔒 FIX 4: Coming Soon UI (graceful, not an error)
    if (isComingSoon) {
        const patternName = infraSpec?.architecture_pattern || infraSpec?.service_classes?.pattern_name || 'this pattern';

        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                    <div className="text-amber-500 text-6xl material-icons">construction</div>
                    <div className="text-center max-w-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Terraform Generation Coming Soon</h2>
                        <p className="text-gray-300 text-lg mb-2">
                            Terraform generation for <span className="text-primary font-semibold">{patternName}</span> is not available yet.
                        </p>
                        <p className="text-gray-400 text-sm">
                            Your architecture and cost estimates are saved and validated. You can continue with manual infrastructure setup or check back later for automated Terraform generation.
                        </p>
                    </div>

                    {/* Architecture Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-2xl">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Architecture Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Pattern</span>
                                <span className="text-white font-semibold">{patternName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Provider</span>
                                <span className="text-white font-semibold">{selectedProvider.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Services</span>
                                <span className="text-white font-semibold">{infraSpec?.service_classes?.required_services?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        className="mt-6 px-8 py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-semibold transition-colors flex items-center space-x-2"
                    >
                        <span className="material-icons">check_circle</span>
                        <span>Continue to Dashboard</span>
                    </button>
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

    const allFiles = terraformProject ? getAllFiles(terraformProject) : [];
    const fileTree = terraformProject ? getFileTree(terraformProject) : [];
    const currentContent = getCurrentFileContent();

    const getProviderCommands = (provider) => {
        const p = provider?.toLowerCase();
        if (p === 'aws') {
            return [
                { cmd: 'terraform init', desc: 'Initialize Terraform working directory' },
                { cmd: 'terraform plan', desc: 'Generate and show an execution plan' },
                { cmd: 'terraform apply', desc: 'Builds or changes infrastructure' }
            ];
        }
        if (p === 'azure') {
            return [
                { cmd: 'az login', desc: 'Log in to Azure CLI' },
                { cmd: 'terraform init', desc: 'Initialize Terraform' },
                { cmd: 'terraform apply', desc: 'Deploy infrastructure' }
            ];
        }
        if (p === 'gcp') {
            return [
                { cmd: 'gcloud auth application-default login', desc: 'Acquire new user credentials' },
                { cmd: 'terraform init', desc: 'Initialize Terraform' },
                { cmd: 'terraform apply', desc: 'Deploy infrastructure' }
            ];
        }
        return [];
    };

    const commands = getProviderCommands(selectedProvider);

    // Normalize provider for display and logic
    const providerKey = selectedProvider?.toLowerCase().replace(/\s+/g, '');
    const isAws = providerKey === 'aws' || providerKey === 'amazonwebservices';
    const isAzure = providerKey === 'azure' || providerKey === 'microsoftazure';
    const isGcp = providerKey === 'gcp' || providerKey === 'googlecloudplatform' || providerKey === 'google';

    // Fallback for resources: if services array is empty, derive from file tree
    const displayResources = services.length > 0 ? services : fileTree.filter(f => !f.name.endsWith('.tf') && !f.name.endsWith('.md') && !f.type === 'folder').map(f => f.name.replace('.tf', ''));
    // If still empty, try to extract from tf files (simple heuristic)
    const effectiveResources = displayResources.length > 0 ? displayResources : (
        terraformProject && typeof terraformProject === 'object' ? Object.keys(terraformProject).filter(k => k.endsWith('.tf') && k !== 'main.tf' && k !== 'variables.tf' && k !== 'outputs.tf').map(k => k.replace('.tf', '')) : []
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white">Your Infrastructure Code</h2>
                    <p className="text-sm text-gray-400">Modular Terraform project for {selectedProvider}</p>
                </div>
                <div className="flex space-x-3 items-center">
                    <div className="flex space-x-3 items-center">
                        {/* Live Toggle (Automatically ON after download) */}
                        {isSelfDeployed && (
                            <div className="flex items-center space-x-2 bg-green-900/30 border border-green-500/50 px-3 py-1.5 rounded-lg animate-fade-in mr-2">
                                <div className="relative inline-block w-10 mr-1 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle" checked={true} readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer translate-x-5 transition-transform duration-200 ease-in bg-green-500 border-green-500" />
                                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-green-300 cursor-pointer"></label>
                                </div>
                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Self Deployed</span>
                            </div>
                        )}

                        <button
                            onClick={copyToClipboard}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                        >
                            <span className="material-icons text-sm">content_copy</span>
                            <span className="text-sm">Copy File</span>
                        </button>
                        <button
                            onClick={downloadZip}
                            disabled={isDownloading}
                            className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin mr-1"></div>
                            ) : (
                                <span className="material-icons text-sm">download</span>
                            )}
                            <span className="text-sm">{isDownloading ? 'Downloading...' : 'Download ZIP'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {/* File Tree */}
                <div className="col-span-1 bg-surface border border-border rounded-xl p-4 max-h-[600px] overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Project Files</h3>
                    <div className="space-y-1">
                        {fileTree.map((item) => {
                            const isFolder = item.type === 'folder';
                            const isSelected = item.path === selectedFile;
                            const indent = item.depth * 16;

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => !isFolder && setSelectedFile(item.path)}
                                    disabled={isFolder}
                                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-2 ${isFolder
                                        ? 'text-amber-400 font-semibold cursor-default'
                                        : isSelected
                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    style={{ paddingLeft: `${8 + indent}px` }}
                                >
                                    <span className="material-icons text-xs">
                                        {isFolder ? 'folder' : item.name.endsWith('.tf') ? 'description' : item.name.endsWith('.md') ? 'article' : 'insert_drive_file'}
                                    </span>
                                    <span className="truncate">{item.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Code Viewer */}
                <div className="col-span-3 bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/5">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <span className="ml-4 text-xs font-mono text-gray-400">{selectedFile}</span>
                    </div>
                    <div className="p-4 overflow-x-auto max-h-[550px] overflow-y-auto">
                        <pre className="font-mono text-sm text-gray-300 leading-relaxed">
                            {currentContent || '// Select a file to view'}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Deployment Guide */}
            <div className="mt-8">
                <DeploymentGuide
                    provider={selectedProvider}
                    region={infraSpec.region?.resolved_region}
                    projectName={infraSpec.project_name}
                    onMarkDeployed={async () => {
                        if (isSelfDeployed) return;
                        // Reuse the downloadZip logic's deployment trigger, or create a specific one
                        // Since downloadZip has mixed concerns, let's just trigger the backend call here
                        try {
                            const loadingId = toast.loading('Marking as deployed...');
                            const token = localStorage.getItem('token');
                            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                            await axios.put(`${API_BASE}/workspaces/${workspaceId}/deploy`, {
                                deployment_method: 'self',
                                provider: selectedProvider
                            }, { headers });

                            toast.success('Project marked as Self-Deployed', { id: loadingId });
                            setIsSelfDeployed(true);
                            if (onComplete) onComplete(); // Optional: trigger completion callback
                        } catch (err) {
                            console.error(err);
                            toast.error('Failed to mark deployment.');
                        }
                    }}
                    isMarkingDeployed={isDownloading || isSelfDeployed} // Use existing loading state or deployed state
                />
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                    <span className="material-icons">arrow_back</span>
                    <span>Back to Diagram</span>
                </button>

                <button
                    onClick={onComplete}
                    className="px-8 py-4 bg-primary hover:bg-primary/90 border border-primary/20 rounded-xl text-black font-bold transition-all flex items-center space-x-3"
                >
                    <span className="material-icons">summarize</span>
                    <span>View Summary</span>
                </button>
            </div>
        </div>
    );
};

export default TerraformStep;
