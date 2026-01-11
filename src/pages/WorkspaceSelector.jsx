import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Building, Clock, DollarSign, Settings, User, LogOut, Loader, Search, LayoutGrid, CheckCircle2, FileCode2, PlusCircle, AlertCircle, Wifi, WifiOff, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const WorkspaceSelector = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
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
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (!err.response) {
        setError('Server Unreachable. Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.msg || 'An unexpected error occurred while loading workspaces.');
      }
    } finally {
      setLoading(false);
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
          <div className="bg-surface/40 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>

            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <WifiOff className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">System Offline</h2>
            <p className="text-gray-400 mb-10 leading-relaxed text-lg italic font-medium">
              "{error}"
            </p>

            <div className="space-y-4">
              <button
                onClick={fetchWorkspaces}
                className="w-full py-4 bg-primary text-black font-black rounded-2xl transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
                TRY RECONNECTING
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
              >
                HARD REFRESH
              </button>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-gray-500 font-medium">
            Error ID: <span className="text-primary/50">ECONN_REFUSED_WS</span>
          </p>
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
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-text-primary hover:bg-white/10 transition-colors font-medium flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-text-primary hover:bg-white/10 transition-colors font-medium flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button
              onClick={handleCreateNewWorkspace}
              className="group px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          {[
            { label: 'Total Projects', value: workspaces.length, icon: LayoutGrid, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Active Deployments', value: workspaces.filter(w => w.state_json?.is_deployed === true && w.state_json?.is_live === true).length, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Draft Designs', value: workspaces.filter(w => !w.state_json?.is_deployed).length, icon: FileCode2, color: 'text-purple-400', bg: 'bg-purple-400/10' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="sticky top-4 z-10 bg-background/80 backdrop-blur-xl py-4 -my-4 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
            <div className="relative group flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-text-subtle group-focus-within:text-primary transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search workspaces..."
                className="block w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-xl text-text-primary placeholder-text-subtle focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative min-w-[200px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-full px-4 pl-12 bg-surface border border-border rounded-xl text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 outline-none appearance-none cursor-pointer font-medium"
              >
                <option value="all">All Projects</option>
                <option value="live">Live</option>
                <option value="not_deployed">Not Deployed</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-subtle">
                <Filter className="w-5 h-5" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-subtle">
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-t-[6px] border-t-current border-r-[5px] border-r-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-dashed border-border rounded-3xl animate-fade-in">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="w-10 h-10 text-text-subtle" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No workspaces found</h3>
            <p className="text-text-secondary max-w-sm mx-auto mb-8">
              {searchTerm ? "Try adjusting your search terms" : "Create your first workspace to get started with Cloudiverse"}
            </p>
            <button
              onClick={handleCreateNewWorkspace}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary hover:bg-white/10 transition-colors font-medium"
            >
              Create New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {filteredWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => navigate(`/workspace/${workspace.id}`)}
                className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer flex flex-col"
              >
                {/* Decoration Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500"></div>

                <div className="p-6 flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-background rounded-xl border border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <LayoutGrid className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {workspace.step === 'ready_for_deployment' && (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          READY
                        </span>
                      )}

                      {/* Project Status Toggle - Show beside settings for deployed projects */}
                      {(workspace.step === 'deployed' || workspace.state_json?.is_deployed === true) && (
                        <div className="flex items-center gap-2" title="Toggle Live Status">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();

                              // Optimistic Update: Update UI instantly before API call
                              const newStatus = !workspace.state_json?.is_live;
                              setWorkspaces(prev => prev.map(w =>
                                w.id === workspace.id
                                  ? {
                                    ...w,
                                    step: 'deployed', // Force 'deployed' so toggle stays visible
                                    state_json: {
                                      ...w.state_json,
                                      is_live: newStatus,
                                      is_deployed: newStatus // Sync deploy flag as requested
                                    }
                                  }
                                  : w
                              ));

                              try {
                                const token = localStorage.getItem('token');
                                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                                await axios.put(
                                  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/workspaces/${workspace.id}/live-status`,
                                  { is_live: newStatus },
                                  { headers }
                                );
                                // Confirm with server state
                                fetchWorkspaces();
                              } catch (error) {
                                console.error('Failed to toggle live status:', error);
                                if (error.response) {
                                  console.error('Backend error:', error.response.status, error.response.data);
                                }
                                toast.error("Connection failed. Reverting status.");
                                // Revert on failure
                                fetchWorkspaces();
                              }
                            }}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${workspace.state_json?.is_live ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                          >
                            <span
                              className={`${workspace.state_json?.is_live ? 'translate-x-5' : 'translate-x-1'
                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                            />
                          </button>
                          <span className={`text-[10px] font-bold tracking-wider ${workspace.state_json?.is_live ? 'text-green-400' : 'text-gray-500'}`}>
                            {workspace.state_json?.is_live ? 'LIVE' : 'OFFLINE'}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workspace/${workspace.id}/settings`);
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg text-text-subtle hover:text-primary transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {workspace.name}
                  </h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-6 h-10">
                    {workspace.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between gap-4 pt-6 border-t border-border mt-auto">
                    <div className="flex items-center text-xs text-text-subtle">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      <span>{formatDate(workspace.updated_at)}</span>
                    </div>


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