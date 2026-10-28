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
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchQueueCount = async () => {
    try {
      const res = await getApprovalQueueApi();
      setPendingCount(res.data.length);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchQueueCount();
    const interval = setInterval(fetchQueueCount, 20000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Recruitment Drives', path: '/activities', icon: Briefcase },
  ];

  // Show Approval Queue for Approvers, Admins, or as audit overview
  if (user?.role === 'APPROVER' || user?.role === 'ADMIN') {
    navItems.push({
      name: 'Approval Queue',
      path: '/approvals',
      icon: CheckCircle2,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500 text-white'
    });
  } else {
    navItems.push({
      name: 'Approvals Review',
      path: '/approvals',
      icon: CheckCircle2,
    });
  }

  navItems.push(
    { name: 'Company Visits', path: '/visits', icon: CalendarCheck },
    { name: 'Reports & Export', path: '/reports', icon: BarChart3 }
  );

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'User Management', path: '/admin', icon: Users });
  }

  return (
    <aside className="w-64 bg-white/70 dark:bg-[#0a0e1a]/70 backdrop-blur-xl border-r border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2.5">
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
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
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

        {/* Quick Highlights Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50/70 via-indigo-50/50 to-violet-50/30 dark:from-brand-950/40 dark:via-indigo-950/20 dark:to-violet-950/20 border border-brand-200/60 dark:border-brand-800/50">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Placement Session</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Track active partner companies, interview schedules, and drive approvals in real time.
          </p>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 px-2">
        <div className="flex items-center justify-between">
          <span>Portal Network</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Role Assigned</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {user?.role || 'Guest'}
          </span>
        </div>
      </div>
    </aside>
  );
};
