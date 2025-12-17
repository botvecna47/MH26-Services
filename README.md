# MH26 Services Platform

**Empowering Local Commerce via Digital Efficiency**

MH26 Services is a robust, full-stack marketplace application engineered to bridge the gap between local service professionals and homeowners in the Nanded region. By digitizing the discovery, booking, and transaction lifecycle, this platform modernizes how essential services—from plumbing to electrical repairs—are accessed and delivered.

This repository hosts a scalable, production-ready solution featuring real-time resource management, secure financial transaction flows, and a comprehensive administration suite.

---

## Technical Architecture & Stack

The platform is built on a high-performance monolithic architecture that emphasizes type safety, data integrity, and real-time responsiveness.

### Backend (Node.js/Express)
*   **Runtime**: Node.js v18+ with Express.js Framework.
*   **Language**: TypeScript (Strict mode).
*   **Database**: PostgreSQL (v14+) managed via **Prisma ORM**.
    *   Features: Complex schema relations, foreign key constraints, atomic transactions.
*   **Real-time**: **Socket.io** for live booking updates and notifications.
*   **Caching/Session**: **Redis** (optional but recommended for production) / In-memory for dev.
*   **Security**:
    *   **Helmet**: HTTP header hardening.
    *   **Bcrypt**: Secure password hashing.
    *   **Rate Limiting**: `express-rate-limit` to prevent abuse.
    *   **JWT**: Access & Refresh token rotation strategy.
    *   **Zod**: Runtime request schema validation.
*   **Logging**: Winston logger for structured logs.
*   **Email**: Nodemailer for transactional emails.

### Frontend (React/Vite)
*   **Framework**: React 18 with **Vite** (Lightning fast build tool).
*   **Language**: TypeScript.
*   **State Management**: **TanStack Query (React Query)** for server state & caching.
*   **Styling**: **Tailwind CSS** with **Shadcn UI** (Radix Primitives).
*   **Forms**: React Hook Form + Zod resolvers.
*   **Routing**: React Router DOM v6.
*   **Visualization**: Recharts for analytics dashboards.
*   **Utilities**: `date-fns` for time manipulation, `axios` for HTTP requests.

---

## Core Capabilities

### For Customers
*   **Intelligent Discovery**: Categorized services with search and filtering.
*   **Seamless Booking**: Date/time slot selection with conflict detection.
*   **Secure Transactions**: Integrated wallet system and mock payment flows.
*   **Live Tracking**: Real-time status updates via WebSockets.

### For Service Providers
*   **Digital Office**: Dashboard for availability management and job tracking.
*   **Portfolio**: Image gallery and credential management.
*   **Financials**: Earnings reports and payout tracking.

### For Administrators
*   **God-Mode Control**: Full oversight of users, providers, and bookings.
*   **Financial Oversight**: Platform fee calculation (default 7%) and revenue aggregation.
*   **Verification**: Tools for verifying provider documents and ensuring quality.

---

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL (Local or Cloud like Neon/Aiven)
*   npm (v9+)

### Quick Start (5 Minutes)

