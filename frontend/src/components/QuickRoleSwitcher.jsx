import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, Award, Users, ChevronDown, Check, User } from 'lucide-react';

export const QuickRoleSwitcher = () => {
  const { user, switchUser, allUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!allUsers || allUsers.length === 0) return null;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-rose-500" />;
      case 'APPROVER':
        return <Award className="w-3.5 h-3.5 text-purple-500" />;
      case 'COORDINATOR':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-500" />;
      case 'MANAGEMENT':
        return <Users className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2 transition-all shadow-sm"
        title="Switch persona for evaluation & testing"
      >
        <span className="flex items-center gap-1.5">
          {getRoleIcon(user?.role)}
          <span className="hidden md:inline font-medium text-slate-500 dark:text-slate-400">Switch:</span>
          <span className="font-bold text-slate-900 dark:text-white max-w-[90px] truncate">
            {user?.name?.split(' ')[0] || 'User'}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111728] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 animate-fadeIn">
          <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
            Switch Test Persona
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {allUsers.map((u) => {
              const isSelected = user?.user_id === u.user_id;
              return (
                <button
                  key={u.user_id}
                  onClick={() => {
                    switchUser(u);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getRoleIcon(u.role)}
                    <div className="truncate">
                      <div className="truncate font-semibold">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.role}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600 flex-shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
