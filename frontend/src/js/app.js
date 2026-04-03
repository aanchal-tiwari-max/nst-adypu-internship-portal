// ── app.js — Main dashboard application logic ──────────────────

const { statusBadge, resumeBadge, getInitials, drawDonut, updateTime, BC } = Utils;

// ── State ─────────────────────────────────────────────────────
const state = {
  filterStatus: 'all',
  filterResume: 'all',
  filterBatch:  'all',
  search:       '',
  page:         1,
  sortBy:       'name',
  sortDir:      'asc',
  totalPages:   1
};

// ── Tab switching ─────────────────────────────────────────────
function switchTab(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  el.classList.add('active');
}
window.switchTab = switchTab;

// ── Filters ───────────────────────────────────────────────────
function toggleFilter(btn, type) {
  state['filter' + type.charAt(0).toUpperCase() + type.slice(1)] = btn.getAttribute('data-val');
  document.querySelectorAll(`.fbtn[data-type="${type}"]`)
    .forEach(b => b.classList.remove('active-status', 'active-resume', 'active-batch'));
  btn.classList.add(type === 'status' ? 'active-status' : type === 'resume' ? 'active-resume' : 'active-batch');
  state.page = 1;
  loadStudents();
}
window.toggleFilter = toggleFilter;

function clearAllFilters() {
  state.filterStatus = 'all';
  state.filterResume = 'all';
  state.filterBatch  = 'all';
  state.search       = '';
  state.page         = 1;
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active-status', 'active-resume', 'active-batch'));
  document.querySelectorAll('.fbtn[data-val="all"]').forEach(b => {
    const t = b.getAttribute('data-type');
    b.classList.add(t === 'status' ? 'active-status' : t === 'resume' ? 'active-resume' : 'active-batch');
  });
  loadStudents();
}
window.clearAllFilters = clearAllFilters;

function onSearch() {
  state.search = document.getElementById('searchInput').value;
  state.page   = 1;
  loadStudents();
}
window.onSearch = onSearch;

