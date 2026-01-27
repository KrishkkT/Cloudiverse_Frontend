import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Save, ArrowLeft, Settings as SettingsIcon, Sparkles, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';

const WorkspaceSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [workspaceData, setWorkspaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch workspace details
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const workspace = await response.json();
          setWorkspaceData(workspace);
          setWorkspaceName(workspace.name);
          setWorkspaceDescription(workspace.description || '');

          // AI-generated description from state_json if available
          const stateJson = workspace.state_json || {};
          const aiDesc = stateJson.step2Result?.project_summary ||
            stateJson.intent_classification?.primary_domain ||
            '';
          setAiDescription(aiDesc);
        } else {
          toast.error('Failed to load workspace');
          navigate('/workspaces');
        }
      } catch (error) {
        console.error('Error fetching workspace:', error);
        toast.error('Failed to load workspace');
        navigate('/workspaces');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkspace();
    }
  }, [id, navigate]);

  const handleDeleteWorkspace = async () => {
    if (window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('Workspace deleted successfully');
          navigate('/workspaces');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to delete workspace');
        }
      } catch (error) {
        console.error('Error deleting workspace:', error);
        toast.error('Failed to delete workspace');
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workspaces/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: workspaceName,
          description: workspaceDescription
        })
      });

      if (response.ok) {
        const updatedWorkspace = await response.json();
        toast.success('Workspace settings saved');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading workspace settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-lg hover:bg-surface"
            >
              <ArrowLeft className="h-5 w-5 text-text-primary" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Workspace Settings</h1>
              <p className="text-text-secondary">Manage your workspace configuration</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center mb-6">
            <SettingsIcon className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-text-primary">General Settings</h2>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="space-y-6">
              {/* Project Name - User Defined (Editable) */}
              <div>
                <div className="flex items-center mb-2">
                  <Edit3 className="h-4 w-4 text-primary mr-2" />
                  <label htmlFor="workspaceName" className="block text-sm font-medium text-text-primary">
                    Project Name
                  </label>
                </div>
                <input
                  id="workspaceName"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                  placeholder="Enter project name"
                />
                <p className="text-text-subtle text-sm mt-1">
                  This is your project name. It stays unchanged throughout the project.
                </p>
              </div>

              {/* AI-Generated Description (Read-only) */}
              {aiDescription && (
                <div>
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-secondary mr-2" />
                    <label className="block text-sm font-medium text-text-primary">
                      AI-Generated Description
                    </label>
                    <span className="ml-2 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">Auto-generated</span>
                  </div>
                  <div className="w-full px-4 py-3 bg-surface/50 border border-border/50 rounded-lg text-text-secondary">
                    {aiDescription}
                  </div>
                  <p className="text-text-subtle text-sm mt-1">
                    This description was generated by AI based on your project requirements.
                  </p>
                </div>
              )}

              {/* Custom Notes (Editable) */}
              <div>
                <label htmlFor="workspaceDescription" className="block text-sm font-medium text-text-primary mb-2">
                  Your Notes (Optional)
                </label>
                <textarea
                  id="workspaceDescription"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                  placeholder="Add your own notes about this workspace"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-surface border border-border rounded-xl p-6 mt-6">
          <div className="flex items-center mb-6">
            <Trash2 className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-text-primary">Danger Zone</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div>
              <h3 className="font-medium text-text-primary">Delete Workspace</h3>
              <p className="text-text-secondary text-sm mt-1">
                Permanently delete this workspace and all its data. This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col items-end">
              {workspaceData?.state_json?.is_deployed === true || workspaceData?.step === 'deployed' ? (
                <div className="text-right">
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-white/50 rounded-lg flex items-center cursor-not-allowed opacity-70"
                    title="Undeploy project to delete"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Workspace
                  </button>
                  <p className="text-xs text-red-400 mt-2 font-medium">
                    Cannot delete active deployment. <br />Undeploy first.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleDeleteWorkspace}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workspace
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;