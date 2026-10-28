import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { RecordVisitModal } from '../components/RecordVisitModal';
import { CreateCompanyModal } from '../components/CreateCompanyModal';
import { ActivityModal } from '../components/ActivityModal';
import {
  Building2,
  CalendarCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  History,
  BarChart3,
  Sparkles,
  Compass,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStatsApi();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
    fetchStats();
  };

  const isPrivileged = user?.role === 'COORDINATOR' || user?.role === 'ADMIN' || user?.role === 'APPROVER';

  const industryChartData = stats?.industry_breakdown
    ? Object.entries(stats.industry_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const activityStatusData = stats?.activity_status_breakdown
    ? Object.entries(stats.activity_status_breakdown).map(([name, count]) => ({
        status: name.replace(/_/g, ' '),
        count
      }))
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner with Modern Gradient */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-violet-800 dark:from-slate-900 dark:via-indigo-950 dark:to-violet-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/10 relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Building2 className="w-72 h-72 text-white" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-200" />
            <span>Campus Placement & Corporate Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Portal Member'}
          </h1>
          <p className="text-brand-100 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            Role: <span className="font-semibold text-white uppercase tracking-wider">{user?.role || 'USER'}</span>. 
            Monitor corporate partners, active recruitment drives, institutional visits, and workflow schedules.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5 pt-3">
            {isPrivileged ? (
              <>
                <button
                  onClick={() => setIsVisitModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-brand-50 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <CalendarCheck className="w-4 h-4 text-brand-600" />
                  Record Visit
                </button>
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Briefcase className="w-4 h-4" />
                  Draft Drive
                </button>
                <button
                  onClick={() => setIsCompanyModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  New Company
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/companies')}
                  className="px-3.5 py-2 rounded-xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-brand-50 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Building2 className="w-4 h-4 text-brand-600" />
                  Explore Companies
                </button>
                <button
                  onClick={() => navigate('/activities')}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Briefcase className="w-4 h-4" />
                  Browse Recruitment Drives
                </button>
                <button
                  onClick={() => navigate('/visits')}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <CalendarCheck className="w-4 h-4" />
                  View Campus Visits
                </button>
              </>
            )}

            {(user?.role === 'APPROVER' || user?.role === 'ADMIN') && (
              <button
                onClick={() => navigate('/approvals')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                Review Queue ({stats?.pending_approvals || 0})
              </button>
            )}

            {user?.role === 'MANAGEMENT' && (
              <button
                onClick={() => navigate('/reports')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <BarChart3 className="w-4 h-4" />
                Management Reports
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Partner Companies"
          value={stats?.total_companies ?? '...'}
          subtitle={`${stats?.active_companies || 0} active corporate partners`}
          icon={Building2}
          color="indigo"
          trend="+15%"
        />
        <StatCard
          title="Documented Visits"
          value={stats?.total_visits ?? '...'}
          subtitle="Campus meetings & institutional MoUs"
          icon={CalendarCheck}
          color="purple"
          trend="+22%"
        />
        <StatCard
          title="Recruitment Drives"
          value={stats?.total_activities ?? '...'}
          subtitle={`${stats?.approved_activities || 0} scheduled & completed`}
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pending_approvals ?? '...'}
          subtitle="Awaiting administrative sign-off"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Distribution Chart */}
        <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Industry & Sector Diversity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakdown of partnered organizations
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
              {industryChartData.length} Sectors
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {industryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Status Pipeline Chart */}
        <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Recruitment Drive Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lifecycle status of on-campus and virtual hiring drives
              </p>
            </div>
            <button
              onClick={() => navigate('/activities')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 transition-colors"
            >
              View All Drives <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Engagement History Feed */}
      <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Recent Engagement History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audited timeline of campus visits, drives, and institutional updates
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 transition-colors"
          >
            Export Logs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {stats?.recent_engagements?.length > 0 ? (
            stats.recent_engagements.map((item) => (
              <div key={item.record_id} className="py-3.5 flex items-start justify-between text-xs hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-colors">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.type} className="text-[10px] py-0 px-2" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.description}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Logged by: {item.recorder_name || 'System'}</span>
                    <span>•</span>
                    <span>{new Date(item.record_date).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/companies/${item.company_id}`)}
                  className="px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 rounded-xl transition-colors flex-shrink-0"
                >
                  View Company →
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center font-medium">No recent engagement records found.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <RecordVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSuccess={showToast}
      />
      <CreateCompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={showToast}
      />
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSuccess={showToast}
      />
    </div>
  );
};
