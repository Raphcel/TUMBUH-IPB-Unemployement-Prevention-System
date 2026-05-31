/**
 * Applications API — apply, list own, list by opportunity, update status.
 */
import api from './client';

export const applicationsApi = {
  /** Student: submit an application */
  apply(opportunityId, data = {}) {
    return api.post('/applications/', { opportunity_id: opportunityId, ...data });
  },

  /** Student: get an in-progress draft for one opportunity */
  getDraft(opportunityId) {
    return api.get(`/applications/drafts/${opportunityId}`);
  },

  /** Student: list in-progress drafts */
  listDrafts() {
    return api.get('/applications/drafts');
  },

  /** Student: save an in-progress draft for one opportunity */
  saveDraft(opportunityId, data = {}) {
    return api.put(`/applications/drafts/${opportunityId}`, data);
  },

  /** Student: delete an in-progress draft for one opportunity */
  deleteDraft(opportunityId) {
    return api.delete(`/applications/drafts/${opportunityId}`);
  },

  /** Student: update a submitted application before the deadline */
  updateMine(applicationId, data = {}) {
    return api.patch(`/applications/me/${applicationId}`, data);
  },

  /** Student: list my applications */
  mine(skip = 0, limit = 100) {
    return api.get(`/applications/me?skip=${skip}&limit=${limit}`);
  },

  /** HR: list applicants for a specific opportunity */
  listByOpportunity(opportunityId, skip = 0, limit = 100) {
    return api.get(
      `/applications/opportunity/${opportunityId}?skip=${skip}&limit=${limit}`
    );
  },

  /** HR: update application status */
  updateStatus(applicationId, status) {
    return api.patch(`/applications/${applicationId}/status`, { status });
  },

  /** HR: bulk update application statuses */
  bulkUpdateStatus(applicationIds, status) {
    return api.patch('/applications/bulk-status', {
      application_ids: applicationIds,
      status,
    });
  },
};

export default applicationsApi;
