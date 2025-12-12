# MH26 Services - Service Marketplace Platform

A modern, responsive web platform connecting consumers with local service providers in Nanded, Maharashtra. Built with React, Tailwind CSS, and designed for the PERN stack (PostgreSQL, Express, React, Node.js).

## 🎯 Features

### For Customers
- **Browse Services**: Search and filter service providers by category, location, and rating
- **Provider Details**: View verified provider profiles with ratings, reviews, and work gallery
- **Phone Reveal**: Contact providers directly (logged-in users only, with access logging)
- **Book Services**: Instant booking with automated invoice generation
- **Real-time Messaging**: Chat with providers via Socket.io
- **Review & Rate**: Leave reviews and ratings after service completion
- **Report System**: Report providers for issues with admin moderation
- **Invoice Management**: View and download booking invoices

### For Service Providers
- **Multi-step Onboarding**: Complete profile setup with document verification
- **Service Management**: Add and manage services with pricing
- **Booking Dashboard**: Track pending and completed bookings
- **Messaging**: Communicate with customers in real-time
- **Analytics**: View earnings and performance metrics

### For Administrators
- **Provider Approval**: Review and approve/reject provider applications
- **User Management**: Full CRUD operations on users and providers
- **Report Moderation**: Handle customer complaints and disputes
- **Analytics Dashboard**: Platform insights with interactive charts (Recharts)
- **Booking Oversight**: Monitor all platform transactions
- **Data Export**: Export users, providers, and booking data to CSV

## 🚀 Tech Stack

### Frontend (This Repository)
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Recharts** for analytics visualization
- **Lucide React** for icons
- **Sonner** for toast notifications
- **date-fns** for date formatting

### Backend (To Be Implemented)
See [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) for complete guide.

