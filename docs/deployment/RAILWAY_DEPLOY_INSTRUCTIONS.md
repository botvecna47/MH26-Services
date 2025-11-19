# Railway One-Click Deployment Instructions

## Quick Deploy Guide

This file contains instructions for deploying MH26 Services to Railway in one go.

---

## Step 1: Prepare Your Repository

1. Ensure all code is pushed to GitHub
2. Verify `railway.toml` is in the root directory
3. Make sure `server/` and `frontend/` directories exist

---

## Step 2: Deploy to Railway

### Option A: Using Railway Dashboard (Recommended)

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `MH26-Services` (or your repo name)
6. **Railway will automatically detect `railway.toml`**
7. **Click "Deploy"**

Railway will automatically:
- ✅ Create PostgreSQL database
- ✅ Create backend service
- ✅ Create frontend service
- ✅ Link services together

---

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project or create new
railway link

# Deploy
railway up
```

---

## Step 3: Configure Environment Variables

After Railway creates the services, you need to set environment variables:

### Backend Service Variables

Go to **Backend Service** → **Variables** tab and add:

```env
# Required
JWT_ACCESS_SECRET=your-super-secret-access-token-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-minimum-32-characters-long

# Optional (set after frontend deploys)
CORS_ORIGIN=https://your-frontend.railway.app
```

**Generate JWT Secrets:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Frontend Service Variables

Go to **Frontend Service** → **Variables** tab and add:

```env
# Required (get this from backend service URL)
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

**To get backend URL:**
1. Go to Backend Service
2. Click **Settings** → **Generate Domain**
3. Copy the URL (e.g., `mh26-backend-production.up.railway.app`)
4. Add `/api` to the end for `VITE_API_BASE_URL`

---

## Step 4: Get Service URLs

### Backend URL
1. Go to **Backend Service**
2. Click **Settings** → **Generate Domain**
3. Copy URL: `https://your-backend.railway.app`

### Frontend URL
1. Go to **Frontend Service**
2. Click **Settings** → **Generate Domain**
3. Copy URL: `https://your-frontend.railway.app`

### Database URL
1. Go to **Database Service**
2. Click **Variables** tab
3. Copy `DATABASE_URL` (automatically set for backend)

---

## Step 5: Update CORS and API URL

After getting both URLs:

1. **Update Backend CORS:**
   - Go to Backend Service → Variables
   - Set `CORS_ORIGIN=https://your-frontend.railway.app`

2. **Update Frontend API URL:**
   - Go to Frontend Service → Variables
   - Set `VITE_API_BASE_URL=https://your-backend.railway.app/api`

3. **Railway will automatically redeploy** both services

---

## Step 6: Verify Deployment

### Test Backend
```bash
curl https://your-backend.railway.app/api/health
```
Should return: `{"status":"ok"}`

### Test Frontend
1. Visit: `https://your-frontend.railway.app`
2. Should load the homepage
3. Check browser console for errors

### Test Database
1. Backend should connect automatically
2. Check backend logs for database connection success
3. Migrations run automatically on startup

---

## Step 7: Seed Database (Optional)

To add test data:

```bash
# Using Railway CLI
railway link
cd server
railway run npm run seed
```

Or temporarily add to backend start command:
```bash
npm run migrate:deploy && npm run seed && npm start
```

---

## Troubleshooting

### Services Not Creating
- Check `railway.toml` is in root directory
- Verify file syntax is correct
- Try deploying manually from Railway dashboard

### Build Fails
- Check build logs in Railway dashboard
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

### Database Connection Fails
- Verify `DATABASE_URL` is set (automatically from database service)
- Check database service is running
- Review backend logs for connection errors

### Frontend Can't Connect to Backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check `CORS_ORIGIN` in backend matches frontend URL
- Ensure backend is running and accessible

---

## Environment Variables Summary

### Backend (Required)
- `DATABASE_URL` - Auto-set from database service
- `JWT_ACCESS_SECRET` - Min 32 characters
- `JWT_REFRESH_SECRET` - Min 32 characters
- `NODE_ENV` - Set to "production"
- `PORT` - Set to "3000"
- `CORS_ORIGIN` - Frontend URL (set after deployment)

### Frontend (Required)
- `VITE_API_BASE_URL` - Backend URL + "/api"
- `NODE_ENV` - Set to "production"

### Optional (Add if needed)
- `REDIS_URL` - For rate limiting
- `AWS_*` - For S3 file uploads
- `SMTP_*` - For email service
- `RAZORPAY_*` - For payments

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] `railway.toml` in root directory
- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] Database service created
- [ ] Backend service created
- [ ] Frontend service created
- [ ] JWT secrets generated and set
- [ ] Backend URL generated
- [ ] Frontend URL generated
- [ ] `VITE_API_BASE_URL` set in frontend
- [ ] `CORS_ORIGIN` set in backend
- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] Database migrations run
- [ ] Test data seeded (optional)

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Full Deployment Guide: `docs/RAILWAY_DEPLOYMENT_GUIDE.md`

---

**Last Updated:** September 19, 2025

