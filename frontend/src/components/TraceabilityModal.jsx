import React, { useState } from 'react';
import { Modal } from './Modal';
import { CheckCircle2, ShieldCheck, FileSpreadsheet, Layers, Database } from 'lucide-react';

const RTM_ITEMS = [
  { req: 'FR-001', title: 'User Login', story: 'US-001', uc: 'UC-001', status: 'Implemented' },
  { req: 'FR-002', title: 'Authentication Failure Message', story: 'US-001', uc: 'UC-001', status: 'Implemented' },
  { req: 'FR-003', title: 'Session Termination / Logout', story: 'US-001', uc: 'UC-001', status: 'Implemented' },
  { req: 'FR-004', title: 'Admin Role Assignment', story: 'US-008', uc: 'UC-002', status: 'Implemented' },
  { req: 'FR-005', title: 'Role-Based Access Control', story: 'US-008', uc: 'UC-002', status: 'Implemented' },
  { req: 'FR-006', title: 'Create Company Profile', story: 'US-002', uc: 'UC-003', status: 'Implemented' },
  { req: 'FR-007', title: 'Company Profile Schema', story: 'US-002', uc: 'UC-003', status: 'Implemented' },
  { req: 'FR-008', title: 'Edit Company Profile', story: 'US-002', uc: 'UC-004', status: 'Implemented' },
  { req: 'FR-009', title: 'Deactivate / Archive Company', story: 'US-002', uc: 'UC-004', status: 'Implemented' },
  { req: 'FR-010', title: 'View Company Profile Details', story: 'US-002', uc: 'UC-013', status: 'Implemented' },
  { req: 'FR-011', title: 'Add Company Contact', story: 'US-003', uc: 'UC-005', status: 'Implemented' },
  { req: 'FR-012', title: 'Company Contact Attributes', story: 'US-003', uc: 'UC-005', status: 'Implemented' },
  { req: 'FR-013', title: 'Edit Company Contact', story: 'US-003', uc: 'UC-005', status: 'Implemented' },
  { req: 'FR-014', title: 'Remove Company Contact', story: 'US-003', uc: 'UC-005', status: 'Implemented' },
  { req: 'FR-015', title: 'View Company Contacts', story: 'US-003', uc: 'UC-005', status: 'Implemented' },
  { req: 'FR-016', title: 'Record Company Visit (UC-006)', story: 'US-004', uc: 'UC-006', status: 'Implemented' },
  { req: 'FR-017', title: 'Visit Information Schema', story: 'US-004', uc: 'UC-006', status: 'Implemented' },
  { req: 'FR-018', title: 'Edit Visit Record', story: 'US-004', uc: 'UC-006', status: 'Implemented' },
  { req: 'FR-019', title: 'View Company Visit History', story: 'US-004', uc: 'UC-006', status: 'Implemented' },
  { req: 'FR-020', title: 'Create Recruitment Activity', story: 'US-005', uc: 'UC-007', status: 'Implemented' },
  { req: 'FR-021', title: 'Recruitment Activity Schema', story: 'US-005', uc: 'UC-007', status: 'Implemented' },
  { req: 'FR-022', title: 'Save Activity Draft', story: 'US-005', uc: 'UC-007', status: 'Implemented' },
  { req: 'FR-023', title: 'Edit Activity by Status', story: 'US-005', uc: 'UC-007', status: 'Implemented' },
  { req: 'FR-024', title: 'Submit for Approval (UC-008)', story: 'US-005', uc: 'UC-008', status: 'Implemented' },
  { req: 'FR-025', title: 'Approve Recruitment Activity (UC-009)', story: 'US-006', uc: 'UC-009', status: 'Implemented' },
  { req: 'FR-026', title: 'Reject Recruitment Activity (UC-010)', story: 'US-006', uc: 'UC-010', status: 'Implemented' },
  { req: 'FR-027', title: 'Rejection Reason Mandatory', story: 'US-006', uc: 'UC-010', status: 'Implemented' },
  { req: 'FR-028', title: 'Publish Recruitment Activity', story: 'US-005', uc: 'UC-011', status: 'Implemented' },
  { req: 'FR-029', title: 'Cancel Recruitment Activity', story: 'US-005', uc: 'UC-012', status: 'Implemented' },
  { req: 'FR-030', title: 'Automatic Engagement Audit Log', story: 'US-007', uc: 'UC-014', status: 'Implemented' },
  { req: 'FR-031', title: 'View Complete Engagement History', story: 'US-007', uc: 'UC-014', status: 'Implemented' },
  { req: 'FR-032', title: 'Chronological Engagement Timeline', story: 'US-007', uc: 'UC-014', status: 'Implemented' },
  { req: 'FR-033', title: 'Fast Company Search', story: 'US-010', uc: 'UC-013', status: 'Implemented' },
  { req: 'FR-034', title: 'Company Attribute Filtering', story: 'US-010', uc: 'UC-013', status: 'Implemented' },
  { req: 'FR-035', title: 'View Comprehensive Company Details', story: 'US-010', uc: 'UC-013', status: 'Implemented' },
  { req: 'FR-036', title: 'Engagement Reports & CSV Export', story: 'US-009', uc: 'UC-015', status: 'Implemented' },
  { req: 'FR-037', title: 'Recruitment Activity Reports', story: 'US-009', uc: 'UC-015', status: 'Implemented' },
  { req: 'FR-038', title: 'Visit Reports & Analytics', story: 'US-009', uc: 'UC-015', status: 'Implemented' },
  { req: 'FR-039', title: 'Management & Admin Dashboard', story: 'US-009', uc: 'UC-015', status: 'Implemented' },
];

