import React, { useState, useEffect } from 'react';
import { getApprovalQueueApi, getApprovalHistoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ApprovalDecisionModal } from '../components/ApprovalDecisionModal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Award,
  History,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const ApprovalsQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Modal
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueRes, historyRes] = await Promise.all([
        getApprovalQueueApi(),
        getApprovalHistoryApi()
      ]);
      setQueue(queueRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Error fetching approvals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
    fetchData();
  };

  const isApprover = user?.role === 'APPROVER' || user?.role === 'ADMIN';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-brand-600" />
            Institutional Approval Queue (UC-009 / UC-010)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review submitted recruitment drives, verify eligibility and compensation norms, and record formal decisions
          </p>
        </div>

        {/* Persona Guidance Banner */}
        {!isApprover && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>
              You are currently viewing as <strong>{user?.name} ({user?.role})</strong>. To approve/reject drives, switch to <strong>Dr. Anand Patidar (Approver)</strong> from the top bar.
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Review Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Approval Audit History ({history.length})
        </button>
      </div>

      {/* Tab 1: Queue */}
      {activeTab === 'queue' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading pending approvals...</div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Review Queue is Clear!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All submitted recruitment activities have been processed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queue.map((item) => (
                <div
                  key={item.activity_id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {item.company_name}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Drive Date:</span>
                      <span className="font-medium">{item.activity_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Type:</span>
                      <span className="font-medium">{item.type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Offered Package:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.package_details || 'Norms'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong className="text-slate-700 dark:text-slate-300">Positions:</strong> {item.positions_offered}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Eligibility:</strong> {item.eligibility_criteria}</p>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Submitted by coordinator: <span className="font-semibold">{item.creator_name || 'Coordinator'}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => setSelectedActivity(item)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" /> Review & Decide (UC-009)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No approval records found.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((app) => (
                <div key={app.approval_id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={app.decision} />
                      <span className="font-bold text-slate-900 dark:text-white">
                        Activity ID #{app.activity_id}
                      </span>
                    </div>
                    {app.comments && (
                      <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{app.comments}"
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      Decided by {app.approver_name} (BR-010)
                    </div>
                    <div>{new Date(app.decision_date).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Decision Modal */}
      <ApprovalDecisionModal
        isOpen={!!selectedActivity}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onSuccess={showToast}
      />
    </div>
  );
};
