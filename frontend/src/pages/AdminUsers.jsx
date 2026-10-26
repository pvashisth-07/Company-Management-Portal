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
      showToast(`User role updated to ${newRole} (FR-004).`);
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
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Access Restricted (FR-005)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This administration section requires System Administrator permissions.
          Please switch to <strong>Pranav Vashisth (Admin)</strong> using the top demo persona switcher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-600" />
          User Administration & Role Management (FR-004 & FR-005)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage institutional staff access, assign roles (Coordinator, Approver, Admin), and toggle account activation
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Current Role (FR-004)</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {usersList.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {u.name}
                    </div>
                    <div className="text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="COORDINATOR">COORDINATOR</option>
                      <option value="APPROVER">APPROVER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={u.account_status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.user_id, u.account_status)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
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
