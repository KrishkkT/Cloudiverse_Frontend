import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthHeader from '../components/AuthHeader';
import GoogleLoginButton from '../components/GoogleLoginButton';

const PremiumLogin = () => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success('Welcome back!');
        navigate('/workspaces');
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('[LOGIN ERROR]', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      // tokenResponse from useGoogleLogin contains access_token
      await loginWithGoogle(tokenResponse.access_token);
      toast.success('Welcome back!');
      navigate('/workspaces');
    } catch (err) {
      console.error("Google Login Error", err);
      toast.error("Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background-dark pt-20">
      {/* 1. Full Screen Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{
            scale: [1.1, 1.2, 1.1],
            rotate: [0, 1, -1, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
        </motion.div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/70 to-primary/20 z-10" />

        {/* Floating animated particles */}
        <motion.div
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] pointer-events-none z-10"
        />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <AuthHeader />
      </div>

      {/* 2. Centered Glass/Premium Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 w-full max-w-5xl bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row mx-4 max-h-[80vh] lg:max-h-[750px]"
      >
        {/* Left Side - Brand & Testimonial (Professional/Enterprise feel) */}
        <div className="hidden lg:flex lg:w-5/12 ml-0 bg-surface relative overflow-hidden flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-0" />

          <div className="relative z-10 mt-12">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Multi-cloud architecture <br />
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              "Design, deploy, and manage multi-cloud infrastructure from a single workspace."
            </p>
          </div>

          <div className="relative z-10">
            {/* Decorative abstract lines/shapes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-24 -left-24 w-64 h-64 border border-white/10 rounded-full z-0 dashed"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-7/12 px-6 pt-2 pb-6 sm:px-8 sm:pt-4 sm:pb-8 lg:px-12 lg:pt-6 lg:pb-12 flex flex-col bg-transparent relative overflow-y-auto h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <div className="w-full max-w-sm mx-auto space-y-6 sm:space-y-8">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              >
                Welcome back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-sm sm:text-base text-gray-400"
              >
                Sign in to your account to continue.
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder:text-gray-600 transition-all outline-none"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-400 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder:text-gray-600 transition-all outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="border-2 border-white/20 border-t-white rounded-full w-5 h-5 animate-spin mr-2" />
                ) : null}
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative my-6"
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-4 text-gray-500 font-medium">Or continue with</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center w-full"
            >
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                loading={loading}
                text="Sign in with Google"
              />
            </motion.div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-400 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumLogin;