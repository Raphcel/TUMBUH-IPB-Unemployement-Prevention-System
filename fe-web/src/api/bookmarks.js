/**
 * Bookmarks API — add, remove, list, check.
 */
import api from './client';

export const bookmarksApi = {
  /** Add an opportunity to bookmarks */
  add(opportunityId) {
    return api.post('/bookmarks/', { opportunity_id: opportunityId });
  },

  /** Remove an opportunity from bookmarks */
  remove(opportunityId) {
    return api.delete(`/bookmarks/${opportunityId}`);
  },

  /** List all bookmarked opportunities */
  mine() {
    return api.get('/bookmarks/me');
  },

  /** Check if an opportunity is bookmarked */
  check(opportunityId) {
    return api.get(`/bookmarks/check/${opportunityId}`);
  },
};

export default bookmarksApi;
