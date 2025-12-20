# MH26 Services - Quick Reference Guide

*Bullet points for demo - you elaborate on each point*

---

## Platform Overview
- Local service marketplace for Nanded region (MH-26)
- Connects service providers (plumbers, electricians, salons) with customers
- Three user roles: Customer, Provider, Admin
- Digitizes discovery → booking → payment → review lifecycle

---

## Frontend Stack

### Core Technologies
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool (~300ms startup vs 30s with CRA)
- **Tailwind CSS** - Utility-first styling

### State & Data
- **TanStack Query** - Server state management with automatic caching
- **React Context** - Global auth state
- **Socket.io Client** - Real-time updates (notifications, bookings)

### UI Components
- **Radix UI** - Accessible primitives (dialogs, dropdowns, tabs)
- **Lucide React** - Icon library
- **React Hook Form + Zod** - Form handling with validation

### Key Components (48 total)
- HomePage, DashboardPage, AdminPanel, AuthPage
- BookingModal, BookingDetailModal, ReviewModal
- ProviderOnboardingPage (3-step wizard)
- MyServicesSection, ProviderSchedulePage

---

## Backend Stack

### Core Technologies
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit with auto-generated types

### Security
- **JWT** - Access tokens (15min) + Refresh tokens (7 days)
- **Bcrypt** - Password hashing (12 rounds)
- **Helmet** - Security headers
- **Rate Limiting** - Prevents brute force (5 login attempts/15min)
- **CORS** - Origin restriction

### Additional Services
- **Socket.io** - Real-time bidirectional communication
- **Nodemailer / Resend** - Email delivery
- **Winston** - Logging

### Controllers (11 total)
- authController - Login, register, OTP, password reset
- bookingController - CRUD, accept/reject, completion
- providerController - Profile, availability, services
- adminController - Approvals, user management, analytics
- serviceController, reviewController, notificationController, etc.

---

## Database (PostgreSQL)

### Why PostgreSQL?
- ACID transactions for financial operations
- JSONB for flexible data (availability schedules)
- Foreign key constraints for data integrity
- Advanced indexing for fast queries

### Core Models
- **User** - All accounts (role: CUSTOMER/PROVIDER/ADMIN)
- **Provider** - Business profile linked to User
- **Service** - What providers offer (name, price, duration)
- **Booking** - Customer-Service transaction with status
- **Review** - Ratings and comments
- **Transaction** - Financial records
- **Notification** - User alerts
- **Category** - Service taxonomy

### Key Design Decisions
- UUIDs instead of auto-increment (security, distributed)
- Soft deletes via status field (audit trail)
- Denormalized aggregates (averageRating, totalSpending)
- Composite indexes (city + category for search)

---

## Key Features

### Customer Flow
1. Register → Email verification
2. Browse categories → View providers
3. Select service → Pick date/time → Confirm booking
4. Wallet deduction → Provider notified (real-time)
5. Service completed → OTP verification
6. Leave review

### Provider Flow
1. Register (3-step wizard with document upload)
2. Wait for admin approval
3. Receive bookings → Accept/Reject
4. Perform service → Get OTP from customer
5. Complete → Earnings credited

### Admin Flow
1. Review pending providers → Approve/Reject
2. Handle custom categories (Create new or assign to Other)
3. Monitor platform analytics
4. Manage users (ban/unban)

---

## Real-Time Features (Socket.io)
- New booking → Provider notification
- Booking accepted/rejected → Customer notification
- Provider approved → Provider notification
- New message → Chat participant notification

---

## Authentication Flow
1. User submits credentials
2. Server verifies password (bcrypt compare)
3. Server issues Access Token (15min) + Refresh Token (7 days)
4. Frontend stores tokens, sends with every request
5. On expiry → Refresh token gets new access token
6. Refresh tokens stored in DB → Can be revoked

---

## Validation (Zod)
- Same schema validates frontend forms AND backend API
- Type inference from schemas (no duplicate definitions)
- Prevents client/server validation mismatch

---

## Email Notifications
- Email verification (registration)
- Provider approval/rejection
- Booking confirmations
- Password reset links

---

## Booking OTP System
- Provider clicks "Complete Service"
- 4-digit OTP generated, sent to customer
- Provider enters OTP to confirm completion
- Protects both parties from fraud

---

## File Structure

```
MH26-Services/
├── frontend/
│   ├── src/api/        # API hooks
│   ├── src/components/ # React components
│   ├── src/context/    # Auth context
│   └── src/lib/        # Utilities
├── server/
│   ├── src/controllers/
│   ├── src/routes/
│   ├── src/middleware/
│   └── prisma/schema.prisma
└── docs/
    ├── audit.md        # Technical deep-dive
    └── explanation.md  # Detailed prose
```

---

*Use these points as talking prompts during your demo*
