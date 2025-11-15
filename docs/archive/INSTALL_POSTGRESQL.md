# 🐘 Install PostgreSQL - Step by Step

## Quick Installation Guide

### Step 1: Download PostgreSQL

1. **Go to**: https://www.postgresql.org/download/windows/
2. **Click**: "Download the installer" (EnterpriseDB)
3. **Download**: PostgreSQL 15.x (or 14.x) - Windows x86-64
4. **File size**: ~200MB

### Step 2: Run Installer

1. **Double-click** the downloaded `.exe` file
2. **Click "Next"** through the welcome screen
3. **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\15`)
4. **Select Components**: Keep all checked ✅
   - PostgreSQL Server
   - pgAdmin 4 (GUI tool - very useful!)
   - Stack Builder
   - Command Line Tools
5. **Data Directory**: Keep default
6. **Password**: **IMPORTANT** - Set a password for the `postgres` superuser
   - Example: `postgres123` (or your own secure password)
   - **Remember this password!** You'll need it.
7. **Port**: Keep default `5432`
8. **Advanced Options**: Keep default (Locale: [Default locale])
9. **Ready to Install**: Click "Next"
10. **Wait** for installation (2-3 minutes)
11. **Stack Builder**: You can skip this (click "Cancel")

### Step 3: Verify Installation

Open **PowerShell** and run:

```powershell
# Check if PostgreSQL is installed
psql --version
```

If you see a version number, ✅ PostgreSQL is installed!

If you get an error, add PostgreSQL to your PATH:
1. Search "Environment Variables" in Windows
2. Edit "Path" under System variables
3. Add: `C:\Program Files\PostgreSQL\15\bin`
4. Restart PowerShell

### Step 4: Create Database for MH26 Services

**Option A: Using pgAdmin (Easiest - Recommended)**

1. **Open pgAdmin 4** from Start menu
2. **Enter master password** (the one you set during installation)
3. **Expand "Servers"** → **"PostgreSQL 15"**
4. **Right-click "Databases"** → **"Create"** → **"Database"**
5. **Database name**: `mh26_services`
6. **Owner**: `postgres`
7. **Click "Save"**

**Option B: Using Command Line**

Open PowerShell and run:

```powershell
# Connect to PostgreSQL (enter your master password when prompted)
psql -U postgres

# Then paste these commands one by one:
CREATE DATABASE mh26_services;
CREATE USER mh26_user WITH PASSWORD 'mh26_password';
GRANT ALL PRIVILEGES ON DATABASE mh26_services TO mh26_user;
\q
```

### Step 5: Configure Project

Create `server/.env` file:

```env
DATABASE_URL=postgresql://mh26_user:mh26_password@localhost:5432/mh26_services
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=dev-access-secret-min-32-characters-long-for-security
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-characters-long-for-security
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Step 6: Run Migrations

```powershell
cd server
npm run migrate:dev
npm run seed
cd ..
```

## 🎯 What You Need

- **PostgreSQL installed** ✅
- **Database created**: `mh26_services` ✅
- **User created**: `mh26_user` with password `mh26_password` ✅
- **Environment file**: `server/.env` with connection string ✅
- **Migrations applied**: Initial schema created ✅

## 🆘 Need Help?

### PostgreSQL Service Not Running
```powershell
# Check if service is running
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-15
```

### Can't Connect
- Make sure PostgreSQL service is running
- Check password is correct
- Verify port 5432 is not blocked by firewall

### Forgot Password
- You can reset it in pgAdmin
- Or reinstall PostgreSQL (last resort)

## ✅ Installation Complete!

If you've successfully:
- ✅ Installed PostgreSQL
- ✅ Created database `mh26_services`
- ✅ Created user `mh26_user`
- ✅ Run `npm run migrate:dev` (migration named `init`)
- ✅ Run `npm run seed`

**You're all set!** 🎉

## 🔧 Troubleshooting (Common Issues)

### Issue: Permission denied for schema public
**Solution**: Run `.\fix-all-permissions.ps1` or use postgres user temporarily

### Issue: Authentication failed for mh26_user
**Solution**: Run `.\create-user-and-db.ps1` to recreate user with correct password

### Issue: Cannot create shadow database
**Solution**: Grant CREATEDB permission: `ALTER USER mh26_user CREATEDB;`

---

**Next Steps**: 
1. Run `npm run seed` to populate database with sample data
2. Start the backend: `npm run dev`
3. Start the frontend: `cd ../frontend && npm run dev`


