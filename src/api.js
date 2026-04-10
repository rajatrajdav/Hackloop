const BASE_URL = "/api";

const getToken = () => localStorage.getItem("token");

const headers = (auth = false) => ({
  "Content-Type": "application/json",
  ...(auth && { Authorization: `Bearer ${getToken()}` }),
});

const handleRes = async (res) => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

// ── AUTH ──────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, password }),
    }).then(handleRes),

  register: (name, email, password, role) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ name, email, password, role }),
    }).then(handleRes),

  me: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: headers(true) }).then(handleRes),

  updateProfile: (data) =>
    fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify(data),
    }).then(handleRes),
};

// ── EVENTS ────────────────────────────────────────
export const eventsAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/events${q ? "?" + q : ""}`, {
      headers: headers(true),
    }).then(handleRes);
  },

  getOne: (id) =>
    fetch(`${BASE_URL}/events/${id}`, { headers: headers(true) }).then(handleRes),

  getMine: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/events/organizer/mine${q ? "?" + q : ""}`, {
      headers: headers(true),
    }).then(handleRes);
  },

  create: (data) =>
    fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify(data),
    }).then(handleRes),

  update: (id, data) =>
    fetch(`${BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify(data),
    }).then(handleRes),

  delete: (id) =>
    fetch(`${BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: headers(true),
    }).then(handleRes),
};

// ── REGISTRATIONS ─────────────────────────────────
export const registrationsAPI = {
  register: (eventId) =>
    fetch(`${BASE_URL}/registrations/${eventId}`, {
      method: "POST",
      headers: headers(true),
    }).then(handleRes),

  cancel: (eventId) =>
    fetch(`${BASE_URL}/registrations/${eventId}`, {
      method: "DELETE",
      headers: headers(true),
    }).then(handleRes),

  myEvents: () =>
    fetch(`${BASE_URL}/registrations/my/events`, {
      headers: headers(true),
    }).then(handleRes),

  getParticipants: (eventId) =>
    fetch(`${BASE_URL}/registrations/event/${eventId}`, {
      headers: headers(true),
    }).then(handleRes),

  updateStatus: (eventId, student_id, status) =>
    fetch(`${BASE_URL}/registrations/${eventId}/status`, {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify({ student_id, status }),
    }).then(handleRes),
};

// ── SAVED EVENTS ──────────────────────────────────
export const savedAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/saved`, { headers: headers(true) }).then(handleRes),

  save: (eventId) =>
    fetch(`${BASE_URL}/saved/${eventId}`, {
      method: "POST",
      headers: headers(true),
    }).then(handleRes),

  unsave: (eventId) =>
    fetch(`${BASE_URL}/saved/${eventId}`, {
      method: "DELETE",
      headers: headers(true),
    }).then(handleRes),
};

// ── INTERESTS ─────────────────────────────────────
export const interestsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/interests`, { headers: headers(true) }).then(handleRes),

  add: (interest) =>
    fetch(`${BASE_URL}/interests`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ interest }),
    }).then(handleRes),

  remove: (interest) =>
    fetch(`${BASE_URL}/interests/${interest}`, {
      method: "DELETE",
      headers: headers(true),
    }).then(handleRes),
};

// ── BROADCASTS ────────────────────────────────────
export const broadcastsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/broadcasts`, { headers: headers(true) }).then(handleRes),

  send: (data) =>
    fetch(`${BASE_URL}/broadcasts`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify(data),
    }).then(handleRes),
};

// ── ANALYTICS ─────────────────────────────────────
export const analyticsAPI = {
  get: () =>
    fetch(`${BASE_URL}/analytics`, { headers: headers(true) }).then(handleRes),
};
