import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { createActivityApi, updateActivityApi, submitActivityApi, getCompaniesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Send, Save, AlertCircle, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

const ACTIVITY_TYPES = [
  'ON_CAMPUS',
  'VIRTUAL',
  'POOL_CAMPUS',
  'INTERNSHIP_DRIVE',
  'HACKATHON'
];

export const ActivityModal = ({ isOpen, onClose, onSuccess, activity = null, initialCompanyId = null }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(initialCompanyId || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('ON_CAMPUS');
  const [activityDate, setActivityDate] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [positionsOffered, setPositionsOffered] = useState('');
  const [packageDetails, setPackageDetails] = useState('');

  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCompaniesApi({ status: 'ACTIVE' })
        .then(res => setCompanies(res.data))
        .catch(err => console.error("Error loading companies", err));

      if (activity) {
        setCompanyId(activity.company_id);
        setTitle(activity.title);
        setType(activity.type);
        setActivityDate(activity.activity_date);
        setEligibilityCriteria(activity.eligibility_criteria);
        setPositionsOffered(activity.positions_offered);
        setPackageDetails(activity.package_details || '');
      } else {
        setCompanyId(initialCompanyId || '');
        setTitle('');
        setType('ON_CAMPUS');
        setActivityDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
        setEligibilityCriteria('B.Tech CSE/CCE/ECE with CGPA >= 7.5, No active backlogs');
        setPositionsOffered('Software Development Engineer (SDE-1)');
        setPackageDetails('CTC 16.0 LPA');
      }
      setErrors([]);
    }
  }, [isOpen, activity, initialCompanyId]);

  const handleSave = async (submitForApproval = false) => {
    setErrors([]);
    const validationErrors = [];

    if (!companyId) validationErrors.push("Company is required.");
    if (!title.trim()) validationErrors.push("Activity title is required.");
    if (!activityDate) validationErrors.push("Activity date is required.");
    if (!eligibilityCriteria.trim()) validationErrors.push("Eligibility criteria is required.");
    if (!positionsOffered.trim()) validationErrors.push("Positions offered is required.");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        company_id: parseInt(companyId),
        title: title.trim(),
        type: type,
        activity_date: activityDate,
        eligibility_criteria: eligibilityCriteria.trim(),
        positions_offered: positionsOffered.trim(),
        package_details: packageDetails.trim() || null,
        status: 'DRAFT'
      };

      let resultActivity;
      if (activity) {
        const res = await updateActivityApi(activity.activity_id, payload, user?.user_id);
        resultActivity = res.data;
      } else {
        const res = await createActivityApi(payload, user?.user_id);
        resultActivity = res.data;
      }

      // If user clicked "Submit for Approval" (UC-008)
      if (submitForApproval) {
        await submitActivityApi(resultActivity.activity_id, user?.user_id);
        onSuccess?.("Activity submitted successfully for institutional approval.");
      } else {
        onSuccess?.("Recruitment activity draft saved successfully.");
      }

      onClose();
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.detail?.errors) {
        setErrors(respData.detail.errors);
      } else if (respData?.detail) {
        setErrors([typeof respData.detail === 'string' ? respData.detail : JSON.stringify(respData.detail)]);
      } else {
        setErrors(["Operation failed. Please verify inputs."]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? "Edit Recruitment Activity" : "Create Recruitment Activity (UC-008)"}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {errors.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-1">
            <div className="flex items-center gap-1 font-bold">
              <AlertCircle className="w-4 h-4" /> Please resolve:
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {errors.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Company */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Recruiting Company <span className="text-rose-500">*</span>
          </label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={!!activity || !!initialCompanyId}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          >
            <option value="">-- Select Company --</option>
            {companies.map(c => (
              <option key={c.company_id} value={c.company_id}>{c.name} ({c.industry})</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Drive Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Amazon AWS SDE Hiring Drive 2027"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Drive Type & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Drive Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              {ACTIVITY_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Activity Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Eligibility Criteria <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Branches eligible, CGPA cutoffs, standing backlogs policy..."
            value={eligibilityCriteria}
            onChange={(e) => setEligibilityCriteria(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Positions Offered */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Positions Offered <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. SDE-1, Cloud Associate, Full-Time Analyst"
            value={positionsOffered}
            onChange={(e) => setPositionsOffered(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Package Details */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Compensation & Package Details
          </label>
          <input
            type="text"
            placeholder="e.g. CTC 24.5 LPA | Stipend INR 80,000/mo"
            value={packageDetails}
            onChange={(e) => setPackageDetails(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Action Buttons */}
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
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft (FR-022)
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave(true)}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Approval (UC-008)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
