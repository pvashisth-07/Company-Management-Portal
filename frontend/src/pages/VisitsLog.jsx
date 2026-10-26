import React, { useState, useEffect } from 'react';
import { getVisitsApi } from '../services/api';
import { RecordVisitModal } from '../components/RecordVisitModal';
import {
  CalendarCheck,
  Search,
  Plus,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VisitsLog = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await getVisitsApi();
      setVisits(res.data);
    } catch (err) {
      console.error("Error loading visits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
    fetchVisits();
  };

  const filteredVisits = visits.filter(v => {
    const q = search.toLowerCase();
    const matchCompany = v.company_name?.toLowerCase().includes(q);
    const matchPurpose = v.purpose?.toLowerCase().includes(q);
    const matchOutcome = v.outcome?.toLowerCase().includes(q);
    const matchAttendee = v.attendees?.some(a => a.attendee_name.toLowerCase().includes(q));
    return matchCompany || matchPurpose || matchOutcome || matchAttendee;
  });

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
            <CalendarCheck className="w-6 h-6 text-brand-600" />
            Institutional Company Visits Log (FR-019)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete records of industry leadership visits, campus tours, MoUs, and executive discussions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Record New Visit (UC-006)
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search visits by company, purpose, attendee, or outcome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Visits List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading visit records...</div>
      ) : filteredVisits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No visit records found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Record a visit to document company interactions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVisits.map((v) => (
            <div
              key={v.visit_id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => navigate(`/companies/${v.company_id}`)}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      {v.company_name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      Date: {v.visit_date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {v.purpose}
                  </h3>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  Recorded by: <span className="font-semibold text-slate-700 dark:text-slate-300">{v.recorder_name}</span>
                </div>
              </div>

              {/* Outcome Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">Outcome & Decisions: </span>
                <span className="text-slate-700 dark:text-slate-300">{v.outcome}</span>
              </div>

              {/* Notes */}
              {v.notes && (
                <div className="text-xs text-slate-500 italic">
                  <strong>Notes:</strong> {v.notes}
                </div>
              )}

              {/* Attendees */}
              {v.attendees && v.attendees.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Attendees:
                  </span>
                  {v.attendees.map((att) => (
                    <span
                      key={att.id}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                    >
                      {att.attendee_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Visit Modal */}
      <RecordVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={showToast}
      />
    </div>
  );
};
