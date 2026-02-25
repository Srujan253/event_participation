let envApiUrl = import.meta.env.VITE_API_URL || '';
if (envApiUrl && !envApiUrl.endsWith('/api') && !envApiUrl.endsWith('/api/')) {
    envApiUrl = envApiUrl.endsWith('/') ? `${envApiUrl}api` : `${envApiUrl}/api`;
}
const API_BASE = envApiUrl || '/api';

// Helper: get stored token
const getToken = () => localStorage.getItem('attendqr_token');

// Helper: build auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── AUTH ────────────────────────────────
export const registerAdmin = async (data) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error('[registerAdmin] HTTP', res.status, json);
    throw new Error(json.message || 'Registration failed');
  }
  return json;
};

export const loginAdmin = async (data) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Login failed');
    err.status = json.status; // 'pending' | 'rejected'
    throw err;
  }
  return json;
};

export const getMe = () =>
  fetch(`${API_BASE}/auth/me`, { headers: authHeaders() }).then((r) => r.json());

// ─── EVENTS ──────────────────────────────
export const createEvent = (data) =>
  fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const getEvents = () =>
  fetch(`${API_BASE}/events`, { headers: authHeaders() }).then((r) => r.json());

export const getEvent = (id) =>
  fetch(`${API_BASE}/events/${id}`, { headers: authHeaders() }).then((r) => r.json());

export const getEventStats = (id) =>
  fetch(`${API_BASE}/events/${id}/stats`, { headers: authHeaders() }).then((r) => r.json());

export const deleteEvent = (id) =>
  fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => r.json());

// ─── ATTENDANCE ───────────────────────────
export const verifyToken = (token) =>
  fetch(`${API_BASE}/attendance/verify/${token}`).then((r) => r.json());

export const submitCheckin = (data) =>
  fetch(`${API_BASE}/attendance/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const getAttendanceRecords = (eventId) =>
  fetch(`${API_BASE}/attendance/event/${eventId}`, { headers: authHeaders() }).then((r) =>
    r.json()
  );

export const exportAttendanceCSV = async (eventId, eventName) => {
  const res = await fetch(`${API_BASE}/attendance/event/${eventId}/export`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventName || 'attendance'}_list.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


// ─── SUPER ADMIN ──────────────────────────
export const getSuperAdminStats = () =>
  fetch(`${API_BASE}/superadmin/stats`, { headers: authHeaders() }).then((r) => r.json());

export const getSuperAdminRequests = () =>
  fetch(`${API_BASE}/superadmin/requests`, { headers: authHeaders() }).then((r) => r.json());

export const updateAdminRequest = (id, status) =>
  fetch(`${API_BASE}/superadmin/requests/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  }).then((r) => r.json());

export const getSuperAdminAdmins = () =>
  fetch(`${API_BASE}/superadmin/admins`, { headers: authHeaders() }).then((r) => r.json());

export const deleteSuperAdminAdmin = (id) =>
  fetch(`${API_BASE}/superadmin/admins/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => r.json());

export const createSuperAdmin = (data) =>
  fetch(`${API_BASE}/superadmin/create-superadmin`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const listSuperAdmins = () =>
  fetch(`${API_BASE}/superadmin/superadmins`, { headers: authHeaders() }).then((r) => r.json());

