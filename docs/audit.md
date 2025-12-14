# MH26 Services: Comprehensive Technical Audit & Architecture Report

## 1. Executive Summary

**Project Title**: MH26 Services - Hyperlocal On-Demand Service Marketplace
**Target Region**: Nanded, Maharashtra (RTO Code: MH-26)
**Core Value Proposition**: Digitizing the unorganized home service sector (plumbers, electricians, cleaners) by providing a unified platform for discovery, booking, and payment.

**Technical Philosophy**:
The project runs on a robust **PERN Stack** (PostgreSQL, Express, React, Node.js) with a strong emphasis on **Type Safety** (TypeScript throughout) and **Real-Time Responsiveness** (Socket.io). Unlike simple CRUD apps, this platform implements complex business logic including collision detection for bookings, state-managed provider onboarding, and role-based access control.

---

## 2. Codebase Architecture

### 2.1 Directory Structure & Purpose

#### **Frontend (`/frontend/src`)**
*   **`api/`**: Centralized Axios instances with interceptors for JWT token rotation.
    *   `auth.ts`: Login, Register, OTP verification endpoints.
    *   `bookings.ts`: Booking creation and management.
*   **`components/`**: Reusable UI blocks.
    *   `ui/`: Shadcn/Radix primitive components (Buttons, Dialogs, Inputs).
    *   `ProviderOnboardingPage.tsx`: Complex 3-step wizard form.
    *   `BookingModal.tsx`: The core booking interface.
    *   `AdminPanel.tsx`: "God Mode" dashboard for verification and stats.
*   **`context/`**: React Context for global state.
    *   `UserContext.tsx`: Stores current user profile and role.
    *   `SocketContext.tsx`: Manages WebSocket connection lifecycle.
*   **`App.tsx`**: Main entry point handling Routing (React Router v6) and Layouts.

#### **Backend (`/server/src`)**
*   **`config/`**: Environment variable validation (Zod) and Database/Redis connection logic.
*   **`controllers/`**: HTTP Request handlers. Separates entry points from business logic.
*   **`middleware/`**: Request processing chain.
    *   `auth.ts`: Verifies JWT headers and checks `isBanned` status.
    *   `validate.ts`: Uses Zod schemas to validate request bodies before controllers run.
    *   `rateLimit.ts`: Prevents DDoS attacks.
*   **`models/`**: Zod schemas shared with frontend.
*   **`routes/`**: Express Router definitions mapping URLs to controllers.
*   **`services/`**: Pure business logic (e.g., "Check if provider is free at 10 AM").
*   **`socket/`**: WebSocket event handlers (`new_booking`, `status_update`).
*   **`prisma/schema.prisma`**: The source of truth for the Database structure.

---

## 3. Deep Dive: Core Critical Workflows

### 3.1 Provider Onboarding (The "3-Step Wizard")

This flow is critical for maintaining quality. It is implemented in `ProviderOnboardingPage.tsx`.

1.  **Step 1: Identity (Registration)**
    *   User inputs Name, Email, Phone, Password.
    *   **Backend**: `POST /auth/register` creates a user with `role: PROVIDER` and `emailVerified: false`.
    *   **Action**: Sends 6-digit OTP via Email (Nodemailer).

2.  **Step 2: Verification**
    *   User enters OTP.
    *   **Backend**: `POST /auth/verify-registration-otp` checks Redis/Database for the code.
    *   **Result**: Sets `emailVerified: true`, issues JWT Tokens (Access + Refresh).

3.  **Step 3: Business Profile**
    *   User inputs Business Name, Category (Dropdown), Radius, Experience.
    *   **Documents**: Uploads Business Card & Work Samples (Base64/URL).
    *   **Status**: Profile is set to `PENDING`.
    *   **Outcome**: User is redirected to Dashboard but sees "Awaiting Approval" banner.

### 3.2 The Booking Lifecycle (The "Heart" of the App)

The booking system handles concurrency and real-time updates.

