# NST — ADYPU Internship Portal

Full-stack internship placement dashboard for Newton School of Technology, Ajeenkya DY Patil University.

---

## 📁 Project Structure

```
NST_ADYPU_Portal/
├── backend/
│   ├── server.js              # Express REST API server
│   ├── students_data.json     # Student data (314 students)
│   └── package.json           # Node dependencies
│
├── frontend/
│   ├── public/                # Served by Express (production)
│   │   ├── index.html         # Main dashboard HTML
│   │   ├── css/styles.css     # All styles
│   │   └── js/
│   │       ├── api.js         # API fetch functions
│   │       ├── utils.js       # Shared helpers (badges, charts)
│   │       └── app.js         # Main app logic
│   └── src/                   # Source files (edit these)
│       ├── css/styles.css
│       └── js/
│           ├── api.js
│           ├── utils.js
│           └── app.js
│
└── README.md
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the server
```bash
npm start
```

### 3. Open the dashboard
```
http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | /api/health           | Server health check                      |
| GET    | /api/stats            | All KPI stats                            |
| GET    | /api/students         | Students with filter/search/pagination   |
| GET    | /api/students/:uid    | Single student by UID                    |
| GET    | /api/mentors          | All mentors + student lists              |
| GET    | /api/mentors/:name    | Single mentor detail                     |
| GET    | /api/companies        | Companies with placed students           |
| GET    | /api/batches          | Batch breakdown                          |
| GET    | /api/placed           | All placed students                      |

### Query Parameters for /api/students
| Param   | Default | Example         |
|---------|---------|-----------------|
| search  | ''      | ?search=Rohan   |
| status  | all     | ?status=Placed  |
| resume  | all     | ?resume=Approved|
| batch   | all     | ?batch=Turing   |
| page    | 1       | ?page=2         |
| limit   | 20      | ?limit=50       |
| sortBy  | name    | ?sortBy=batch   |
| sortDir | asc     | ?sortDir=desc   |

---

## 📊 Dashboard Features

- **Overview** — 8 KPI cards, donut charts, bar charts, live placed students ticker
- **All Students** — Searchable + filterable table (Status / Resume / Batch) with column sorting & pagination
- **Mentors** — Cards with stats + expandable student list per mentor
- **Companies** — All internship companies with placed students
- **API Docs** — In-app REST API reference

---

## 🛠 Tech Stack

| Layer    | Tech                     |
|----------|--------------------------|
| Backend  | Node.js + Express        |
| Frontend | Vanilla HTML/CSS/JS      |
| Data     | JSON (from Excel)        |
| Fonts    | Space Grotesk, JetBrains Mono |

---

## 🔄 Updating Data

To update with new Excel data:
1. Run the Python extraction script (see original Excel file)
2. Replace `backend/students_data.json` with the new JSON
3. Restart the server — changes reflect immediately

---

## 🌐 Deploy Online (Free)

### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

### Render
1. Push to GitHub
2. New Web Service → connect repo
3. Root directory: `backend`
4. Start command: `npm start`

### Vercel (Frontend only)
Deploy the `frontend/public` folder for a static version.
