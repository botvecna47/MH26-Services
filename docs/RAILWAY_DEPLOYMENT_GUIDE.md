# Railway Deployment Guide
## MH26 Services Marketplace

Complete guide to deploy the MH26 Services platform (Backend, Frontend, and Database) on Railway.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Railway Account Setup](#2-railway-account-setup)
3. [Database Setup](#3-database-setup)
4. [Backend Deployment](#4-backend-deployment)
5. [Frontend Deployment](#5-frontend-deployment)
6. [Environment Variables](#6-environment-variables)
7. [Post-Deployment Steps](#7-post-deployment-steps)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

- ✅ GitHub account (code should be pushed to GitHub)
- ✅ Railway account (sign up at [railway.app](https://railway.app))
- ✅ Railway CLI installed (optional, but recommended)
- ✅ Basic understanding of environment variables

---

## 2. Railway Account Setup

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### Step 2: Install Railway CLI (Optional)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login
```

---

## 3. Database Setup

### Step 1: Create PostgreSQL Database

1. In Railway dashboard, click **"New Project"**
2. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database
4. Wait for the database to be provisioned (takes 1-2 minutes)

### Step 2: Get Database Connection String

1. Click on the PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the `DATABASE_URL` value
   - Format: `postgresql://postgres:password@hostname:port/railway`
4. **Save this URL** - you'll need it for the backend

### Step 3: Run Database Migrations

**Option A: Using Railway CLI**

```bash
# Link to your project
railway link

# Run migrations
cd server
railway run npm run migrate:deploy
```

**Option B: Using Railway Dashboard**

1. Go to your backend service (we'll create this next)
2. Go to **"Deployments"** → **"Deploy"**
3. In the build command, add migration step

---

## 4. Backend Deployment

### Step 1: Create Backend Service

1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select your repository: `MH26-Services` (or your repo name)
3. Railway will detect it's a Node.js project
4. Click **"Deploy Now"**

### Step 2: Configure Backend Service

1. Click on the newly created service
2. Go to **"Settings"** tab
3. Configure the following:

**Root Directory:**
```
server
```

**Build Command:**
```bash
npm install && npm run build && npx prisma generate
```

**Start Command:**
```bash
npm run migrate:deploy && npm start
```

**Watch Paths:**
```
server/**
```

### Step 3: Set Environment Variables

Go to **"Variables"** tab and add the following:

#### Required Variables

```env
# Database (from PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@hostname:port/railway

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-chars

# Application
NODE_ENV=production
PORT=3000
```

#### Optional Variables (Add if needed)

```env
# CORS (set to your frontend URL after deployment)
CORS_ORIGIN=https://your-frontend.railway.app

# Redis (optional - for production rate limiting)
REDIS_URL=redis://default:password@hostname:port

# AWS S3 (optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_PORT=587

# Payment Gateway (optional)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Step 4: Generate JWT Secrets

Use one of these methods to generate secure secrets:

**Option A: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option C: Online Tool**
- Visit: https://generate-secret.vercel.app/32

### Step 5: Deploy Backend

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button in Railway dashboard
3. Wait for deployment to complete (2-5 minutes)
4. Check **"Deployments"** tab for logs

### Step 6: Get Backend URL

1. Go to **"Settings"** → **"Generate Domain"**
2. Railway will create a URL like: `your-backend.railway.app`
3. **Save this URL** - you'll need it for the frontend

---

## 5. Frontend Deployment

### Step 1: Create Frontend Service

1. In the same Railway project, click **"New"** → **"GitHub Repo"**
2. Select the same repository
3. Railway will create a new service

### Step 2: Configure Frontend Service

1. Click on the frontend service
2. Go to **"Settings"** tab
3. Configure the following:

**Root Directory:**
```
frontend
```

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npx serve -s build -l 3000
```

**OR** (if using Vite preview):
```bash
npm run preview
```

**Watch Paths:**
```
frontend/**
```

### Step 3: Install Serve Package

Add `serve` to frontend dependencies:

**Option A: Add to package.json**
```json
{
  "scripts": {
    "preview": "vite preview",
    "serve": "serve -s build -l 3000"
  },
  "dependencies": {
    "serve": "^14.2.0"
  }
}
```

**Option B: Use Railway's static file serving**

Railway can serve static files automatically. Update build command:

```bash
npm install && npm run build
```

And start command:
```bash
npx serve -s build -l $PORT
```

### Step 4: Set Environment Variables

Go to **"Variables"** tab and add:

```env
# Backend API URL (from backend service)
VITE_API_BASE_URL=https://your-backend.railway.app/api

# Environment
NODE_ENV=production
```

**Important:** 
- Railway automatically sets `PORT` variable
- Use `$PORT` in your start command if needed

### Step 5: Deploy Frontend

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button
3. Wait for deployment (2-5 minutes)

### Step 6: Get Frontend URL

1. Go to **"Settings"** → **"Generate Domain"**
2. Railway will create a URL like: `your-frontend.railway.app`
3. **Update CORS_ORIGIN** in backend with this URL

---

## 6. Environment Variables

### Backend Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://...` |
| `JWT_ACCESS_SECRET` | ✅ Yes | JWT access token secret (min 32 chars) | `abc123...` |
| `JWT_REFRESH_SECRET` | ✅ Yes | JWT refresh token secret (min 32 chars) | `xyz789...` |
| `NODE_ENV` | ✅ Yes | Environment mode | `production` |
| `PORT` | ✅ Yes | Server port | `3000` |
| `CORS_ORIGIN` | ⚠️ Recommended | Frontend URL for CORS | `https://...` |
| `REDIS_URL` | ❌ Optional | Redis connection for rate limiting | `redis://...` |
| `AWS_*` | ❌ Optional | AWS S3 credentials | - |
| `SMTP_*` | ❌ Optional | Email service credentials | - |
| `RAZORPAY_*` | ❌ Optional | Payment gateway credentials | - |

### Frontend Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ Yes | Backend API URL | `https://backend.railway.app/api` |
| `NODE_ENV` | ✅ Yes | Environment mode | `production` |

---

## 7. Post-Deployment Steps

### Step 1: Update Backend CORS

1. Go to backend service → **"Variables"**
2. Update `CORS_ORIGIN` with your frontend URL:
   ```
   CORS_ORIGIN=https://your-frontend.railway.app
   ```
3. Railway will automatically redeploy

### Step 2: Run Database Seed (Optional)

If you want to seed the database with test data:

```bash
# Using Railway CLI
railway link
cd server
railway run npm run seed
```

**OR** add to backend start command temporarily:
```bash
npm run migrate:deploy && npm run seed && npm start
```

### Step 3: Test the Deployment

1. **Test Backend:**
   - Visit: `https://your-backend.railway.app/api/health`
   - Should return: `{ "status": "ok" }`

2. **Test Frontend:**
   - Visit: `https://your-frontend.railway.app`
   - Should load the homepage

3. **Test API Connection:**
   - Open browser console on frontend
   - Check if API calls are working
   - Look for CORS errors (if any)

### Step 4: Set Up Custom Domain (Optional)

1. Go to service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Add your domain
4. Follow Railway's DNS instructions

---

## 8. Troubleshooting

### Issue: Backend Fails to Start

**Error:** `Environment variable validation failed`

**Solution:**
- Check all required environment variables are set
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are at least 32 characters
- Check Railway logs for specific missing variables

---

### Issue: Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Ensure database service is running
3. Check if database is in the same Railway project
4. Try regenerating `DATABASE_URL` from database service

---

### Issue: Frontend Can't Connect to Backend

**Error:** `CORS error` or `Network error`

**Solution:**
1. Update `CORS_ORIGIN` in backend with frontend URL
2. Verify `VITE_API_BASE_URL` in frontend is correct
3. Check backend is running and accessible
4. Check Railway logs for CORS errors

---

### Issue: Prisma Migrations Fail

**Error:** `Migration failed`

**Solution:**
1. Ensure `DATABASE_URL` is set correctly
2. Run migrations manually:
   ```bash
   railway run npm run migrate:deploy
   ```
3. Check Prisma schema is valid
4. Verify database has proper permissions

---

### Issue: Build Fails

**Error:** `Build command failed`

**Solution:**
1. Check build logs in Railway dashboard
2. Verify all dependencies are in `package.json`
3. Ensure Node.js version is compatible (Railway uses Node 18+)
4. Check for TypeScript errors:
   ```bash
   npm run build
   ```

---

### Issue: Static Files Not Serving

**Error:** `404 on frontend routes`

**Solution:**
1. Ensure `serve` package is installed
2. Use correct start command:
   ```bash
   npx serve -s build -l $PORT
   ```
3. Check `build` directory exists after build
4. Verify `vite.config.ts` output directory

---

### Issue: Environment Variables Not Working

**Error:** `process.env.VARIABLE is undefined`

**Solution:**
1. Frontend: Use `VITE_` prefix for Vite variables
2. Backend: Variables are available as `process.env.VARIABLE`
3. Restart service after adding variables
4. Check variable names match exactly (case-sensitive)

---

## 9. Railway Configuration Files

### Create `railway.json` (Optional)

Create this file in project root for Railway-specific settings:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Create `nixpacks.toml` for Backend (Optional)

Create `server/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build", "npx prisma generate"]

[start]
cmd = "npm run migrate:deploy && npm start"
```

### Create `nixpacks.toml` for Frontend (Optional)

Create `frontend/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s build -l $PORT"
```

---

## 10. Quick Deployment Checklist

### Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] JWT secrets generated
- [ ] Database service created
- [ ] `DATABASE_URL` copied

### Backend Deployment

- [ ] Backend service created
- [ ] Root directory set to `server`
- [ ] Build command configured
- [ ] Start command configured
- [ ] Environment variables set
- [ ] Backend URL generated
- [ ] Health check passes

### Frontend Deployment

- [ ] Frontend service created
- [ ] Root directory set to `frontend`
- [ ] Build command configured
- [ ] Start command configured
- [ ] `VITE_API_BASE_URL` set
- [ ] Frontend URL generated
- [ ] Frontend loads correctly

### Post-Deployment

- [ ] CORS_ORIGIN updated in backend
- [ ] Database migrations run
- [ ] Database seeded (optional)
- [ ] API connection tested
- [ ] Custom domain set (optional)

---

## 11. Cost Estimation

Railway offers:

- **Free Tier:**
  - $5 free credit per month
  - 500 hours of usage
  - Perfect for development/testing

- **Pro Plan:**
  - $20/month
  - Unlimited usage
  - Better performance

**Estimated Costs:**
- Database: ~$5-10/month
- Backend: ~$5-10/month
- Frontend: ~$5/month
- **Total: ~$15-25/month** (on Pro plan)

---

## 12. Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

---

## 13. Support

If you encounter issues:

1. Check Railway logs in dashboard
2. Check Railway status: https://status.railway.app
3. Join Railway Discord for help
4. Review this guide's troubleshooting section

---

**Last Updated:** September 19, 2025  
**Railway Version:** Latest  
**Status:** ✅ Production Ready

