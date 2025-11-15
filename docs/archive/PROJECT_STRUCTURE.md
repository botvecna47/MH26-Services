# MH26 Services - Complete Project Structure

## 📁 File Tree

```
mh26-services/
├── README.md                      # Main project README
├── .env.example                   # Environment variables template
├── package.json                    # Workspace scripts
├── docker-compose.dev.yml          # Docker services (PostgreSQL, Redis, MinIO)
│
├── frontend/                       # React + Vite + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── README.md
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx                # App entry point
│       ├── App.tsx                 # Router setup
│       ├── index.css               # Global styles
│       ├── hooks/
│       │   ├── useAuth.ts          # Auth context & provider
│       │   └── useSocket.ts        # Socket.io hook
│       ├── api/
│       │   ├── axiosClient.ts      # Axios instance with interceptors
│       │   ├── auth.ts             # Auth API types & functions
│       │   ├── providers.ts         # Providers API
│       │   ├── bookings.ts          # Bookings API
│       │   └── admin.ts             # Admin API
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.tsx      # Button component
│       │   │   ├── Input.tsx       # Input component
│       │   │   ├── Modal.tsx       # Modal component
│       │   │   └── tabs.tsx        # Tabs component
│       │   ├── PhoneReveal.tsx     # Phone reveal with auth
│       │   ├── ProviderCard.tsx    # Provider card component
│       │   ├── ReportProviderModal.tsx  # Report modal
│       │   ├── NotificationCenter.tsx    # Notifications
│       │   ├── Navigation.tsx     # Navbar
│       │   └── Footer.tsx          # Footer
│       ├── pages/
│       │   ├── Home.tsx            # Home page
│       │   ├── Services.tsx       # Services listing
│       │   ├── ProviderDetail.tsx  # Provider details
│       │   ├── Auth/
│       │   │   ├── SignIn.tsx      # Sign in page
│       │   │   └── SignUp.tsx      # Sign up page
│       │   ├── Dashboard/
│       │   │   └── Dashboard.tsx   # Unified dashboard
│       │   ├── ProviderOnboarding.tsx
│       │   └── AdminPanel.tsx
│       ├── lib/
│       │   ├── utils.ts            # Utility functions
│       │   └── socket.ts           # Socket.io client
│       ├── styles/
│       │   └── tokens.css          # Design tokens
│       └── seed/
│           └── mockData.ts         # Mock data for dev
│
├── backend/                        # Node.js + Express + Prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                 # Seed script
│   └── src/
│       ├── server.ts               # Server entry point
│       ├── app.ts                 # Express app setup
│       ├── config/
│       │   ├── database.ts         # Prisma client
│       │   ├── redis.ts            # Redis client
│       │   └── s3.ts               # S3 configuration
│       ├── routes/
│       │   ├── auth.ts             # Auth routes
│       │   ├── providers.ts        # Provider routes
│       │   ├── bookings.ts         # Booking routes
│       │   ├── messages.ts         # Message routes
│       │   └── admin.ts            # Admin routes
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── providerController.ts
│       │   └── bookingController.ts
│       ├── services/
│       │   ├── emailService.ts
│       │   ├── paymentService.ts
│       │   └── uploadService.ts
│       ├── middleware/
│       │   ├── auth.ts             # JWT auth
│       │   ├── validate.ts         # Zod validation
│       │   └── rateLimit.ts        # Rate limiting
│       ├── socket/
│       │   └── index.ts            # Socket.io setup
│       └── utils/
│           ├── logger.ts           # Winston logger
│           └── jwt.ts              # JWT utilities
│
└── infra/                          # Infrastructure
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── k8s/                        # Kubernetes configs (optional)
```

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm install

# Start Docker services (PostgreSQL, Redis, MinIO)
npm run docker:up

# Setup database
npm run migrate
npm run seed

# Start development servers
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

## 📝 Key Files

### Frontend
- `frontend/src/api/axiosClient.ts` - Axios instance with JWT interceptors
- `frontend/src/hooks/useAuth.ts` - Authentication context
- `frontend/src/components/ui/*` - Reusable UI components

### Backend
- `backend/src/config/database.ts` - Prisma client singleton
- `backend/src/server.ts` - Express + Socket.io server
- `backend/prisma/schema.prisma` - Database schema

## 🔧 Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_ACCESS_SECRET` - JWT secret
- `AWS_*` - S3 credentials
- `RAZORPAY_*` - Payment gateway

## 📚 Documentation

- [Main README](./README.md) - Setup and overview
- [Frontend README](./frontend/README.md) - Frontend details
- [Backend README](./backend/README.md) - Backend details

---

**Complete monorepo structure ready for development! 🎉**