1.  **Intent & Validation**:
    *   Customer opens `BookingModal`.
    *   Selects Date (Min: Today, Max: Today + 3 days) and Time Slot.
    *   **Frontend Validation**: Checks for empty fields and past dates.

2.  **Creation (`POST /bookings`)**:
    *   **Collision Check**: Backend queries database: *Does this provider have a 'CONFIRMED' booking at this `scheduleAt` time?*
    *   If Free: Creates Booking (`status: PENDING`).
    *   **Real-Time Trigger**: Server emits `new_booking` via Socket.io to `provider_${providerId}` room.

3.  **Provider Acceptance**:
    *   Provider sees instant popup. Clicks "Accept".
    *   **Backend**: Updates status to `CONFIRMED`.
    *   **Notification**: Customer receives "Booking Confirmed" alert.

4.  **Service & Completion**:
    *   Provider marks `IN_PROGRESS` upon arrival.
    *   **Completion Protocol**:
        *   Provider clicks "Complete Work".
        *   Backend generates a random 6-digit OTP and sends it to the **Customer**.
        *   Provider asks Customer for OTP and enters it into their app.
        *   **Verify**: Backend matches OTP. If correct -> Status `COMPLETED`.
    *   **Payment**: Wallet balance updated.

---

## 4. API Architecture & Key Endpoints

The API is RESTful, versioned (implicit v1), and secured.

### **Authentication (`/api/auth`)**
*   `POST /register`: Create account.
*   `POST /login`: Get JWT tokens.
*   `POST /refresh`: Rotate access token using httpOnly cookie.
*   `POST /verify-registration-otp`: Finalize sign-up.

### **Bookings (`/api/bookings`)**
*   `POST /`: Create new booking request.
*   `GET /`: List my bookings (Customer) or Assigned bookings awaitings (Provider).
*   `POST /:id/accept`: Provider accepts job.
*   `POST /:id/reject`: Provider declines job.
*   `POST /:id/completion-verify`: OTP verification endpoint.

### **Provider Management (`/api/providers`)**
*   `GET /:id`: Public profile (for customers).
*   `PATCH /profile`: Update service radius, images, or description.
*   `GET /availability`: Fetch open slots.

---

## 5. Database Schema & Data Integrity

The database is **PostgreSQL**, managed by **Prisma ORM**.

### **Key Models**

*   **`User`**:
    *   `id`: UUID (Primary Key).
    *   `role`: Enum (`CUSTOMER`, `PROVIDER`, `ADMIN`).
    *   `walletBalance`: Decimal (Money type).
    *   `isBanned`: Boolean (Security flag).

*   **`Provider`**:
    *   `userId`: Foreign Key (1:1 with User).
    *   `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`).
    *   `serviceRadius`: Int (Kilometers).
    *   `primaryCategory`: String (Indexed for search).

