/**
 * Users API — get/update profile, file uploads.
 */
import api, { getToken } from './client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const usersApi = {
  /** Get a user by ID */
  get(id) {
    return api.get(`/users/${id}`);
  },

  /** Update current user profile */
  update(payload) {
    return api.put('/users/me', payload);
  },

  /** Upload avatar image */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/users/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || 'Failed to upload avatar');
    }
    return res.json();
  },

  /** Upload CV (PDF) */
  async uploadCV(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/users/me/cv`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || 'Failed to upload CV');
    }
    return res.json();
  },
};

export default usersApi;