function sortTable(key) {
  if (state.sortBy === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
  else { state.sortBy = key; state.sortDir = 'asc'; }
  loadStudents();
}
window.sortTable = sortTable;

function changePage(d) {
  state.page = Math.max(1, Math.min(state.page + d, state.totalPages));
  loadStudents();
}
window.changePage = changePage;

// ── Load Students Table ───────────────────────────────────────
async function loadStudents() {
  const tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = '<tr><td colspan="10"><div class="loading"><div class="spinner"></div> Loading students...</div></td></tr>';

  try {
    const result = await API.students({
      search:  state.search,
      status:  state.filterStatus,
      resume:  state.filterResume,
      batch:   state.filterBatch,
      page:    state.page,
      limit:   20,
      sortBy:  state.sortBy,
      sortDir: state.sortDir
    });

    const { data, pagination } = result;
    state.totalPages = pagination.totalPages;

    document.getElementById('tableCount').textContent = `(${pagination.total} students)`;
    document.getElementById('pgInfo').textContent =
      pagination.total > 0
        ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`
        : '';
    document.getElementById('pgPrev').disabled = !pagination.hasPrev;
    document.getElementById('pgNext').disabled = !pagination.hasNext;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10"><div class="no-results">
        😕 No students match your filters.
        <button onclick="clearAllFilters()" style="color:var(--accent);background:none;border:none;cursor:pointer;font-size:0.9rem;">Clear filters</button>
      </div></td></tr>`;
      return;
    }

    const start = (pagination.page - 1) * pagination.limit;
    tbody.innerHTML = data.map((s, i) => `
      <tr>
        <td style="color:var(--muted);font-size:0.72rem">${start + i + 1}</td>
        <td><span class="uid-chip">${s.uid}</span></td>
        <td><strong style="color:#fff">${s.name}</strong></td>
        <td><span style="color:var(--muted);font-size:0.72rem">${s.enrollment}</span></td>
        <td><span style="color:${BC[s.batch] || '#94a3b8'};font-weight:600">${s.batch}</span></td>
        <td><span class="mentor-tag">${s.mentor || '—'}</span></td>
        <td>${statusBadge(s.status)}</td>
        <td>${resumeBadge(s.resume)}</td>
        <td>${s.company ? `<span class="company-tag">${s.company}</span>` : '<span style="color:var(--muted)">—</span>'}</td>
        <td style="color:var(--muted);font-size:0.75rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${s.profile || ''}">${s.profile || '—'}</td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="error-msg">⚠ Failed to load students: ${err.message}</div></td></tr>`;
  }
}

// ── Load Overview ─────────────────────────────────────────────
async function loadOverview() {
  try {
    const [stats, companies, batches, placed] = await Promise.all([
      API.stats(), API.companies(), API.batches(), API.placed()
    ]);

    const t = stats.total;
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card blue"><div class="stat-label">Total Students</div><div class="stat-val">${t}</div><div class="stat-sub">Across all batches</div><div class="stat-bar"><div class="stat-fill" style="width:100%"></div></div></div>
      <div class="stat-card green"><div class="stat-label">Placed</div><div class="stat-val">${stats.placed}</div><div class="stat-sub">${stats.placementRate}% of total</div><div class="stat-bar"><div class="stat-fill" style="width:${stats.placed/t*100}%"></div></div></div>
      <div class="stat-card purple"><div class="stat-label">Entrepreneurship</div><div class="stat-val">${stats.entrepreneurship}</div><div class="stat-sub">Running own ventures</div><div class="stat-bar"><div class="stat-fill" style="width:${stats.entrepreneurship/t*100}%"></div></div></div>
      <div class="stat-card orange"><div class="stat-label">Already Working</div><div class="stat-val">${stats.alreadyWorking}</div><div class="stat-sub">Pre-existing employment</div><div class="stat-bar"><div class="stat-fill" style="width:${stats.alreadyWorking/t*100}%"></div></div></div>
      <div class="stat-card cyan"><div class="stat-label">Internal CP Placed</div><div class="stat-val">${stats.internalCP}</div><div class="stat-sub">Competitive programming</div><div class="stat-bar"><div class="stat-fill" style="width:${stats.internalCP/t*100}%"></div></div></div>
      <div class="stat-card yellow"><div class="stat-label">External Offer</div><div class="stat-val">${stats.externalOffer}</div><div class="stat-sub">Offers outside portal</div><div class="stat-bar"><div class="stat-fill" style="width:${stats.externalOffer/t*100}%"></div></div></div>
      <div class="stat-card green"><div class="stat-label">Resume Approved</div><div class="stat-val">${stats.resumeApproved}</div><div class="stat-sub">${stats.approvalRate}% approval rate</div><div class="stat-bar"><div class="stat-fill" style="width:${stats.resumeApproved/t*100}%"></div></div></div>
      <div class="stat-card red"><div class="stat-label">Correction Required</div><div class="stat-val">${stats.resumeCorrection}</div><div class="stat-sub">Needs resume fixes</div><div class="stat-bar"><div class="stat-fill" style="width:${stats.resumeCorrection/t*100}%"></div></div></div>`;

    drawDonut('donutArcs', 'donutLegend', 'donutCenter', [
      { label: 'Placed',        val: stats.placed,         color: '#4f8ef7' },
      { label: 'Entrepreneur',  val: stats.entrepreneurship,color: '#7c3aed' },
      { label: 'Already Working',val: stats.alreadyWorking, color: '#f97316' },
      { label: 'Internal CP',   val: stats.internalCP,     color: '#06b6d4' },
      { label: 'External',      val: stats.externalOffer,  color: '#94a3b8' },
      { label: 'Seeking',       val: t - stats.placed - stats.entrepreneurship - stats.alreadyWorking - stats.internalCP - stats.externalOffer, color: '#1e2535' }
    ], t);

    drawDonut('resumeArcs', 'resumeLegend', 'resumeCenter', [
      { label: 'Approved',      val: stats.resumeApproved,    color: '#22c55e' },
      { label: 'Correction Req.',val: stats.resumeCorrection, color: '#f59e0b' },
      { label: 'Not Required',  val: stats.resumeNotRequired, color: '#ef4444' },
      { label: 'Pending',       val: stats.resumePending,     color: '#1e2535' }
    ], stats.resumeApproved + stats.resumeCorrection);

    const cols = ['#4f8ef7', '#7c3aed', '#22c55e', '#06b6d4', '#f59e0b', '#f97316', '#ef4444', '#94a3b8'];
    const topCompanies = companies.slice(0, 8);
    const maxC = topCompanies[0]?.count || 1;
    document.getElementById('companiesBar').innerHTML = topCompanies.map(({ name, count }, i) => `
      <div class="bar-row">
        <div class="bar-name" title="${name}">${name}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${count/maxC*100}%;background:${cols[i%8]}"><span class="bar-fill-label">${count}</span></div></div>
        <div class="bar-count" style="color:${cols[i%8]}">${count}</div>
      </div>`).join('');

    const maxB = batches[0]?.total || 1;
    document.getElementById('batchBar').innerHTML = batches.map(b => `
      <div class="bar-row">
        <div class="bar-name">${b.name}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${b.total/maxB*100}%;background:${BC[b.name]||'#64748b'}"><span class="bar-fill-label">${b.total}</span></div></div>
        <div class="bar-count" style="color:${BC[b.name]||'#64748b'}">${b.total}</div>
      </div>`).join('');

    // Ticker
    const ti = placed.students.filter(s => s.company).map(s =>
      `<div class="ticker-item"><div class="dot"></div><strong>${s.name}</strong> → ${s.company} · ${s.profile || 'Intern'}</div>`
    ).join('');
    document.getElementById('tickerContent').innerHTML = ti + ti;

  } catch (err) {
    document.getElementById('statsGrid').innerHTML = `<div class="error-msg">⚠ Failed to load overview: ${err.message}</div>`;
  }
}

// ── Load Mentors ──────────────────────────────────────────────
async function loadMentors() {
  const grid = document.getElementById('mentorGrid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading mentors...</div>';
  try {
    const mentors = await API.mentors();
    grid.innerHTML = mentors.map((m, idx) => {
      const id = 'mentor-' + idx;
      const initials = getInitials(m.name);
      const studentRows = m.students.map((s, i) => `
        <div class="student-row">
          <div>
            <div class="sr-name">${i+1}. ${s.name} <span class="uid-chip" style="margin-left:6px">#${s.uid}</span></div>
            <div style="display:flex;gap:6px;align-items:center;margin-top:3px;flex-wrap:wrap;">
              <span class="sr-batch" style="background:${BC[s.batch]||'#94a3b8'}22;color:${BC[s.batch]||'#94a3b8'};border:1px solid ${BC[s.batch]||'#94a3b8'}44">${s.batch}</span>
              ${s.enrollment ? `<span style="font-size:0.65rem;color:var(--muted)">${s.enrollment}</span>` : ''}
            </div>
          </div>
          <div class="sr-right">
            ${statusBadge(s.status)}
            ${resumeBadge(s.resume)}
            ${s.company ? `<span style="font-size:0.68rem;color:var(--cyan);font-weight:500">🏢 ${s.company}</span>` : ''}
          </div>
        </div>`).join('');
      return `
        <div class="mentor-card">
          <div class="mentor-header">
            <div class="mentor-top">
              <div class="mentor-avatar">${initials}</div>
              <div>
                <div class="mentor-name">${m.name}</div>
                <div class="mentor-count">${m.total} students · ${m.placementRate}% placed</div>
              </div>
            </div>
            <div class="mentor-stats">
              <div class="ms-item b"><div class="ms-val">${m.total}</div><div class="ms-label">Total</div></div>
              <div class="ms-item g"><div class="ms-val">${m.placed}</div><div class="ms-label">Placed</div></div>
              <div class="ms-item y"><div class="ms-val">${m.approved}</div><div class="ms-label">Approved</div></div>
              <div class="ms-item r"><div class="ms-val">${m.correction}</div><div class="ms-label">Correction</div></div>
            </div>
          </div>
          <div class="mentor-students-header" onclick="toggleStudentList('${id}')">
            <span class="ms-toggle-label">👥 <span id="slabel-${id}">View Students ▾</span></span>
            <span style="font-size:0.72rem;color:var(--muted)">${m.total} students</span>
          </div>
          <div class="student-list" id="sl-${id}">${studentRows}</div>
        </div>`;
    }).join('');
  } catch (err) {
    grid.innerHTML = `<div class="error-msg">⚠ Failed to load mentors: ${err.message}</div>`;
  }
}

// ── Load Companies ────────────────────────────────────────────
async function loadCompanies() {
  const grid = document.getElementById('companyGrid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading companies...</div>';
  try {
    const companies = await API.companies();
    grid.innerHTML = companies.map(({ name, count, students }) => `
      <div class="company-card">
        <div class="company-name">🏢 ${name}</div>
        <div class="company-count">${count} intern${count > 1 ? 's' : ''}</div>
        <div class="company-students">
          ${students.slice(0, 5).map(s => `<div class="company-student">• ${s.name}</div>`).join('')}
          ${students.length > 5 ? `<div class="company-student" style="color:var(--accent);font-size:0.65rem">+${students.length - 5} more</div>` : ''}
        </div>
      </div>`).join('');
  } catch (err) {
    grid.innerHTML = `<div class="error-msg">⚠ Failed to load companies: ${err.message}</div>`;
  }
}

// ── Toggle mentor student list ────────────────────────────────
function toggleStudentList(id) {
  const list  = document.getElementById('sl-' + id);
  const label = document.getElementById('slabel-' + id);
  const open  = list.classList.toggle('open');
  label.textContent = open ? 'Hide Students ▴' : 'View Students ▾';
}
window.toggleStudentList = toggleStudentList;

// ── Boot ──────────────────────────────────────────────────────
async function init() {
  updateTime();
  setInterval(updateTime, 30000);
  await Promise.all([loadOverview(), loadStudents(), loadMentors(), loadCompanies()]);
}

document.addEventListener('DOMContentLoaded', init);
