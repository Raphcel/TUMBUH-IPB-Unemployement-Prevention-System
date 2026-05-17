/**
 * Company follows API - student follow/unfollow state for companies.
 */
import api from './client';

export const companyFollowsApi = {
  mine(skip = 0, limit = 100) {
    return api.get(`/company-follows/?skip=${skip}&limit=${limit}`);
  },

  follow(companyId) {
    return api.post(`/company-follows/${companyId}`);
  },

  unfollow(companyId) {
    return api.delete(`/company-follows/${companyId}`);
  },

  status(companyId) {
    return api.get(`/company-follows/${companyId}/status`);
  },
};

export default companyFollowsApi;
