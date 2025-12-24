import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthHeader = () => {
    const location = useLocation();

    // Check if link is active
    const isActive = (path) => {
        return location.pathname === path ? 'text-primary font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-primary transition-colors';
    };

    return (
        <header className="fixed top-0 left-0 w-full h-[72px] px-6 z-50 flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-white/10 dark:border-white/5 transition-all">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
                    <span className="material-symbols-outlined text-[24px]">cloud_circle</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    Cloudiverse
                </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 bg-white/40 dark:bg-black/20 px-6 py-2 rounded-full border border-white/20 dark:border-white/5 shadow-sm">
                <Link to="/" className={`text-sm ${isActive('/')}`}>Home</Link>
                <Link to="/about" className={`text-sm ${isActive('/about')}`}>About Us</Link>
                <Link to="/contact" className={`text-sm ${isActive('/contact')}`}>Contact Us</Link>
            </nav>

            {/* Empty div for balance */}
            <div className="hidden md:block w-24"></div>
        </header>
    );
};

export default AuthHeader;
