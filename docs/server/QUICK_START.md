# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your database and service credentials
```

### 3. Setup Database
```bash
# Option A: Use existing PostgreSQL
# Update DATABASE_URL in .env

# Option B: Use setup script (Linux/Mac)
chmod +x infra/db-setup.sh
./infra/db-setup.sh

# Generate Prisma client
npm run generate

# Run migrations
npm run migrate:dev

# Seed database (35 providers, users, bookings)
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## ✅ Verify Installation

### Test Health Endpoint
```bash
curl http://localhost:3000/healthz
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+91-9876543210",
    "password": "password123",
    "role": "CUSTOMER"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Providers List
```bash
curl http://localhost:3000/api/providers?city=Nanded
```

## 📚 Next Steps

1. Read `README.md` for detailed documentation
2. Check `DEVELOPER_ONBOARDING.md` for architecture details
3. Review `SECURITY_CHECKLIST.md` for security measures
4. See `BACKEND_IMPLEMENTATION_SUMMARY.md` for implementation status

## 🐛 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check database exists and user has permissions

### Redis Connection Error
- Check Redis is running: `redis-cli ping`
- Verify REDIS_URL in .env
- Redis is optional for development (rate limiting uses memory store)

### Port Already in Use
- Change PORT in .env
- Or kill process: `lsof -ti:3000 | xargs kill`

## 🎯 Default Credentials (After Seed)

- **Admin**: admin@mh26services.com / admin123
- **Customer**: customer1@example.com / customer123
- **Provider**: provider1@example.com / provider123

---

**Ready to build! 🚀**

