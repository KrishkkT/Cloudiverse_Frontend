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
                <div className="flex items-center">
                    <img
                        src="/cloudiverse.png"
                        alt="Cloudiverse Architect"
                        className="h-12 w-auto"
                    />
                </div>
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
