# 🏪 MH26 Services Marketplace

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-85%25%20Complete-yellow.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)

**A comprehensive service marketplace platform connecting customers with local service providers in Nanded, Maharashtra**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

---

## 🎯 Overview

**MH26 Services Marketplace** is a full-stack web application that enables seamless connections between customers and service providers. The platform supports multiple user roles, real-time communication, comprehensive booking management, and an advanced admin dashboard for platform oversight.

### Key Highlights

- 🎭 **Multi-Role System**: Customers, Service Providers, and Administrators with role-based access control
- 🔍 **Advanced Search**: Location-based filtering, category search, and provider discovery
- 💬 **Real-Time Messaging**: Socket.io powered messaging with instant notifications
- 📱 **Responsive Design**: Mobile-first approach with modern UI/UX
- 🔒 **Secure Authentication**: JWT-based auth with email verification and OTP support
- 📊 **Admin Dashboard**: Comprehensive analytics and management tools
- ⚡ **High Performance**: Optimized queries, rate limiting, and efficient state management

---

## ✨ Features

### 🔐 Authentication & Authorization

- **User Registration**: Two-step registration with email OTP verification
  - Step 1: User submits registration form, receives OTP via email
  - Step 2: User verifies OTP, account is created only after verification
- **Email Verification**: Secure email-based OTP verification for registration
- **Phone Number Validation**: 10-digit phone numbers (starting with 6-9) with duplicate checking
- **Password Management**: 
  - Secure password reset via email
  - Password change with current password verification
  - Bcrypt hashing (12 rounds)
- **Session Management**: JWT tokens with refresh token rotation
- **Role-Based Access Control**: Granular permissions for different user types

### 👥 User Management

- **Profile Management**:
  - Profile picture upload (local storage)
  - Update name, phone, and other details
  - Account information display
  - Role-specific information display
- **User Settings Page**: Comprehensive settings for all user types
- **Account Status**: Ban/unban functionality for admins
- **User Verification**: Email and phone verification status tracking

### 🏢 Provider Management

- **Provider Onboarding**:
  - Multi-step registration process
  - Business information collection
  - Document upload (Aadhar, License, GST, etc.)
  - Service listing creation
- **Provider Approval Workflow**:
  - Admin review and approval system
  - Status tracking (PENDING, APPROVED, REJECTED, SUSPENDED)
  - Suspension/unsuspension functionality
- **Provider Appeals System**:
  - Appeal creation for suspended providers
  - Admin review and management
  - Status tracking (PENDING, APPROVED, REJECTED)
- **Provider Profiles**:
  - Business details and description
  - Service listings with pricing
  - Reviews and ratings display
  - Contact information (with privacy controls)

### 🔍 Service Discovery

- **Advanced Search**:
  - Search by provider name or service category
  - Location-based filtering (city, state, pincode)
  - Category filtering (primary and secondary)
  - Price range filtering
- **Provider Listing**:
  - Paginated provider cards
  - Rating and review display
  - Quick view of services
  - Direct booking access
- **Provider Detail Pages**:
  - Complete provider information
  - Service listings with details
  - Reviews and ratings
  - Booking interface
  - Direct messaging
  - Phone number reveal (with privacy controls)

### 📅 Booking System

- **Booking Creation**:
  - User-initiated booking requests
  - Multi-step booking form
  - Service selection
  - Date and time scheduling
  - Address management
  - Special requirements input
  - Automatic platform fee calculation (5%)
  - Provider earnings calculation
- **Booking Request Flow**:
  - Customer creates booking with PENDING status
  - Provider receives real-time notification
  - Provider can accept (CONFIRMED) or reject (REJECTED) booking
  - Customer receives notification of provider's decision
  - Optional rejection reason from provider
- **Booking Management**:
  - View all bookings (customer/provider/admin)
  - Role-based booking filtering
  - Booking status tracking (PENDING → CONFIRMED/REJECTED → COMPLETED)
  - Provider accept/reject actions
  - Booking cancellation (customer/provider)
  - Booking updates and real-time notifications via Socket.io
- **Invoice Generation**:
  - Automatic invoice creation
  - PDF invoice download
  - Invoice viewing in admin panel
  - Booking details with pricing breakdown

### 💬 Real-Time Messaging

- **Conversation Management**:
  - Conversation list with search
  - Unread message indicators
  - Last message preview
  - Conversation creation (provider-initiated)