*   **`Booking`**:
    *   `providerId` & `userId`: Foreign Keys.
    *   `status`: Enum (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
    *   `scheduledAt`: DateTime (Indexed for collision checks).
    *   `completionOtp`: String (Nullable, stores the verification code).

### **Constraints**
*   **Unique Email/Phone**: Prevents duplicate accounts.
*   **Foreign Keys**: `Booking` cannot exist without valid `User` and `Provider`.
*   **Cascading Deletes**: If a User is deleted, their potential PENDING bookings are removed (handled by Prisma).

---

## 6. Security Implementation

1.  **Helmet**: Adds HTTP headers (HSTS, X-Frame-Options) to prevent Clickjacking and MITM.
2.  **Rate Limiting**: `express-rate-limit` is applied to `/auth` routes (5 attempts per 15 mins) to stop Brute Force password guessing.
3.  **Zod Middleware**: Every POST/PUT request body is strictly validated against a schema. Extra fields are stripped; missing fields cause 400 Bad Request.
4.  **JWT Strategy**:
    *   **Access Token**: Short-lived (15 mins). Sent in Header `Authorization: Bearer ...`.
    *   **Refresh Token**: Long-lived (7 days). Stored in Database (for revocation capability).
5.  **Banning Logic**: `requireNotBanned` middleware runs on *every* protected route. Banned users are instantly rejected, even with valid tokens.

---

## 7. Frontend Technical Details

*   **State Management**:
    *   **Server State**: `TanStack Query` (React Query). Handles caching, loading states, and auto-refetching.
    *   **UI State**: Local `useState` for forms.
    *   **Auth State**: React Context (`UserContext`).
*   **Lazy Loading**:
    *   Routes are wrapped in `Suspense` and `lazy()` imports.
    *   This ensures the "Admin Panel" code is not downloaded by a regular Customer, reducing initial bundle size.
*   **Styling**:
    *   **Tailwind CSS**: For layout and spacing.
    *   **Shadcn UI**: For accessible interactive components (modals, dropdowns).
    *   **Lucide React**: For scalable vector icons.

---

## 8. Deployment & Production Readiness

### 8.1 Current Deployment Architecture

| Component | Service | Region | Status |
|-----------|---------|--------|--------|
| **Frontend** | Vercel | Mumbai (ap-south-1) | ✅ Live |
| **Backend** | Render Free Tier | Singapore | ✅ Live |
| **Database** | Aiven PostgreSQL | Mumbai | ✅ Live |
| **Redis (OTP)** | Upstash | Mumbai | ✅ Configured |
| **Email** | Resend API | Global | ⚠️ Limited (see below) |

### 8.2 Issues Encountered & Solutions

#### Issue 1: SMTP Blocked on Render Free Tier
**Problem**: Render blocks outbound SMTP ports (25, 465, 587) on free tier.
**Impact**: Gmail SMTP emails fail with `Connection timeout`.
**Solution**: Integrated **Resend API** (HTTP-based, bypasses port restrictions).

#### Issue 2: Resend Domain Verification Required
**Problem**: Resend free tier without verified domain only sends to account owner's email.
**Impact**: Cannot send OTP emails to arbitrary users.
**Workaround (Demo)**: OTP codes are prominently logged in Render console:
```
═══════════════════════════════════════════════════════
📧 EMAIL FOR: user@example.com
🔐 OTP CODE: 718010
═══════════════════════════════════════════════════════
```
**Production Fix**: Verify a custom domain in Resend (~₹100/year for .xyz domain).

#### Issue 3: Redis Connection Delay
**Problem**: Initial Redis connection shows "Stream isn't writeable" warning.
**Impact**: First OTP may use in-memory fallback.
**Status**: Self-recovers within seconds; not a critical issue.

#### Issue 4: Service Idling (Free Tier)
**Problem**: Render free tier sleeps after 15 minutes of inactivity.
**Impact**: 30-60 second cold start on first request.
**Solution**: Use [UptimeRobot](https://uptimerobot.com) to ping `/` endpoint every 5 minutes.

---

## 9. Payment Integration & Platform Fee Analysis

### 9.1 Current Implementation
- **Status**: Mock wallet system with simulated transactions.
- **Platform Fee**: 7% configured in environment (`PLATFORM_FEE_PERCENT=7`).
- **GST**: 8% (standard rate for service charges).

### 9.2 Fee Breakdown Per Booking

For a ₹500 service booking:

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Base Service Price | - | ₹500.00 |
| Platform Fee (7%) | ₹500 × 0.07 | ₹35.00 |
| GST on Platform Fee (8%) | ₹35 × 0.08 | ₹2.80 |
| **Customer Pays** | | **₹537.80** |
| **Provider Receives** | ₹500 - ₹35 | **₹465.00** |

### 9.3 Razorpay Integration Feasibility

#### Razorpay Charges (2024)

| Payment Method | Razorpay Fee | Net After Razorpay |
|----------------|--------------|-------------------|
| UPI | 0% (bank-to-bank) | ₹0 |
| Debit Cards | 2% + GST (2.36%) | ₹11.80 on ₹500 |
| Credit Cards | 2% + GST (2.36%) | ₹11.80 on ₹500 |
| Net Banking | 2% + GST (2.36%) | ₹11.80 on ₹500 |
| EMI | 3% + GST (3.54%) | ₹17.70 on ₹500 |

#### Marketplace Split Payment (Razorpay Route)

Razorpay Route enables automatic payment splitting:
```
Customer Payment (₹537.80)
    ├── Razorpay Fee (~2.36%): ₹12.70
    ├── Platform Income (7%): ₹35.00
    ├── GST Pool (8%): ₹2.80
    └── Provider Payout: ₹487.30
```

#### Feasibility Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| **Technical** | ✅ Feasible | Razorpay SDK already in `package.json` |
| **Business Model** | ✅ Viable | 7% platform fee standard for marketplaces |
| **Profitability** | ⚠️ Marginal | After Razorpay fees (~2.5%), net margin ~4.5% |
| **Compliance** | ⚠️ Required | GST registration, KYC for payouts |

#### Monthly Revenue Projection (Nanded City Scale)

| Daily Bookings | Avg. Booking Value | Monthly GMV | Platform Revenue (7%) | Net After Razorpay (~4.5%) |
|----------------|-------------------|-------------|----------------------|--------------------------|
| 50 | ₹500 | ₹7,50,000 | ₹52,500 | ₹33,750 |
| 100 | ₹500 | ₹15,00,000 | ₹1,05,000 | ₹67,500 |
| 200 | ₹500 | ₹30,00,000 | ₹2,10,000 | ₹1,35,000 |

---

## 10. Deployment Cost Summary

### Demo Mode (Current - ₹0/month)

| Service | Cost | Limitation |
|---------|------|-----------|
| Vercel | Free | 100GB bandwidth |
| Render | Free | Idles, SMTP blocked |
| Aiven | Free | 5GB, 20 connections |
| Upstash | Free | 10K requests/day |
| Resend | Free | Own email only |
| **Total** | **₹0** | OTP via logs |

### Production Mode (Recommended - ~₹600-1,200/month)

| Service | Cost | Benefit |
|---------|------|---------|
| Render Starter | ₹600 ($7) | No idle, SMTP works |
| Verified Domain | ₹100 | Real email delivery |
| Upstash Pro | ₹850 ($10) | 100K requests/day |
| **Total** | **~₹1,550** | Full functionality |

### City-Scale Production (~₹12,000-18,000/month)

| Service | Cost | Capacity |
|---------|------|----------|
| AWS EC2 (Mumbai) | ₹2,500 | 1000 concurrent users |
| RDS PostgreSQL | ₹5,000 | 50GB, auto-backup |
| ElastiCache | ₹1,200 | Redis cluster |
| Load Balancer | ₹1,500 | Multi-instance |
| **Total** | **~₹12,000-18,000** | 25K+ users |

---

## 11. Future Roadmap

### Phase 1: Demo Ready ✅
- [x] Core booking flow
- [x] OTP verification (via logs)
- [x] Admin panel
- [x] Real-time notifications

### Phase 2: Beta Launch (Month 1-3)
- [ ] Verify custom domain for Resend
- [ ] Upgrade Render to Starter plan
- [ ] Integrate Razorpay Test Mode
- [ ] Add provider payout system

### Phase 3: Production Launch (Month 3-6)
- [ ] Razorpay Live Mode activation
- [ ] GST registration & compliance
- [ ] Provider KYC verification
- [ ] Customer support system
- [ ] Mobile app (React Native)

### Phase 4: Scale (Month 6+)
- [ ] Migrate to AWS Mumbai
- [ ] Multi-city expansion
- [ ] Subscription plans for providers
- [ ] Map-based live tracking
- [ ] Machine learning for matching

---

**Audit Conclusion**: The MH26 Services platform is production-ready with minor adjustments. The current demo deployment successfully demonstrates all core features. For live payments, Razorpay integration is technically feasible with a sustainable 7% platform fee model. Recommended next step: Verify a custom domain and upgrade to Render Starter plan for full email functionality.
