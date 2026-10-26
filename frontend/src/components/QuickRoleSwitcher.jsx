import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, Award, Users } from 'lucide-react';

export const QuickRoleSwitcher = () => {
  const { user, switchUser, allUsers } = useAuth();

  if (!allUsers || allUsers.length === 0) return null;

  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
      <span className="text-xs font-semibold px-2 text-slate-500 dark:text-slate-400 hidden sm:inline flex items-center gap-1">
        <Users className="w-3.5 h-3.5" /> Demo Persona:
      </span>
      <div className="flex gap-1">
        {allUsers.map((u) => {
          const isSelected = user?.user_id === u.user_id;
          return (
            <button
              key={u.user_id}
              onClick={() => switchUser(u)}
              title={`${u.name} (${u.role}) - ${u.email}`}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {u.role === 'ADMIN' && <Shield className="w-3 h-3 text-amber-300" />}
              {u.role === 'APPROVER' && <Award className="w-3 h-3 text-purple-300" />}
              {u.role === 'COORDINATOR' && <UserCheck className="w-3 h-3 text-blue-200" />}
              <span>{u.name.split(' ')[0]}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded uppercase ${
                isSelected ? 'bg-brand-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {u.role.slice(0, 5)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
