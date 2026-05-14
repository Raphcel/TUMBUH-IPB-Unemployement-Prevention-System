import api from './client';

export const resumesApi = {
  listMine() {
    return api.get('/resumes/me');
  },

  create(payload) {
    return api.post('/resumes/me', payload);
  },

  get(id) {
    return api.get(`/resumes/${id}`);
  },

  update(id, payload) {
    return api.put(`/resumes/${id}`, payload);
  },

  remove(id) {
    return api.delete(`/resumes/${id}`);
  },
};

export default resumesApi;
