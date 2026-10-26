import React, { useState, useEffect } from 'react';
import { getCompaniesApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { CreateCompanyModal } from '../components/CreateCompanyModal';
import { RecordVisitModal } from '../components/RecordVisitModal';
import {
  Building2,
  Search,
  Filter,
  Plus,
  CalendarCheck,
  Briefcase,
  Users,
  ExternalLink,
  MapPin,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INDUSTRIES = [
  'All',
  'Software & IT',
  'FinTech & Banking',
  'E-Commerce & Cloud',
  'Networking & Cybersecurity',
  'Digital Media & Software',
  'IT Consulting & Services',
  'Hardware & Semiconductors',
  'FoodTech & Logistics'
];

export const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [visitModalCompanyId, setVisitModalCompanyId] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedIndustry !== 'All') params.industry = selectedIndustry;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await getCompaniesApi(params);
      setCompanies(res.data);
    } catch (err) {
      console.error("Error fetching companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedIndustry, selectedStatus]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
    fetchCompanies();
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
            <Building2 className="w-6 h-6 text-brand-600" />
            Company Directory & Profiles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized registry of recruiting companies, contacts, and historical institutional engagements
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Company Profile (FR-006)
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by company name (e.g. Microsoft, Goldman Sachs)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Industry Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind === 'All' ? 'All Industries' : ind}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Company Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No companies found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search criteria or register a new company.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white shadow"
          >
            Create Company Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <div
              key={c.company_id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {c.name}
                    </h3>
                    <span className="inline-block text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.industry}
                    </span>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {c.address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}

                {c.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    {c.notes}
                  </p>
                )}

                {/* Badges for counts */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="block font-bold text-slate-900 dark:text-white">{c.contacts_count || 0}</span>
                    <span className="text-[10px] text-slate-400">Contacts</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="block font-bold text-slate-900 dark:text-white">{c.visits_count || 0}</span>
                    <span className="text-[10px] text-slate-400">Visits</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="block font-bold text-slate-900 dark:text-white">{c.activities_count || 0}</span>
                    <span className="text-[10px] text-slate-400">Drives</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                <button
                  onClick={() => setVisitModalCompanyId(c.company_id)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-brand-600" /> Record Visit
                </button>

                <button
                  onClick={() => navigate(`/companies/${c.company_id}`)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 flex items-center gap-1 transition-colors"
                >
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateCompanyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={showToast}
      />
      <RecordVisitModal
        isOpen={!!visitModalCompanyId}
        initialCompanyId={visitModalCompanyId}
        onClose={() => setVisitModalCompanyId(null)}
        onSuccess={showToast}
      />
    </div>
  );
};
