# MH26 Services Deployment Research
## For Nanded City Users 🇮🇳

> **Last Updated**: December 14, 2025  
> **Purpose**: Complete deployment analysis for college demo, budget, and production scenarios

---

## 📊 Executive Summary

| Component | College Demo (Free) | Budget (₹400-1200/mo) | Production |
|-----------|--------------------|-----------------------|------------|
| **Frontend** | Vercel Free | Vercel Free | Vercel Pro |
| **Backend** | Render Free | Render Starter ($7) | Railway/Fly.io |
| **Database** | Aiven Free ✅ | Aiven Free ✅ | Aiven/Supabase Paid |
| **Email** | Logs Only | Resend Free | Resend/SendGrid |
| **Redis** | In-Memory | Upstash Free | Upstash Pro |
| **Cost** | ₹0 | ~₹600-1000/mo | ₹2000+/mo |

---

## 🌍 Latency Considerations for Nanded, India

| Service | Nearest Region | Latency from Nanded |
|---------|---------------|---------------------|
| **Vercel** | Mumbai (bom1) ✅ | ~20-50ms |
| **Render** | Singapore 🔶 | ~80-150ms |
| **Railway** | US/EU regions ❌ | ~200-400ms |
| **Aiven** | Mumbai available ✅ | ~20-50ms |
| **Upstash** | Mumbai available ✅ | ~20-50ms |

> **Recommendation**: Use Vercel (Mumbai) for frontend, Aiven Mumbai for DB, and accept Render Singapore latency for backend.

---

## 🎓 Scenario 1: College Demo (₹0)

**Best for**: Project demos, evaluations, short-term showcases

### Architecture
```
┌─────────────────────┐     ┌─────────────────────┐
│   Vercel (Mumbai)   │◄───►│   Render (Singapore)│
│   React Frontend    │     │   Express Backend   │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
             ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
             │Aiven (Mumbai)│    │ In-Memory   │    │ Console Log │
             │  PostgreSQL  │    │  OTP Store  │    │   Emails    │
             └─────────────┘    └─────────────┘    └─────────────┘
```

### Services & Limitations

| Service | Free Tier | Limitation | Workaround |
|---------|-----------|-----------|------------|
| **Vercel** | 100GB bandwidth, 1M requests | No commercial use | Fine for demo |
| **Render Backend** | 750 hrs/month | **Idles after 15min** | UptimeRobot ping |
| **Aiven DB** | 5GB, 20 connections | No pooling | `connection_limit=5` |
| **Email** | None | **SMTP BLOCKED** | OTP in server logs |
| **Redis** | None | In-memory resets | Re-request OTP |

### ⚠️ Key Issues & Solutions

#### Issue 1: SMTP Blocked (Critical)
```
❌ Your Gmail SMTP will NOT work on Render free tier
```
**Solution**: Accept OTP-in-logs for demo
- OTPs print to Render dashboard logs
- During demo: check logs to get OTP manually
- Tell evaluators this is a known free-tier limitation

#### Issue 2: Service Idling
```
❌ Backend sleeps after 15 min → 30-60sec cold start
```
**Solution**: Use free monitoring to keep alive
- [UptimeRobot](https://uptimerobot.com/) - 5 min intervals, free
- [Cron-job.org](https://cron-job.org/) - 1 min intervals, free

#### Issue 3: In-Memory OTP Loss
```
❌ OTPs lost when service restarts/idles
```
**Solution**: Just re-request OTP if expired

### Environment Variables (Demo)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@aiven-host:port/db?sslmode=require&connection_limit=5
JWT_ACCESS_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret
PORT=10000
CORS_ORIGIN=https://your-frontend.vercel.app
# NO SMTP - intentionally missing, will use log fallback
```

---

## 💰 Scenario 2: Budget Deployment (₹600-1200/mo)

**Best for**: Active development, beta testing, small user base

### What You Get
- ✅ **Real emails work** (Resend API)
- ✅ **No cold starts** (Render Starter)
- ✅ **Persistent OTP storage** (Upstash)
- ✅ Still mostly free services

### Cost Breakdown (INR)
| Service | Plan | Cost/Month |
|---------|------|------------|
| Vercel | Free | ₹0 |
| Render | Starter | ~₹600 ($7) |
| Aiven DB | Free | ₹0 |
| Resend | Free (3K emails) | ₹0 |
| Upstash | Free (10K/day) | ₹0 |
| **Total** | | **~₹600/mo** |

### Key Upgrades

#### 1. Email: Switch to Resend API
```typescript
// server/src/services/resendService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailViaResend(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: 'MH26 Services <noreply@your-domain.com>',
    to: [to],
    subject,
    html,
  });
}
```

**Free Tier**: 3,000 emails/month, 100/day  
**Setup**: Requires domain verification (or use test domain)

#### 2. OTP Storage: Upstash Redis
```typescript
// Use HTTP-based Redis (works on Render)
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
```

**Free Tier**: 10,000 requests/day, 256MB

#### 3. Render Paid: No Idling
- Upgrade to Starter ($7/mo)
- SMTP ports **UNLOCKED**
- Zero cold starts

### Environment Variables (Budget)
```env
NODE_ENV=production
DATABASE_URL=postgresql://...?sslmode=require&connection_limit=5

# Email via Resend
RESEND_API_KEY=re_xxxxxxxxxxxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx

# JWT & CORS
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## 🚀 Scenario 3: Production Deployment (₹2000+/mo)

**Best for**: Small-scale launch, testing with real users

### Recommended Services

| Component | Service | Region | Est. Cost |
|-----------|---------|--------|-----------|
| **Frontend** | Vercel Pro | Mumbai | $20/mo |
| **Backend** | Fly.io | Mumbai | ~$5-15/mo |
| **Database** | Aiven Startup | Mumbai | ~$19/mo |
| **Redis** | Upstash Pro | Mumbai | ~$10/mo |
| **Email** | Resend Pro | - | $20/mo |
| **Total** | | | **~₹6000-7000/mo** |

---

## 🏙️ Scenario 4: City-Scale Production (Nanded - 500K+ Population)

**Best for**: Real deployment serving Nanded city residents at scale

### 📊 User & Load Estimates

| Metric | Conservative | Optimistic | Peak |
|--------|--------------|------------|------|
| **Registered Users** | 25,000 (5%) | 50,000 (10%) | 100,000 (20%) |
| **Daily Active Users** | 2,500 | 5,000 | 10,000 |
| **Concurrent Users** | 250-500 | 500-1,000 | 2,000+ |
| **Bookings/Day** | 100-200 | 300-500 | 1,000+ |
| **Database Size (1 year)** | 10-20 GB | 30-50 GB | 100+ GB |
| **Emails/Month** | 5,000-10,000 | 20,000-40,000 | 100,000+ |

### 🏗️ Enterprise Architecture

```
                         ┌─────────────────────────────┐
                         │   Cloudflare (Mumbai Edge)  │
                         │   DDoS + CDN + WAF          │
                         └────────────┬────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
    ┌─────────▼─────────┐   ┌─────────▼─────────┐   ┌─────────▼─────────┐
    │  Vercel (Mumbai)  │   │    Load Balancer  │   │  Static Assets    │
    │  React Frontend   │   │    (AWS ALB)      │   │  (Cloudflare R2)  │
    └───────────────────┘   └─────────┬─────────┘   └───────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
          ┌─────────▼────┐   ┌────────▼─────┐   ┌──────▼──────┐
          │ Backend #1   │   │ Backend #2   │   │ Backend #3  │
          │ (AWS EC2/ECS)│   │ (Auto-scale) │   │ (Reserve)   │
          └──────┬───────┘   └──────┬───────┘   └──────┬──────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
    ┌─────────────┬─────────────────┼─────────────────┬─────────────┐
    │             │                 │                 │             │
┌───▼───┐   ┌─────▼─────┐   ┌───────▼───────┐   ┌─────▼─────┐   ┌───▼───┐
│Primary│   │ Read      │   │   PgBouncer   │   │ Upstash   │   │ S3    │
│  DB   │◄──│ Replica   │   │ (Connection   │   │ Redis     │   │ Files │
│(Write)│   │ (Read)    │   │  Pooling)     │   │ Caching   │   │       │
└───────┘   └───────────┘   └───────────────┘   └───────────┘   └───────┘
```

### ⚙️ Critical Infrastructure Components

#### 1. Database Scaling (Most Critical)

| Challenge | Solution | Why |
|-----------|----------|-----|
| **20 connection limit (Aiven Free)** | Upgrade to Aiven Business ($99/mo) or AWS RDS | Supports 100+ connections |
| **No connection pooling** | Add **PgBouncer** | Multiplex 1000s of app connections → 50 DB connections |
| **Read-heavy workload** | **Read Replicas** | Bookings list, search → replica; writes → primary |
| **50GB+ storage** | Managed DB upgrade | Aiven Business: 80GB included |
| **High availability** | Multi-node with failover | Zero downtime during failures |

**Recommended DB Setup:**
```
Primary: Aiven Business (Mumbai) - $99/mo
├── 2 vCPUs, 4GB RAM, 80GB storage
├── Automatic backups
├── Connection pooling via PgBouncer
└── Read replica for queries
```

#### 2. Backend Scaling

| Users | Instances | RAM/Instance | Est. Cost |
|-------|-----------|--------------|-----------|
| 500 concurrent | 2 | 1GB | ~$20/mo |
| 1,000 concurrent | 3 | 2GB | ~$50/mo |
| 2,000+ concurrent | 4-6 | 2-4GB | ~$100-200/mo |

**Options:**
- **AWS EC2 (Mumbai)**: t3.small ($15/mo) with auto-scaling
- **Fly.io (Singapore)**: $5-10 per machine, easy scaling
- **DigitalOcean (Bangalore)**: $12/mo droplets

#### 3. Caching Strategy (Critical for Performance)

```typescript
// Redis caching layers
const CACHE_STRATEGY = {
  // Hot data - frequently accessed
  'services:list': '1 hour',
  'categories:all': '24 hours',
  'provider:profile:{id}': '15 minutes',
  
  // Session data
  'otp:{email}': '10 minutes',
  'session:{userId}': '24 hours',
  
  // Query cache
  'search:results:{hash}': '5 minutes',
  'bookings:user:{id}': '2 minutes',
};
```

**Upstash Pro Plan**: $10/mo (100K requests/day) → sufficient for 2000 concurrent users

#### 4. Email at Scale

| Volume | Service | Cost |
|--------|---------|------|
| <10K/mo | Resend Free | ₹0 |
| 10K-50K/mo | Resend Pro | $20/mo |
| 50K-100K/mo | AWS SES (Mumbai) | ~$5/mo |
| 100K+/mo | AWS SES | $0.10 per 1000 |

**Recommendation**: AWS SES for city-scale (much cheaper at volume)

### 💰 City-Scale Cost Breakdown

#### Option A: Managed Services (Easier, Higher Cost)

| Component | Service | Monthly Cost (INR) |
|-----------|---------|-------------------|
| Frontend | Vercel Pro | ₹1,700 ($20) |
| Backend (3 instances) | Fly.io | ₹4,200 ($50) |
| Database | Aiven Business (Mumbai) | ₹8,400 ($99) |
| Redis | Upstash Pro | ₹850 ($10) |
| Email | AWS SES | ₹500 ($6) |
| CDN/Security | Cloudflare Pro | ₹1,700 ($20) |
| File Storage | Cloudflare R2 | ₹400 ($5) |
| Monitoring | Sentry (free tier) | ₹0 |
| **Total** | | **~₹17,750/mo ($210)** |

#### Option B: AWS India (Best Performance, Medium Complexity)

| Component | Service | Monthly Cost (INR) |
|-----------|---------|-------------------|
| Frontend | Vercel Pro | ₹1,700 ($20) |
| Backend | 2x EC2 t3.small (Mumbai) | ₹2,500 ($30) |
| Database | RDS db.t3.medium (Mumbai) | ₹5,000 ($60) |
| Redis | ElastiCache t3.micro | ₹1,200 ($15) |
| Email | SES | ₹400 ($5) |
| Load Balancer | ALB | ₹1,500 ($18) |
| S3 Storage | 50GB | ₹100 ($1) |
| **Total** | | **~₹12,400/mo ($150)** |

#### Option C: Self-Managed VPS (Cheapest, Most Work)

| Component | Service | Monthly Cost (INR) |
|-----------|---------|-------------------|
| Frontend | Vercel Free | ₹0 |
| Backend+DB+Redis | DigitalOcean 4GB Droplet | ₹2,000 ($24) |
| Managed Postgres | DO Managed DB | ₹1,500 ($18) |
| Email | AWS SES | ₹400 ($5) |
| Backups | DO Spaces | ₹400 ($5) |
| **Total** | | **~₹4,300/mo ($52)** |

⚠️ **Warning**: Self-managed requires DevOps expertise for security, updates, backups

### 🔐 Security Considerations (City-Scale)

| Requirement | Implementation |
|-------------|----------------|
| **DDoS Protection** | Cloudflare (free tier works) |
| **SSL/TLS** | Let's Encrypt (auto via Vercel/Render) |
| **Rate Limiting** | Already in your Express middleware |
| **Data Encryption** | PostgreSQL with SSL, bcrypt passwords |
| **Input Validation** | Zod schemas (already implemented) |
| **Audit Logging** | Add database audit trail |
| **GDPR/Privacy** | User data export, deletion features |

### 📈 Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| Response time > 500ms | Consistent | Add backend instance |
| DB connections > 80% | Frequently | Enable PgBouncer/upgrade |
| CPU > 70% sustained | 5+ minutes | Scale horizontally |
| Storage > 80% | - | Increase disk, archive old data |
| Error rate > 1% | - | Investigate immediately |

### 🚀 Migration Path: Demo → City-Scale

```
Phase 1: College Demo (Now - Free)
    └── Render + Aiven Free + Logs

Phase 2: Beta Launch (Month 1-3 - ₹600/mo)
    └── Add Resend + Upstash, keep free tiers

Phase 3: Public Launch (Month 3-6 - ₹5,000/mo)
    └── Upgrade Aiven, add monitoring

Phase 4: City Scale (Month 6+ - ₹12,000-18,000/mo)
    └── AWS Mumbai, multi-instance, PgBouncer
```

---

## 🔧 Implementation Checklist

### For College Demo
- [ ] Deploy frontend to Vercel (connect GitHub)
- [ ] Deploy backend to Render (free tier)
- [ ] Configure Aiven connection string with `?sslmode=require&connection_limit=5`
- [ ] Set up UptimeRobot to ping backend every 5 min
- [ ] Update logger to console-only in production
- [ ] Test OTP flow (check Render logs for OTP)

### For Budget Upgrade
- [ ] Create Resend account, get API key
- [ ] Create Upstash account, get Redis credentials
- [ ] Add `resend` npm package
- [ ] Create `resendService.ts` wrapper
- [ ] Update email utility to use Resend in production
- [ ] Add `@upstash/redis` package
- [ ] Update OTP storage to use Upstash
- [ ] Upgrade Render to Starter plan
- [ ] Verify domain in Resend

### For Production
- [ ] Migrate to Fly.io/Railway for backend
- [ ] Upgrade Aiven to paid plan
- [ ] Set up proper monitoring (Sentry, LogRocket)
- [ ] Configure custom domain + SSL
- [ ] Set up backup strategy
- [ ] Load testing for Nanded user base

---

## 🗄️ Aiven Database (Your Current Setup)

