import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

const NewWorkspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const creatingRef = React.useRef(false);

  useEffect(() => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    createWorkspaceAndRedirect();
  }, []);

  const createWorkspaceAndRedirect = async () => {
    try {
      const token = localStorage.getItem('token');

      const requestData = {
        name: 'New Project',
        description: '',
        project_data: {
          appDescription: '',
          projectName: 'New Project'
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
        navigate(`/workspace/${workspace.id}`, { replace: true });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create workspace');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error creating workspace:', err);
      setError('Failed to create workspace. Please try again.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <span className="material-icons text-4xl">error_outline</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Error Creating Workspace</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate('/workspaces')}
              className="btn btn-secondary px-4 py-2"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                createWorkspaceAndRedirect();
              }}
              className="btn btn-primary px-4 py-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center">
        <Loader className="animate-spin text-primary mx-auto mb-4" size={48} />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Creating Workspace...</h2>
        <p className="text-text-secondary">Setting up your new project</p>
      </div>
    </div>
  );
};

export default NewWorkspace;