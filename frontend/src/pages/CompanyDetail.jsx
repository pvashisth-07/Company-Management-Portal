import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyDetailApi, createContactApi, deleteContactApi, archiveEngagementRecordApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { RecordVisitModal } from '../components/RecordVisitModal';
import { ActivityModal } from '../components/ActivityModal';
import { Modal } from '../components/Modal';
import {
  Building2,
  CalendarCheck,
  Briefcase,
  Users,
  History,
  Globe,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  ArrowLeft,
  Archive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // New contact form state
  const [contactName, setContactName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactDept, setContactDept] = useState('');
  const [contactError, setContactError] = useState('');

  const fetchCompanyDetail = async () => {
    try {
      setLoading(true);
      const res = await getCompanyDetailApi(id);
      setCompany(res.data);
    } catch (err) {
      console.error("Error loading company detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetail();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
    fetchCompanyDetail();
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setContactError('');
    if (!contactName.trim() || !contactDesignation.trim() || !contactEmail.trim()) {
      setContactError("Name, Designation, and Email are required.");
      return;
    }

    try {
      await createContactApi({
        company_id: parseInt(id),
        name: contactName.trim(),
        designation: contactDesignation.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim() || null,
        department: contactDept.trim() || null
      }, user?.user_id);

      setContactName('');
      setContactDesignation('');
      setContactEmail('');
      setContactPhone('');
      setContactDept('');
      setIsAddContactOpen(false);
      showToast("Company contact added successfully.");
    } catch (err) {
      setContactError("Failed to add contact. Please try again.");
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to remove this contact?")) {
      try {
        await deleteContactApi(contactId, user?.user_id);
        showToast("Contact removed successfully.");
      } catch (err) {
        alert("Failed to remove contact.");
      }
    }
  };

  const handleArchiveRecord = async (recordId) => {
    try {
      await archiveEngagementRecordApi(recordId);
      showToast("Engagement history entry archived (BR-008).");
    } catch (err) {
      alert("Failed to archive record.");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading company profile...</div>;
  }

  if (!company) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Company Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Company profile does not exist. Please create the profile first.</p>
        <button onClick={() => navigate('/companies')} className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white">
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/companies')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Company Directory
      </button>

      {/* Company Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {company.name}
                  </h1>
                  <StatusBadge status={company.status} />
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {company.industry} Sector
                </p>
              </div>
            </div>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{company.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {company.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.address}</span>
                </div>
              )}
            </div>

            {company.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Engagement Notes:</span> {company.notes}
              </p>
            )}
          </div>

          {/* Action buttons (UC-006 & UC-008 entry points) */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setIsVisitModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <CalendarCheck className="w-4 h-4" /> Record Visit (UC-006)
            </button>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Briefcase className="w-4 h-4 text-brand-600" /> Draft Drive (UC-008)
            </button>
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Contact
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-t border-slate-100 dark:border-slate-800 mt-6 pt-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Engagement Timeline ({company.engagement_timeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'visits'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Visits Log ({company.visits?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Recruitment Drives ({company.activities?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Company Contacts ({company.contacts?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {/* TAB 1: Engagement Timeline (FR-031 & FR-032) */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chronological Engagement History (FR-031 & FR-032)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Immutable audit records of institutional visits, contacts, drives, and approvals
                </p>
              </div>
            </div>

            {company.engagement_timeline?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No engagement history recorded yet.</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-brand-200 dark:border-brand-900 space-y-6 my-4">
                {company.engagement_timeline.map((record) => (
                  <div key={record.record_id} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 border-2 border-white dark:border-slate-900 shadow" />
                    
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={record.type} className="text-[10px] py-0 px-1.5" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {record.description}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Recorded by: {record.recorder_name || 'System'}</span>
                          <span>•</span>
                          <span>{new Date(record.record_date).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* BR-008 Archive button */}
                      <button
                        onClick={() => handleArchiveRecord(record.record_id)}
                        title="Archive record (BR-008: Records cannot be deleted)"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all text-xs flex items-center gap-1"
                      >
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Visits Log (FR-016 to FR-019) */}
        {activeTab === 'visits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Institutional Visits & Meeting History (FR-019)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Documented on-campus visits, attendee delegations, and institutional outcomes
                </p>
              </div>
              <button
                onClick={() => setIsVisitModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white shadow"
              >
                + Record Visit
              </button>
            </div>

            {company.visits?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No visits recorded for this company.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {company.visits.map((v) => (
                  <div key={v.visit_id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                          Visit Date: {v.visit_date}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {v.purpose}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Logged by {v.recorder_name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-900 dark:text-white">Outcome: </span>
                      {v.outcome}
                    </div>

                    {v.attendees?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400">Attendees:</span>
                        {v.attendees.map((att) => (
                          <span
                            key={att.id}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
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
          </div>
        )}

        {/* TAB 3: Recruitment Activities (FR-020 to FR-029) */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Company Recruitment Drives (FR-021)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Campus recruitment sessions, assessment drives, and internship programs
                </p>
              </div>
              <button
                onClick={() => setIsActivityModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white shadow"
              >
                + Draft Drive
              </button>
            </div>

            {company.activities?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recruitment drives created yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {company.activities.map((a) => (
                  <div key={a.activity_id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {a.title}
                          </h4>
                          <StatusBadge status={a.status} />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Type: {a.type} • Date: {a.activity_date}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {a.package_details || 'Norms'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Positions:</span> {a.positions_offered}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Eligibility:</span> {a.eligibility_criteria}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Company Contacts (FR-011 to FR-015, BR-009) */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Company Contacts & Talent Leads (FR-015)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Primary HR representatives, university leads, and technical hiring directors
                </p>
              </div>
              <button
                onClick={() => setIsAddContactOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white shadow flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Contact
              </button>
            </div>

            {company.contacts?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No contact persons registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {company.contacts.map((contact) => (
                  <div key={contact.contact_id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {contact.name}
                      </h4>
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        {contact.designation} {contact.department ? `(${contact.department})` : ''}
                      </p>
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteContact(contact.contact_id)}
                      title="Remove contact"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <Modal isOpen={isAddContactOpen} onClose={() => setIsAddContactOpen(false)} title="Add Company Contact (FR-011)" maxWidth="max-w-md">
        <form onSubmit={handleAddContact} className="space-y-3">
          {contactError && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {contactError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Singhania"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designation *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Talent Acquisition Partner"
              value={contactDesignation}
              onChange={(e) => setContactDesignation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
            <input
              type="email"
              required
              placeholder="lead.recruiter@company.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 98xxx xxxxx"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                placeholder="Engineering HR"
                value={contactDept}
                onChange={(e) => setContactDept(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsAddContactOpen(false)} className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white shadow">
              Save Contact
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Visit Modal */}
      <RecordVisitModal
        isOpen={isVisitModalOpen}
        initialCompanyId={parseInt(id)}
        onClose={() => setIsVisitModalOpen(false)}
        onSuccess={showToast}
      />

      {/* Draft Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        initialCompanyId={parseInt(id)}
        onClose={() => setIsActivityModalOpen(false)}
        onSuccess={showToast}
      />
    </div>
  );
};
