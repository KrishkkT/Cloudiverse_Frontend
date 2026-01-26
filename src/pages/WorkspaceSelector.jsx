import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Building, Clock, DollarSign, Settings, User, Home, LogOut, Loader, Search, LayoutGrid, CheckCircle2, FileCode2, PlusCircle, AlertCircle, Wifi, WifiOff, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

import { generateProjectReport } from '../utils/pdfGenerator';

const WorkspaceSelector = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    // ... (existing code, ensure it stays valid)
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWorkspaces(response.data.map(ws => {
        let parsedState = ws.state_json || {};
        try {
          if (typeof parsedState === 'string') parsedState = JSON.parse(parsedState);
        } catch (e) {
          console.warn('Failed to parse workspace state:', e);
          parsedState = {};
        }
        return { ...ws, state_json: parsedState };
      }));
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      // Valid error handling
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.msg || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (e, workspaceId) => {
    e.stopPropagation();
    if (downloadingReportId) return;

    try {
      setDownloadingReportId(workspaceId);
      toast.info('Generating PDF Report...');

      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces/${workspaceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Assume backend returns full workspace object with state_json
      const fullWorkspace = response.data;
      // Parse state_json if needed (backend might return it as object already if using pg driver properly, or string)
      if (typeof fullWorkspace.state_json === 'string') {
        fullWorkspace.state_json = JSON.parse(fullWorkspace.state_json);
      }

      // Merge top-level state into a 'project' structure expected by generator
      // The generator expects: name, description, infraSpec, costEstimation, state_json
      const projectData = {
        name: fullWorkspace.name,
        description: fullWorkspace.description || fullWorkspace.state_json?.description,
        infraSpec: fullWorkspace.state_json?.infraSpec,
        costEstimation: fullWorkspace.state_json?.costEstimation,
        state_json: fullWorkspace.state_json
      };

      generateProjectReport(projectData, fullWorkspace.state_json?.diagramImage); // Pass saved diagram image
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Report generation failed:', err);
      toast.error('Failed to generate report');
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleToggleDeployment = async (e, workspace) => {
    e.stopPropagation();
    const currentStatus = workspace.state_json?.is_live || false;
    const newStatus = !currentStatus;

    try {
      const authToken = localStorage.getItem('token');
      // We need to update state_json.is_live AND is_deployed
      // We'll use the existing /save endpoint which updates the whole state.
      // Or better, creating a focused update if possible, but let's stick to the pattern used in ArchitectureStep

      // 1. Prepare updated state
      const updatedState = {
        ...workspace.state_json,
        is_live: newStatus,
        is_deployed: newStatus // Sync both for consistency based on user request "is_deployed"
      };

      // 2. Call Save
      // Note: The /save endpoint expects { workspaceId, step, state, name, projectId }
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces/save`, {
        workspaceId: workspace.id,
        step: workspace.step,
        state: updatedState,
        name: workspace.name,
        projectId: workspace.project_id
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      // 3. Optimistic Update or Refetch
      // For speed, let's update local state
      setWorkspaces(prev => prev.map(w =>
        w.id === workspace.id
          ? { ...w, state_json: updatedState, updated_at: new Date().toISOString() }
          : w
      ));

      toast.success(newStatus ? 'Project marked as Deployed' : 'Project marked as Offline');

    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleCreateNewWorkspace = () => {
    navigate('/workspace/new');
  };

  const handleSelectWorkspace = (workspaceId) => {
    navigate(`/workspace/${workspaceId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter(workspace => {
      const matchesSearch = workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workspace.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const isDeployed = workspace.step === 'deployed' || workspace.state_json?.is_deployed === true;
      const isLive = workspace.state_json?.is_live === true;

      let matchesFilter = true;
      if (filterStatus === 'live') {
        matchesFilter = isDeployed && isLive;
      } else if (filterStatus === 'not_deployed') {
        matchesFilter = !isDeployed;
      }

      return matchesSearch && matchesFilter;
    });
  }, [workspaces, searchTerm, filterStatus]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-surface/40 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-10 text-center shadow-2xl">
            <h2 className="text-3xl font-black text-white mb-4">System Offline</h2>
            <p className="text-gray-400 mb-10">"{error}"</p>
            <button onClick={fetchWorkspaces} className="w-full py-4 bg-primary text-black font-black rounded-2xl">RETRY</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">{user?.name || 'User'}</span>
            </h1>
            <p className="text-text-secondary mt-2 text-lg">Manage and organize your cloud infrastructure projects</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-text-primary font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
              <Home className="w-4 h-4" /> <span>Home</span>
            </button>
            <button onClick={() => navigate('/profile')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-text-primary font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
              <User className="w-4 h-4" /> <span>Profile</span>
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium flex items-center gap-2 hover:bg-red-500/20 transition-colors">
              <LogOut className="w-4 h-4" /> <span>Logout</span>
            </button>
            <button onClick={handleCreateNewWorkspace} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:shadow-primary/40 transition-all">
              <PlusCircle className="w-5 h-5" /> <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - Same as before */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          {[
            { label: 'Total Projects', value: workspaces.length, icon: LayoutGrid, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Active Deployments', value: workspaces.filter(w => w.state_json?.is_deployed === true && w.state_json?.is_live === true).length, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Draft Designs', value: workspaces.filter(w => !w.state_json?.is_deployed).length, icon: FileCode2, color: 'text-purple-400', bg: 'bg-purple-400/10' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <div>
                  <p className="text-text-secondary font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bg}`}><stat.icon className={`w-8 h-8 ${stat.color}`} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter - Stays mostly same */}
        <div className="sticky top-4 z-10 bg-background/80 backdrop-blur-xl py-4 -my-4 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="relative min-w-[200px]">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full h-full px-4 bg-surface border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
                <option value="all">All Projects</option>
                <option value="live">Live</option>
                <option value="not_deployed">Not Deployed</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <button
              onClick={() => navigate('/feedback')}
              className="px-4 py-3 bg-surface border border-border rounded-xl text-text-primary hover:border-primary/50 hover:bg-surface/80 transition-all flex items-center gap-2 font-medium"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <span>Feedback</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-primary" /></div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-dashed border-border rounded-3xl">
            <h3 className="text-xl font-bold text-text-primary">No workspaces found</h3>
            <button onClick={handleCreateNewWorkspace} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">Create New Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {filteredWorkspaces.map((workspace) => (
              <div key={workspace.id} onClick={() => navigate(`/workspace/${workspace.id}`)} className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer flex flex-col hover:shadow-xl">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-background rounded-xl border border-border"><LayoutGrid className="w-6 h-6 text-primary" /></div>
                    <div className="flex items-center gap-2">
                      {(workspace.step === 'deployed' || workspace.state_json?.is_deployed === true) && (
                        <>
                          <div className="flex items-center gap-2 bg-surface/50 rounded-full px-3 py-1 border border-border/50" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-bold tracking-wider text-text-secondary w-12 text-center">
                              {workspace.state_json?.is_live ? 'LIVE' : 'OFFLINE'}
                            </span>
                            <button
                              onClick={(e) => handleToggleDeployment(e, workspace)}
                              className={`w-8 h-4 rounded-full transition-colors relative ${workspace.state_json?.is_live ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${workspace.state_json?.is_live ? 'left-4.5' : 'left-0.5'}`} style={{ left: workspace.state_json?.is_live ? 'calc(100% - 3.5px - 12px)' : '2px' }}></div>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-1">{workspace.name}</h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-6 h-10">{workspace.description || "No description"}</p>

                  <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                    <div className="flex items-center text-xs text-text-subtle">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      <span>{formatDate(workspace.updated_at)}</span>
                    </div>

                    {/* Report Button - Moved Here */}
                    {(workspace.step === 'deployed' || workspace.state_json?.is_deployed === true) && (
                      <button
                        onClick={(e) => handleDownloadReport(e, workspace.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors text-xs font-medium"
                        title="Download PDF Report"
                      >
                        {downloadingReportId === workspace.id ? (
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileCode2 className="w-3.5 h-3.5" />
                        )}
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkspaceSelector;