import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { updateContactApi } from '../services/api';
import { User, Mail, Phone, Briefcase, Building, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EditContactModal = ({ isOpen, onClose, contact, onContactUpdated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        designation: contact.designation || '',
        email: contact.email || '',
        phone: contact.phone || '',
        department: contact.department || '',
      });
      setErrors({});
    }
  }, [contact, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Contact name is required';
    if (!formData.designation.trim()) errs.designation = 'Designation is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await updateContactApi(contact.contact_id, formData, user?.user_id);
      if (onContactUpdated) onContactUpdated(res.data);
      onClose();
    } catch (err) {
      setErrors({ form: err.response?.data?.detail || 'Failed to update contact details.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Company Contact"
      subtitle="FR-013: Update primary corporate contact person details"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-medium">
            {errors.form}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-brand-500" /> Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Priyanshu Dave"
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
            }`}
          />
          {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-500" /> Designation *
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Head of University Talent"
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 transition-all ${
                errors.designation
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.designation && <p className="text-[11px] text-red-500 mt-1">{errors.designation}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-500" /> Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Human Resources"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-500" /> Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. talent@company.com"
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-500" /> Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 98290 12345"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Update Contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
