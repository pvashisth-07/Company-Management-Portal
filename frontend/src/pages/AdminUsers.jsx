import React, { useState, useEffect } from 'react';
import { getAdminUsersApi, updateUserRoleOrStatusApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Users, Shield, UserCheck, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminUsers = () => {
  const { user, refreshUsers } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsersApi(user?.user_id);
      setUsersList(res.data);
    } catch (err) {
      console.error("Error fetching admin users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
    fetchUsers();
    refreshUsers?.();
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      await updateUserRoleOrStatusApi(targetUserId, { role: newRole }, user?.user_id);
      showToast(`User role updated to ${newRole}.`);
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleStatusToggle = async (targetUserId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUserRoleOrStatusApi(targetUserId, { account_status: newStatus }, user?.user_id);
      showToast(`User account status updated to ${newStatus}.`);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-16 bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 p-8 animate-fadeIn">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Access Restricted</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          This administration section requires System Administrator permissions.
          Please switch to an Administrator persona using the persona switcher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Shield className="w-5 h-5" />
          </div>
          User Administration & Role Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage institutional staff access, assign roles, and toggle account activation status
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {usersList.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {u.name}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="USER">USER</option>
                      <option value="COORDINATOR">COORDINATOR</option>
                      <option value="APPROVER">APPROVER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGEMENT">MANAGEMENT</option>
                      <option value="COMPANY_REP">COMPANY_REP</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={u.account_status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.user_id, u.account_status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        u.account_status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      {u.account_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
