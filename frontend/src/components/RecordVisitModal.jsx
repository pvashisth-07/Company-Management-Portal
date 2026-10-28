import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { recordVisitApi, updateVisitApi, getCompaniesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, FileText, CheckCircle2, AlertCircle, Plus, X, Building2 } from 'lucide-react';

export const RecordVisitModal = ({ isOpen, onClose, onSuccess, initialCompanyId = null, visitToEdit = null }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [attendeeInput, setAttendeeInput] = useState('');
  const [attendees, setAttendees] = useState([]);
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCompaniesApi({ status: 'ACTIVE' })
        .then(res => setCompanies(res.data))
        .catch(err => console.error("Error loading companies", err));

      if (visitToEdit) {
        setCompanyId(visitToEdit.company_id || '');
        setVisitDate(visitToEdit.visit_date || '');
        setPurpose(visitToEdit.purpose || '');
        setOutcome(visitToEdit.outcome || '');
        setNotes(visitToEdit.notes || '');
        setAttendees(visitToEdit.attendees ? visitToEdit.attendees.map(a => typeof a === 'string' ? a : a.attendee_name) : []);
      } else {
        setCompanyId(initialCompanyId || '');
        setVisitDate(new Date().toISOString().split('T')[0]);
        setPurpose('');
        setOutcome('');
        setNotes('');
        setAttendees([]);
      }
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isOpen, initialCompanyId, visitToEdit]);

  const addAttendee = (e) => {
    e?.preventDefault();
    if (attendeeInput.trim()) {
      if (!attendees.includes(attendeeInput.trim())) {
        setAttendees([...attendees, attendeeInput.trim()]);
      }
      setAttendeeInput('');
      if (fieldErrors.attendees) {
        setFieldErrors(prev => ({ ...prev, attendees: null }));
      }
    }
  };

  const removeAttendee = (name) => {
    setAttendees(attendees.filter(a => a !== name));
  };

  const validate = () => {
    const errs = {};
    if (!companyId) errs.companyId = "Company selection is required.";
    if (!visitDate) errs.visitDate = "Visit date is required.";
    if (!purpose.trim()) errs.purpose = "Purpose is required.";
    if (!outcome.trim()) errs.outcome = "Outcome is required.";
    if (attendees.length === 0) errs.attendees = "Enter at least one attendee.";
    
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setGeneralError("Visit not saved. Please correct the highlighted fields.");
      return false;
    }
    setGeneralError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (visitToEdit) {
        // FR-018: Edit Visit Record
        await updateVisitApi(visitToEdit.visit_id, {
          visit_date: visitDate,
          purpose: purpose.trim(),
          outcome: outcome.trim(),
          notes: notes.trim() || null,
          attendees: attendees
        }, user?.user_id || 1);
        onSuccess?.("Visit record updated and engagement history logged.");
      } else {
        // FR-016: Record Company Visit (UC-006)
        await recordVisitApi({
          company_id: parseInt(companyId),
          visit_date: visitDate,
          purpose: purpose.trim(),
          outcome: outcome.trim(),
          notes: notes.trim() || null,
          attendees: attendees
        }, user?.user_id || 1);
        onSuccess?.("Visit recorded and engagement history updated.");
      }
      onClose();
    } catch (err) {
      const respData = err.response?.data;
      setGeneralError(respData?.detail || "Visit could not be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={visitToEdit ? "Edit Company Visit (FR-018)" : "Record Company Visit (UC-006 / Screen S3)"} 
      subtitle="Institutional visit delegation, attendee rosters, and engagement outcome tracking"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Screen S3 Wireframe Failure Alert */}
        {generalError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span className="font-semibold">{generalError}</span>
          </div>
        )}

        {/* Company Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-brand-500" /> Company Profile *
          </label>
          <select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              if (fieldErrors.companyId) setFieldErrors(prev => ({ ...prev, companyId: null }));
            }}
            disabled={!!initialCompanyId || !!visitToEdit}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 disabled:opacity-60 transition-all ${
              fieldErrors.companyId ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
            }`}
          >
            <option value="">-- Select Company Profile --</option>
            {companies.map(c => (
              <option key={c.company_id} value={c.company_id}>{c.name} ({c.industry})</option>
            ))}
          </select>
          {fieldErrors.companyId && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.companyId}</p>}
        </div>

        {/* Visit Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-500" /> Visit Date *
          </label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => {
              setVisitDate(e.target.value);
              if (fieldErrors.visitDate) setFieldErrors(prev => ({ ...prev, visitDate: null }));
            }}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.visitDate ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
            }`}
          />
          {fieldErrors.visitDate && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.visitDate}</p>}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-500" /> Purpose of Visit *
          </label>
          <input
            type="text"
            placeholder="e.g. Placement drive planning, Curriculum Advisory, MoU renewal"
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              if (fieldErrors.purpose) setFieldErrors(prev => ({ ...prev, purpose: null }));
            }}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.purpose ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
            }`}
          />
          {fieldErrors.purpose && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.purpose}</p>}
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-500" /> Attendees *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Anand Patidar, Riya Sharma (HR Manager)"
              value={attendeeInput}
              onChange={(e) => setAttendeeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAttendee(e)}
              className={`flex-1 px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.attendees ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            <button
              type="button"
              onClick={addAttendee}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {fieldErrors.attendees && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.attendees}</p>}
          
          {attendees.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attendees.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80"
                >
                  {a}
                  <button type="button" onClick={() => removeAttendee(a)} className="hover:text-rose-600 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> Visit Outcome & Agreements *
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Agreed to conduct drive in Nov; finalized 25 positions with 18 LPA CTC."
            value={outcome}
            onChange={(e) => {
              setOutcome(e.target.value);
              if (fieldErrors.outcome) setFieldErrors(prev => ({ ...prev, outcome: null }));
            }}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.outcome ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
            }`}
          />
          {fieldErrors.outcome && <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.outcome}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Internal Follow-Up Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Labs 101 and 102 reserved for online test session."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {visitToEdit ? 'Save Changes' : 'Save Visit Record'}</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};