### ✅ Why Aiven is Good
- **No expiration** (unlike Render's 30-day DB)
- **Mumbai region available** (low latency for Nanded)
- **5GB storage** on free tier
- **Dedicated VM** (not shared)

### ⚠️ Limitations & Fixes

| Limitation | Risk | Fix |
|------------|------|-----|
| 20 max connections | Connection exhaustion | Add `connection_limit=5` to URL |
| No connection pooling | Slow under load | Prisma handles internally |
| SSL required | Connection failures | Add `?sslmode=require` |
| Community support only | Slow issue resolution | Document workarounds |

### Connection String Format
```env
DATABASE_URL=postgresql://user:password@host.aiven.io:port/database?sslmode=require&connection_limit=5
```

---

## 📧 Email Solutions Comparison

| Service | Free Tier | API Type | Setup Difficulty |
|---------|-----------|----------|------------------|
| **Resend** | 3K/mo (100/day) | HTTP | Easy ⭐ |
| **Mailtrap** | 1K/mo | HTTP | Easy |
| **SendGrid** | 100/day | HTTP | Medium |
| **AWS SES** | 62K/mo (if on EC2) | HTTP | Hard |
| **Gmail SMTP** | N/A on Render free | SMTP | ❌ Blocked |

### Recommendation: **Resend**
- Best developer experience
- Simple Node.js SDK
- React Email integration
- Free tier sufficient for demo/small scale

---

## 🔴 Quick Reference: What Works Where

| Feature | Render Free | Render Paid | Vercel Free |
|---------|-------------|-------------|-------------|
| SMTP (ports 25,465,587) | ❌ Blocked | ✅ Works | N/A |
| WebSockets | ✅ Works | ✅ Works | ❌ Limited |
| Persistent disk | ❌ No | ✅ Yes | ❌ No |
| Custom domains | ✅ Yes | ✅ Yes | ✅ Yes |
| Auto-sleep | ⚠️ After 15min | ❌ No | ❌ No |
| India region | 🔶 Singapore | 🔶 Singapore | ✅ Mumbai |

---

## ❓ Decision Questions

1. **Timeline**: When is the college demo?
2. **Budget**: Can you spend ₹600/mo for reliable emails?
3. **User load**: How many concurrent users expected?
4. **Email criticality**: Must emails actually send, or logs OK?

---

## 🚨 Issues Encountered During Deployment (Dec 14, 2025)

### Issue 1: Resend Domain Verification Required ❌

**Error Message:**
```
You can only send testing emails to your own email address (sdsdmyself@gmail.com).
To send emails to other recipients, please verify a domain at resend.com/domains
```

**Root Cause**: Resend free tier without verified domain only sends to account owner's email.

**Solutions:**
| Option | Cost | Time | Works For All Users? |
|--------|------|------|---------------------|
| Verify custom domain | ~₹100/year | 10 min | ✅ Yes |
| Use logs (demo) | ₹0 | 0 min | ⚠️ Manual |
| Test with owner email | ₹0 | 0 min | ❌ No |

**Demo Workaround**: OTPs are prominently logged:
```
═══════════════════════════════════════════════════════
📧 EMAIL FOR: user@example.com
🔐 OTP CODE: 718010
═══════════════════════════════════════════════════════
```

---

### Issue 2: Redis Initial Connection Delay ⚠️

**Warning:**
```
Redis unavailable for OTP storage, using memory: Stream isn't writeable
```

**Root Cause**: Upstash Redis takes 1-2 seconds to establish connection on cold start.

**Impact**: First OTP after cold start uses in-memory fallback.

**Status**: ✅ Self-recovers within seconds. Not critical.

---

### Issue 3: SMTP Connection Timeout ❌

**Error:**
```
📧 Sending email via SMTP: smtp.gmail.com:587
❌ SMTP failed: Connection timeout
```

**Root Cause**: Render free tier blocks outbound SMTP ports (25, 465, 587).

**Solution**: Use HTTP-based email APIs (Resend, SendGrid) instead of SMTP.

---

### Issue 4: Prisma 7 Breaking Changes ❌

**Error:**
```
The datasource property `url` is no longer supported in schema files
```

**Root Cause**: Prisma 7 requires new `prisma.config.ts` file format.

**Solution**: ✅ Rolled back to Prisma 5.22.0 (stable, working).

---

## 💳 Payment Integration: Razorpay Feasibility

### Current Platform Fee Model

| Component | Percentage | On ₹500 Booking |
|-----------|-----------|-----------------|
| Base Service | 100% | ₹500.00 |
| Platform Fee | 7% | ₹35.00 |
| GST on Fee | 8% | ₹2.80 |
| **Customer Pays** | | **₹537.80** |
| **Provider Receives** | 93% | **₹465.00** |

### Razorpay Transaction Fees (2024)

| Payment Method | Razorpay Fee | After Fee (₹500) |
|----------------|-------------|------------------|
| UPI (Bank-to-Bank) | **0%** | ₹0 |
| Debit Cards | 2% + GST | ₹11.80 |
| Credit Cards | 2% + GST | ₹11.80 |
| Net Banking | 2% + GST | ₹11.80 |
| EMI | 3% + GST | ₹17.70 |

### Razorpay Route (Marketplace Split Payments)

Razorpay Route enables automatic payment splitting to providers:

```
Customer Payment: ₹537.80
    │
    ├── Razorpay Fee (2.36%): ₹12.70
    │
    ├── Platform Income (7%): ₹35.00
    │
    ├── GST Pool (8%): ₹2.80
    │
    └── Provider Bank Transfer: ₹487.30
```

### Profitability Analysis

| Daily Bookings | Avg. Value | Monthly GMV | Platform (7%) | Net After Razorpay (~4.5%) |
|----------------|-----------|-------------|---------------|---------------------------|
| 50 | ₹500 | ₹7,50,000 | ₹52,500 | ₹33,750 |
| 100 | ₹500 | ₹15,00,000 | ₹1,05,000 | ₹67,500 |
| 200 | ₹500 | ₹30,00,000 | ₹2,10,000 | ₹1,35,000 |
| 500 | ₹500 | ₹75,00,000 | ₹5,25,000 | ₹3,37,500 |

### Integration Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Razorpay SDK | ✅ Already installed | `razorpay` in package.json |
| Business Registration | ⚠️ Required | GST/Shop Act for payouts |
| KYC Verification | ⚠️ Required | PAN, Aadhar, Bank details |
| Test Mode | ✅ Ready | Can test without live registration |
| Live Mode Activation | ⏳ 2-3 days | After document verification |

### Implementation Steps for Live Payments

1. **Test Mode (Now)**
   - Use Razorpay test API keys
   - Test payment flow end-to-end
   - Simulate split payments

2. **Business Setup (Week 1)**
   - Register GST (if turnover > ₹40L/year)
   - Get Shop & Establishment license
   - Open business bank account

3. **Razorpay Live Activation (Week 2)**
   - Submit KYC documents
   - Wait for verification (2-3 days)
   - Enable Route for split payments

4. **Provider Onboarding (Week 3)**
   - Collect provider bank details
   - Create linked accounts in Razorpay
   - Test first live transaction

---

## ✅ Final Status: Demo Ready

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ Working | OTP via logs |
| Provider Onboarding | ✅ Working | Documents upload |
| Booking Flow | ✅ Working | Full lifecycle |
| Real-time Notifications | ✅ Working | Socket.io |
| Admin Panel | ✅ Working | All features |
| Email Delivery | ⚠️ Partial | Logs for demo, domain needed for real |
| Payments | 🔶 Mock | Razorpay ready, needs KYC |
| Redis Persistence | ✅ Working | Upstash connected |

---

## 📝 Quick Commands Reference

```bash
# Local Development
cd server && npm run dev
cd frontend && npm run dev

# Production Build
cd server && npm run build
cd frontend && npm run build

# Database
npx prisma generate
npx prisma migrate dev
npx prisma db push

# Git Push
git add .
git commit -m "feat: description"
git push origin main
```
