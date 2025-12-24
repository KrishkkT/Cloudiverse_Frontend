import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AuthHeader from '../components/AuthHeader';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, { email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (newPassword.length < 6) {
                toast.error("Password must be at least 6 characters.");
                setLoading(false);
                return;
            }

            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
                email,
                otp,
                newPassword
            });
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen relative overflow-hidden">
            <AuthHeader />

            {/* Background Gradients */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/20 via-blue-500/10 to-purple-500/20 rounded-full blur-[120px] pointer-events-none opacity-60 dark:opacity-30 z-0"></div>

            {/* Main Content Container with Top Padding */}
            <div className="relative z-10 pt-[72px] min-h-screen flex flex-col items-center justify-center pb-12">

                <div className="w-full max-w-[460px] bg-white/80 dark:bg-card-dark/80 backdrop-blur-2xl rounded-[20px] shadow-2xl border border-white/60 dark:border-white/5 overflow-hidden p-10 box-border mt-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary mb-5 shadow-inner border border-white/20">
                            <span className="material-symbols-outlined text-[28px]">lock_reset</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Reset Password</h2>
                        <p className="text-base text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email'}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-black/20 border-2 border-transparent focus:border-primary/20 dark:focus:border-primary/20 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    placeholder="het@gmail.com"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 mt-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                                {!loading && <span className="material-symbols-outlined text-[20px] font-bold">send</span>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">OTP Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-black/20 border-2 border-transparent focus:border-primary/20 dark:focus:border-primary/20 bg-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium tracking-[0.5em] text-center text-lg uppercase"
                                    placeholder="123456"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-black/20 border-2 border-transparent focus:border-primary/20 dark:focus:border-primary/20 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    placeholder="New password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 mt-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                                {!loading && <span className="material-symbols-outlined text-[20px] font-bold">check_circle</span>}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                        <Link to="/login" className="font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
