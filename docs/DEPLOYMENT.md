# Deployment Guide for MH26 Services

This guide provides instructions on how to build and deploy the MH26 Services application for production.

## Prerequisites

-   Node.js (v18 or higher)
-   PostgreSQL Database
-   Redis (Optional, for caching/session store)
-   Google Cloud Console Account (for OAuth, Maps) - *Optional if using mock data*

## Environment Configuration

### Backend (.env)
Update `server/.env` with your production values:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/mh26_db"
JWT_SECRET="your_production_secret_key"
CORS_ORIGIN="https://your-frontend-domain.com"
NODE_ENV="production"
```

### Frontend (.env)
Update `frontend/.env` (or set build-time variables):
```env
VITE_API_BASE_URL="https://your-api-domain.com/api"
```

## Build Steps

### 1. Backend
The backend is written in TypeScript and needs to be compiled.
```bash
cd server
npm install
npm run build
```
This will create a `dist` folder. To run the server:
```bash
npm start
```

### 2. Frontend
The frontend is built using Vite.
```bash
cd frontend
npm install
npm run build
```
This will create a `dist` folder containing static files. Serve these files using Nginx, Apache, or upload to a static host (Vercel, Netlify).

## Database Migration
Ensure your production database has the correct schema:
```bash
cd server
npx prisma migrate deploy
```
To seed initial data (Admin user, Categories):
```bash
npx prisma db seed
```

## Running with PM2 (Recommended)
For a persistent production server, use PM2:
```bash
npm install -g pm2
cd server
pm2 start dist/index.js --name "mh26-backend"
```
