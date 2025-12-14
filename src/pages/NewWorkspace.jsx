import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Play, Save, Loader } from 'lucide-react';

const NewWorkspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appDescription, setAppDescription] = useState('');
  const [projectName, setProjectName] = useState('New Project');
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!appDescription.trim()) {
      alert('Please describe your system');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const requestData = {
        name: projectName,
        description: appDescription,
        project_data: {
          appDescription,
          projectName
        }
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const workspace = await response.json();
        // Navigate to the newly created workspace
        navigate(`/workspace/${workspace.id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create workspace');
      }
    } catch (error) {
      alert('Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Workspace</h1>
          <p className="text-text-secondary">Brief the system you want to build. We'll design the architecture.</p>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-8">
          <div className="mb-6">
            <label htmlFor="projectName" className="block text-sm font-medium text-text-primary mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
              placeholder="Enter project name"
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="appDescription" className="block text-sm font-medium text-text-primary mb-2">
              System Description
            </label>
            <textarea
              id="appDescription"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe your system (e.g., A SaaS analytics platform for 50k concurrent users with PostgreSQL database, Redis caching, and CDN for static assets...)"
              className="w-full h-64 bg-background border border-border rounded-lg p-4 text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleCreateWorkspace}
              disabled={!appDescription.trim() || loading}
              className={`btn btn-primary px-6 py-3 flex items-center ${
                !appDescription.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  Create Workspace
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewWorkspace;