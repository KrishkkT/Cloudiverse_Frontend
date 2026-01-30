import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, User, Cloud, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-navbar glass-effect">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden btn-icon btn-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <a href={'/'}><img
                src="/cloudiverse.png"
                alt="Cloudiverse Architect"
                className="h-12 w-auto"
              /></a>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-surface/50 px-3 py-1.5 rounded-lg">
                <User size={16} className="text-primary" />
                <span className="text-sm font-medium truncate max-w-xs">{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-secondary btn-sm"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn btn-primary btn-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Mobile Menu */}
      {
        mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border p-4 animate-fade-in shadow-xl z-50">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 px-2 py-2 bg-background/50 rounded">
                    <User size={16} className="text-primary" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <button onClick={() => { navigate('/workspaces'); setMobileMenuOpen(false); }} className="text-left px-2 py-2 hover:bg-background/50 rounded transition-colors">
                    Dashboard
                  </button>
                  <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} className="text-left px-2 py-2 hover:bg-background/50 rounded transition-colors flex items-center gap-2">
                    <Settings size={16} /> Settings
                  </button>
                  <button onClick={handleLogout} className="text-left px-2 py-2 text-red-400 hover:bg-red-400/10 rounded transition-colors flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                  <hr className="border-white/10 my-2" />
                  <button onClick={() => { navigate('/workspaces/new'); setMobileMenuOpen(false); }} className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <Cloud size={16} /> New Project
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="btn btn-secondary w-full">Login</button>
                  <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="btn btn-primary w-full">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        )
      }
    </nav >
  );
};

export default Navbar;