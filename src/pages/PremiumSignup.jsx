import React, { useState } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AuthHeader from '../components/AuthHeader';
// import Logo from '../components/Logo'; // Logo is in AuthHeader now

const PremiumSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(name, email, password, company);

      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/workspaces');
      } else {
        toast.error(result.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error("Signup failed", error);
      toast.error('An unexpected error occurred during signup.');
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
            rotate: [0, -1, 1, 0],
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
            y: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] pointer-events-none z-10"
        />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <AuthHeader />
      </div>

      {/* 2. Centered Glass/Premium Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 w-full max-w-5xl bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row mx-4 max-h-[80vh] lg:max-h-[750px]"
      >

        {/* Left Side - Visuals (Inside Card) */}
        <div className="hidden lg:flex w-5/12 relative flex-col justify-between p-10 overflow-hidden bg-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-0" />

          <div className="relative z-10 mt-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Join the future of engineering.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Create an account and start building your cloud infrastructure in minutes.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="p-2 bg-primary/20 rounded-full text-primary">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-sm font-medium text-gray-200">Multi-provider cost comparison</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="p-2 bg-primary/20 rounded-full text-primary">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-sm font-medium text-gray-200">Integrated Cost Estimation</span>
            </div>
          </div>

          {/* Decorative abstract shape */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-80 h-80 border border-white/5 rounded-full z-0 dashed"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 px-6 pt-2 pb-6 sm:px-8 sm:pt-4 sm:pb-8 lg:px-12 lg:pt-6 lg:pb-12 flex flex-col bg-transparent relative overflow-y-auto h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <div className="w-full max-w-sm mx-auto space-y-4 sm:space-y-6">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              >
                Create account
              </motion.h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-1"
              >
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder:text-gray-600 transition-all outline-none"
                    placeholder="Mukesh Ambani"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="space-y-1"
              >
                <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder:text-gray-600 transition-all outline-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-1"
              >
                <label className="text-sm font-medium text-gray-300 ml-1">Company (Optional)</label>
                <div className="relative group">
                  <Building className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder:text-gray-600 transition-all outline-none"
                    placeholder="Your Company Inc."
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder:text-gray-600 transition-all outline-none"
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
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300 ml-1">Confirm</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder:text-gray-600 transition-all outline-none"
                      placeholder="••••••••"
                      required
                    />
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
                className="w-full flex items-center justify-center py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="border-2 border-white/20 border-t-white rounded-full w-5 h-5 animate-spin mr-2" />
                ) : null}
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative my-4"
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
                onSuccess={async (tokenResponse) => {
                  setLoading(true);
                  try {
                    await loginWithGoogle(tokenResponse.access_token);
                    toast.success('Account created! Redirecting...', { duration: 2000 });
                    setTimeout(() => navigate('/workspaces'), 500);
                  } catch (err) {
                    console.error("Google Signup Error", err);
                    toast.error("Google Signup failed");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  toast.error('Google Signup Failed');
                }}
                loading={loading}
                text="Sign up with Google"
              />
            </motion.div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-400 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumSignup;