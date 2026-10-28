import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Shield,
  Award,
  UserCheck,
  Users
} from 'lucide-react';

export const Login = () => {
  const { login, signup, switchUser, allUsers } = useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' or 'signup'
  const [mode, setMode] = useState('signin');

  // Sign In state
  const [email, setEmail] = useState('hitesh.coordinator@lnmiit.ac.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoPersonas, setShowDemoPersonas] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user?.role === 'APPROVER') {
        navigate('/approvals');
      } else if (user?.role === 'COORDINATOR') {
        navigate('/companies');
      } else {
        navigate('/');
      }
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.detail) {
        setError(typeof respData.detail === 'string' ? respData.detail : JSON.stringify(respData.detail));
      } else {
        setError("Invalid email or password. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (signupPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    try {
      setLoading(true);
      const newUser = await signup({
        name: name.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: "USER"
      });
      setSuccess("Account created successfully! Welcome to the portal.");
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.detail) {
        setError(typeof respData.detail === 'string' ? respData.detail : JSON.stringify(respData.detail));
      } else {
        setError("Failed to create account. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u) => {
    switchUser(u);
    if (u.role === 'APPROVER') {
      navigate('/approvals');
    } else if (u.role === 'COORDINATOR') {
      navigate('/companies');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f8fafd] dark:bg-[#0a0e1a] transition-colors overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/5 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 mx-auto ring-4 ring-brand-500/10">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Corporate Engagement Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified University & Industry Recruitment Relations Platform
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-white/90 dark:bg-[#111728]/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/90 p-7 sm:p-8 shadow-2xl shadow-indigo-950/5 space-y-6">
          {/* Mode Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Create Account</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? 'Signing In...' : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your.email@organization.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 4 chars"
                      className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/60 text-brand-800 dark:text-brand-300 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>
                  New accounts automatically join with full <strong>User</strong> access to explore companies, recruitment drives, and reports.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <span>Create Account & Enter Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Drawer (Clean and subtle, not in-your-face) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDemoPersonas(!showDemoPersonas)}
              className="w-full flex items-center justify-between py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-500" />
                Quick Demo Personas for Evaluation
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showDemoPersonas ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showDemoPersonas && (
              <div className="mt-3 grid grid-cols-2 gap-2 animate-fadeIn">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin({
                      user_id: 1,
                      name: "Hitesh Jain",
                      role: "COORDINATOR",
                      email: "hitesh.coordinator@lnmiit.ac.in",
                      account_status: "ACTIVE"
                    })
                  }
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-white dark:hover:bg-slate-800 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                    <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                    <span>Hitesh Jain</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Coordinator</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin({
                      user_id: 2,
                      name: "Dr. Anand Patidar",
                      role: "APPROVER",
                      email: "anand.approver@lnmiit.ac.in",
                      account_status: "ACTIVE"
                    })
                  }
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-white dark:hover:bg-slate-800 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>Dr. Anand</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Approver</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin({
                      user_id: 3,
                      name: "Pranav Vashisth",
                      role: "ADMIN",
                      email: "pranav.admin@lnmiit.ac.in",
                      account_status: "ACTIVE"
                    })
                  }
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-white dark:hover:bg-slate-800 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600">
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    <span>Pranav V.</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Administrator</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin({
                      user_id: 5,
                      name: "Prof. Subrat Kar",
                      role: "MANAGEMENT",
                      email: "director.mgmt@lnmiit.ac.in",
                      account_status: "ACTIVE"
                    })
                  }
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-slate-800 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prof. Subrat</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Management</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
