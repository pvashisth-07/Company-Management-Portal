import React, { useState, useEffect } from 'react';
import { getApprovalQueueApi, getApprovalHistoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ApprovalDecisionModal } from '../components/ApprovalDecisionModal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Building2,
  Briefcase,
  AlertCircle,
  Award,
  CheckCheck,
  Calendar,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ApprovalsQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'history'
  const [queueItems, setQueueItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [decisionType, setDecisionType] = useState('APPROVED');
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueRes, histRes] = await Promise.all([
        getApprovalQueueApi(),
        getApprovalHistoryApi()
      ]);
      setQueueItems(queueRes.data);
      setHistoryItems(histRes.data);
    } catch (err) {
      console.error("Error loading approvals", err);
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
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Award className="w-5 h-5" />
            </div>
            Approval Review & Sign-Off
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review submitted recruitment drives, verify eligibility and compensation norms, and record formal decisions
          </p>
        </div>

        {/* Persona Guidance Banner */}
        {!isApprover && (
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0 text-slate-400" />
            <span>
              Viewing in read-only audit mode as <strong>{user?.name || 'User'}</strong> ({user?.role || 'USER'}).
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/70 dark:border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Queue</span>
          {queueItems.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            }`}>
              {queueItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Decision History</span>
          <span className="text-[10px] text-slate-400">({historyItems.length})</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-medium">Loading approval records...</div>
      ) : activeTab === 'queue' ? (
        queueItems.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 p-8">
            <CheckCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">All caught up!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">There are no drives pending review right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queueItems.map((item) => (
              <div
                key={item.activity_id}
                className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      {item.company_name}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Positions:</span>
                      <span className="font-semibold">{item.positions_offered}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Package:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.package_details || 'Not Disclosed'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Submitted By:</span>
                      <span className="font-semibold">{item.creator_name}</span>
                    </div>
                  </div>
                  {item.eligibility_criteria && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 mt-1">
                      <strong className="text-slate-700 dark:text-slate-300">Eligibility:</strong> {item.eligibility_criteria}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {isApprover ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedActivity(item);
                          setDecisionType('APPROVED');
                          setIsDecisionModalOpen(true);
                        }}
                        className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Drive
                      </button>
                      <button
                        onClick={() => {
                          setSelectedActivity(item);
                          setDecisionType('REJECTED');
                          setIsDecisionModalOpen(true);
                        }}
                        className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`/companies/${item.company_id}`)}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      View Company Profile
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History Tab */
        historyItems.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 p-8">
            <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No decision history yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Decisions made on submitted drives will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div
                key={item.approval_id}
                className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.decision} />
                    <span className="text-xs text-slate-400">
                      Decided on {new Date(item.decision_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {item.activity_title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span>Company: <strong className="text-slate-700 dark:text-slate-300">{item.company_name}</strong></span>
                    <span className="mx-2">•</span>
                    <span>Approver: <strong className="text-slate-700 dark:text-slate-300">{item.approver_name}</strong></span>
                  </div>
                  {item.comments && (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Notes / Remarks: </span>
                      {item.comments}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/companies/${item.company_id}`)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors self-start md:self-auto"
                >
                  View Company →
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Decision Modal */}
      <ApprovalDecisionModal
        isOpen={isDecisionModalOpen}
        activity={selectedActivity}
        decisionType={decisionType}
        onClose={() => {
          setIsDecisionModalOpen(false);
          setSelectedActivity(null);
        }}
        onSuccess={showToast}
      />
    </div>
  );
};
