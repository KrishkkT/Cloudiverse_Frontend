import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onSuccess, onError, loading, text = 'Continue with Google' }) => {
    const login = useGoogleLogin({
        onSuccess,
        onError,
    });

    return (
        <button
            type="button"
            onClick={() => login()}
            disabled={loading}
            className="relative w-full h-[50px] group overflow-hidden rounded-full border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300"
        >
            {/* Animated White Background Fill */}
            <div className="absolute left-0 top-0 h-full w-[50px] bg-white transition-all duration-500 ease-out group-hover:w-full z-0" />

            {/* Content Container */}
            <div className="relative z-10 flex items-center justify-center w-full h-full px-4">
                {/* Google Logo */}
                <div className="absolute left-[1px] top-[1px] bottom-[1px] w-[48px] flex items-center justify-center bg-white rounded-l-full group-hover:bg-transparent transition-colors duration-300">
                    {/* Google 'G' Logo SVG */}
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </g>
                    </svg>
                </div>

                {/* Text */}
                <span className="ml-8 font-medium text-gray-300 transition-colors duration-300 group-hover:text-gray-900">
                    {loading ? 'Please wait...' : text}
                </span>
            </div>
        </button>
    );
};

export default GoogleLoginButton;
