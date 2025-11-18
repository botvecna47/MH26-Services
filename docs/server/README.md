# MH26 Services Backend API

Production-ready backend for MH26 Services marketplace built with Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, and Socket.io.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- AWS S3 (or S3-compatible storage)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

### Database Setup

```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate:dev

# Seed database (35 providers, users, bookings)
npm run seed
```

### Development

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed script
├── src/
│   ├── config/           # Configuration (DB, Redis, S3, Logger)
│   ├── middleware/       # Express middleware (auth, validation, rate limit)
│   ├── routes/           # API routes
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic
│   ├── models/           # TypeScript types and Zod schemas
│   ├── utils/            # Utilities (JWT, security, email)
│   ├── socket/           # Socket.io setup
│   ├── app.ts            # Express app configuration
│   └── index.ts          # Application entry point
├── tests/                # Test files
└── infra/                # Infrastructure scripts
```

## 🔐 Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `REDIS_URL` - Redis connection URL
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `AWS_S3_BUCKET` - S3 bucket name
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email` - Verify email address

### Providers
- `GET /api/providers` - List providers (with filters)
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Create provider application
- `PATCH /api/providers/:id` - Update provider
- `POST /api/providers/:id/documents` - Upload documents
- `POST /api/providers/:id/approve` - Approve provider (Admin)
- `POST /api/providers/:id/reject` - Reject provider (Admin)

### Bookings
- `POST /api/bookings` - Create booking (customer initiates booking request)
- `GET /api/bookings` - List bookings (filtered by user role)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/accept` - Accept booking (provider action)
- `POST /api/bookings/:id/reject` - Reject booking (provider action)
- `PATCH /api/bookings/:id` - Update booking status (provider/admin)
- `POST /api/bookings/:id/cancel` - Cancel booking (customer/provider)
- `GET /api/bookings/:id/invoice` - Get invoice

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `POST /api/webhooks/razorpay` - Razorpay webhook

### Messages
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/conversations` - Start conversation
- `POST /api/messages` - Send message

### Admin
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/providers/pending` - Get pending providers
- `POST /api/admin/providers/:id/approve` - Approve provider
- `GET /api/admin/users` - List users
- `GET /api/admin/reports` - List reports

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Rate limiting (Redis-backed)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation (Zod)
- ✅ XSS protection
- ✅ SQL injection prevention (Prisma)
- ✅ Audit logging for admin actions
- ✅ Encrypted sensitive data (AES-256)

## 🧪 Testing

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📊 Database

### Migrations

```bash
# Create new migration
npm run migrate:dev

# Apply migrations (production)
npm run migrate:deploy

# Reset database
npm run migrate:reset
```

### Seed Data

The seed script creates:
- 1 admin user
- 5 customer users
- 35 providers (5 per category: Plumbing, Electrical, Cleaning, Salon, Tutoring, Fitness, Catering)
- 20 bookings
- 20 transactions
- Service categories

## 🔌 Socket.io

Real-time features:
- Message notifications
- Booking updates
- Provider approval notifications

Connect with:
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-access-token' }
});
```

## 📝 API Documentation

OpenAPI/Swagger spec available at `/api-docs` (when implemented).

## 🚢 Deployment

See `infra/` directory for deployment scripts and configurations.

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure production database
- [ ] Set up Redis
- [ ] Configure S3 bucket
- [ ] Set up Razorpay production keys
- [ ] Configure CORS origins
- [ ] Set up monitoring (Sentry)
- [ ] Enable HTTPS
- [ ] Set up backup strategy

## 📞 Support

For issues and questions, contact the development team.

---

**Built with ❤️ for MH26 Services**

