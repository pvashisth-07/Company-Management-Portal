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
  Send,
  ArrowRight,
  TrendingUp,
  History,
  Activity
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

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Building2 className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur mb-2">
            Placement Session 2026-27 | T&P Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Company Engagement Portal
          </h1>
          <p className="text-brand-100 text-sm mt-1">
            Welcome back, <span className="font-semibold text-white">{user?.name}</span> ({user?.role}). 
            Track company relationships, recruitment drives, campus visits, and approval workflows.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => setIsVisitModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white text-brand-700 font-semibold text-xs shadow hover:bg-brand-50 flex items-center gap-1.5 transition-all"
            >
              <CalendarCheck className="w-4 h-4 text-brand-600" />
              Record Visit (UC-006)
            </button>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur flex items-center gap-1.5 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Draft Drive (UC-008)
            </button>
            <button
              onClick={() => setIsCompanyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Company (FR-006)
            </button>
            {(user?.role === 'APPROVER' || user?.role === 'ADMIN') && (
              <button
                onClick={() => navigate('/approvals')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Review Queue ({stats?.pending_approvals || 0})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Partner Companies"
          value={stats?.total_companies ?? '...'}
          subtitle={`${stats?.active_companies || 0} currently active`}
          icon={Building2}
          color="blue"
          trend="+15%"
        />
        <StatCard
          title="Campus Visits Recorded"
          value={stats?.total_visits ?? '...'}
          subtitle="Documented meetings & MoUs"
          icon={CalendarCheck}
          color="purple"
          trend="+22%"
        />
        <StatCard
          title="Recruitment Drives"
          value={stats?.total_activities ?? '...'}
          subtitle={`${stats?.approved_activities || 0} approved & scheduled`}
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pending_approvals ?? '...'}
          subtitle="Awaiting Approver review"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Industry & Sector Diversity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution of partnered recruiting organizations
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
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
                  paddingAngle={4}
                  dataKey="value"
                >
                  {industryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '12px'
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
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Recruitment Drive Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status progression across the recruitment lifecycle
              </p>
            </div>
            <button
              onClick={() => navigate('/activities')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              View Drives <ArrowRight className="w-3.5 h-3.5" />
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
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Engagement History Feed (FR-030 to FR-032) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Recent Institutional Engagement Activity (FR-030)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited timeline of visits, drives, contact updates, and approvals
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
          >
            Export All Records <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stats?.recent_engagements?.length > 0 ? (
            stats.recent_engagements.map((item) => (
              <div key={item.record_id} className="py-3 flex items-start justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.type} className="text-[10px] py-0 px-1.5" />
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
                  className="px-2 py-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-colors flex-shrink-0"
                >
                  View Company →
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No recent engagements found.</p>
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
