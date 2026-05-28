# 🏥 ClinicOS — Appointment Management System

A full-stack clinic appointment scheduling system built with **Express.js** + **Next.js 14**.

![Stack](https://img.shields.io/badge/Backend-Express.js-green)
![Stack](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Stack](https://img.shields.io/badge/Auth-JWT-blue)
![Stack](https://img.shields.io/badge/DB-SQLite-lightgrey)

---

## ✨ Features

### Backend (Express.js)
- **JWT Authentication** — register, login, `/me` endpoint
- **Role-based access** — `patient`, `doctor`, `admin`
- **Appointments CRUD** — create, list, update status, delete
- **Input validation** — all endpoints validate and sanitize inputs
- **SQLite via better-sqlite3** — zero-setup, file-based database

### Frontend (Next.js 14)
- **Login / Register page** — demo credential shortcuts
- **Appointments list** — filter by status, animated cards
- **Create appointment** — department → doctor → date/time → reason flow
- **Persistent auth** — JWT stored in localStorage, auto-redirect on expiry
- **Responsive** — mobile-first layout with nav drawer

---

## 🗂️ Project Structure

```
clinic-system/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js        # SQLite connection + migrations
│   │   │   └── seed.js         # Demo data seeder
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verify middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # POST /login, /register, GET /me
│   │   │   └── appointments.js # Full CRUD + role-based filtering
│   │   └── index.js            # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── login/page.jsx              # Login & Register
    │   │   ├── appointments/page.jsx        # Appointments list
    │   │   └── appointments/create/page.jsx # Book appointment
    │   ├── components/
    │   │   └── Navbar.jsx
    │   └── lib/
    │       └── api.js           # Typed API client with auto-logout
    ├── .env.local.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

---

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/clinic-system.git
cd clinic-system
```

---

### 2. Backend setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# Seed demo data (creates 3 users + 3 appointments)
npm run seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:4000`

---

### 3. Frontend setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 🔐 Demo Credentials

After running `npm run seed` in the backend:

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Patient | patient@clinic.com      | patient123  |
| Doctor  | doctor@clinic.com       | doctor123   |
| Admin   | admin@clinic.com        | admin123    |

---

## 📡 API Reference

### Auth

| Method | Endpoint             | Body                          | Auth |
|--------|----------------------|-------------------------------|------|
| POST   | `/api/auth/register` | `{ name, email, password }`   | No   |
| POST   | `/api/auth/login`    | `{ email, password }`         | No   |
| GET    | `/api/auth/me`       | —                             | Yes  |

### Appointments

| Method | Endpoint                  | Description                          | Auth |
|--------|---------------------------|--------------------------------------|------|
| GET    | `/api/appointments`       | List (patients see own; admins all)  | Yes  |
| GET    | `/api/appointments/:id`   | Get single appointment               | Yes  |
| POST   | `/api/appointments`       | Create appointment                   | Yes  |
| PATCH  | `/api/appointments/:id`   | Update status / notes                | Yes  |
| DELETE | `/api/appointments/:id`   | Delete appointment                   | Yes  |

#### Query params for `GET /api/appointments`
- `status` — filter by: `pending` | `confirmed` | `cancelled` | `completed`
- `page` — page number (default: 1)
- `limit` — items per page (default: 20)

---

## 🛠️ Tech Stack

| Layer    | Technology        | Why                                   |
|----------|-------------------|---------------------------------------|
| Backend  | Express.js        | Lightweight, familiar, flexible       |
| Database | SQLite (better-sqlite3) | Zero setup, perfect for assessment |
| Auth     | JWT (jsonwebtoken) | Stateless, standard                  |
| Passwords| bcryptjs          | Industry-standard hashing             |
| Frontend | Next.js 14        | App Router, SSR-ready, fast           |
| Styling  | Tailwind CSS      | Utility-first, consistent             |
| Icons    | Lucide React      | Clean, consistent icon set            |

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 7 days by default (configurable via `JWT_EXPIRES_IN`)
- Role-based middleware prevents patients from accessing other patients' data
- SQLite prepared statements prevent SQL injection
- CORS restricted to frontend origin

---

## 📈 Possible Enhancements

- [ ] Email notifications on appointment confirmation
- [ ] Doctor availability calendar
- [ ] Admin dashboard with analytics
- [ ] Appointment reminders
- [ ] PostgreSQL/MySQL for production
- [ ] Docker Compose for one-command setup

---

## 📄 License

MIT — free to use and extend.
