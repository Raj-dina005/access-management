# 🛡️ AccessGuard — Digital Access Management System

A full-stack web application to manage and monitor entry/exit access for organizations and buildings. Built with **React**, **Node.js**, **Express**, and **PostgreSQL**.

![Status](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

---

## 🌐 Live Demo

> 🔗 [AccessGuard Live](https://your-render-url.onrender.com)

**Demo Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@access.com | Admin@123 |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login with token-based auth
- 👥 **Role-Based Access Control** — Super Admin, Security Staff, Employee
- 🧑‍💼 **Employee Management** — Register, edit, search, export employees
- 🎫 **Visitor Pass Generation** — Auto-generate unique pass codes (VIS-XXXXXX)
- 📋 **Entry/Exit Logging** — Track every entry and exit with timestamps
- 📊 **Live Dashboard** — Real-time stats and activity feed
- 🔍 **Search & Filters** — Filter logs by name, date, action, type
- 📥 **CSV Export** — Download employee and access log data
- 🌙 **Dark UI** — Smooth, modern dark-themed interface

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT, Bcrypt |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
access-management/
├── backend/
│   ├── db/
│   │   ├── db.js          # PostgreSQL connection
│   │   ├── schema.js      # Table creation
│   │   └── seed.js        # Default admin seed
│   ├── middleware/
│   │   └── auth.js        # JWT + role middleware
│   ├── routes/
│   │   ├── auth.js        # Login, /me
│   │   ├── users.js       # User management
│   │   ├── employees.js   # Employee CRUD
│   │   ├── visitors.js    # Visitor pass CRUD
│   │   └── logs.js        # Access logs + stats
│   ├── .env.example       # Environment variables template
│   └── server.js          # Express app entry
│
└── frontend/
    └── src/
        ├── components/    # Reusable UI components
        ├── hooks/         # Auth context
        ├── pages/         # All page components
        └── utils/         # Axios instance
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/your-username/access-management.git
cd access-management
```

### 2. Create PostgreSQL Database
```sql
CREATE DATABASE access_management;
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=access_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

Start backend:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Open App
```
http://localhost:5173
```

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access — manage users, employees, visitors, logs |
| **Security Staff** | Manage employees, visitors, log entry/exit |
| **Employee** | View-only access |

---

## 🚀 Deployment

- **Backend** — Render (Web Service)
- **Frontend** — Render (Static Site)
- **Database** — Render PostgreSQL (free tier)

---

## 👨‍💻 Author

Built with ❤️ as a full-stack portfolio project.

> Feel free to ⭐ star this repo if you found it useful!
