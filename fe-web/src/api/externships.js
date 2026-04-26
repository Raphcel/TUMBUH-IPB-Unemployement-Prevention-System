/**
 * Externships API — CRUD for student externship records.
 */
import api from './client';

export const externshipsApi = {
  /** Create a new externship */
  create(payload) {
    return api.post('/externships/', payload);
  },

  /** List my externships */
  mine(skip = 0, limit = 100) {
    return api.get(`/externships/me?skip=${skip}&limit=${limit}`);
  },

  /** Update an externship */
  update(id, payload) {
    return api.put(`/externships/${id}`, payload);
  },

  /** Delete an externship */
  delete(id) {
    return api.delete(`/externships/${id}`);
  },
};

export default externshipsApi;
