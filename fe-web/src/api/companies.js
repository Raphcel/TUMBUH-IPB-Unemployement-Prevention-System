/**
 * Companies API — list, get, create, update.
 */
import api from './client';

export const companiesApi = {
  list(skip = 0, limit = 100) {
    return api.get(`/companies/?skip=${skip}&limit=${limit}`);
  },

  get(id) {
    return api.get(`/companies/${id}`);
  },

  create(payload) {
    return api.post('/companies/', payload);
  },

  update(id, payload) {
    return api.put(`/companies/${id}`, payload);
  },
};

export default companiesApi;
