import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Upload,
  AlertTriangle,
  Key,
  Globe,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Krish Thakker',
    email: user?.email || '',
    notifications: true,
    newsletter: false,
    twoFactor: false,
    theme: 'dark',
    language: 'en'
  });

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.success('Account deleted successfully');
      // In a real app, you would make an API call to delete the account
    }
  };

  const handleSaveChanges = () => {
    toast.success('Settings saved successfully');
    // In a real app, you would make an API call to save the settings
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'billing', name: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="card">
            <div className="card-body p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left ${activeTab === tab.id
                          ? 'bg-primary/20 text-primary border-l-4 border-primary'
                          : 'text-text-secondary hover:bg-surface'
                        }`}
                    >
                      <Icon size={20} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold">Profile Information</h2>
                </div>
                <div className="card-body">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="text-background" size={32} />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-surface rounded-full p-2 border-2 border-background">
                        <Upload size={16} />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Profile Picture</h3>
                      <p className="text-text-secondary text-sm">JPG, GIF or PNG. Max size of 5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold">Security Settings</h2>
                </div>
                <div className="card-body space-y-6">
                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-amber-400/20">
                        <Key className="text-amber-400" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Password</h3>
                        <p className="text-sm text-text-secondary">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="btn btn-secondary">Change</button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Shield className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Two-Factor Authentication</h3>
                        <p className="text-sm text-text-secondary">Add extra security to your account</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="twoFactor"
                        checked={formData.twoFactor}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-secondary/20">
                        <Download className="text-secondary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Backup Codes</h3>
                        <p className="text-sm text-text-secondary">Generate backup codes for 2FA</p>
                      </div>
                    </div>
                    <button className="btn btn-secondary">Generate</button>
                  </div>

                  <div className="card bg-red-500/10 border border-red-500/30">
                    <div className="card-body">
                      <div className="flex items-start">
                        <AlertTriangle className="text-red-500 mt-1 mr-3" size={20} />
                        <div>
                          <h3 className="font-bold text-red-500">Danger Zone</h3>
                          <p className="text-text-secondary mt-1">Permanently delete your account and all associated data</p>
                          <button
                            onClick={handleDeleteAccount}
                            className="btn btn-danger mt-4"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold">Notification Preferences</h2>
                </div>
                <div className="card-body space-y-6">
                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div>
                      <h3 className="font-bold">Email Notifications</h3>
                      <p className="text-sm text-text-secondary">Receive email updates about your projects</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notifications"
                        checked={formData.notifications}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div>
                      <h3 className="font-bold">Newsletter</h3>
                      <p className="text-sm text-text-secondary">Subscribe to our monthly newsletter</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div>
                      <h3 className="font-bold">Security Alerts</h3>
                      <p className="text-sm text-text-secondary">Get notified about security events</p>
                    </div>
                    <div className="badge badge-success">Always On</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold">Appearance</h2>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Theme</label>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold">Billing Information</h2>
                </div>
                <div className="card-body">
                  <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <CreditCard className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Payment Method</h3>
                        <p className="text-sm text-text-secondary">Visa ending in 4242</p>
                      </div>
                    </div>
                    <button className="btn btn-secondary">Update</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="form-group">
                      <label className="form-label">Billing Email</label>
                      <input
                        type="email"
                        name="billingEmail"
                        placeholder="billing@example.com"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tax ID (Optional)</label>
                      <input
                        type="text"
                        name="taxId"
                        placeholder="e.g. EU123456789"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea
                      name="address"
                      placeholder="123 Main St, City, Country"
                      className="form-textarea"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold">Plan & Usage</h2>
                </div>
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Pro Plan</h3>
                      <p className="text-text-secondary">$29/month</p>
                    </div>
                    <button className="btn btn-secondary">Manage Subscription</button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-text-secondary">Projects</span>
                        <span className="text-sm">8/20</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-text-secondary">Team Members</span>
                        <span className="text-sm">3/5</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Dock */}
      <AIDock />
    </div>
  );
};

export default Settings;