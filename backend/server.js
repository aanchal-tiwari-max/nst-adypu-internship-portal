const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ─── Load Data ────────────────────────────────────────────────
let STUDENTS = [];
try {
  const raw = fs.readFileSync(path.join(__dirname, 'students_data.json'), 'utf-8');
  STUDENTS = JSON.parse(raw);
  console.log(`✅ Loaded ${STUDENTS.length} students from data file`);
} catch (err) {
  console.error('❌ Failed to load students_data.json:', err.message);
}

// ─── Helper: compute stats ────────────────────────────────────
function computeStats(data) {
  const total = data.length;
  const placed = data.filter(s => s.status === 'Placed').length;
  const entrepreneurship = data.filter(s => s.status === 'entrepreneurship').length;
  const alreadyWorking = data.filter(s => s.status === 'Already working').length;
  const internalCP = data.filter(s => s.status === 'Internal Placed CP').length;
  const externalOffer = data.filter(s => s.status === 'External Offer').length;
  const backToPlacement = data.filter(s => s.status === 'Back to Placement').length;
  const resumeApproved = data.filter(s => s.resume === 'Approved').length;
  const resumeCorrection = data.filter(s => s.resume === 'Correction Required').length;
  const resumeNotRequired = data.filter(s => s.resume === 'Resume Not required').length;
  const resumePending = data.filter(s => !s.resume).length;
  return {
    total, placed, entrepreneurship, alreadyWorking,
    internalCP, externalOffer, backToPlacement,
    resumeApproved, resumeCorrection, resumeNotRequired, resumePending,
    placementRate: total > 0 ? ((placed / total) * 100).toFixed(1) : '0.0',
    approvalRate: total > 0 ? ((resumeApproved / total) * 100).toFixed(1) : '0.0'
  };
}

// ─── API ROUTES ───────────────────────────────────────────────

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    totalStudents: STUDENTS.length
  });
});

// GET /api/stats - Dashboard KPI stats
app.get('/api/stats', (req, res) => {
  res.json(computeStats(STUDENTS));
});

// GET /api/students - All students with filtering, search, pagination, sort
app.get('/api/students', (req, res) => {
  const {
    search = '',
    status = 'all',
    resume = 'all',
    batch = 'all',
    mentor = 'all',
    page = 1,
    limit = 20,
    sortBy = 'name',
    sortDir = 'asc'
  } = req.query;

  let data = [...STUDENTS];

  // Search
  if (search.trim()) {
    const q = search.toLowerCase();
    data = data.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.uid.includes(q) ||
      (s.mentor || '').toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.batch.toLowerCase().includes(q) ||
      (s.company || '').toLowerCase().includes(q) ||
      (s.profile || '').toLowerCase().includes(q) ||
      s.enrollment.toLowerCase().includes(q)
    );
  }

  // Filters
  if (status !== 'all') {
    if (status === 'none') {
      data = data.filter(s => !s.status);
    } else {
      data = data.filter(s => (s.status || '').toLowerCase() === status.toLowerCase());
    }
  }
  if (resume !== 'all') {
    if (resume === 'none') {
      data = data.filter(s => !s.resume);
    } else {
      data = data.filter(s => s.resume === resume);
    }
  }
  if (batch !== 'all') data = data.filter(s => s.batch === batch);
  if (mentor !== 'all') data = data.filter(s => s.mentor === mentor);

  // Sort
  data.sort((a, b) => {
    const av = (a[sortBy] || '').toLowerCase();
    const bv = (b[sortBy] || '').toLowerCase();
    return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
  });

  // Pagination
  const total = data.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;
  const paginated = data.slice(start, start + limitNum);

  res.json({
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext: start + limitNum < total,
      hasPrev: pageNum > 1
    },
    stats: computeStats(data)
  });
});

// GET /api/students/:uid - Single student by UID
app.get('/api/students/:uid', (req, res) => {
  const student = STUDENTS.find(s => s.uid === req.params.uid);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// GET /api/mentors - All mentors with their student lists & stats
app.get('/api/mentors', (req, res) => {
  const mentorMap = {};
  STUDENTS.forEach(s => {
    const m = s.mentor || 'Unassigned';
    if (!mentorMap[m]) {
      mentorMap[m] = { name: m, students: [], placed: 0, approved: 0, correction: 0, entrepreneurship: 0 };
    }
    mentorMap[m].students.push(s);
    if (s.status === 'Placed') mentorMap[m].placed++;
    if (s.resume === 'Approved') mentorMap[m].approved++;
    if (s.resume === 'Correction Required') mentorMap[m].correction++;
    if (s.status === 'entrepreneurship') mentorMap[m].entrepreneurship++;
  });

  const mentors = Object.values(mentorMap)
    .filter(m => m.name !== 'Unassigned')
    .sort((a, b) => b.students.length - a.students.length)
    .map(m => ({
      ...m,
      total: m.students.length,
      placementRate: ((m.placed / m.students.length) * 100).toFixed(1)
    }));

  res.json(mentors);
});

// GET /api/mentors/:name - Single mentor with all their students
app.get('/api/mentors/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const students = STUDENTS.filter(s => s.mentor === name);
  if (students.length === 0) return res.status(404).json({ error: 'Mentor not found' });

  const placed = students.filter(s => s.status === 'Placed').length;
  const approved = students.filter(s => s.resume === 'Approved').length;
  const correction = students.filter(s => s.resume === 'Correction Required').length;

  res.json({
    name,
    total: students.length,
    placed,
    approved,
    correction,
    placementRate: ((placed / students.length) * 100).toFixed(1),
    students
  });
});

// GET /api/companies - All companies with placed students
app.get('/api/companies', (req, res) => {
  const companyMap = {};
  STUDENTS.forEach(s => {
    if (s.company && s.status === 'Placed') {
      if (!companyMap[s.company]) companyMap[s.company] = [];
      companyMap[s.company].push(s);
    }
  });

  const companies = Object.entries(companyMap)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, students]) => ({
      name,
      count: students.length,
      students
    }));

  res.json(companies);
});

// GET /api/batches - Batch breakdown
app.get('/api/batches', (req, res) => {
  const batches = {};
  STUDENTS.forEach(s => {
    if (!batches[s.batch]) batches[s.batch] = { name: s.batch, total: 0, placed: 0, approved: 0 };
    batches[s.batch].total++;
    if (s.status === 'Placed') batches[s.batch].placed++;
    if (s.resume === 'Approved') batches[s.batch].approved++;
  });
  res.json(Object.values(batches).sort((a, b) => b.total - a.total));
});

// GET /api/placed - All placed students with company info
app.get('/api/placed', (req, res) => {
  const placed = STUDENTS.filter(s => s.status === 'Placed' && s.company);
  res.json({ total: placed.length, students: placed });
});

// Catch-all: serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NST ADYPU Internship Portal`);
  console.log(`   Backend API : http://localhost:${PORT}/api`);
  console.log(`   Dashboard   : http://localhost:${PORT}`);
  console.log(`   Health      : http://localhost:${PORT}/api/health\n`);
});

module.exports = app;