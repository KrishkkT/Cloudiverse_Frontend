import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authClient } from '../auth';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from router state or query param
    const email = location.state?.email || new URLSearchParams(location.search).get('email');

    useEffect(() => {
        if (!email) {
            toast.error("No email found for verification.");
            navigate('/register');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Fix: Use verifyEmail instead of verify
            // This maps to /email-otp/verify-email which is the correct endpoint for BetterAuth/Neon
            const res = await authClient.emailOtp.verifyEmail({
                email,
                otp
            });

            const { data, error } = res || {};

            if (!error) {
                toast.success('Email verified successfully!');
                // Force full reload to ensure AuthContext picks up the new session immediately
                window.location.href = '/workspaces';
            } else {
                console.error("Verification Error:", error);
                toast.error(error.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            console.error("Catch Error:", err);
            // detailed error for debugging
            if (err.message && err.message.includes('404')) {
                toast.error('Vertex endpoint not found (404). Please contact support.');
            } else {
                toast.error('Verification failed. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-border-dark flex flex-col relative z-10 p-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 shadow-sm">
                        <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Verify Your Email</h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-3">
                        We sent a 6-digit code to <span className="font-bold text-gray-800 dark:text-gray-200">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="flex flex-col gap-8 max-w-md mx-auto w-full">
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Enter Code</label>
                        <input
                            className="w-full h-16 text-center text-4xl tracking-[0.6em] font-mono rounded-xl bg-gray-50 dark:bg-input-dark border-2 border-gray-100 dark:border-white/5 text-gray-900 dark:text-white focus:ring-0 focus:border-primary outline-none transition-all placeholder:tracking-normal shadow-inner"
                            placeholder="••••••"
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 text-lg"
                    >
                        <span>{loading ? 'Verifying...' : 'Verify Email'}</span>
                        {!loading && <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
