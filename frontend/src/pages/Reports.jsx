import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi, getExportUrl } from '../services/api';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Building2,
  CalendarCheck,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStatsApi()
      .then(res => setStats(res.data))
      .catch(err => console.error("Error loading stats", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (type) => {
    window.open(getExportUrl(type), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          Institutional Reports & Data Export (FR-036 to FR-039)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate official engagement summaries, recruitment drive audits, and export raw data to CSV
        </p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Companies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Company Profiles (FR-036)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete list of companies, sectors, active status, contact counts, and visits count.
            </p>
          </div>
          <button
            onClick={() => handleDownload('companies')}
            className="mt-6 w-full py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export Companies CSV
          </button>
        </div>

        {/* Export Visits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Company Visits Report (FR-038)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit report of all recorded campus visits, delegations, purpose, and institutional outcomes.
            </p>
          </div>
          <button
            onClick={() => handleDownload('visits')}
            className="mt-6 w-full py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export Visits CSV
          </button>
        </div>

        {/* Export Activities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recruitment Drives (FR-037)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consolidated summaries of all drives, packages, positions, and current approval statuses.
            </p>
          </div>
          <button
            onClick={() => handleDownload('activities')}
            className="mt-6 w-full py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export Activities CSV
          </button>
        </div>
      </div>

      {/* Engagement Summary Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          System Overview & Metrics (FR-039)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Companies</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_companies ?? 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Visits Conducted</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_visits ?? 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Recruitment Drives</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_activities ?? 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Drives Approved</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.approved_activities ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
