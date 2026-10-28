import React, { useState, useEffect } from 'react';
import { getVisitsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RecordVisitModal } from '../components/RecordVisitModal';
import {
  CalendarCheck,
  Search,
  Plus,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VisitsLog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const isPrivileged = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';

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
              <CalendarCheck className="w-5 h-5" />
            </div>
            Company Visits & Meetings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official records of corporate delegations, campus meetings, partnership MoUs, and executive deliberations
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Record New Visit
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search visits by company, purpose, attendee, or outcome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Visits List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-medium">Loading visit records...</div>
      ) : filteredVisits.length === 0 ? (
        <div className="text-center py-16 bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-800/80 p-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No visit records found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visit documentation will appear here once recorded.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVisits.map((v) => (
            <div
              key={v.visit_id}
              className="bg-white/80 dark:bg-[#111728]/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all space-y-3"
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
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      Date: {v.visit_date}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {v.purpose}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right text-[11px] text-slate-400">
                    Recorded by: <span className="font-semibold text-slate-700 dark:text-slate-300">{v.recorder_name}</span>
                  </div>
                  {isPrivileged && (
                    <button
                      onClick={() => setEditingVisit(v)}
                      title="Edit Visit Record"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Outcome Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Outcome & Decisions: </span>
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
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-brand-50/80 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 font-medium"
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

      {/* Record or Edit Visit Modal */}
      <RecordVisitModal
        isOpen={isModalOpen || !!editingVisit}
        visitToEdit={editingVisit}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVisit(null);
        }}
        onSuccess={showToast}
      />
    </div>
  );
};
