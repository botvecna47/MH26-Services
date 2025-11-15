# Seeded Credentials for MH26 Services

This document contains all the test credentials created by the database seed script.

---

## 🔐 Login Credentials

### Admin Account
- **Email**: `admin@mh26services.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Status**: Email verified, Phone verified

### Customer Accounts (5 accounts)
All customers use the same password:
- **Password**: `customer123`

**Customer 1:**
- **Email**: `customer1@example.com`
- **Phone**: `+91-9876543211`

**Customer 2:**
- **Email**: `customer2@example.com`
- **Phone**: `+91-9876543212`

**Customer 3:**
- **Email**: `customer3@example.com`
- **Phone**: `+91-9876543213`

**Customer 4:**
- **Email**: `customer4@example.com`
- **Phone**: `+91-9876543214`

**Customer 5:**
- **Email**: `customer5@example.com`
- **Phone**: `+91-9876543215`

### Provider Accounts (35 accounts)
All providers use the same password:
- **Password**: `provider123`

**Provider Accounts:**
- `provider1@example.com` through `provider35@example.com`
- Each provider has a unique phone number
- All providers are **APPROVED** and ready to use
- Each provider has at least 1 service listed

**Example Provider:**
- **Email**: `provider1@example.com`
- **Password**: `provider123`
- **Business**: Patil Plumbing Works
- **Owner**: Vijay Patil
- **Category**: Plumbing

---

## 📊 Seed Data Summary

### Users Created
- **1 Admin** user
- **5 Customer** users
- **35 Provider** users (5 per category)
- **Total**: 41 users

### Providers Created
- **35 Providers** across 7 categories:
  - Plumbing (5 providers)
  - Electrical (5 providers)
  - Cleaning (5 providers)
  - Salon (5 providers)
  - Tutoring (5 providers)
  - Fitness (5 providers)
  - Catering (5 providers)

### Additional Data
- **35 Services** (1 per provider)
- **20 Bookings** (various statuses)
- **20 Transactions**
- **7 Service Categories**

---

## 🚀 Quick Login Guide

### To Login as Admin:
1. Go to `/auth` or click "Login"
2. Enter: `admin@mh26services.com`
3. Enter password: `admin123`
4. Click "Sign In"

### To Login as Customer:
1. Go to `/auth` or click "Login"
2. Enter: `customer1@example.com` (or customer2-5)
3. Enter password: `customer123`
4. Click "Sign In"

### To Login as Provider:
1. Go to `/auth` or click "Login"
2. Enter: `provider1@example.com` (or provider2-35)
3. Enter password: `provider123`
4. Click "Sign In"

---

## ⚠️ Important Notes

1. **All accounts are pre-verified** (email and phone verified)
2. **All providers are APPROVED** - ready to receive bookings
3. **Passwords are simple** - change them in production
4. **These are test credentials** - remove or change before production deployment

---

## 🔄 Resetting Seed Data

To reset and re-seed the database:

```bash
cd server
npm run migrate:reset  # WARNING: This deletes all data
npm run seed           # Re-creates all seed data
```

Or to seed without resetting:

```bash
cd server
npm run seed
```

---

**Last Updated**: 2024  
**Note**: These credentials are for development/testing only

