# Quick Start Guide - MH26 Services

This guide will help you get the MH26 Services platform running locally in 5 minutes.

## Prerequisites

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **Code Editor** (VS Code recommended)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `react` & `react-dom`
- `react-router-dom` (navigation)
- `date-fns` (date formatting)
- `recharts` (analytics charts)
- `lucide-react` (icons)
- `sonner` (toasts)
- And all shadcn/ui components

### 2. Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or the next available port).

### 3. Test Different User Roles

The app has a **built-in role switcher** for testing:

1. Click on your profile name in the top-right navigation
2. Use the "Switch Role (Testing)" buttons to toggle between:
   - **User** (CUSTOMER) - Browse and book services
   - **Provider** - Manage services and bookings
   - **Admin** - Full platform control

**Default login**: Already logged in as "Rajesh Kumar" (Customer role)

## Key Features to Test

### As a Customer

1. **Browse Services**
   - Go to "Services" tab
   - Filter by category (dropdown)
   - Search by keyword

2. **View Provider Details**
   - Click on any provider card
   - Try "Reveal Phone Number" (works when logged in)
   - Click "Report" to test report submission

3. **Dashboard**
   - View your bookings
   - Check recent activity

### As a Provider

1. **Switch to Provider role** (via profile menu)

2. **Provider Onboarding**
   - Click "Become a Provider" (or visit `/provider-onboarding`)
   - Complete the 6-step form
   - Submit application (goes to admin for approval)

3. **Dashboard**
   - View your bookings and earnings
   - Quick actions to manage services

### As an Admin

1. **Switch to Admin role** (via profile menu)

2. **Admin Panel** (`/admin`)
   - **Overview**: Quick stats and pending items
   - **Providers**: Approve/reject pending applications
   - **Users**: View all registered users
   - **Reports**: Handle customer complaints
   - **Bookings**: View all platform bookings
   - **Analytics**: Charts showing platform growth

3. **Key Actions**
   - Approve a pending provider
   - Resolve an open report
   - Export data to CSV

## Project Structure

```
src/
├── App.tsx                    # Main app with routes
├── context/                   # React contexts
│   ├── UserContext.tsx       # Auth & user state
│   └── NotificationContext.tsx
├── components/               
│   ├── HomePage.tsx          # Landing page
│   ├── ServicesPage.tsx      # Provider listing
│   ├── ProviderDetailPage.tsx
│   ├── ProviderOnboardingPage.tsx  # Multi-step form
│   ├── DashboardPage.tsx     # Merged dashboard
│   ├── MessagingPage.tsx     # Chat interface
│   ├── InvoicesPage.tsx      # Invoice viewer
│   └── AdminPanel.tsx        # Full admin CRUD
├── data/
│   └── mockData.ts           # Sample providers, bookings, etc.
└── styles/
    └── globals.css           # Design tokens & typography
```

## Mock Data

The app comes with realistic mock data:

- **7 Providers** (5 verified, 2 pending)
  - QuickFix Plumbing (verified)
  - Nanded Home Tiffin (verified)
  - PowerLine Electricals (verified)
  - Nanded Heritage Tours (verified)
  - FitZone Gym (verified)
  - Clean & Shine (pending)
  - AC Care Experts (pending)

- **3 Bookings** (completed, confirmed, pending)
- **2 Reports** (open, investigating)
- **Sample Messages** (3 conversation threads)
- **1 Invoice** (completed booking)

Edit `/data/mockData.ts` to add more test data.

## Common Tasks

### Add a New Service Category

1. Open `/data/mockData.ts`
2. Add to `mockCategories` array:
```typescript
export const mockCategories = [
  'Plumbing',
  'Electrical',
  // Add yours:
  'Carpentry',
  'Your Category'
];
```

### Customize Colors

1. Open `/styles/globals.css`
2. Change the primary color:
```css
:root {
  --primary: #ff6b35;  /* Change this hex color */
  --primary-hover: #ff5722;
}
```

### Test Phone Reveal Flow

1. **Logged Out**: Visit any provider → See "Available for registered members"
2. **Logged In**: Click "Reveal Phone Number" → Phone displays
3. **Backend Integration**: In production, this would:
   - Log the reveal (userId, providerId, timestamp)
   - Rate limit to 3 reveals/day per user
   - Optionally charge a small lead fee

### Test Report System

1. Go to any provider detail page
2. Click "Report" button (top right)
3. Fill the form (reason, details, attachments)
4. Submit → Creates admin ticket
5. Switch to **Admin role** → Go to Admin Panel → Reports tab
6. View the report and mark as Resolved/Investigating

## Mobile Testing

The app is fully responsive. Test mobile views:

**Desktop browsers:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or "Pixel 5"

**Features on mobile:**
- Bottom navigation bar
- Collapsible filters
- Stacked card layouts
- Touch-friendly tap targets (≥44px)

## Next Steps

### Production Deployment

1. **Frontend Only** (current state):
   - Deploy to Vercel/Netlify
   - All features use mock data
   - Great for demos and client previews

2. **Full Production** (with backend):
   - Follow `/BACKEND_IMPLEMENTATION.md`
   - Set up PostgreSQL + Prisma
   - Implement all API endpoints
   - Connect Socket.io for real-time features
   - Configure file uploads (S3)
   - Integrate payment gateway (Razorpay/Stripe)

### Backend Integration Checklist

When your backend is ready:

1. **Replace mock data** with API calls:
   ```typescript
   // Before (mock):
   const providers = mockProviders;
   
   // After (real):
   const response = await fetch('/api/providers');
   const providers = await response.json();
   ```

2. **Add Socket.io client**:
   ```typescript
   import io from 'socket.io-client';
   const socket = io('http://localhost:5000', {
     auth: { token: user.token }
   });
   ```

3. **Environment variables** (create `.env`):
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Update fetch calls** to use env vars:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL;
   fetch(`${API_URL}/api/providers`);
   ```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or start on different port
npm run dev -- --port 3000
```

### Charts Not Showing

Recharts requires a minimum container width. Check:
1. Parent div has defined width
2. Using `ResponsiveContainer` from recharts

### Icons Missing

Lucide icons are tree-shakeable. Import each one:
```typescript
import { Home, User, Settings } from 'lucide-react';
```

### Styles Not Applying

Tailwind v4 requires:
1. Classes in the JSX (no dynamic string concatenation)
2. Proper `@layer` usage in CSS
3. No custom `tailwind.config.js` (uses `@theme inline`)

## Support & Documentation

- **Full Docs**: See `/README.md`
- **Backend Setup**: See `/BACKEND_IMPLEMENTATION.md`
- **Design System**: See `/styles/globals.css`
- **Mock Data**: See `/data/mockData.ts`

## Summary

✅ **5 minutes** to get running  
✅ **3 user roles** fully functional (Customer, Provider, Admin)  
✅ **All key flows** working with mock data  
✅ **Mobile-responsive** out of the box  
✅ **Production-ready** frontend (just add backend)

**Start exploring!** Change roles, test flows, and customize to your needs. 🚀
