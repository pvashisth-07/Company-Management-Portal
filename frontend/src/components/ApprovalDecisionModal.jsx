import React, { useState } from 'react';
import { Modal } from './Modal';
import { decideActivityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, XCircle, AlertCircle, Building2, Calendar, Award } from 'lucide-react';

export const ApprovalDecisionModal = ({ isOpen, onClose, onSuccess, activity }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!activity) return null;

  const handleDecision = async (decision) => {
    setError('');

    // FR-027: Rejection Reason check
    if (decision === 'REJECTED' && (!comments || !comments.trim())) {
      setError("Please provide a reason for rejection.");
      return;
    }

    if (user?.role !== 'APPROVER' && user?.role !== 'ADMIN') {
      setError("You are not authorized to perform this action. Switch to Dr. Anand Patidar (Approver) using the top persona switcher.");
      return;
    }

    try {
      setSubmitting(true);
      await decideActivityApi(activity.activity_id, decision, comments.trim(), user?.user_id);
      onSuccess?.(`Recruitment activity has been ${decision.toLowerCase()} successfully.`);
      setComments('');
      onClose();
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.detail) {
        setError(typeof respData.detail === 'string' ? respData.detail : JSON.stringify(respData.detail));
      } else {
        setError("Failed to record decision. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Approval Review (UC-009 / UC-010)"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drive Overview Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{activity.company_name}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {activity.title}
              </h4>
            </div>
            <StatusBadge status={activity.status} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">Drive Date:</span>
              <span className="font-medium">{activity.activity_date}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Drive Type:</span>
              <span className="font-medium">{activity.type}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Package:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{activity.package_details || 'As per norms'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Created By:</span>
              <span className="font-medium">{activity.creator_name || 'Coordinator'}</span>
            </div>
          </div>

          <div className="text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Eligibility Criteria:</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{activity.eligibility_criteria}</p>
          </div>

          <div className="text-xs pt-1">
            <span className="text-slate-400 block text-[11px]">Positions Offered:</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{activity.positions_offered}</p>
          </div>
        </div>

        {/* Approver Comments */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Approver Evaluation & Comments <span className="text-slate-400 font-normal">(Required if rejecting)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Specify reason for approval or detailed rationale for revision/rejection..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Decision Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('REJECTED')}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              <XCircle className="w-4 h-4 text-rose-500" /> Reject Drive (UC-010)
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('APPROVED')}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Drive (UC-009)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
