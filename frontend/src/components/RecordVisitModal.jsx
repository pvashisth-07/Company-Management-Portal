import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { recordVisitApi, getCompaniesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, FileText, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';

export const RecordVisitModal = ({ isOpen, onClose, onSuccess, initialCompanyId = null }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(initialCompanyId || '');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [attendeeInput, setAttendeeInput] = useState('');
  const [attendees, setAttendees] = useState([]);
  
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCompaniesApi({ status: 'ACTIVE' })
        .then(res => setCompanies(res.data))
        .catch(err => console.error("Error loading companies", err));

      if (initialCompanyId) {
        setCompanyId(initialCompanyId);
      }
      setErrors([]);
    }
  }, [isOpen, initialCompanyId]);

  const addAttendee = (e) => {
    e.preventDefault();
    if (attendeeInput.trim()) {
      if (!attendees.includes(attendeeInput.trim())) {
        setAttendees([...attendees, attendeeInput.trim()]);
      }
      setAttendeeInput('');
    }
  };

  const removeAttendee = (name) => {
    setAttendees(attendees.filter(a => a !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Client-side validation per Assignment 7 specs
    const validationErrors = [];
    if (!companyId) validationErrors.push("Company profile must be selected.");
    if (!visitDate) validationErrors.push("Visit date is required.");
    if (!purpose.trim()) validationErrors.push("Purpose of visit is required.");
    if (!outcome.trim()) validationErrors.push("Outcome is required.");
    if (attendees.length === 0) validationErrors.push("At least one attendee is required.");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      await recordVisitApi({
        company_id: parseInt(companyId),
        visit_date: visitDate,
        purpose: purpose.trim(),
        outcome: outcome.trim(),
        notes: notes.trim() || null,
        attendees: attendees
      }, user?.user_id || 1);

      // Reset
      setPurpose('');
      setOutcome('');
      setNotes('');
      setAttendees([]);
      onSuccess?.("Visit recorded and engagement history updated.");
      onClose();
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.detail?.errors) {
        setErrors(respData.detail.errors);
      } else if (respData?.detail) {
        setErrors([typeof respData.detail === 'string' ? respData.detail : JSON.stringify(respData.detail)]);
      } else {
        setErrors(["Visit could not be saved. Please try again."]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Company Visit (UC-006)" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-1">
            <div className="flex items-center gap-1 font-bold">
              <AlertCircle className="w-4 h-4" /> Please fix the following:
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Company Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Company <span className="text-rose-500">*</span>
          </label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={!!initialCompanyId}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          >
            <option value="">-- Select Company --</option>
            {companies.map(c => (
              <option key={c.company_id} value={c.company_id}>{c.name} ({c.industry})</option>
            ))}
          </select>
        </div>

        {/* Visit Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Visit Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Purpose of Visit <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Placement Drive Planning, MoU Discussion, Tech Talk"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Attendees (Representatives & Institute Leads) <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Rohit Sharma (HR Director)"
              value={attendeeInput}
              onChange={(e) => setAttendeeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAttendee(e)}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={addAttendee}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {attendees.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attendees.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                >
                  {a}
                  <button type="button" onClick={() => removeAttendee(a)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Visit Outcome & Key Decisions <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Agreed to conduct 3 rounds of on-campus interviews; confirmed 25 FTE offers."
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Internal Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="Follow up actions or internal observations"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
          >
            {submitting ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> Record Visit</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};