- **Messaging Features**:
  - Real-time message delivery via Socket.io
  - Message history with timestamps
  - Read/unread status
  - Message notifications (database + Socket.io)
  - Toast notifications with quick actions
- **Enhanced UI**:
  - Modern message bubble design
  - Avatar display for sender/receiver
  - Smart timestamp display
  - Grouped messages from same sender
  - Compact design optimized for laptop screens
  - Always-visible input area

### ⭐ Reviews & Ratings

- **Review System**:
  - Post-booking reviews
  - Star ratings (1-5)
  - Written comments
  - Review editing
- **Rating Display**:
  - Average rating calculation
  - Total review count
  - Individual review display
  - Provider rating aggregation

### 🔔 Notifications

- **Real-Time Notifications**:
  - Database notifications for all events
  - Socket.io for instant delivery
  - Toast notifications in UI
  - Notification center
- **Notification Types**:
  - New messages
  - New booking requests (for providers)
  - Booking acceptance/rejection (for customers)
  - Booking status updates
  - Provider approval/rejection
  - Provider suspension/unsuspension
  - Appeal status updates
  - System announcements
- **Notification Management**:
  - Mark as read/unread
  - Notification filtering
  - Notification history

### 🛡️ Admin Dashboard

- **Analytics Dashboard**:
  - User statistics
  - Provider statistics
  - Booking statistics
  - Revenue metrics (when payments are integrated)
  - Growth trends
- **Provider Management**:
  - View all providers
  - Approve/reject provider applications
  - Suspend/unsuspend providers
  - View provider details
  - Export provider data
- **User Management**:
  - View all users
  - User details modal
  - Ban/unban users
  - User activity tracking
- **Booking Management**:
  - View all bookings
  - Booking details modal
  - Invoice viewing
  - Booking status updates
- **Report Management**:
  - View all reports
  - Report details and resolution
  - Report status tracking
- **Appeal Management**:
  - View all provider appeals
  - Review and approve/reject appeals
  - Appeal status tracking
  - Admin notes on appeals

### 📁 File Management

- **File Upload**:
  - File upload handling
  - Document upload (provider documents)
  - Profile picture upload
  - Image validation (type and size)
- **File Storage**:
  - Local file storage
  - Secure file access
  - File preview functionality

### 🔒 Security Features

- **Authentication Security**:
  - JWT token-based authentication with 15-minute access tokens
  - Refresh token rotation (7-day expiry)
  - Token expiration handling with automatic refresh
  - Secure password hashing (bcrypt, 12 rounds)
  - Email OTP verification for registration
  - Suspended provider account blocking
- **API Security**:
  - Rate limiting on all endpoints (Redis-backed with in-memory fallback)
  - Input validation with Zod schemas
  - Automatic input sanitization (XSS prevention)
  - SQL injection prevention (Prisma ORM)
  - CORS configuration with dynamic origins
  - Security headers (Helmet.js):
    - Content Security Policy (CSP)
    - HSTS (HTTP Strict Transport Security)
    - XSS Filter
    - Frame Guard
    - Cross-Origin Resource Policy
- **Data Security**:
  - Phone number validation (10 digits, duplicate checking)
  - Message text sanitization
  - Review comment sanitization
  - Audit logging for admin actions
  - Secure file upload with validation
- **Data Protection**:
  - Environment variable validation
  - Secure file uploads (local storage)
  - Audit logging for admin actions
  - Privacy controls (phone visibility)

### 📊 Additional Features

- **Health Checks**: 
  - Basic health endpoint
  - Detailed health with dependency checks
  - Database connectivity monitoring
  - Redis connectivity monitoring
- **Error Handling**:
  - Centralized error handling
  - Error boundaries in React
  - Comprehensive error logging
  - User-friendly error messages
- **Logging**:
  - Winston logger configuration
  - Log file management
  - Error tracking
- **Rate Limiting**:
  - In-memory rate limiting
  - Per-endpoint rate limits
  - Auth-specific rate limits
  - Frontend query optimization to reduce API calls

---

