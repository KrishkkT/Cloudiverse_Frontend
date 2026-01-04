import React, { useState, useEffect } from 'react';

const RequirementsStep = ({ 
  workspaceId, 
  infraSpec, 
  costEstimation, 
  onNext, 
  onBack,
  onRequirementsCaptured
}) => {
  const [requirements, setRequirements] = useState({
    // Non-functional requirements
    nfr: {
      availability: '99.5',
      latency: 'medium',
      compliance: [],
      data_residency: '',
      cost_ceiling_usd: null,
      security_level: 'standard'
    },
    // Region selection
    region: {
      primary_region: 'us-east-1',
      secondary_region: '',
      multi_region: false
    },
    // Data classification
    data_classes: {},
    // Data retention
    data_retention: {},
    // Deployment strategy
    deployment_strategy: 'rolling',
    downtime_allowed: true,
    // Observability
    observability: {
      logs: true,
      metrics: true,
      alerts: false
    }
  });

  const [activeTab, setActiveTab] = useState('nfr'); // nfr, region, data, deployment, observability

  const handleNFRChange = (field, value) => {
    setRequirements(prev => ({
      ...prev,
      nfr: {
        ...prev.nfr,
        [field]: value
      }
    }));
  };

  const handleRegionChange = (field, value) => {
    setRequirements(prev => ({
      ...prev,
      region: {
        ...prev.region,
        [field]: value
      }
    }));
  };

  const handleComplianceChange = (complianceType, checked) => {
    setRequirements(prev => {
      const newCompliance = checked
        ? [...prev.nfr.compliance, complianceType]
        : prev.nfr.compliance.filter(c => c !== complianceType);
      
      return {
        ...prev,
        nfr: {
          ...prev.nfr,
          compliance: newCompliance
        }
      };
    });
  };

  const handleSecurityChange = (level) => {
    handleNFRChange('security_level', level);
  };

  const handleAvailabilityChange = (level) => {
    handleNFRChange('availability', level);
  };

  const handleLatencyChange = (level) => {
    handleNFRChange('latency', level);
  };

  const handleDeploymentStrategyChange = (strategy) => {
    setRequirements(prev => ({
      ...prev,
      deployment_strategy: strategy
    }));
  };

  const handleObservabilityChange = (service, checked) => {
    setRequirements(prev => ({
      ...prev,
      observability: {
        ...prev.observability,
        [service]: checked
      }
    }));
  };

  const handleSubmit = () => {
    try {
      // Validate requirements before submission
      if (!requirements || Object.keys(requirements).length === 0) {
        console.error('Requirements data is empty');
        return;
      }
      
      if (onRequirementsCaptured) {
        onRequirementsCaptured(requirements);
      }
      onNext();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const tabs = [
    { id: 'nfr', label: 'Constraints', icon: 'security' },
    { id: 'region', label: 'Region', icon: 'public' },
    { id: 'data', label: 'Data', icon: 'database' },
    { id: 'deployment', label: 'Deployment', icon: 'build' },
    { id: 'observability', label: 'Monitoring', icon: 'monitoring' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-white">System Requirements</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Define non-functional requirements, compliance, and operational constraints for your infrastructure.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-primary/20 text-white border border-primary/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-icons text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        {activeTab === 'nfr' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Non-Functional Requirements</h3>
            
            {/* Availability */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Availability</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { value: '99.5', label: 'Standard (99.5%)', desc: '~3.6 hours downtime/month - suitable for internal tools' },
                  { value: '99.9', label: 'High (99.9%)', desc: '~43 minutes downtime/month - customer-facing apps' },
                  { value: '99.99', label: 'Critical (99.99%)', desc: '~4 minutes downtime/month - business-critical systems' }
                ].map(option => (
                  <div 
                    key={option.value}
                    onClick={() => handleAvailabilityChange(option.value)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      requirements.nfr.availability === option.value
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latency */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Latency Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Low (<100ms)', desc: 'Real-time apps, gaming, trading platforms' },
                  { value: 'medium', label: 'Medium (<500ms)', desc: 'Standard web apps, e-commerce, SaaS' },
                  { value: 'high', label: 'High (<2s)', desc: 'Batch processing, analytics, background jobs' }
                ].map(option => (
                  <div 
                    key={option.value}
                    onClick={() => handleLatencyChange(option.value)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      requirements.nfr.latency === option.value
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Level */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Security Level</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'standard', label: 'Standard', desc: 'Basic firewalls, SSL/TLS, standard encryption' },
                  { value: 'high', label: 'High', desc: 'Advanced threat protection, WAF, DDoS mitigation' },
                  { value: 'maximum', label: 'Maximum', desc: 'End-to-end encryption, HSM, zero-trust architecture' }
                ].map(option => (
                  <div 
                    key={option.value}
                    onClick={() => handleSecurityChange(option.value)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      requirements.nfr.security_level === option.value
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Compliance Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'PCI', label: 'PCI DSS', desc: 'Payment card processing and storage security' },
                  { value: 'GDPR', label: 'GDPR', desc: 'EU data privacy and protection regulations' },
                  { value: 'HIPAA', label: 'HIPAA', desc: 'Healthcare data protection (US)' },
                  { value: 'SOX', label: 'SOX', desc: 'Financial reporting and audit compliance (US)' },
                  { value: 'FedRAMP', label: 'FedRAMP', desc: 'US government cloud security authorization' },
                  { value: 'SOC2', label: 'SOC2', desc: 'Security, availability, and confidentiality audit' }
                ].map(compliance => (
                  <div 
                    key={compliance.value}
                    onClick={() => handleComplianceChange(compliance.value, !requirements.nfr.compliance.includes(compliance.value))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      requirements.nfr.compliance.includes(compliance.value)
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-medium">{compliance.label}</div>
                    <div className="text-xs opacity-70 mt-1">{compliance.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Ceiling */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Cost Ceiling</h4>
              <div className="max-w-xs">
                <label className="block text-sm text-gray-400 mb-2">Maximum monthly cost (USD)</label>
                <input
                  type="number"
                  value={requirements.nfr.cost_ceiling_usd || ''}
                  onChange={(e) => handleNFRChange('cost_ceiling_usd', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="No limit"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'region' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Region Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Primary Region</label>
                <select
                  value={requirements.region.primary_region}
                  onChange={(e) => handleRegionChange('primary_region', e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="eu-central-1">EU (Frankfurt)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  <option value="ca-central-1">Canada (Central)</option>
                  <option value="sa-east-1">South America (São Paulo)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Secondary Region (Optional)</label>
                <select
                  value={requirements.region.secondary_region}
                  onChange={(e) => handleRegionChange('secondary_region', e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">None</option>
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="eu-central-1">EU (Frankfurt)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  <option value="ca-central-1">Canada (Central)</option>
                  <option value="sa-east-1">South America (São Paulo)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-surface/50 rounded-xl border border-border">
              <input
                type="checkbox"
                id="multi-region"
                checked={requirements.region.multi_region}
                onChange={(e) => handleRegionChange('multi_region', e.target.checked)}
                className="w-5 h-5 text-primary bg-surface border-border rounded focus:ring-primary"
              />
              <label htmlFor="multi-region" className="text-white">
                Enable multi-region deployment for high availability
              </label>
            </div>

            {requirements.nfr.compliance.includes('GDPR') && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-amber-400 text-sm mt-0.5">info</span>
                  <div>
                    <h4 className="font-bold text-amber-200 mb-1">Data Residency Notice</h4>
                    <p className="text-sm text-amber-200/80">
                      GDPR compliance requires data to be stored within EU regions. 
                      Primary region must be EU-based.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Data Classification & Retention</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-4">Data Classification</h4>
                <p className="text-sm text-gray-400 mb-4">Classify your data types to apply appropriate security measures</p>
                
                <div className="space-y-4">
                  {[
                    { type: 'user_profiles', label: 'User Profiles', desc: 'Names, emails, personal preferences, account details' },
                    { type: 'payment_data', label: 'Payment Data', desc: 'Credit cards, billing info, transaction history' },
                    { type: 'documents', label: 'Documents', desc: 'User-uploaded files, images, videos, PDFs' },
                    { type: 'logs', label: 'System Logs', desc: 'Application logs, access logs, error traces' },
                    { type: 'analytics', label: 'Analytics', desc: 'Usage metrics, user behavior, performance data' },
                    { type: 'backup', label: 'Backup Data', desc: 'Backup copies, snapshots, archived data' }
                  ].map(data => (
                    <div key={data.type} className="flex items-center justify-between p-4 bg-surface/30 rounded-xl border border-border">
                      <div>
                        <div className="font-medium text-white">{data.label}</div>
                        <div className="text-sm text-gray-400">{data.desc}</div>
                      </div>
                      <select
                        value={requirements.data_classes[data.type] || ''}
                        onChange={(e) => setRequirements(prev => ({
                          ...prev,
                          data_classes: {
                            ...prev.data_classes,
                            [data.type]: e.target.value
                          }
                        }))}
                        className="bg-surface border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="">Unclassified</option>
                        <option value="public">Public</option>
                        <option value="internal">Internal</option>
                        <option value="confidential">Confidential</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Data Retention</h4>
                <p className="text-sm text-gray-400 mb-4">Define how long different data types should be retained</p>
                
                <div className="space-y-4">
                  {[
                    { type: 'user_profiles', label: 'User Profiles' },
                    { type: 'payment_data', label: 'Payment Data' },
                    { type: 'logs', label: 'System Logs' },
                    { type: 'analytics', label: 'Analytics Data' }
                  ].map(data => (
                    <div key={data.type} className="flex items-center justify-between p-4 bg-surface/30 rounded-xl border border-border">
                      <div>
                        <div className="font-medium text-white">{data.label}</div>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g., 7 years, 90 days"
                        value={requirements.data_retention[data.type] || ''}
                        onChange={(e) => setRequirements(prev => ({
                          ...prev,
                          data_retention: {
                            ...prev.data_retention,
                            [data.type]: e.target.value
                          }
                        }))}
                        className="bg-surface border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary w-40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Deployment Strategy</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-4">Deployment Strategy</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { value: 'rolling', label: 'Rolling', desc: 'Instances updated gradually, minimal risk' },
                    { value: 'blue-green', label: 'Blue/Green', desc: 'Zero downtime with instant rollback capability' },
                    { value: 'canary', label: 'Canary', desc: 'Test with small traffic before full rollout' },
                    { value: 'batch', label: 'Batch', desc: 'All instances updated at once, fastest but risky' }
                  ].map(strategy => (
                    <div 
                      key={strategy.value}
                      onClick={() => handleDeploymentStrategyChange(strategy.value)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        requirements.deployment_strategy === strategy.value
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-medium">{strategy.label}</div>
                      <div className="text-xs opacity-70 mt-1">{strategy.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-surface/50 rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="downtime-allowed"
                  checked={requirements.downtime_allowed}
                  onChange={(e) => setRequirements(prev => ({
                    ...prev,
                    downtime_allowed: e.target.checked
                  }))}
                  className="w-5 h-5 text-primary bg-surface border-border rounded focus:ring-primary"
                />
                <label htmlFor="downtime-allowed" className="text-white">
                  Downtime is allowed during deployment
                </label>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-blue-400 text-sm mt-0.5">info</span>
                  <div>
                    <h4 className="font-bold text-blue-200 mb-1">Strategy Recommendations</h4>
                    <p className="text-sm text-blue-200/80">
                      • High availability systems: Blue/Green or Canary<br/>
                      • Development systems: Rolling<br/>
                      • Batch: Only for non-critical systems
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'observability' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Observability & Monitoring</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface/30 rounded-xl border border-border">
                <div>
                  <div className="font-medium text-white">Application Logging</div>
                  <div className="text-sm text-gray-400">Capture application and system logs</div>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={requirements.observability.logs}
                    onChange={(e) => handleObservabilityChange('logs', e.target.checked)}
                    className="sr-only"
                    id="logs-toggle"
                  />
                  <label 
                    htmlFor="logs-toggle"
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      requirements.observability.logs ? 'bg-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        requirements.observability.logs ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface/30 rounded-xl border border-border">
                <div>
                  <div className="font-medium text-white">Infrastructure Metrics</div>
                  <div className="text-sm text-gray-400">Monitor CPU, memory, disk, and network</div>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={requirements.observability.metrics}
                    onChange={(e) => handleObservabilityChange('metrics', e.target.checked)}
                    className="sr-only"
                    id="metrics-toggle"
                  />
                  <label 
                    htmlFor="metrics-toggle"
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      requirements.observability.metrics ? 'bg-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        requirements.observability.metrics ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface/30 rounded-xl border border-border">
                <div>
                  <div className="font-medium text-white">Alerting System</div>
                  <div className="text-sm text-gray-400">Get notified of issues and anomalies</div>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={requirements.observability.alerts}
                    onChange={(e) => handleObservabilityChange('alerts', e.target.checked)}
                    className="sr-only"
                    id="alerts-toggle"
                  />
                  <label 
                    htmlFor="alerts-toggle"
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      requirements.observability.alerts ? 'bg-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        requirements.observability.alerts ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <span className="material-icons text-green-400 text-sm mt-0.5">info</span>
                <div>
                  <h4 className="font-bold text-green-200 mb-1">Observability Benefits</h4>
                  <p className="text-sm text-green-200/80">
                    Monitoring and logging are essential for production systems. 
                    They help identify issues before they impact users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-white/5">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 transition-colors flex items-center space-x-2"
        >
          <span className="material-icons">arrow_back</span>
          <span>Back</span>
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 rounded-xl text-white font-bold uppercase tracking-wider flex items-center space-x-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <span>Continue to Architecture</span>
          <span className="material-icons">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default RequirementsStep;