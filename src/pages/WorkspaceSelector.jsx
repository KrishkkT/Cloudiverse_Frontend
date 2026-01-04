import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, Clock, DollarSign, Settings, User, LogOut, Loader, Search, LayoutGrid, CheckCircle2, FileCode2, PlusCircle } from 'lucide-react';

const WorkspaceSelector = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load workspaces. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setError('Failed to connect to server. Please check your connection and try again.');
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
    return workspaces.filter(workspace =>
      workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workspaces, searchTerm]);

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Workspaces</h2>
            <p className="text-text-secondary mb-4">{error}</p>
            <button
              onClick={fetchWorkspaces}
              className="btn btn-primary"
            >
              Retry
            </button>
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
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Workspaces</span>
            </h1>
            <p className="text-text-secondary mt-2 text-lg">Manage and organize your cloud infrastructure projects</p>
          </div>
          <button
            onClick={handleCreateNewWorkspace}
            className="group px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Project</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          {[
            { label: 'Total Projects', value: workspaces.length, icon: LayoutGrid, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Active Deployments', value: workspaces.filter(w => w.status === 'deployed').length, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Draft Designs', value: workspaces.filter(w => w.status !== 'deployed').length, icon: FileCode2, color: 'text-purple-400', bg: 'bg-purple-400/10' }
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
          <div className="relative group max-w-2xl">
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
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="h-6 w-px bg-border mx-2"></div>
              <button className="text-text-subtle hover:text-text-primary transition-colors p-1">
                <div className="w-5 h-5 flex flex-col gap-0.5 justify-center">
                  <span className="block w-4 h-0.5 bg-current rounded-full"></span>
                  <span className="block w-3 h-0.5 bg-current rounded-full"></span>
                  <span className="block w-2 h-0.5 bg-current rounded-full"></span>
                </div>
              </button>
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
                      {workspace.status === 'deployed' && (
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                          LIVE
                        </span>
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

                  <div className="flex items-center gap-4 pt-6 border-t border-border mt-auto">
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