# Quick Start Guide - MH26 Services

## 🚀 Setup and Run Instructions

### Prerequisites
- Node.js 18+ installed
- Docker Desktop installed and running
- Git (optional)

### Step 1: Install Dependencies

```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Start Docker Services

```powershell
# Start PostgreSQL, Redis, and MinIO
npm run docker:up

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

Wait a few seconds for services to be ready.

### Step 3: Setup Database

```powershell
# Navigate to server directory
cd server

# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate:dev

# Seed database with sample data (35 providers, users, bookings)
npm run seed

# Go back to root
cd ..
```

### Step 4: Start Development Servers

```powershell
# From root directory, start both frontend and backend
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Alternative: Run Separately

```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🧪 Testing the Application

### 1. Open Frontend
Navigate to: http://localhost:5173

### 2. Test Registration
- Click "Sign Up"
- Fill in the form
- Choose "Book Services" (Customer) or "Offer Services" (Provider)
- Submit

### 3. Test Login
Use seeded credentials:
- **Admin**: admin@mh26services.com / admin123
- **Customer**: customer1@example.com / customer123
- **Provider**: provider1@example.com / provider123

### 4. Browse Providers
- Go to Services page
- See 35 providers from Nanded
- Filter by category (Plumbing, Electrical, Cleaning, etc.)

### 5. Test API Endpoints

```powershell
# Health check
curl http://localhost:3000/healthz

# Get providers
curl http://localhost:3000/api/providers?city=Nanded

# Register user
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"+91-9876543210\",\"password\":\"password123\",\"role\":\"CUSTOMER\"}'
```

## 🐛 Troubleshooting

### Docker Issues
```powershell
# Check if Docker is running
docker ps

# View logs
npm run docker:logs

# Restart services
npm run docker:down
npm run docker:up
```

### Database Issues
```powershell
# Reset database (WARNING: deletes all data)
cd server
npm run migrate:reset
npm run migrate:dev
npm run seed
```

### Port Already in Use
```powershell
# Change ports in:
# - frontend/vite.config.ts (port 5173)
# - server/.env (PORT=3000)
```

### Missing Dependencies
```powershell
# Reinstall all dependencies
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..
```

## 📝 Environment Variables

Create `.env` files if needed:

**server/.env**:
```
DATABASE_URL=postgresql://mh26_user:mh26_password@localhost:5432/mh26_services
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=dev-access-secret-min-32-characters
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-characters
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## ✅ Verification Checklist

- [ ] Docker services running (PostgreSQL, Redis, MinIO)
- [ ] Database migrated and seeded
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can register/login
- [ ] Can see providers list

## 🎉 You're Ready!

The application should now be running. Open http://localhost:5173 in your browser to start testing!

