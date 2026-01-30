import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import AuthHeader from '../components/AuthHeader';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced validation
    if (!name || name.trim().length < 2) {
      toast.error('Please enter your full name (at least 2 characters)', { duration: 4000 });
      return;
    }

    if (!email || !email.trim()) {
      toast.error('Please enter a valid email address', { duration: 4000 });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email format', { duration: 4000 });
      return;
    }

    setLoading(true);

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters', { duration: 4000 });
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);
      toast.success('Account created successfully! Welcome to Cloudiverse.', { duration: 3000 });
      setTimeout(() => navigate('/workspaces'), 1000);
    } catch (error) {
      console.error('[REGISTER ERROR]', error);

      // Enhanced error messages
      let msg = 'Registration failed. Please try again.';

      if (error.response?.status === 400) {
        msg = error.response?.data?.message || 'Invalid registration data. Please check your input.';
      } else if (error.response?.status === 409) {
        msg = 'Email already registered. Please login or use a different email.';
      } else if (error.response?.status === 500) {
        msg = 'Server error during registration. Please try again later.';
      } else if (!error.response) {
        msg = 'Cannot connect to server. Check your internet connection.';
      } else {
        msg = error.response?.data?.message || error.response?.data?.msg || msg;
      }

      toast.error(msg, { duration: 5000 });
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
              <span className="material-symbols-outlined text-[28px]">person_add</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-2 font-medium">Join Cloudiverse to start building</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-black/20 border-2 border-transparent focus:border-primary/20 dark:focus:border-primary/20 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                placeholder="Krish Thakker"
                required
              />
            </div>

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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-black/20 border-2 border-transparent focus:border-primary/20 dark:focus:border-primary/20 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                placeholder="Min 6 characters"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <div className="relative flex items-center justify-center w-full">
              <div className="absolute w-full border-t border-gray-200 dark:border-white/10"></div>
              <span className="relative bg-white/80 dark:bg-card-dark/80 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
            </div>

            <button
              type="button"
              className="w-full h-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              onClick={() => toast.info('Google Login coming soon!')}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Sign up with Google</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Already have an account?
              <Link to="/login" className="font-bold text-primary hover:text-blue-600 ml-1 transition-colors">Log in</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;