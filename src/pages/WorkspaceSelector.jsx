import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, Clock, DollarSign, Settings, User, LogOut, Loader } from 'lucide-react';

const WorkspaceSelector = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchWorkspaces();
  }, []);
  
  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
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
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Your Architecture Workspaces</h1>
            <p className="text-text-secondary mt-1">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'Architect'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-secondary flex items-center space-x-2 px-4 py-2.5"
            >
              <User size={16} />
              <span>Profile</span>
            </button>
            <button
              onClick={logout}
              className="btn btn-secondary flex items-center space-x-2 px-4 py-2.5"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
            <button
              onClick={handleCreateNewWorkspace}
              className="btn btn-primary flex items-center space-x-2 px-4 py-2.5"
            >
              <Plus size={20} />
              <span>New Workspace</span>
            </button>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center mb-12">
          <p className="text-text-secondary italic">"From idea → architecture → cost → code."</p>
        </div>

        {/* Workspaces Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <div 
                key={workspace.id}
                onClick={() => handleSelectWorkspace(workspace.id)}
                className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer hover:scale-[1.02] relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">{workspace.name}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workspace/${workspace.id}/settings`);
                    }}
                    className="p-1 rounded hover:bg-background"
                    title="Workspace Settings"
                  >
                    <Settings className="text-text-subtle hover:text-text-primary" size={16} />
                  </button>
                </div>
                
                <p className="text-text-secondary text-sm mb-2">{workspace.description || 'No description provided'}</p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm">
                    <Clock className="text-text-subtle mr-2" size={16} />
                    <span className="text-text-secondary">Created:</span>
                    <span className="text-text-primary ml-1">
                      {new Date(workspace.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty state for new workspace */}
            <div 
              onClick={handleCreateNewWorkspace}
              className="bg-surface border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="bg-surface/50 group-hover:bg-primary/10 p-3 rounded-full mb-4 transition-colors">
                <Plus className="text-text-subtle group-hover:text-primary" size={24} />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">Create New Workspace</h3>
              <p className="text-text-secondary text-center text-sm mt-2">
                Start designing a new cloud architecture
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSelector;