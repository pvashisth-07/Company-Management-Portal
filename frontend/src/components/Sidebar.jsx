import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApprovalQueueApi } from '../services/api';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Briefcase,
  CheckCircle2,
  BarChart3,
  Users,
  ShieldAlert,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchQueueCount = async () => {
    try {
      const res = await getApprovalQueueApi();
      setPendingCount(res.data.length);
    } catch (e) {
      // ignore in background
    }
  };

  useEffect(() => {
    fetchQueueCount();
    const interval = setInterval(fetchQueueCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Recruitment Drives', path: '/activities', icon: Briefcase },
    { 
      name: 'Approval Queue', 
      path: '/approvals', 
      icon: CheckCircle2,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { name: 'Company Visits', path: '/visits', icon: CalendarCheck },
    { name: 'Reports & Export', path: '/reports', icon: BarChart3 },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'User Management', path: '/admin', icon: Users });
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold shadow-sm border border-brand-200 dark:border-brand-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor} animate-pulse`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Workflow Quick Links */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Key Workflows
          </div>
          <div className="space-y-1 text-xs">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-brand-600 dark:text-brand-400">UC-006:</span> Record Company Visit
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-brand-600 dark:text-brand-400">UC-008:</span> Submit Activity
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-brand-600 dark:text-brand-400">UC-009:</span> Approve Drive
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Backend Status:</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Online
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>SRS Baseline:</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">v1.0 (SQLite)</span>
        </div>
      </div>
    </aside>
  );
};
