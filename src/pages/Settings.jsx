import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Cloud, DollarSign, Brain, Code, Shield, Bell, Users, Archive } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    // Project Settings
    defaultEnvironment: 'dev',
    allowMultiEnvironment: true,
    
    // Cloud & Deployment
    preferredProvider: 'auto',
    defaultCostProfile: 'cost_effective',
    preferredRegion: 'us-east-1',
    dataResidencyRequired: false,
    
    // Cost & Budget
    monthlyBudgetLimit: '',
    budgetAlertEnabled: true,
    showHeuristicEstimate: true,
    showInfracostEstimate: true,
    
    // Architecture & AI
    useAIForIntent: true,
    useAIForExplanations: true,
    allowAIOptimizations: false,
    preventServerlessForStateful: true,
    enforceCompliance: true,
    failOnIncomplete: true,
    allowManualPatternOverride: false,
    
    // Terraform
    terraformVersion: '1.0',
    backendType: 'local',
    stateEncryption: true,
    enableInfracost: true,
    currency: 'USD',
    costBreakdownLevel: 'detailed',
    
    // Security
    compliancePreset: 'none',
    encryptionAtRest: true,
    encryptionInTransit: true,
    publicEndpointsAllowed: false,
    
    // Notifications
    costThresholdAlerts: true,
    architectureChangeAlerts: true,
    deploymentAlerts: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save to localStorage or backend
    localStorage.setItem('cloudiverse_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('cloudiverse_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-white/10'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/workspaces')}
              className="mr-4 p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-text-primary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Workspace Settings</h1>
              <p className="text-text-secondary">Configure your workspace preferences</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          
          {/* 1. Project Settings */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Project Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Default Environment</label>
                <select
                  value={settings.defaultEnvironment}
                  onChange={(e) => handleChange('defaultEnvironment', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Allow Multi-Environment</p>
                  <p className="text-text-secondary text-sm">Enable multiple environment support</p>
                </div>
                <ToggleSwitch 
                  checked={settings.allowMultiEnvironment}
                  onChange={() => handleToggle('allowMultiEnvironment')}
                />
              </div>
            </div>
          </div>

          {/* 2. Cloud & Deployment */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Cloud className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Cloud & Deployment Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Preferred Cloud Provider</label>
                <select
                  value={settings.preferredProvider}
                  onChange={(e) => handleChange('preferredProvider', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="auto">Auto (Comparison-based)</option>
                  <option value="aws">AWS</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="azure">Azure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Preferred Region</label>
                <select
                  value={settings.preferredRegion}
                  onChange={(e) => handleChange('preferredRegion', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Data Residency Required</p>
                  <p className="text-text-secondary text-sm">Enforce data to stay in selected region</p>
                </div>
                <ToggleSwitch 
                  checked={settings.dataResidencyRequired}
                  onChange={() => handleToggle('dataResidencyRequired')}
                />
              </div>
            </div>
          </div>

          {/* 3. Cost & Budget */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Cost & Budget Controls</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Monthly Budget Limit (USD)</label>
                <input
                  type="number"
                  value={settings.monthlyBudgetLimit}
                  onChange={(e) => handleChange('monthlyBudgetLimit', e.target.value)}
                  placeholder="Leave empty for no limit"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Budget Alert Enabled</p>
                  <p className="text-text-secondary text-sm">Warn when approaching budget limit</p>
                </div>
                <ToggleSwitch 
                  checked={settings.budgetAlertEnabled}
                  onChange={() => handleToggle('budgetAlertEnabled')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Show Heuristic Estimate</p>
                  <p className="text-text-secondary text-sm">Display formula-based cost estimates</p>
                </div>
                <ToggleSwitch 
                  checked={settings.showHeuristicEstimate}
                  onChange={() => handleToggle('showHeuristicEstimate')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Show Infracost Estimate</p>
                  <p className="text-text-secondary text-sm">Display Terraform-based pricing</p>
                </div>
                <ToggleSwitch 
                  checked={settings.showInfracostEstimate}
                  onChange={() => handleToggle('showInfracostEstimate')}
                />
              </div>
            </div>
          </div>

          {/* 4. Architecture & AI */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Brain className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Architecture & AI Behavior</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Use AI for Intent Understanding</p>
                  <p className="text-text-secondary text-sm">Let AI analyze project requirements</p>
                </div>
                <ToggleSwitch 
                  checked={settings.useAIForIntent}
                  onChange={() => handleToggle('useAIForIntent')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Use AI for Explanations</p>
                  <p className="text-text-secondary text-sm">Generate explanations for decisions</p>
                </div>
                <ToggleSwitch 
                  checked={settings.useAIForExplanations}
                  onChange={() => handleToggle('useAIForExplanations')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Allow AI Optimizations</p>
                  <p className="text-text-secondary text-sm">Let AI suggest architecture improvements</p>
                </div>
                <ToggleSwitch 
                  checked={settings.allowAIOptimizations}
                  onChange={() => handleToggle('allowAIOptimizations')}
                />
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm font-semibold text-text-primary mb-3">Architecture Guardrails</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium text-sm">Prevent Serverless for Stateful Apps</p>
                      <p className="text-text-secondary text-xs">Block inappropriate patterns</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.preventServerlessForStateful}
                      onChange={() => handleToggle('preventServerlessForStateful')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium text-sm">Enforce Compliance Constraints</p>
                      <p className="text-text-secondary text-xs">Apply compliance rules strictly</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.enforceCompliance}
                      onChange={() => handleToggle('enforceCompliance')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium text-sm">Fail on Incomplete Architecture</p>
                      <p className="text-text-secondary text-xs">Don't proceed with missing services</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.failOnIncomplete}
                      onChange={() => handleToggle('failOnIncomplete')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium text-sm">Allow Manual Pattern Override</p>
                      <p className="text-text-secondary text-xs">Let advanced users override pattern selection</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.allowManualPatternOverride}
                      onChange={() => handleToggle('allowManualPatternOverride')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Terraform & Infrastructure */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Code className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Terraform & Infrastructure</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Terraform Version</label>
                <select
                  value={settings.terraformVersion}
                  onChange={(e) => handleChange('terraformVersion', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="1.0">1.0.x</option>
                  <option value="1.5">1.5.x</option>
                  <option value="latest">Latest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Backend Type</label>
                <select
                  value={settings.backendType}
                  onChange={(e) => handleChange('backendType', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="local">Local</option>
                  <option value="remote">Remote</option>
                  <option value="s3">AWS S3</option>
                  <option value="gcs">Google Cloud Storage</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">State File Encryption</p>
                  <p className="text-text-secondary text-sm">Encrypt Terraform state files</p>
                </div>
                <ToggleSwitch 
                  checked={settings.stateEncryption}
                  onChange={() => handleToggle('stateEncryption')}
                />
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm font-semibold text-text-primary mb-3">Infracost Integration</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium text-sm">Enable Infracost Estimates</p>
                      <p className="text-text-secondary text-xs">Get Terraform-based pricing</p>
                    </div>
                    <ToggleSwitch 
                      checked={settings.enableInfracost}
                      onChange={() => handleToggle('enableInfracost')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Cost Breakdown Level</label>
                    <select
                      value={settings.costBreakdownLevel}
                      onChange={(e) => handleChange('costBreakdownLevel', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                    >
                      <option value="simple">Simple</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Security & Compliance */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Security & Compliance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Compliance Preset</label>
                <select
                  value={settings.compliancePreset}
                  onChange={(e) => handleChange('compliancePreset', e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="none">None</option>
                  <option value="gdpr">GDPR</option>
                  <option value="pci">PCI-DSS</option>
                  <option value="hipaa">HIPAA (Coming Soon)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Encryption at Rest</p>
                  <p className="text-text-secondary text-sm">Encrypt stored data</p>
                </div>
                <ToggleSwitch 
                  checked={settings.encryptionAtRest}
                  onChange={() => handleToggle('encryptionAtRest')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Encryption in Transit</p>
                  <p className="text-text-secondary text-sm">Use TLS/SSL for data transfer</p>
                </div>
                <ToggleSwitch 
                  checked={settings.encryptionInTransit}
                  onChange={() => handleToggle('encryptionInTransit')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Public Endpoints Allowed</p>
                  <p className="text-text-secondary text-sm">Allow internet-facing services</p>
                </div>
                <ToggleSwitch 
                  checked={settings.publicEndpointsAllowed}
                  onChange={() => handleToggle('publicEndpointsAllowed')}
                />
              </div>
            </div>
          </div>

          {/* 7. Notifications */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Notifications & Alerts</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Cost Threshold Alerts</p>
                  <p className="text-text-secondary text-sm">Notify when costs exceed limits</p>
                </div>
                <ToggleSwitch 
                  checked={settings.costThresholdAlerts}
                  onChange={() => handleToggle('costThresholdAlerts')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Architecture Change Alerts</p>
                  <p className="text-text-secondary text-sm">Notify on architecture modifications</p>
                </div>
                <ToggleSwitch 
                  checked={settings.architectureChangeAlerts}
                  onChange={() => handleToggle('architectureChangeAlerts')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Deployment Alerts</p>
                  <p className="text-text-secondary text-sm">Notify on deployment success/failure</p>
                </div>
                <ToggleSwitch 
                  checked={settings.deploymentAlerts}
                  onChange={() => handleToggle('deploymentAlerts')}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end mt-8 pb-8">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
