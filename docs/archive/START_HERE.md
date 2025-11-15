# 🚀 START HERE - MH26 Services Setup

## Quick Setup (5 minutes)

### Step 1: Install Dependencies ✅
```powershell
# Already done! Dependencies are installed.
```

### Step 2: Setup Database

**Option A: With Docker (Recommended)**
```powershell
# Start Docker Desktop first, then:
docker-compose -f docker-compose.dev.yml up -d

# Wait 10 seconds
Start-Sleep -Seconds 10

# Setup database
cd server
npm run migrate:dev
npm run seed
cd ..
```

**Option B: Without Docker (Manual PostgreSQL)**
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create database: `mh26_services`
3. Create user: `mh26_user` with password: `mh26_password`
4. Update `server/.env` with your connection string
5. Then run:
```powershell
cd server
npm run migrate:dev
npm run seed
cd ..
```

### Step 3: Start Servers

```powershell
# From project root - starts both frontend and backend
npm run dev
```

**Or start separately:**
```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🎯 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/healthz

## 🧪 Test Credentials

After seeding, use these credentials:

- **Admin**: admin@mh26services.com / admin123
- **Customer**: customer1@example.com / customer123  
- **Provider**: provider1@example.com / provider123

## ✅ What's Working

- ✅ All dependencies installed
- ✅ Prisma client generated
- ✅ Database schema ready
- ✅ Frontend and backend code ready
- ⏳ Database migration (run `npm run migrate:dev` in server/)
- ⏳ Database seeding (run `npm run seed` in server/)

## 🐛 Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Check `server/.env` has correct `DATABASE_URL`
- For Docker: `docker-compose -f docker-compose.dev.yml ps`

### Port Already in Use
- Change port in `server/.env` (PORT=3001)
- Or kill process: `netstat -ano | findstr :3000`

### Prisma Errors
```powershell
cd server
npm run generate
npm run migrate:dev
```

## 📚 Next Steps

1. Run database migration: `cd server && npm run migrate:dev`
2. Seed database: `cd server && npm run seed`
3. Start servers: `npm run dev`
4. Open http://localhost:5173

---

**Ready to go! 🎉**

