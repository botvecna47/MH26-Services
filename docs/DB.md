# Database Guide

This document explains how the database for **MH26 Services** is structured. We use **PostgreSQL** as our database and **Prisma** to interact with it.

## 🗄️ Database Structure

Our database stores information in "tables". Here are the main ones:

### 1. Users Table
This is where we store everyone who signs up.
- **ID**: A unique code for each user.
- **Email**: The user's email address.
- **Role**: Tells us if they are a `CUSTOMER`, `PROVIDER`, or `ADMIN`.
- **Password**: Stored securely (hashed) so no one can read it.

### 2. Providers Table
This stores extra details for people who offer services.
- **Business Name**: The name of their shop or service.
- **Category**: What they do (e.g., Plumber, Electrician).
- **Gallery**: Photos of their work.

### 3. Services Table
These are the specific jobs a provider can do.
- **Title**: Name of the service (e.g., "Tap Repair").
- **Price**: How much it costs.

### 4. Bookings Table
This tracks appointments between customers and providers.
- **Status**: Is it `PENDING`, `CONFIRMED`, or `COMPLETED`?
- **OTP**: A code to verify the job is done.

## 🛠️ How to View Data

We use a tool called **Prisma Studio** to look at the data easily.

1.  Open your terminal.
2.  Run this command:
    ```bash
    npx prisma studio
    ```
3.  A website will open (usually at `http://localhost:5555`) where you can see all the tables and data.

## 🔄 Resetting Data

If you want to clear everything and load fresh sample data (like real Nanded providers), run:

```bash
cd server
npm run seed
```

*Note: This deletes all old data!*
