/**
 * Base API client — wraps fetch with auth, JSON handling, error mapping,
 * 401 auto-logout, and AbortController support.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

/** Base URL for the backend server (without /api/v1) */
export const SERVER_BASE = API_BASE.replace(/\/api\/v1\/?$/, '');

/** Resolve a relative upload path (e.g. /uploads/avatars/1.jpg) to a full URL */
export function resolveUploadUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER_BASE}${path}`;
}

/* ─── Token helpers ─────────────────────────────────────────── */

let _token = localStorage.getItem('token');
let _refreshToken = localStorage.getItem('refreshToken');

export function setToken(token) {
  _token = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function setRefreshToken(token) {
  _refreshToken = token;
  if (token) {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
}

export function getToken() {
  return _token;
}

export function getRefreshToken() {
  return _refreshToken;
}

export function clearTokens() {
  setToken(null);
  setRefreshToken(null);
}

/* ─── Core request function ─────────────────────────────────── */

let _isRefreshing = false;

async function request(
  path,
  { method = 'GET', body, headers = {}, signal, ...opts } = {}
) {
  const cfg = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      ...headers,
    },
    ...(signal ? { signal } : {}),
    ...opts,
  };

  if (body !== undefined) {
    cfg.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, cfg);

  // 204 No Content
  if (res.status === 204) return null;

  // 401 — attempt refresh once, then logout
  if (res.status === 401 && _refreshToken && !_isRefreshing && !path.includes('/auth/')) {
    _isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: _refreshToken }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setToken(refreshData.access_token);
        setRefreshToken(refreshData.refresh_token);
        _isRefreshing = false;
        // Retry original request with new token
        return request(path, { method, body, headers, signal, ...opts });
      }
    } catch {
      // refresh failed
    }
    _isRefreshing = false;
    clearTokens();
    window.location.href = '/login';
    return;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ─── Convenience methods ───────────────────────────────────── */

export const api = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  patch: (path, body, opts) =>
    request(path, { method: 'PATCH', body, ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
};

export default api;
