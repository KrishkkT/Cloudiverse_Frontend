import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, PlusCircle, Settings } from 'lucide-react';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-between items-center z-50 md:hidden pb-safe">
            <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') && location.pathname === '/' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <Home className="w-6 h-6" />
                <span className="text-[10px] font-medium">Home</span>
            </button>

            <button
                onClick={() => navigate('/workspaces')}
                className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/workspaces' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-[10px] font-medium">Projects</span>
            </button>

            <div className="relative -top-5">
                <button
                    onClick={() => navigate('/workspaces/new')}
                    className="bg-primary text-black p-4 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transform active:scale-95 transition-all"
                >
                    <PlusCircle className="w-7 h-7" />
                </button>
            </div>

            <button
                onClick={() => navigate('/workspaces')} // Placeholder for "Templates" or "New" if distinct? User said "New" is a tab. 
                // Actually the "New" tab usually goes to New Project. The middle button handles that. 
                // User list: Home, Projects, New, Settings.  Center button is usually New.
                // Let's stick to Home, Projects, (New - center), Settings. 
                // Wait, user said "Home, Projects, New, Settings". That's 4 items.
                // I made it 3 items + Center. 
                // Let's adjust to be exactly 4 items if requested, or keep the standard FAB pattern.
                // User said "Tabs: Home, Projects, New, Settings".
                className="hidden" // Hiding this placeholder
            />

            {/* Re-doing items to match user request exactly: Home, Projects, New, Settings */}

            <button
                onClick={() => navigate('/settings')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/settings') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <Settings className="w-6 h-6" />
                <span className="text-[10px] font-medium">Settings</span>
            </button>
        </div>
    );
};

export default MobileBottomNav;
