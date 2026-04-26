/**
 * Notifications API — list, mark read.
 */
import api from './client';

export const notificationsApi = {
  /** List current user's notifications */
  list(skip = 0, limit = 50) {
    return api.get(`/notifications/?skip=${skip}&limit=${limit}`);
  },

  /** Mark a single notification as read */
  markRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  /** Mark all notifications as read */
  markAllRead() {
    return api.post('/notifications/read-all');
  },
};

export default notificationsApi;
