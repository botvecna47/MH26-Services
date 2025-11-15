# Setup and Run Guide - MH26 Services

## 🚀 Complete Setup Instructions

### Option 1: With Docker (Recommended)

#### Step 1: Install Dependencies
```powershell
# From project root
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..
```

#### Step 2: Start Docker Services
```powershell
# Make sure Docker Desktop is running, then:
docker-compose -f docker-compose.dev.yml up -d

# Wait 10 seconds for services to start
Start-Sleep -Seconds 10
```

#### Step 3: Setup Database
```powershell
cd server

# Generate Prisma client
npm run generate

# Create database and run migrations
npm run migrate:dev

# Seed database (35 providers, users, bookings)
npm run seed

cd ..
```

#### Step 4: Start Servers
```powershell
# From root - starts both frontend and backend
npm run dev
```

### Option 2: Without Docker (Manual Setup)

If you don't have Docker, you need to install PostgreSQL and Redis manually:

#### 1. Install PostgreSQL
- Download from https://www.postgresql.org/download/
- Create database: `mh26_services`
- Create user: `mh26_user` with password: `mh26_password`

#### 2. Install Redis (Optional for development)
- Download from https://redis.io/download
- Or skip Redis - rate limiting will use in-memory store

#### 3. Update Environment Variables

Create `server/.env`:
```
DATABASE_URL=postgresql://mh26_user:mh26_password@localhost:5432/mh26_services
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=dev-access-secret-min-32-characters-long-for-security
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-characters-long-for-security
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Create `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

#### 4. Setup Database
```powershell
cd server
npm run generate
npm run migrate:dev
npm run seed
cd ..
```

#### 5. Start Servers
```powershell
npm run dev
```

## 🧪 Testing the Application

### 1. Open Browser
Navigate to: **http://localhost:5173**

### 2. Test Credentials (from seed)

**Admin:**
- Email: `admin@mh26services.com`
- Password: `admin123`

**Customer:**
- Email: `customer1@example.com`
- Password: `customer123`

**Provider:**
- Email: `provider1@example.com`
- Password: `provider123`

### 3. Test Features

- ✅ Sign Up / Sign In
- ✅ Browse Providers (35 providers in Nanded)
- ✅ View Provider Details
- ✅ Create Booking
- ✅ Dashboard (Overview, Bookings, Profile)

### 4. Test API Directly

```powershell
# Health check
curl http://localhost:3000/healthz

# Get providers
curl http://localhost:3000/api/providers?city=Nanded

# Register (PowerShell)
$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "+91-9876543210"
    password = "password123"
    role = "CUSTOMER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in server/.env
PORT=3001
```

### Database Connection Error
```powershell
# Check if PostgreSQL is running
# Windows: Check Services
services.msc

# Test connection
psql -U mh26_user -d mh26_services -h localhost
```

### Prisma Errors
```powershell
cd server
# Reset Prisma
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

### Frontend Not Loading
```powershell
cd frontend
# Clear cache and reinstall
rm -r node_modules
npm install
npm run dev
```

## ✅ Verification

Check these URLs:
- Frontend: http://localhost:5173 ✅
- Backend Health: http://localhost:3000/healthz ✅
- Backend API: http://localhost:3000/api/providers ✅

## 🎉 Success!

If you can:
1. ✅ See the homepage at http://localhost:5173
2. ✅ Register/Login successfully
3. ✅ See providers list
4. ✅ Access dashboard

Then everything is working! 🚀

