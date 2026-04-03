// ── api.js — All API calls to the backend ──────────────────────
import dotenv from 'dotenv';
dotenv.config()
const BASE = '/api';
console.log(process.env.API)
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

const API = {
  health:    ()                 => fetchJSON(`${BASE}/health`),
  stats:     ()                 => fetchJSON(`${BASE}/stats`),
  placed:    ()                 => fetchJSON(`${BASE}/placed`),
  batches:   ()                 => fetchJSON(`${BASE}/batches`),
  companies: ()                 => fetchJSON(`${BASE}/companies`),
  mentors:   ()                 => fetchJSON(`${BASE}/mentors`),
  mentor:    (name)             => fetchJSON(`${BASE}/mentors/${encodeURIComponent(name)}`),
  student:   (uid)              => fetchJSON(`${BASE}/students/${uid}`),

  students: ({
    search = '', status = 'all', resume = 'all',
    batch = 'all', mentor = 'all',
    page = 1, limit = 20,
    sortBy = 'name', sortDir = 'asc'
  } = {}) => {
    const params = new URLSearchParams({ search, status, resume, batch, mentor, page, limit, sortBy, sortDir });
    return fetchJSON(`${BASE}/students?${params}`);
  }
};

window.API = API;
