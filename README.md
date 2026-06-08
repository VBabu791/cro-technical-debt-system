# CRO Technical Debt Assessment System

A full-stack real-time web application that helps a Chief Revenue Officer (CRO) identify how technical debt impacts revenue generation, customer acquisition, retention, CRM performance, and sales operations.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Chart.js |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Export | jsPDF + xlsx |
| Deploy (FE) | Vercel |
| Deploy (BE) | Railway |

---

## Features

- **Real-time Dashboard** — Live KPI cards update instantly via Socket.io when any team member submits data
- **Technical Debt Assessment** — 6-dimension weighted scoring model
- **Revenue Impact Analysis** — Downtime cost calculation with risk classification
- **Customer Churn Module** — Churn/retention rates with trend charts
- **Lead Conversion Module** — Funnel analysis against industry benchmarks
- **Recommendation Engine** — AI-powered action plans based on debt score
- **Reports** — PDF & Excel export for all modules
- **Admin Panel** — User management and system config
- **JWT Authentication** — Secure register/login with bcrypt hashing

---

## Local Development

### Prerequisites
- Node.js v18+
- MySQL 8+

### 1. Clone & setup database

```bash
git clone <your-repo>
cd cro-technical-debt-system

# Create database
mysql -u root -p < database/cro_technical_debt.sql
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials

npm install
npm run dev     # Runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# .env: VITE_API_URL=http://localhost:5000/api

npm install
npm run dev     # Runs on http://localhost:3000
```

### Demo credentials
| Email | Password | Role |
|---|---|---|
| admin@cro.com | Admin@123 | Admin |
| cro@cro.com | Admin@123 | CRO User |

---

## Deploy to Vercel + Railway

### Step 1 — Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **Deploy from GitHub Repo** → select your repo → set **Root Directory** to `backend`
3. Add a **MySQL** plugin: click **+ New** → **Database** → **MySQL**
4. Railway auto-injects `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` — update your `config/db.js` to use these OR set manual env vars:

```
PORT=5000
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
```

5. In Railway MySQL shell, run the SQL from `database/cro_technical_debt.sql`
6. Copy your Railway backend URL (e.g. `https://cro-backend.railway.app`)

### Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL = https://cro-backend.railway.app/api
   ```
4. Click **Deploy**

### Step 3 — Update CORS

Back in Railway, update `FRONTEND_URL` to your Vercel URL:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/profile` | Get current user (auth required) |

### Assessments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/assessments` | Get all assessments |
| POST | `/api/assessments` | Create assessment (triggers real-time event) |
| PUT | `/api/assessments/:id` | Update assessment |
| DELETE | `/api/assessments/:id` | Delete assessment |

### Revenue / Churn / Leads
Same pattern: `GET /api/{route}` and `POST /api/{route}`

### Admin (Admin role only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

---

## Real-time Events (Socket.io)

| Event | Direction | Payload |
|---|---|---|
| `join:dashboard` | Client → Server | `{ userId }` |
| `assessment:new` | Server → Client | Assessment object |
| `revenue:new` | Server → Client | Revenue object |
| `churn:new` | Server → Client | Churn object |
| `leads:new` | Server → Client | Leads object |
| `users:count` | Server → Client | `{ count }` |

---

## Technical Debt Formula

```
Final Score = (CRM × 0.25) + (Website × 0.20) + (Customer × 0.20)
            + (Integration × 0.15) + (Data × 0.10) + (Reporting × 0.10)
```

**Risk Levels:**
- Score ≥ 80 → Low Debt
- Score 60–79 → Moderate Debt
- Score < 60 → High Debt (immediate action required)

---

## Folder Structure

```
cro-technical-debt-system/
├── frontend/
│   ├── src/
│   │   ├── components/     Layout, LiveFeed
│   │   ├── pages/          Dashboard, Assessment, Revenue, Churn, Leads, Recommendations, Reports, AdminPanel, Login, Register
│   │   ├── services/       api.js (Axios)
│   │   ├── hooks/          useAuth.jsx, useSocket.js
│   │   └── utils/          export.js (PDF/Excel)
│   ├── vercel.json
│   └── .env.example
├── backend/
│   ├── controllers/        auth, assessment, revenue, churn, leads, users
│   ├── routes/             auth, assessments, revenue, churn, leads, users
│   ├── middleware/         auth.js (JWT)
│   ├── config/             db.js (MySQL pool)
│   ├── server.js           Express + Socket.io
│   ├── railway.json
│   └── .env.example
└── database/
    └── cro_technical_debt.sql
```
