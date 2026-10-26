import React, { useState, useEffect } from 'react';
import {
  getActivitiesApi,
  submitActivityApi,
  cancelActivityApi,
  progressActivityStatusApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ActivityModal } from '../components/ActivityModal';
import {
  Briefcase,
  Plus,
  Send,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  CheckCheck,
  Edit,
  Clock,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_FILTERS = [
  'All',
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'SCHEDULED',
  'ONGOING',
  'COMPLETED',
  'REJECTED',
  'CANCELLED'
];

export const Activities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      const res = await getActivitiesApi(params);
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching activities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedStatus]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
    fetchActivities();
  };

  const handleSubmitForApproval = async (activityId) => {
    try {
      await submitActivityApi(activityId, user?.user_id);
      showToast("Activity submitted for institutional approval (UC-008).");
    } catch (err) {
      const resp = err.response?.data;
      alert(resp?.detail?.message || resp?.detail || "Submission failed.");
    }
  };

  const handleCancel = async (activityId) => {
    if (window.confirm("Are you sure you want to cancel this activity? Cancelled activities cannot be modified.")) {
      try {
        await cancelActivityApi(activityId, user?.user_id);
        showToast("Activity marked as CANCELLED (FR-029).");
      } catch (err) {
        alert("Failed to cancel activity.");
      }
    }
  };

  const handleProgressStatus = async (activityId, newStatus) => {
    try {
      await progressActivityStatusApi(activityId, newStatus, user?.user_id);
      showToast(`Drive transitioned to ${newStatus}.`);
    } catch (err) {
      const resp = err.response?.data;
      alert(resp?.detail || "Status progression failed.");
    }
  };

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
            <Briefcase className="w-6 h-6 text-brand-600" />
            Recruitment Drives & Activities
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage full recruitment lifecycle from Draft, Institutional Submission, Approval to Completion
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedActivity(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Drive Draft (UC-008)
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1 flex-shrink-0" />
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedStatus === s
                ? 'bg-brand-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading recruitment activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No recruitment activities found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try changing the status filter or create a new drive draft.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a) => (
            <div
              key={a.activity_id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {a.company_name}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      {a.title}
                    </h3>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Type:</span>
                    <span className="font-medium">{a.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date:</span>
                    <span className="font-medium">{a.activity_date}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Package / CTC:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{a.package_details || 'As per norms'}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="line-clamp-2">
                    <strong className="text-slate-700 dark:text-slate-300">Positions:</strong> {a.positions_offered}
                  </p>
                  <p className="line-clamp-2">
                    <strong className="text-slate-700 dark:text-slate-300">Eligibility:</strong> {a.eligibility_criteria}
                  </p>
                </div>

                {/* Approvals Feedback */}
                {a.approvals && a.approvals.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Approval Decision:</span>
                      <StatusBadge status={a.approvals[0].decision} className="text-[10px] py-0 px-1.5" />
                    </div>
                    {a.approvals[0].comments && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        "{a.approvals[0].comments}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block">
                      Decided by {a.approvals[0].approver_name} on {new Date(a.approvals[0].decision_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Contextual Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
                {/* DRAFT actions */}
                {a.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedActivity(a);
                        setIsModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleSubmitForApproval(a.activity_id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit (UC-008)
                    </button>
                  </>
                )}

                {/* SUBMITTED / UNDER_REVIEW */}
                {(a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW') && (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> In Approver Queue
                    </span>
                    {(user?.role === 'APPROVER' || user?.role === 'ADMIN') ? (
                      <button
                        onClick={() => navigate('/approvals')}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-sm"
                      >
                        Review Now →
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Awaiting Authority</span>
                    )}
                  </div>
                )}

                {/* APPROVED */}
                {a.status === 'APPROVED' && (
                  <button
                    onClick={() => handleProgressStatus(a.activity_id, 'SCHEDULED')}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Mark as Scheduled
                  </button>
                )}

                {/* SCHEDULED */}
                {a.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleProgressStatus(a.activity_id, 'ONGOING')}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Drive (Ongoing)
                  </button>
                )}

                {/* ONGOING */}
                {a.status === 'ONGOING' && (
                  <button
                    onClick={() => handleProgressStatus(a.activity_id, 'COMPLETED')}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}

                {/* COMPLETED */}
                {a.status === 'COMPLETED' && (
                  <span className="w-full text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                    ✓ Recruitment Completed & Archived
                  </span>
                )}

                {/* CANCELLED / REJECTED */}
                {a.status === 'CANCELLED' && (
                  <span className="w-full text-center text-xs text-rose-500 font-semibold py-1">
                    Activity Cancelled (Immutable)
                  </span>
                )}

                {/* Cancel option for active drives */}
                {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'SCHEDULED'].includes(a.status) && (
                  <button
                    onClick={() => handleCancel(a.activity_id)}
                    className="text-[11px] text-slate-400 hover:text-rose-600 mt-2 block w-full text-right"
                  >
                    Cancel Activity (FR-029)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        activity={selectedActivity}
        onClose={() => setIsModalOpen(false)}
        onSuccess={showToast}
      />
    </div>
  );
};
