// ── utils.js — Shared helper functions ─────────────────────────

const BC = { Ramanujan: '#4f8ef7', Hopper: '#7c3aed', Turing: '#22c55e' };

function statusBadge(s) {
  if (!s) return '<span class="badge na">—</span>';
  const sl = s.toLowerCase();
  if (sl === 'placed')             return '<span class="badge placed">Placed</span>';
  if (sl === 'entrepreneurship')   return '<span class="badge entrepreneurship">Entrepreneur</span>';
  if (sl === 'already working')    return '<span class="badge working">Already Working</span>';
  if (sl.includes('internal'))     return '<span class="badge internalcp">Internal CP</span>';
  if (sl.includes('external'))     return '<span class="badge na">External Offer</span>';
  if (sl.includes('back'))         return '<span class="badge na">Back to Placement</span>';
  return `<span class="badge na">${s}</span>`;
}

function resumeBadge(r) {
  if (!r)                          return '<span class="badge na">⏳ Pending</span>';
  if (r === 'Approved')            return '<span class="badge approved">✓ Approved</span>';
  if (r === 'Correction Required') return '<span class="badge correction">⚠ Correction</span>';
  if (r === 'Resume Not required') return '<span class="badge na">Not Required</span>';
  return `<span class="badge na">${r}</span>`;
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

function drawDonut(arcId, legId, cenId, data, center) {
  const r = 54, cx = 70, cy = 70, C = 2 * Math.PI * r;
  const total = data.reduce((a, b) => a + b.val, 0) || 1;
  let off = 0;
  document.getElementById(arcId).innerHTML = data
    .filter(d => d.val > 0)
    .map(d => {
      const p = d.val / total, dash = p * C, gap = C - dash, rot = (off / total) * 360 - 90;
      off += d.val;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="20"
        stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
        transform="rotate(${rot.toFixed(2)} ${cx} ${cy})"/>`;
    }).join('');
  document.getElementById(cenId).textContent = center;
  document.getElementById(legId).innerHTML = data
    .filter(d => d.val > 0)
    .map(d => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${d.color}"></div>
        <div class="legend-label">${d.label}</div>
        <div class="legend-val" style="color:${d.color}">${d.val}</div>
      </div>`).join('');
}

function updateTime() {
  const el = document.getElementById('lastUpdate');
  if (el) el.textContent = 'Updated: ' + new Date().toLocaleString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short'
  });
}

function showLoading(containerId, cols = 8) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="loading"><div class="spinner"></div> Loading...</div>`;
}

function showError(containerId, msg) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="error-msg">⚠ ${msg}</div>`;
}

window.Utils = { statusBadge, resumeBadge, getInitials, drawDonut, updateTime, showLoading, showError, BC };