## 💻 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **TypeScript** | 5.2.2 | Type Safety |
| **Vite** | 5.0.8 | Build Tool & Dev Server |
| **React Router** | 6.21.1 | Client-side Routing |
| **TanStack Query** | 5.17.0 | Server State Management |
| **TailwindCSS** | 3.4.0 | Utility-first CSS Framework |
| **Radix UI** | Latest | Accessible Component Library |
| **Axios** | 1.6.2 | HTTP Client |
| **Socket.io Client** | 4.6.1 | Real-time Communication |
| **Framer Motion** | 11.0.0 | Animation Library |
| **Zod** | 3.22.4 | Schema Validation |
| **Lucide React** | Latest | Icon Library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express** | 4.18.2 | Web Framework |
| **TypeScript** | 5.3.2 | Type Safety |
| **Prisma** | 5.7.0 | ORM & Database Toolkit |
| **PostgreSQL** | 14+ | Primary Database |
| **Redis** | 6+ | Caching & Session Store |
| **Socket.io** | 4.5.4 | Real-time WebSocket Server |
| **JWT** | 9.0.2 | Authentication Tokens |
| **Bcrypt** | 5.1.1 | Password Hashing |
| **Winston** | 3.11.0 | Logging Library |
| **Zod** | 3.22.4 | Schema Validation |
| **Nodemailer** | Latest | Email Service |

### Infrastructure & Tools

- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **Storage**: Local file storage
- **Email**: SMTP (Nodemailer)
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: Concurrently (run multiple scripts)

---

## 📁 Project Structure

```
mh26-services/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                # Node.js + Express backend
│   ├── src/
│   ├── prisma/
│   └── package.json
├── docs/                  # Documentation
│   ├── deployment/        # Deployment guides
│   ├── archive/          # Historical docs
│   └── ...
├── scripts/              # Setup and utility scripts
│   ├── setup.ps1
│   ├── setup.sh
│   └── start-project.bat
├── railway.toml          # Railway deployment config
├── package.json          # Workspace configuration
└── README.md
```

```
mh26-services/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/             # API client functions
│   │   │   ├── auth.ts
│   │   │   ├── providers.ts
│   │   │   ├── bookings.ts
│   │   │   ├── messages.ts
│   │   │   ├── notifications.ts
│   │   │   ├── reviews.ts
│   │   │   ├── reports.ts
│   │   │   ├── admin.ts
│   │   │   ├── users.ts
│   │   │   └── appeals.ts
│   │   ├── components/      # React components
│   │   │   ├── AuthPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── ProviderDetailPage.tsx
│   │   │   ├── BookingModal.tsx
│   │   │   ├── MessagingPage.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProfilePictureUpload.tsx
│   │   │   └── ...
│   │   ├── context/         # React contexts
│   │   │   ├── UserContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   ├── hooks/           # Custom hooks
│   │   │   ├── useAuth.tsx
│   │   │   ├── useSocket.ts
│   │   │   └── useNotifications.ts
│   │   ├── lib/             # Utility functions
│   │   │   ├── axiosClient.ts
│   │   │   └── queryClient.ts
│   │   ├── pages/           # Page components
│   │   │   └── Settings.tsx
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json
│
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── db.ts
│   │   │   ├── redis.ts
│   │   │   ├── logger.ts
│   │   │   └── validateEnv.ts
│   │   ├── controllers/     # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── providerController.ts
│   │   │   ├── bookingController.ts
│   │   │   ├── messageController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── reportController.ts
│   │   │   ├── adminController.ts
│   │   │   ├── userController.ts
│   │   │   └── appealController.ts
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── validate.ts
│   │   │   ├── rateLimit.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── upload.ts
│   │   ├── models/          # Data models/schemas
│   │   │   └── schemas.ts
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts
│   │   │   ├── providers.ts
│   │   │   ├── bookings.ts
│   │   │   ├── messages.ts
│   │   │   ├── notifications.ts
│   │   │   ├── reviews.ts
│   │   │   ├── reports.ts
│   │   │   ├── admin.ts
│   │   │   ├── users.ts
│   │   │   ├── appeals.ts
│   │   │   └── health.ts
│   │   ├── services/        # Business logic
│   │   │   └── emailService.ts
│   │   ├── socket/          # Socket.io handlers
│   │   │   └── index.ts
│   │   ├── utils/           # Utility functions
│   │   │   ├── jwt.ts
│   │   │   ├── security.ts
│   │   │   └── otp.ts
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/       # Database migrations
│   │   └── seed.ts          # Seed data
│   └── package.json
│
├── docs/                    # Documentation
│   ├── SRS.md              # Software Requirements Specification
│   ├── UML_DIAGRAMS.md     # UML diagrams
│   ├── COMPLETE_PROJECT_DOCUMENTATION.md
│   ├── IMPLEMENTATION_STATUS.md
│   ├── COMPLETED_TASKS.md
│   ├── SEEDED_CREDENTIALS.md
│   └── ...
│
├── start-project.bat       # Windows startup script
├── .gitignore
└── package.json            # Root package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn**
- **PostgreSQL** 14+
- **Redis** 6+
- **Git**

### Option 1: Using Batch File (Windows)

```batch
# Simply double-click or run:
start-project.bat
```

### Option 2: Manual Setup

1. **Clone the repository**
```bash
git clone https://github.com/botvecna47/MH26-Services.git
cd MH26-Services
```

2. **Install dependencies**
```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

