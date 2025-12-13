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

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/botvecna47/MH26-Services.git
    cd MH26-Services
    ```

2.  **Backend Setup**
    ```bash
    cd server
    npm install
    ```
    *   Create a `.env` file in `server/` (refer to `.env.example`).
    *   Set `DATABASE_URL` to your PostgreSQL connection string.
    *   Set `CORS_ORIGIN` to your frontend URL (or `*` for dev).

    **Initialize Database:**
    ```bash
    npx prisma migrate deploy  # Apply schema
    npm run seed               # Populate with initial data
    ```
    **Start Server:**
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```
    *   Create a `.env` file in `frontend/` (refer to `frontend/.env.example`).
    *   Set `VITE_API_URL` to point to your backend (e.g., `http://localhost:5000/api`).
    *   Set `VITE_SOCKET_URL` to point to your backend (e.g., `http://localhost:5000`).

    **Start Interface:**
    ```bash
    npm run dev
    ```

---

## Deployment Guide (Safety & Best Practices)

To safely host this application, follow the **Split Deployment Strategy** due to the use of WebSockets (Socket.io).

### 1. Database (PostgreSQL)
*   **Host**: Use a managed cloud provider like **Neon.tech**, **Supabase**, or **Aiven**.
*   **Safety Check**: Ensure your database is not accessible to the public internet without a password. Use strong passwords in `DATABASE_URL`.

### 2. Backend (Render / Railway)
*   **Host**: Use **Render** or **Railway**.
*   **Why?**: Vercel/Netlify are "Serverless" and **kill connections**, breaking Socket.io. Render/Railway keep the server alive.
*   **Environment Variables**:
    *   `NODE_ENV`: Set to `production`.
    *   `CORS_ORIGIN`: Set STRICTLY to your frontend domain (e.g., `https://my-frontend.vercel.app`). Do not use `*` in production.
    *   `JWT_SECRET`: Use a long, complex random string.

### 3. Frontend (Vercel)
*   **Host**: **Vercel** is recommended.
*   **Configuration**:
    *   Set `VITE_API_URL` to your Backend URL.
    *   Set `VITE_SOCKET_URL` to your Backend URL.
*   **Safety Check**: The frontend contains **no secrets**. All strict logic (payments, data validation) must happen on the backend.

---

**MH26 Services Platform**
*Digital Solutions for Local Needs.*