- **Node.js + Express**
- **PostgreSQL** database
- **Prisma ORM**
- **JWT** authentication
- **Socket.io** for real-time features
- **AWS S3** for file storage
- **Razorpay/Stripe** for payments (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- (Optional) Backend server running on PORT 5000

### Frontend Setup

```bash
# Install dependencies
npm install

# Required packages (if not auto-installed)
npm install react-router-dom date-fns recharts sonner@2.0.3

# Start development server
npm run dev
```

The app will run on `http://localhost:5173` (or your configured port).

## 🎨 Project Structure

```
/
├── App.tsx                          # Main app component with routing
├── context/
│   ├── UserContext.tsx             # User authentication context
│   └── NotificationContext.tsx     # Real-time notifications
├── components/
│   ├── HomePage.tsx                # Landing page
│   ├── ServicesPage.tsx            # Provider listing with filters
│   ├── ProviderDetailPage.tsx     # Individual provider profile
│   ├── ProviderOnboardingPage.tsx # Multi-step provider registration
│   ├── DashboardPage.tsx          # Merged dashboard (role-aware)
│   ├── MessagingPage.tsx          # Real-time chat interface
│   ├── InvoicesPage.tsx           # Invoice management
│   ├── AdminPanel.tsx             # Admin dashboard with CRUD
│   ├── UnifiedNavigation.tsx      # Top navigation bar
│   ├── MobileBottomNav.tsx        # Mobile bottom navigation
│   ├── NotificationDropdown.tsx   # Notification tray
│   ├── PhoneRevealModal.tsx       # Phone reveal flow
│   ├── ReportProviderModal.tsx    # Report submission form
│   ├── ReviewsList.tsx            # Reviews and ratings
│   ├── AnalyticsCharts.tsx        # Charts for admin
│   └── ui/                         # shadcn/ui components
├── data/
│   └── mockData.ts                # Mock data for development
├── styles/
│   └── globals.css                # Global styles and Tailwind config
├── BACKEND_IMPLEMENTATION.md      # Backend setup guide
└── README.md                      # This file
```

## 🔑 Key User Flows

### 1. Provider Onboarding
- **Step 1**: Basic information (name, email, phone, bio)
- **Step 2**: Service categories selection
- **Step 3**: Service location with optional coordinates
- **Step 4**: Work gallery upload (optional)
- **Step 5**: Document verification (ID proof, business license, GST)
- **Step 6**: Review and submit (requires terms agreement)
- **Backend**: Admin reviews documents → Approve/Reject → Provider gets verified badge

### 2. Phone Reveal (with Privacy)
- Non-logged users see: "Contact details available for registered members"
- Logged users click "Reveal Phone Number" → Phone displayed
- **Backend logs**: userId, providerId, timestamp (for analytics & fraud detection)
- **Rate limit**: 3 reveals per day per user (configurable)

### 3. Report Provider
- Form: Reason dropdown + detailed description + optional attachments
- Submission creates admin ticket with status: OPEN → INVESTIGATING → RESOLVED/REJECTED
- Admin can suspend provider if needed

### 4. Real-time Messaging
- **Frontend**: Socket.io client connects on authentication
- **Backend**: Server maps socketId to userId
- Messages persist in DB and emit to recipient if online
- Unread count badge in navigation

## 🎭 Role-Based Views

### Switch Roles (for testing)
Click on your profile in the navigation → Use the role switcher buttons:
- **User** (CUSTOMER): Browse services, book, message providers
- **Provider**: Manage services, view bookings, chat with customers
- **Admin**: Full platform control (approvals, reports, analytics)

In production, roles are assigned during signup/onboarding.

## 🎨 Design System

### Colors
- **Primary Orange**: `#ff6b35` (warm, approachable tone)
- **Hover Orange**: `#ff5722`
- **Success Green**: `#4CAF50`
- **Warning Yellow**: `#FFC107`
- **Error Red**: `#f44336`
- **Neutral Grays**: Tailwind default scale

### Typography
- **Headings**: Default system font stack (see `globals.css`)
- **Body**: Base size with responsive scaling
- **Do NOT use**: Tailwind font-size classes (`text-xl`, `text-2xl`) unless specifically needed

### Components
- All UI components use **shadcn/ui** from `/components/ui/`
- Do not create custom versions of existing shadcn components
- Extend via className props when needed

## 📱 Mobile Responsiveness

- **Breakpoints**: `md:` (768px), `lg:` (1024px)
- **Mobile Navigation**: Bottom tab bar (Home, Services, Messages, Dashboard)
- **Desktop Navigation**: Top bar with dropdowns
- **Touch-friendly**: All interactive elements ≥44px tap target

## 🔐 Security Considerations (Backend)

- **Authentication**: JWT tokens with 7-day expiry
- **Password Hashing**: bcrypt with salt rounds 10
- **Rate Limiting**: Prevent abuse (e.g., phone reveals, API calls)
- **Input Validation**: All user inputs sanitized and validated
- **File Upload**: Type checking, size limits (10MB), virus scanning
- **SQL Injection**: Prisma ORM prevents via parameterized queries
- **XSS Prevention**: Input sanitization + Helmet.js headers

## 💰 Monetization Options

1. **Platform Commission**: X% of each booking
2. **Lead Fee**: Small fee for phone reveals (transparent to users)
3. **Featured Listings**: Pay-to-promote providers
4. **Verification Fee**: One-time provider verification charge

All fees recorded in `Transaction` table with type field.

## 📊 Analytics & Reporting

- **User Growth**: Line chart (monthly new signups)
- **Revenue Trend**: Bar chart (monthly platform revenue)
- **Category Distribution**: Pie chart (service categories)
- **Export Data**: Admin can export all data to CSV

## 🧪 Testing

### Frontend Testing (Manual)
1. **Browse Services**: Filter by category, search by keyword
2. **Provider Detail**: Test phone reveal (logged-in vs logged-out)
3. **Report Provider**: Submit report → Check admin panel
4. **Provider Onboarding**: Complete all 6 steps
5. **Messaging**: Send messages → Check real-time delivery
6. **Admin Panel**: Approve provider → Verify badge appears
7. **Role Switching**: Test all 3 roles (Customer, Provider, Admin)

### Backend Testing
See `BACKEND_IMPLEMENTATION.md` Section 13 for Jest/Supertest examples.

## 🚀 Deployment

### Frontend (React)
- **Vercel** (recommended): `vercel --prod`
- **Netlify**: Connect GitHub repo → Auto deploy
- **AWS S3 + CloudFront**: Static hosting

### Backend (Node.js)
- **DigitalOcean Droplet**: PM2 + Nginx
- **AWS EC2**: Docker container
- **Heroku**: `git push heroku main`

### Database
- **AWS RDS**: Managed PostgreSQL
- **DigitalOcean Managed Database**: Auto backups
- **Supabase**: PostgreSQL + Auth (alternative)

## 📄 API Endpoints Summary

See `BACKEND_IMPLEMENTATION.md` for complete details.

**Auth**
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-phone`

**Providers**
- `POST /api/providers/onboard` (multipart)
- `GET /api/admin/providers?status=pending`
- `POST /api/admin/providers/:id/approve`
- `POST /api/providers/:id/reveal-phone` (rate-limited)

**Bookings & Invoices**
- `POST /api/bookings`
- `GET /api/invoices/:id` (download PDF)

**Reports**
- `POST /api/reports`
- `POST /api/admin/reports/:id/resolve`

**Messaging**
- `GET /api/messages/conversations/:otherId`
- `POST /api/messages/send` (+ Socket.io emit)

**Real-time (Socket.io)**
- `connection` → Map userId to socketId
- `send_message` → Persist + emit to recipient
- `notification:new` → Push to client

## 🐛 Known Limitations (Frontend Only)

This is a **frontend prototype** with mock data:
- Phone reveal does NOT actually log to database
- Messaging does NOT persist or sync in real-time
- Invoices are NOT generated as PDFs
- Provider onboarding does NOT upload files
- Payment integration is NOT implemented

**To make it production-ready**: Implement the backend as per `BACKEND_IMPLEMENTATION.md`.

## 🤝 Contributing

This is a client project. If you're part of the development team:

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Follow design system**: Use existing components and colors
3. **Test all roles**: Ensure functionality works for Customer, Provider, and Admin
4. **Mobile-first**: Test on mobile breakpoints
5. **Submit PR**: Clear description of changes

## 📞 Support

For questions or issues:
- **Developer**: [Your contact]
- **Documentation**: See `BACKEND_IMPLEMENTATION.md`
- **Design System**: See `styles/globals.css`

## 📝 License

Proprietary - MH26 Services Platform

---

**Built with ❤️ for service providers in Nanded, Maharashtra**

**Current Status**: ✅ Frontend Complete | ⏳ Backend Pending Implementation
