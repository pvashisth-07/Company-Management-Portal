import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const loginApi = (email, password) => api.post('/auth/login', { email, password });
export const registerApi = (userData) => api.post('/auth/register', userData);
export const getAllUsersApi = () => api.get('/auth/users');

// Companies
export const getCompaniesApi = (params) => api.get('/companies', { params });
export const getCompanyDetailApi = (companyId) => api.get(`/companies/${companyId}`);
export const createCompanyApi = (companyData, userId) => 
  api.post('/companies', companyData, { params: { user_id: userId } });
export const updateCompanyApi = (companyId, companyData, userId) => 
  api.put(`/companies/${companyId}`, companyData, { params: { user_id: userId } });
export const deactivateCompanyApi = (companyId, userId) => 
  api.delete(`/companies/${companyId}`, { params: { user_id: userId } });

// Contacts
export const getContactsByCompanyApi = (companyId) => api.get(`/contacts/company/${companyId}`);
export const createContactApi = (contactData, userId) => 
  api.post('/contacts', contactData, { params: { user_id: userId } });
export const updateContactApi = (contactId, contactData, userId) => 
  api.put(`/contacts/${contactId}`, contactData, { params: { user_id: userId } });
export const deleteContactApi = (contactId, userId) => 
  api.delete(`/contacts/${contactId}`, { params: { user_id: userId } });

// Visits (UC-006)
export const getVisitsApi = (companyId) => 
  api.get('/visits', { params: companyId ? { company_id: companyId } : {} });
export const getVisitByIdApi = (visitId) => api.get(`/visits/${visitId}`);
export const recordVisitApi = (visitData, userId) => 
  api.post('/visits', visitData, { params: { user_id: userId } });

// Recruitment Activities (UC-008)
export const getActivitiesApi = (params) => api.get('/activities', { params });
export const getActivityByIdApi = (activityId) => api.get(`/activities/${activityId}`);
export const createActivityApi = (activityData, userId) => 
  api.post('/activities', activityData, { params: { user_id: userId } });
export const updateActivityApi = (activityId, activityData, userId) => 
  api.put(`/activities/${activityId}`, activityData, { params: { user_id: userId } });
export const submitActivityApi = (activityId, userId) => 
  api.post(`/activities/${activityId}/submit`, null, { params: { user_id: userId } });
export const cancelActivityApi = (activityId, userId) => 
  api.post(`/activities/${activityId}/cancel`, null, { params: { user_id: userId } });
export const progressActivityStatusApi = (activityId, newStatus, userId) => 
  api.post(`/activities/${activityId}/progress-status`, null, { params: { new_status: newStatus, user_id: userId } });

// Approvals (UC-009)
export const getApprovalQueueApi = () => api.get('/approvals/queue');
export const getApprovalHistoryApi = () => api.get('/approvals/history');
export const decideActivityApi = (activityId, decision, comments, approverId) => 
  api.post(`/approvals/${activityId}/decide`, { decision, comments }, { params: { approver_id: approverId } });

// Engagement Timeline
export const getCompanyTimelineApi = (companyId, includeArchived = false) => 
  api.get(`/engagement/company/${companyId}`, { params: { include_archived: includeArchived } });
export const archiveEngagementRecordApi = (recordId) => 
  api.post(`/engagement/record/${recordId}/archive`);

// Reports & Analytics
export const getDashboardStatsApi = () => api.get('/reports/dashboard-stats');
export const getExportUrl = (type) => `http://127.0.0.1:8000/api/reports/export/${type}-csv`;

// Admin
export const getAdminUsersApi = (adminId) => api.get('/admin/users', { params: { admin_id: adminId } });
export const updateUserRoleOrStatusApi = (targetUserId, updateData, adminId) => 
  api.put(`/admin/users/${targetUserId}`, updateData, { params: { admin_id: adminId } });

export default api;
