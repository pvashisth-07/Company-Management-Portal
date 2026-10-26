import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Award, Shield } from 'lucide-react';

export const Login = () => {
  const { login, allUsers, switchUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('hitesh.coordinator@lnmiit.ac.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.detail) {
        setError(typeof respData.detail === 'string' ? respData.detail : JSON.stringify(respData.detail));
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u) => {
    switchUser(u);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Company Engagement Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The LNM Institute of Information Technology, Jaipur (CS314 Team T066)
          </p>
        </div>

        {/* Login Card (S1 Wireframe) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@lnmiit.ac.in"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : <><span>Sign In to Portal</span> <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick 1-Click Demo Login
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin({ user_id: 1, name: "Hitesh Jain", role: "COORDINATOR", email: "hitesh.coordinator@lnmiit.ac.in", account_status: "ACTIVE" })}
                className="w-full p-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <span className="font-bold block">Hitesh Jain</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">T&P Coordinator (UC-006, UC-008)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800">Select →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin({ user_id: 2, name: "Dr. Anand Patidar", role: "APPROVER", email: "anand.approver@lnmiit.ac.in", account_status: "ACTIVE" })}
                className="w-full p-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-900 dark:text-purple-200 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <div className="text-left">
                    <span className="font-bold block">Dr. Anand Patidar</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Approving Authority (UC-009)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-800">Select →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin({ user_id: 3, name: "Pranav Vashisth", role: "ADMIN", email: "pranav.admin@lnmiit.ac.in", account_status: "ACTIVE" })}
                className="w-full p-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-600" />
                  <div className="text-left">
                    <span className="font-bold block">Pranav Vashisth</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400">System Administrator (FR-004)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-800">Select →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
