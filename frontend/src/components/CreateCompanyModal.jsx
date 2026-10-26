import React, { useState } from 'react';
import { Modal } from './Modal';
import { createCompanyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Globe, MapPin, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

const COMMON_INDUSTRIES = [
  'Software & IT',
  'FinTech & Banking',
  'E-Commerce & Cloud',
  'Networking & Cybersecurity',
  'Digital Media & Software',
  'IT Consulting & Services',
  'Hardware & Semiconductors',
  'FoodTech & Logistics',
  'Automotive & EV',
  'Healthcare & Pharma'
];

export const CreateCompanyModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState(COMMON_INDUSTRIES[0]);
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!name.trim()) {
      setErrors(["Company name is required."]);
      return;
    }

    try {
      setSubmitting(true);
      await createCompanyApi({
        name: name.trim(),
        industry: industry.trim(),
        website: website.trim() || null,
        address: address.trim() || null,
        status: status,
        notes: notes.trim() || null
      }, user?.user_id);

      setName('');
      setWebsite('');
      setAddress('');
      setNotes('');
      onSuccess?.("Company profile created successfully.");
      onClose();
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.detail) {
        setErrors([typeof respData.detail === 'string' ? respData.detail : JSON.stringify(respData.detail)]);
      } else {
        setErrors(["Could not create company profile. Please check inputs."]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Company Profile (FR-006)" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}

        {/* Company Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              placeholder="e.g. Google India, Apple, NVIDIA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Industry / Sector <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              {COMMON_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Website URL
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="url"
              placeholder="https://careers.company.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Address / Development Center
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="City, State, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Initial Engagement Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          >
            <option value="ACTIVE">ACTIVE (Eligible for visits and drives)</option>
            <option value="INACTIVE">INACTIVE (Not currently participating)</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Engagement Notes
          </label>
          <textarea
            rows={2}
            placeholder="Special hiring preferences, GPA cutoffs, alumni connections..."
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
            {submitting ? 'Creating...' : <><CheckCircle2 className="w-4 h-4" /> Create Profile</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};
