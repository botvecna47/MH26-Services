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

## 8. Summary & Future/limitations

### **Current Limitations**
*   **Payments**: Currently uses a "Mock" wallet or simulation. Real Razorpay integration code exists but needs active API keys.
*   **SMS**: OTPs are sent via Email. SMS integration (Twilio/Fast2SMS) requires paid credits.

### **Future Roadmap**
*   **React Native App**: To give providers persistent background notifications.
*   **Map Integration**: Show "Live Location" of provider on a map map using Google Maps API.
*   **Subscription Plans**: Revenue model for "Premium Providers" to get featured listing.

---

**Audit Conclusion**: The MH26 Services platform is a well-architected, secure, and scalable solution. It follows modern best practices (Validation, Sanitization, Modularization) and is ready for pilot deployment in the Nanded region.
