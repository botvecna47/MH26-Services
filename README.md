# MH26 Services Marketplace

Complete marketplace platform for local services in Nanded, Maharashtra.

## 🏗️ Project Structure

```
mh26-services/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + Prisma
└── infra/             # Docker, K8s configs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis 6+ (or use Docker)

### Development Setup

1. **Clone and install**
```bash
git clone <repo-url>
cd mh26-services
npm install
```

2. **Setup environment**
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your configuration
```

3. **Start services with Docker**
```bash
npm run docker:up
# This starts PostgreSQL and Redis
```

4. **Setup database**
```bash
npm run migrate
npm run seed
```

5. **Start development servers**
```bash
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

## 📦 Workspace Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run build` - Build both projects
- `npm run test` - Run all tests
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

## 🔧 Production Keys

### S3 (File Storage)
1. Create AWS S3 bucket or use S3-compatible service (MinIO, DigitalOcean Spaces)
2. Create IAM user with S3 access
3. Update `backend/.env`:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=ap-south-1
   ```

### Razorpay (Payments)
1. Sign up at https://razorpay.com
2. Get API keys from dashboard
3. Update `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=your_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

### SendGrid (Email) - Optional
1. Sign up at https://sendgrid.com
2. Create API key
3. Update `backend/.env`:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   ```

### Twilio (SMS/OTP) - Optional
1. Sign up at https://twilio.com
2. Get Account SID and Auth Token
3. Update `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## 📚 Documentation

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Developer Onboarding](./backend/DEVELOPER_ONBOARDING.md)
- [Deployment Guide](./backend/DEPLOYMENT_GUIDE.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

## 🐳 Docker Development

```bash
# Start all services (PostgreSQL, Redis)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## 📝 Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection URL
- `JWT_ACCESS_SECRET` - JWT secret (use strong random string)
- `JWT_REFRESH_SECRET` - JWT refresh secret
- `AWS_*` - S3 credentials
- `RAZORPAY_*` - Payment gateway credentials

## 🔒 Security

- All passwords hashed with bcrypt (12 rounds)
- JWT tokens with refresh token rotation
- Rate limiting on all endpoints
- Input validation with Zod
- Security headers with Helmet
- CORS configured
- Audit logging for admin actions

## 📞 Support

For issues and questions, contact the development team.

---

**Built with ❤️ for MH26 Services**