const BUSINESS_RULES = [
  { rule: 'BR-001', desc: 'Only authorized coordinators/administrators can create company profiles.', status: 'Enforced' },
  { rule: 'BR-002', desc: 'A recruitment activity must be approved before it is published.', status: 'Enforced' },
  { rule: 'BR-003', desc: 'Only approved recruitment activities can be scheduled or conducted.', status: 'Enforced' },
  { rule: 'BR-004', desc: 'A company profile cannot be duplicated for the same company (Unique Name constraint).', status: 'Enforced' },
  { rule: 'BR-005', desc: 'Only authorized users can record company visits.', status: 'Enforced' },
  { rule: 'BR-006', desc: 'Only authorized users can access administrative reports and user management.', status: 'Enforced' },
  { rule: 'BR-007', desc: 'Cancelled recruitment activities cannot be further edited.', status: 'Enforced' },
  { rule: 'BR-008', desc: 'Engagement history entries cannot be deleted, only archived.', status: 'Enforced' },
  { rule: 'BR-009', desc: 'Each company contact must be linked to an existing company profile.', status: 'Enforced' },
  { rule: 'BR-010', desc: 'Every approval decision must record the approver identity and decision date.', status: 'Enforced' },
];

export const TraceabilityModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('rtm');
  const [filter, setFilter] = useState('');

  const filteredRTM = RTM_ITEMS.filter(
    (item) =>
      item.req.toLowerCase().includes(filter.toLowerCase()) ||
      item.title.toLowerCase().includes(filter.toLowerCase()) ||
      item.uc.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Requirements Traceability Matrix (RTM) & Verification"
      subtitle="Complete traceability chain from SRS baseline v1.0 across Assignments 1 to 7"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('rtm')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'rtm'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Functional Requirements (FR-001 - FR-039)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'rules'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Business Rules (BR-001 - BR-010)
          </button>
          <button
            onClick={() => setActiveTab('modeling')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'modeling'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Architecture &amp; Modeling Chain
          </button>
        </div>

        {activeTab === 'rtm' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                placeholder="Filter requirements by code or title (e.g. FR-016, Visit, UC-008)..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-80 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" /> 39 / 39 Verified (100%)
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">Requirement</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">Description</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">User Story</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">Use Case</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredRTM.map((row) => (
                    <tr key={row.req} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">{row.req}</td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">{row.title}</td>
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.story}</td>
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.uc}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {BUSINESS_RULES.map((br) => (
              <div
                key={br.rule}
                className="p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-4"
              >
                <div>
                  <span className="font-bold text-xs text-brand-600 dark:text-brand-400 block mb-0.5">{br.rule}</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{br.desc}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> {br.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'modeling' && (
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Continuous Traceability Chain (Assignments 1 to 7)
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              The project demonstrates end-to-end consistency preserving the exact domain entities, workflows, and state machines established in the course submissions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">UC-006: Record Company Visit</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  FR-016 to FR-019 • BR-005 • Screen S2 &amp; S3 • TPCoordinator &rarr; CompanyService &rarr; VisitService &rarr; ValidationService &rarr; EngagementHistoryService.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">UC-008: Submit Recruitment Activity</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  FR-020 to FR-024 • BR-007 • Screen S4 • RecruitmentActivityService &rarr; ValidationService &rarr; Status transition: DRAFT &rarr; SUBMITTED.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">UC-009 / UC-010: Approve / Reject</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  FR-025 to FR-027 • BR-010 • Screen S5 • ApprovingAuthority &rarr; ApprovalService &rarr; Approver ID + Decision Date persistence.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">Architecture &amp; Database</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  N-tier Layered client-server model • SQLite relational tables: users, companies, contacts, visits, visit_attendees, recruitment_activities, approvals, engagement_records.
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </Modal>
  );
};