3. **Set up environment variables**

Create `server/.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mh26services"

# JWT
JWT_ACCESS_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Redis
REDIS_URL="redis://localhost:6379"

# File uploads use local storage (no configuration needed)

# Email (required for OTP verification during registration)
# See docs/EMAIL_SETUP.md or QUICK_EMAIL_SETUP.md for setup instructions
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

4. **Set up the database**
```bash
cd server

# Generate Prisma client
npm run generate

# Run migrations
npm run migrate:dev

# Seed database (optional)
npm run seed
```

5. **Start development servers**
```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

### Default Test Credentials

See `docs/SEEDED_CREDENTIALS.md` for test accounts after running the seed script.

---

## 📚 Documentation

### Available Documentation

#### Project Management
- **[Development Progress](./docs/DEVELOPMENT_PROGRESS.md)** - Detailed development log (Aug 20 - Sept 19, 2025)
- **[Agile Project Documentation](./docs/AGILE_PROJECT_DOCUMENTATION.md)** - Sprint tracking, user stories, and agile methodology

#### Technical Documentation
- **[Software Requirements Specification](./docs/SRS.md)** - Detailed requirements
- **[UML Diagrams](./docs/UML_DIAGRAMS.md)** - System architecture diagrams
- **[Implementation Status](./docs/IMPLEMENTATION_STATUS.md)** - Current progress tracking
- **[Completed Tasks](./docs/COMPLETED_TASKS.md)** - Task completion log

#### Setup & Configuration
- **[Seeded Credentials](./docs/SEEDED_CREDENTIALS.md)** - Test account information
- **[Email Setup Guide](./docs/EMAIL_SETUP.md)** - Detailed email configuration instructions
- **[Quick Email Setup](./QUICK_EMAIL_SETUP.md)** - Quick guide for Gmail SMTP setup
- **[Security Improvements](./SECURITY_IMPROVEMENTS.md)** - Security enhancements documentation
- **File Storage**: Uses local storage by default (no external services required)

### API Documentation

The API follows RESTful conventions. Base URL: `http://localhost:3000/api`

#### Main Endpoints

