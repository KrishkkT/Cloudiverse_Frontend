import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  BarChart3,
  Cloud,
  Code,
  DollarSign
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Workspaces',
      icon: LayoutDashboard,
      path: '/workspaces'
    },
    {
      name: 'Projects',
      icon: FileText,
      path: '/projects'
    },
    {
      name: 'Cloud Comparison',
      icon: Cloud,
      path: '/comparison'
    },
    {
      name: 'Terraform',
      icon: Code,
      path: '/terraform'
    },
    {
      name: 'Cost Estimation',
      icon: DollarSign,
      path: '/cost'
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/settings'
    }
  ];

  return (
    <aside className="app-sidebar glass-effect">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="font-bold text-background">CP</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gradient">Cloudiverse</h2>
            <p className="text-xs text-text-subtle">AI Infrastructure</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="bg-surface/50 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-2">Need Help?</h3>
          <p className="text-xs text-text-subtle mb-3">
            Our AI assistant can help you plan your infrastructure
          </p>
          <button className="btn btn-secondary btn-sm w-full">
            Ask AI Assistant
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;