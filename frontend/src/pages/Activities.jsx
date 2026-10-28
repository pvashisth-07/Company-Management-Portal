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
  Filter,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_FILTERS = [
  'All',
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'SCHEDULED',
  'ONGOING',
  'COMPLETED',
  'REJECTED',
  'REVISION',
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

  const isPrivileged = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

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
      showToast("Activity submitted for institutional approval.");
    } catch (err) {
      const resp = err.response?.data;
      alert(resp?.detail?.message || resp?.detail || "Submission failed.");
    }
  };

  const handleCancel = async (activityId) => {
    if (window.confirm("Are you sure you want to cancel this recruitment drive?")) {
      try {
        await cancelActivityApi(activityId, user?.user_id);
        showToast("Activity marked as cancelled.");
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
              <Briefcase className="w-5 h-5" />
            </div>
            Recruitment Drives & Activities
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage and explore on-campus hiring drives, eligibility requirements, and schedule timelines
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={() => {
              setSelectedActivity(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Drive Draft
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1 flex-shrink-0" />
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedStatus === s
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-medium">Loading recruitment activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No recruitment activities found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try changing the status filter or create a new drive draft.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((a) => (
            <div
              key={a.activity_id}
              className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      {a.company_name}
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {a.title}
                    </h3>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Drive Type:</span>
                    <span className="font-semibold">{a.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-medium">Target Date:</span>
                    <span className="font-semibold">{a.activity_date}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-400 block text-[10px] font-medium">Positions:</span>
                    <span className="font-semibold">{a.positions_offered}</span>
                  </div>
                  {a.package_details && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px] font-medium">Compensation:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{a.package_details}</span>
                    </div>
                  )}
                </div>

                {a.eligibility_criteria && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 leading-relaxed">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Eligibility:</span>
                    {a.eligibility_criteria}
                  </div>
                )}
              </div>

              {/* Action Buttons for Coordinators/Admins */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                {isPrivileged && a.status === 'DRAFT' && (
                  <button
                    onClick={() => handleSubmitForApproval(a.activity_id)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center gap-1 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit for Approval
                  </button>
                )}

                {isPrivileged && a.status === 'APPROVED' && (
                  <button
                    onClick={() => handleProgressStatus(a.activity_id, 'SCHEDULED')}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" /> Schedule Drive
                  </button>
                )}

                {isPrivileged && a.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleProgressStatus(a.activity_id, 'ONGOING')}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Drive
                  </button>
                )}

                {isPrivileged && a.status === 'ONGOING' && (
                  <button
                    onClick={() => handleProgressStatus(a.activity_id, 'COMPLETED')}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}

                <button
                  onClick={() => navigate(`/companies/${a.company_id}`)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
                >
                  View Company →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Creation Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        activity={selectedActivity}
        onClose={() => setIsModalOpen(false)}
        onSuccess={showToast}
      />
    </div>
  );
};