```bash
# Clone and enter the project
git clone https://github.com/botvecna47/MH26-Services.git
cd MH26-Services

# Install all dependencies (frontend + backend)
npm run install:all

# Start both frontend and backend
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Manual Installation

#### 1. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` (copy from `.env.example`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
JWT_ACCESS_SECRET="your-32-char-secret"
JWT_REFRESH_SECRET="your-32-char-secret"
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
```

Initialize database and seed:

```bash
npx prisma db push      # Create tables
npm run seed            # Seed demo data
npm run dev             # Start server on :5000
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Start on :5173
```

---

## 🔑 Demo Credentials

After seeding, use these accounts to test:

### Admin
| Email | Password |
|-------|----------|
| `admin@mh26services.com` | `admin123` |

### Providers (by Category)
Password format: `{Category}@123`

| Business | Email | Password |
|----------|-------|----------|
| Sameer Plumbers | `sameer.plumbers@gmail.com` | `Plumbing@123` |
| Fr Electricals | `fr.electricals@gmail.com` | `Electrical@123` |
| Signate Beauty Salon | `signate.beauty@gmail.com` | `Salon@123` |
| Siddhi Mangal Karyalay | `siddhi.mangal@gmail.com` | `Catering@123` |
| Rama Sales | `rama.sales@gmail.com` | `Carpentry@123` |
| Sidh Home Cleaning | `sidh.homecleaning@gmail.com` | `Cleaning@123` |

### Customers
Register at `/auth` with any email to create a customer account.

---

## 🧪 Testing Features

### Provider Booking Flow
1. **Customer Login** → Browse Services → Book a service
2. **Provider Login** → Dashboard → View PENDING booking → **Accept/Reject**
3. **After Accepting** → Click "Mark Job Complete" → OTP is sent to customer
4. **Customer** sees OTP in their booking details
5. **Provider** enters OTP → Booking becomes COMPLETED
6. **Customer** can leave a review

### Admin Features
1. **Admin Panel** (`/admin`) → View all providers, users, bookings
2. **Add Provider** → Creates account + sends credentials email
3. **Approve/Reject** pending provider applications
4. **Ban/Unban** users

---

## 📧 Email Configuration (Optional)

For emails to actually send (OTP, credentials), configure in `server/.env`:

### Option 1: Resend (Recommended - Works on Render)
```env
RESEND_API_KEY="re_xxxxxxxx"
RESEND_FROM_EMAIL="MH26 Services <noreply@yourdomain.com>"
```

### Option 2: SMTP (Gmail)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Generate at Google Account > Security > App Passwords
```

> **Note**: Without email config, OTPs and credentials are logged to the **server console** for testing.

---

## Deployment Guide

### Database (PostgreSQL)
*   **Recommended**: [Aiven.io](https://aiven.io), [Neon.tech](https://neon.tech), [Supabase](https://supabase.com)
*   Use strong passwords in `DATABASE_URL`

### Backend (Render / Railway)
*   **Why not Vercel?** Socket.io requires persistent connections; serverless kills them.
*   Set `NODE_ENV=production`
*   Set `CORS_ORIGIN` to your frontend domain exactly

### Frontend (Vercel)
*   Set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend URL

---

## Project Structure

```
MH26-Services/
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/        # API hooks (React Query)
│   │   ├── components/ # UI Components
│   │   ├── context/    # Auth, Socket, Notifications
│   │   └── types/      # TypeScript types
│   └── .env.example
├── server/             # Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── .env.example
└── package.json        # Root scripts for monorepo
```

---

## Recent Updates

### December 2024 - Provider Enhancement Release
- ✅ **Provider Step 3 Resume** - PENDING/REJECTED providers can login and complete their application
- ✅ **Admin Category Handling** - Create new category or assign to "Other" for custom categories
- ✅ **Provider Profile Settings** - Business settings visible in Profile tab
- ✅ **Service Delete** - Providers can delete services with confirmation
- ✅ **Detailed Availability Editor** - Per-day time slot management with toggle and custom times
- ✅ **Email Notifications** - Automatic emails on provider approval/rejection

### Previous Updates
- ✅ Provider Accept/Reject booking buttons
- ✅ Invoice view and download
- ✅ OTP-based booking completion
- ✅ Admin panel provider creation with email credentials
- ✅ Provider self-registration with email OTP

---

## 📄 Documentation

- **[Comprehensive Technical Audit](./docs/audit.md)** - In-depth architecture documentation covering:
  - Frontend stack (React, Vite, TanStack Query) with alternative comparisons
  - Backend stack (Express, Prisma, Socket.io) with problem-solution pairs
  - Database design (PostgreSQL) with relationship diagrams
  - Real-time notification flow
  - Authentication system
  - Best practices for all layers

---

**MH26 Services Platform**  
*Digital Solutions for Local Needs.*

