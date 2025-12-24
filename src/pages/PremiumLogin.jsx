import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import AuthHeader from '../components/AuthHeader';

const PremiumLogin = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // Success is implied by redirect
      navigate('/workspaces');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen relative overflow-hidden">
      <AuthHeader />

      {/* Background Gradients (Fixed) */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/20 via-blue-500/10 to-purple-500/20 rounded-full blur-[120px] pointer-events-none opacity-60 dark:opacity-30 z-0"></div>

      {/* Main Content Container with Top Padding */}
      <div className="relative z-10 pt-[72px] min-h-screen flex flex-col items-center justify-center pb-12">

        <div className="w-full max-w-[460px] bg-white/80 dark:bg-card-dark/80 backdrop-blur-2xl rounded-[20px] shadow-2xl border border-white/60 dark:border-white/5 overflow-hidden p-10 box-border mt-8">

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary mb-5 shadow-inner border border-white/20">
              <span className="material-symbols-outlined text-[28px]">waving_hand</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-2 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white dark:bg-black/20 border-2 border-transparent focus:border-primary/20 dark:focus:border-primary/20 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary bg-gray-100 dark:bg-white/10" />
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-bold text-primary hover:text-blue-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Don't have an account?
              <Link to="/register" className="font-bold text-primary hover:text-blue-600 ml-1 transition-colors">Create account</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PremiumLogin;