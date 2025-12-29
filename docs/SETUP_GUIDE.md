# MH26 Services - Complete Setup Guide

This guide helps you set up and run the MH26 Services project on a new PC.

---

## 1. Prerequisites (Install These First)

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | v20+ (LTS) | https://nodejs.org/ |
| **Git** | Latest | https://git-scm.com/ |
| **VS Code** | Latest | https://code.visualstudio.com/ (Optional) |

### Database (Choose One)

**Option A: Cloud PostgreSQL (Recommended - No Install)**
- Use [Aiven](https://aiven.io/) or [Neon](https://neon.tech/) free tier
- Copy connection string to `.env`

**Option B: Local PostgreSQL**
- Install PostgreSQL 15+ from https://www.postgresql.org/download/

---

## 2. Clone/Copy Project

```bash
# If using Git
git clone https://github.com/YOUR_REPO/MH26-V5.git
cd MH26-V5

# Or copy the project folder manually
```

---

## 3. Install Dependencies

Open terminal in project root folder:

```bash
# Install all dependencies (root + frontend + server)
npm install
```

This installs everything via npm workspaces.

---

## 4. Configure Environment

### Backend Environment

1. Copy the example file:
```bash
cd server
copy .env.example .env
```

2. Edit `server/.env` with your values:

```env
# Required
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@host:port/dbname

# JWT (generate a random secret)
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Email (choose one)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR use SMTP settings
```

---

## 5. Initialize Database

```bash
# From project root
cd server

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed with demo data
npm run seed
```

---

## 6. Run the Project

### Development Mode (Both Frontend + Backend)

From project root:
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### Run Individually

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

---

## 7. Access the Application

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend (User Interface) |
| http://localhost:5000/api | Backend API |
| http://localhost:5000/api/health | Health Check |

### Demo Accounts (if seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mh26services.com | admin123 |
| Providers | (see seed output) | (random) |

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| `MODULE_NOT_FOUND` | Run `npm install` again |
| Database connection error | Check `DATABASE_URL` in `.env` |
| Port already in use | Kill process or change PORT |
| Prisma errors | Run `npx prisma generate` |

---

## Project Structure

```
MH26 V5/
├── frontend/          # React + Vite frontend
├── server/            # Express + Prisma backend
│   ├── prisma/        # Database schema
│   └── src/           # API source code
├── package.json       # Root package (workspaces)
└── docs/              # Documentation
```
