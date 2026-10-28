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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          Reports & Data Export
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate official engagement summaries, recruitment drive audits, and export raw records to CSV
        </p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export Companies */}
        <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Company Profiles Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete catalog of partner companies, industry sectors, active account status, contact counts, and recorded visits.
            </p>
          </div>
          <button
            onClick={() => handleDownload('companies')}
            className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Companies CSV
          </button>
        </div>

        {/* Export Visits */}
        <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Campus Visits Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Consolidated audit report of all recorded corporate visits, visiting delegations, meeting purpose, and institutional outcomes.
            </p>
          </div>
          <button
            onClick={() => handleDownload('visits')}
            className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Visits CSV
          </button>
        </div>

        {/* Export Activities */}
        <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recruitment Drives Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detailed registry of recruitment drives, compensation packages, offered positions, and administrative approval decisions.
            </p>
          </div>
          <button
            onClick={() => handleDownload('activities')}
            className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Activities CSV
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          System Overview & Metrics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Total Companies</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats?.total_companies ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Visits Conducted</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats?.total_visits ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Recruitment Drives</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats?.total_activities ?? 0}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Drives Approved</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{stats?.approved_activities ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
