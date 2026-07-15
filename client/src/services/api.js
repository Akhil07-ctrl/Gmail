import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',           // Dynamic baseURL for production vs local proxy
  withCredentials: true,  // send httpOnly cookie on every request
});

// ── Auth ──────────────────────────────────────────────────────────────────
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const logout = () => api.post('/auth/logout').then((r) => r.data);

// ── Gmail ─────────────────────────────────────────────────────────────────
export const getProfile = () => api.get('/api/gmail/profile').then((r) => r.data);

export const getMessages = (params = {}) =>
  api.get('/api/gmail/messages', { params }).then((r) => r.data);

export const getMessage = (id) =>
  api.get(`/api/gmail/messages/${id}`).then((r) => r.data);

export const getLabels = () =>
  api.get('/api/gmail/labels').then((r) => r.data);

export const markAsRead = (id) =>
  api.post(`/api/gmail/messages/${id}/read`).then((r) => r.data);

export const toggleStar = (id, starred) =>
  api.post(`/api/gmail/messages/${id}/star`, { starred }).then((r) => r.data);

export default api;