- **Authentication**: `/api/auth/*`
  - `POST /api/auth/register` - User registration (sends OTP via email)
  - `POST /api/auth/verify-registration-otp` - Verify email OTP and complete registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/refresh` - Refresh token
  - `POST /api/auth/logout` - User logout
  - `POST /api/auth/change-password` - Change password
  - `POST /api/auth/forgot-password` - Request password reset
  - `POST /api/auth/reset-password` - Reset password

- **Providers**: `/api/providers/*`
  - `GET /api/providers` - List providers
  - `GET /api/providers/:id` - Get provider details
  - `POST /api/providers` - Create provider application
  - `PATCH /api/providers/:id` - Update provider

- **Bookings**: `/api/bookings/*`
  - `POST /api/bookings` - Create booking (customer initiates booking request)
  - `GET /api/bookings` - List bookings (filtered by user role)
  - `GET /api/bookings/:id` - Get booking details
  - `POST /api/bookings/:id/accept` - Accept booking (provider action)
  - `POST /api/bookings/:id/reject` - Reject booking (provider action)
  - `PATCH /api/bookings/:id` - Update booking status (provider/admin)
  - `POST /api/bookings/:id/cancel` - Cancel booking (customer/provider)
  - `GET /api/bookings/:id/invoice` - Get invoice

- **Messages**: `/api/messages/*`
  - `GET /api/messages/conversations` - List conversations
  - `GET /api/messages/conversations/:id/messages` - Get messages
  - `POST /api/messages` - Send message

- **Admin**: `/api/admin/*`
  - `GET /api/admin/analytics` - Get analytics
  - `GET /api/admin/providers/pending` - Get pending providers
  - `POST /api/admin/providers/:id/approve` - Approve provider
  - `PATCH /api/admin/providers/:id/suspend` - Suspend provider
  - `PATCH /api/admin/providers/:id/unsuspend` - Unsuspend provider

For detailed API documentation, see the [Complete Project Documentation](./docs/COMPLETE_PROJECT_DOCUMENTATION.md).

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
   ```bash
   git fork https://github.com/botvecna47/MH26-Services.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write clear commit messages
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Ensure the application runs without errors
   - Test the feature you've added/modified
   - Check for any console errors

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes clearly

### Contribution Guidelines

- **Code Style**: Follow TypeScript best practices and existing code patterns
- **Commits**: Use conventional commit messages (feat:, fix:, docs:, etc.)
- **Testing**: Test your changes thoroughly before submitting
- **Documentation**: Update relevant documentation for new features
- **Issues**: Check existing issues before creating new ones

### Areas Where Help is Needed

- 🐛 **Bug Fixes**: Fix existing issues and improve stability
- ✨ **New Features**: Implement features from the roadmap
- 📝 **Documentation**: Improve and expand documentation
- 🧪 **Testing**: Write unit and integration tests
- 🎨 **UI/UX**: Improve user interface and experience
- ⚡ **Performance**: Optimize queries and improve performance
- 🔒 **Security**: Enhance security features and practices
- 🌐 **Internationalization**: Add multi-language support
- 📱 **Mobile**: Improve mobile responsiveness

### Getting Help

If you need help or have questions:

- **Discord**: Contact **botvecna__47** on Discord
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

---

## 📞 Support

### Contact

- **Discord**: **botvecna__47**
- **GitHub Issues**: [Open an issue](https://github.com/botvecna47/MH26-Services/issues)
- **Email**: Contact via Discord for direct communication

### Getting Help

1. **Check Documentation**: Review the docs folder for detailed information
2. **Search Issues**: Look for similar issues in the GitHub issues tab
3. **Ask on Discord**: Reach out to **botvecna__47** for quick help
4. **Create an Issue**: For bugs or feature requests, create a detailed issue

---

## 📊 Project Status

### Development Methodology
This project follows **Agile (Scrum-based)** methodology with 2-week sprints. Development period: August 20 - September 19, 2025.

**Sprint Summary**:
- **Sprint 1** (Aug 20 - Sept 2): Foundation & Core Features - 37 story points
- **Sprint 2** (Sept 3 - Sept 16): Booking System & Real-time Features - 49 story points
- **Sprint 3** (Sept 17 - Sept 19): Polish & Documentation - 13 story points

For detailed progress tracking, see [Development Progress](./docs/DEVELOPMENT_PROGRESS.md) and [Agile Documentation](./docs/AGILE_PROJECT_DOCUMENTATION.md).

### Current Progress: ~85% Complete

#### ✅ Completed Features
- Authentication & Authorization (100%)
- Provider Management (100%)
- Booking System (100%)
- Messaging System (100%)
- Reviews & Ratings (100%)
- Admin Dashboard (100%)
- Notifications (100%)
- User Settings (100%)
- Profile Picture Upload (100%)
- Provider Appeals (100%)
- File Upload (90%)

#### 🚧 In Progress
- SMS/OTP Integration (80% - backend ready, SMS service pending)
- Rate Limiting (70% - in-memory done, Redis pending)

#### 📋 Planned Features
- Payment Integration (Razorpay)
- Redis-based Rate Limiting
- API Documentation (Swagger)
- Comprehensive Test Coverage
- Mobile App (React Native)

---

## 🛠️ Development Scripts

### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run build           # Build both projects
npm run test            # Run all tests
```

### Backend (server/)
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run generate        # Generate Prisma client
npm run migrate:dev     # Create and apply migrations
npm run migrate:deploy  # Deploy migrations
npm run seed            # Seed database
npm run test            # Run tests
```

### Frontend (frontend/)
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test            # Run tests
npm run lint            # Lint code
```

---

## 🔒 Security

### Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT tokens with refresh token rotation
- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ Environment variable validation
- ✅ Secure file uploads
- ✅ Audit logging for admin actions

### Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets (min 32 characters)
- Keep dependencies updated
- Review code for security vulnerabilities
- Use HTTPS in production
- Implement proper error handling

---

## 📝 License

This project is **Proprietary**. All rights reserved.

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Express.js Community** - For the robust backend framework
- **Prisma Team** - For the excellent ORM
- **All Contributors** - For their valuable contributions
- **Open Source Community** - For the amazing tools and libraries

---

<div align="center">

**Built with ❤️ for MH26 Services**

[⬆ Back to Top](#-mh26-services-marketplace)

</div>
