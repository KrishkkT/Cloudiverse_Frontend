import React, { useState, useEffect } from 'react';
import { User, CreditCard, BarChart2, Shield, Settings as SettingsIcon, LogOut, ArrowLeft, LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Sections
import AccountSection from './settings/AccountSection';
import BillingSection from './settings/BillingSection';
import UsageSection from './settings/UsageSection';
import SecuritySection from './settings/SecuritySection';
import PreferencesSection from './settings/PreferencesSection';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab from URL hash/state or default to 'account'
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'usage', label: 'Usage & Limits', icon: BarChart2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account': return <AccountSection user={user} />;
      case 'billing': return <BillingSection />;
      case 'usage': return <UsageSection />;
      case 'security': return <SecuritySection />;
      case 'preferences': return <PreferencesSection />;
      default: return <AccountSection user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col md:flex-row">

      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-white/10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/workspaces')} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg">Settings</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <div className="hidden md:flex flex-col w-72 border-r border-white/5 bg-surface/30 h-screen sticky top-0 p-6">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/workspaces')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center">
            <a href={'/'}><img
              src="/cloudiverse.png"
              alt="Cloudiverse Architect"
              className="h-12 w-auto"
            /></a>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="text-xs font-semibold text-text-subtle uppercase tracking-wider px-4 mb-4">Settings</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${isActive
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-subtle group-hover:text-text-primary'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pt-6 border-t border-white/5 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          <div className="px-4 py-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-text-primary">{user?.name || 'User'}</p>
                <p className="text-xs text-text-subtle truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen bg-background relative">
        {/* Top Bar (Desktop) */}
        <div className="hidden md:flex justify-between items-center px-10 py-6 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <p className="text-sm text-text-secondary">Manage your {activeTab} preferences</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/workspaces')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text-primary rounded-lg text-sm font-medium border border-white/10 transition-all flex items-center gap-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto pb-20">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
