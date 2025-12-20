# MH26 Services - Detailed System Explanation

A comprehensive guide to understanding how MH26 Services works, written for demo presentations and explaining every aspect of the platform in plain language.

---

# CHAPTER 1: UNDERSTANDING MH26 SERVICES

## 1.1 What is MH26 Services?

MH26 Services is a digital marketplace specifically designed for the Nanded region (MH-26 is the RTO code for Nanded district in Maharashtra). The platform connects local service professionals—such as plumbers, electricians, carpenters, beauty salon operators, caterers, and home cleaners—with customers who need their services.

Think of it as an "Urban Company" or "Justdial" but specifically tailored for local businesses in Nanded. The platform digitizes the entire service lifecycle: from discovering a provider, booking their service, making payments, to leaving reviews.

## 1.2 The Three Types of Users

The platform serves three distinct user roles, each with different needs and capabilities:

**Customers** are the end users who search for services. They can browse different categories, view provider profiles, check ratings and reviews, book services for specific dates and times, make payments through the wallet system, and leave reviews after service completion.

**Service Providers** are the local businesses offering their expertise. They register on the platform with their business details and credentials, wait for admin verification, and once approved, they can receive booking requests, accept or decline jobs based on their availability, complete services, and track their earnings.

**Administrators** have complete oversight of the platform. They verify new provider applications by checking uploaded documents, manage all users and providers, handle disputes and appeals from banned users, monitor platform revenue, and maintain the category system.

## 1.3 The Core Value Proposition

The platform solves several real problems for both parties:

For customers, it eliminates the guesswork of finding reliable service providers. Instead of asking neighbors for recommendations or calling random numbers from business cards, customers can see verified providers with ratings, reviews, and clear pricing.

For providers, it offers a digital presence without the technical complexity. A local plumber who may not know how to create a website or manage social media can simply register, upload their credentials, and start receiving customers through the platform.

---

# CHAPTER 2: THE FRONTEND - USER INTERFACE

## 2.1 Technology Choices Explained

The frontend is built using React, which is a JavaScript library for building user interfaces. React was chosen because it allows developers to create reusable components—think of them like LEGO blocks that can be assembled in different ways to build complex pages.

TypeScript is used instead of plain JavaScript because it adds type checking. This means the code is more reliable because errors are caught during development rather than when users encounter them.

Vite serves as the build tool. When developers write code, Vite transforms it into optimized files that browsers can understand. Vite is particularly fast—while older tools might take 30 seconds to start the development server, Vite does it in under a second.

Tailwind CSS handles the styling. Instead of writing traditional CSS files with class names like "button-primary-large-rounded", developers apply utility classes directly like "bg-blue-500 text-white px-4 py-2 rounded". This approach is faster for development and results in smaller file sizes.

## 2.2 How the Application Stays Updated

One of the challenges in web applications is keeping data fresh. When a customer books a service, the provider's dashboard should immediately show that booking. The platform uses two mechanisms for this:

**TanStack Query** (formerly React Query) manages all data fetching from the server. It automatically caches responses so the same data isn't fetched repeatedly. When a user navigates away from a page and returns, the cached data is shown instantly while fresh data loads in the background. This creates a snappy user experience.

**Socket.io** enables real-time updates. Unlike traditional web requests where the browser asks the server for information, Socket.io maintains a persistent connection. The server can push updates to the browser immediately when something changes. This is how providers see new bookings appear without refreshing the page.

## 2.3 The Component Structure

The frontend is organized into approximately 50 distinct components, each serving a specific purpose:

**Page Components** represent entire screens. The HomePage shows the landing page with category cards and featured providers. The DashboardPage is the main hub for logged-in users, adapting its content based on whether the user is a customer, provider, or admin. The AuthPage handles both login and registration flows.

**Feature Components** handle specific functionality. The BookingModal walks customers through the booking process. The ProviderSchedulePage lets providers set their weekly availability. The AdminPanel gives administrators access to all management functions.

**UI Components** are the building blocks. These include buttons, cards, input fields, modals, dropdown menus, and other interface elements. The platform uses Radix UI primitives which are pre-built accessible components, ensuring the application works well for users with disabilities using screen readers or keyboard navigation.

## 2.4 Navigation and Routing

The application uses client-side routing, meaning when a user clicks a link, only the content changes—the entire page doesn't reload. This creates a smooth, app-like experience. The URL bar updates to reflect the current location, so users can bookmark or share specific pages.

Navigation adapts to the user's role. An admin sees links to the Admin Panel. A provider sees links to their services and schedule. A customer sees links to browse services and their booking history. This is achieved through conditional rendering based on the logged-in user's role stored in the application state.

## 2.5 Forms and Validation

Forms throughout the application use React Hook Form for state management. This library efficiently tracks what the user has entered without causing excessive re-renders of the entire form.

Validation is handled by Zod, which defines the rules for each field. For example, an email field must contain a valid email format, a phone number must be exactly 10 digits starting with 6-9 (Indian mobile numbers), and a service price must be a positive number. The same validation rules are used on both the frontend and backend to ensure consistency.

When validation fails, the user sees helpful error messages immediately next to the relevant field, rather than a generic "something went wrong" message at the top of the form.

---

# CHAPTER 3: THE BACKEND - SERVER AND API

## 3.1 Technology Choices Explained

The backend runs on Node.js, which allows JavaScript to run on the server. This choice means the development team uses the same language for both frontend and backend, simplifying development and knowledge sharing.

Express.js provides the web framework—it handles incoming HTTP requests, routes them to the appropriate handler, and sends responses back. Express is the most widely-used Node.js framework, with a massive ecosystem of plugins and extensive community support.

TypeScript is used here as well, providing the same type-safety benefits. When a function expects a number but receives a string, TypeScript catches this during development.

## 3.2 The Controller Structure

The backend is organized around controllers, each handling a specific domain of functionality:

**authController** manages everything related to user identity: registration, login, password reset, email verification, and OTP verification. It handles the complex logic of creating accounts, verifying credentials, and issuing authentication tokens.

**bookingController** handles the service booking lifecycle: creating new bookings, updating booking status, handling acceptance and rejection, processing completion with OTP verification, and managing cancellations.

**providerController** manages provider-specific operations: profile updates, availability settings, service management, and document submissions.

**adminController** provides administrative functions: approving or rejecting provider applications, managing users, viewing platform analytics, creating categories, and handling appeals from banned users.

**serviceController** manages the services catalog: creating services, updating pricing, managing service status, and handling service deletion.

**reviewController** handles customer feedback: submitting reviews, rating providers, and retrieving reviews for display.

**notificationController** manages the notification system: creating notifications, marking them as read, and retrieving notification lists.

**messageController** enables direct messaging between customers and providers: sending messages, retrieving conversation history, and marking messages as read.

## 3.3 Authentication and Security

Security is implemented through multiple layers:

**Password Hashing** uses bcrypt with 12 rounds. When a user creates a password, it's transformed into a hash—a seemingly random string of characters. Even if someone accessed the database, they couldn't reverse-engineer the original passwords. The 12 rounds means the hashing is computationally intensive, making brute-force attacks impractical.

**JWT (JSON Web Tokens)** handle session management. When a user logs in, the server creates a token containing the user's ID and role. This token is signed with a secret key so it cannot be forged. The frontend stores this token and sends it with every request to prove the user's identity.

**Access and Refresh Tokens** work together for security and convenience. The access token expires quickly (15 minutes) so if it's stolen, the damage is limited. The refresh token lasts longer (7 days) and is used to obtain new access tokens without requiring the user to log in again. Refresh tokens are stored in the database and can be revoked if suspicious activity is detected.

**Rate Limiting** prevents abuse. Login attempts are limited to 5 per 15 minutes per IP address. OTP requests are limited to 1 per minute. This stops automated attacks from overwhelming the system or trying endless password combinations.

**Helmet** sets security headers. It prevents common attacks like clickjacking (where attackers embed the site in an invisible frame), content sniffing (where browsers incorrectly interpret files), and cross-site scripting (where malicious scripts are injected).

**CORS (Cross-Origin Resource Sharing)** ensures only the legitimate frontend can communicate with the backend. Requests from unknown origins are rejected.

## 3.4 Request Processing Flow

When a request arrives at the server, it passes through several stages:

First, **global middleware** processes every request. The body parser converts JSON request bodies into JavaScript objects. CORS headers are added for browser compatibility. Rate limiting checks if the IP has exceeded request limits.

Next, the **router** determines which controller should handle the request based on the URL path and HTTP method. A GET request to /api/bookings goes to the bookings controller's list function, while a POST request to the same URL goes to the create function.

If the route is protected, **authentication middleware** verifies the JWT token. Invalid or expired tokens result in a 401 Unauthorized response. The middleware extracts the user information from the token and attaches it to the request object.

Some routes require specific roles. **Authorization middleware** checks if the authenticated user has permission. An attempt by a customer to access the admin panel results in a 403 Forbidden response.

**Validation middleware** checks that the request body contains all required fields in the correct format. A booking request missing the service ID or with an invalid date format is rejected with a 400 Bad Request and specific error messages.

Finally, the **controller function** executes the business logic, interacts with the database, and sends the response.

## 3.5 Real-Time Communication

Socket.io enables bidirectional real-time communication. When the frontend establishes a Socket.io connection, it authenticates using the same JWT token used for API requests.

The server can then push events to specific users. When an admin approves a provider application, the server emits an event to that provider's socket connection. The provider's browser receives this event immediately and updates the interface—they don't need to refresh the page.

Events are organized by type: new_booking notifies providers of incoming requests, booking_accepted and booking_rejected inform customers of provider decisions, notification broadcasts important updates, and message enables real-time chat.

## 3.6 Email Integration

The platform sends emails for critical communications:

**Verification Emails** contain a link that users must click to prove they own the email address. This prevents fake registrations with other people's emails.

**Provider Status Emails** notify service providers when their application is approved or rejected. Approved providers receive a congratulatory message with next steps. Rejected providers receive the reason and instructions for reapplying.

**Booking Confirmation Emails** inform both customers and providers about new bookings. They include the service details, scheduled date and time, address, and total amount.

**Password Reset Emails** contain a secure, time-limited link for users who forgot their password.

The platform uses Resend as the email delivery service. Resend provides better deliverability than direct SMTP, ensuring emails actually reach inboxes rather than spam folders. In development, emails are logged to the console for testing without actually sending.

---

# CHAPTER 4: THE DATABASE - DATA STORAGE

## 4.1 Why PostgreSQL?

PostgreSQL was chosen over other databases for several specific reasons:

**Relational Integrity** is crucial for a transactional platform. When a booking is created, it must reference a valid user, a valid service, and a valid provider. PostgreSQL enforces these relationships through foreign keys—it literally prevents the creation of a booking for a non-existent service.

**ACID Transactions** ensure data consistency. When a customer pays for a booking, multiple operations must happen together: deduct from the customer's wallet, create the booking record, create a transaction record, and update the provider's expected earnings. If any operation fails, all operations are rolled back—the customer doesn't lose money without getting the booking.

**JSONB Support** allows flexible data storage within the structured database. The provider availability field stores a complex schedule as JSON—which days they work, what hours, whether they're available. This would be cumbersome to model as separate database tables.

**Advanced Indexing** makes queries fast. The database has indexes on frequently queried columns: email for login, city and category for provider search, status for filtering active bookings. Without indexes, the database would scan every row to find matches.

## 4.2 The Data Model

**Users** are at the center of the platform. Every customer, provider, and admin is a user with basic information: name, email, password hash, phone number, and role. Users can have a wallet balance for making payments, and their total spending is tracked for analytics.

**Providers** extend user information with business-specific details. A provider record is linked to exactly one user account. It contains the business name, description, category (plumbing, electrical, etc.), address, service radius (how far they'll travel), verification status, and availability schedule. Providers also have aggregate statistics like average rating and total earnings.

**Services** represent what providers offer. A provider can offer multiple services—a plumber might offer pipe repair, bathroom fitting, and drain cleaning, each with different prices and durations. Each service has a title, description, price, estimated duration, and approval status.

**Bookings** represent individual transactions. A booking connects a customer to a specific service for a scheduled date and time at a particular address. It tracks the status through the lifecycle: pending (waiting for provider response), confirmed (provider accepted), in_progress (work started), completed (finished and verified), or cancelled.

**Reviews** provide feedback after service completion. A review is linked to both a booking and the provider, containing a numeric rating (1-5 stars) and an optional comment. The provider's average rating is automatically updated when new reviews are submitted.

**Transactions** record all financial movements. When a customer adds money to their wallet, when they pay for a booking, when a provider receives their payout—each creates a transaction record with the amount, type, status, and references to the related user and booking.

**Notifications** keep users informed. When something important happens—a new booking, an application approved, a message received—a notification record is created with the message and a link to the relevant page.

**Categories** organize services. The platform has predefined categories like Plumbing, Electrical, Salon & Beauty, Catering, Carpentry, and Cleaning. Each provider is assigned a primary category, and an "Other" category catches everything else.

## 4.3 Data Relationships

The database uses relationships to connect data:

**One-to-One** relationships connect single records. Each User has at most one Provider profile. This is enforced by making the userId column in the Provider table unique.

**One-to-Many** relationships connect one record to multiple related records. One Provider can have many Services. One User can have many Bookings. One Booking can have many Transactions (payment, refund, etc.).

**Many-to-Many** relationships require junction tables. Users can save multiple providers as favorites, and each provider can be saved by multiple users. The SavedProvider table connects them with pairs of user and provider IDs.

## 4.4 Data Integrity Strategies

**Cascade Deletes** ensure related data is cleaned up. If a user account is deleted, their provider profile, bookings, and reviews are automatically deleted. This prevents orphaned records pointing to non-existent users.

**Soft Deletes** preserve history where needed. Providers aren't deleted when rejected—their status changes to REJECTED. This allows them to reapply and preserves audit trails.

**Default Values** provide sensible starting points. New users have zero wallet balance, new providers have PENDING status, bookings default to PENDING status.

**Enum Types** constrain values to valid options. A booking status can only be PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, or CANCELLED—nothing else. This prevents data corruption from typos or bugs.

---

# CHAPTER 5: FEATURE WALKTHROUGH

## 5.1 Customer Registration and Login

When a new customer visits the platform, they see the landing page with service categories and featured providers. To book a service, they must create an account.

The registration form collects name, email, and password. The email must be a valid format, and the password must meet minimum strength requirements. Upon submission, the backend creates a user account with the CUSTOMER role and sends a verification email.

Until the email is verified, certain features are restricted. The customer can browse the platform but cannot make bookings. Clicking the verification link in their email confirms ownership and unlocks full functionality.

For returning users, login requires email and password. The backend verifies the password hash matches, checks that the account isn't banned, and issues access and refresh tokens. The frontend stores these tokens and includes them in subsequent requests.

## 5.2 Provider Registration (Multi-Step Onboarding)

Provider registration is more complex because providers must be verified before serving customers.

**Step 1: Contact Information** collects the provider's personal details—name, email, phone number, and password. An OTP (one-time password) is sent to the email for verification.

**Step 2: OTP Verification** confirms the email is valid and accessible. The provider enters the 6-digit code received via email. This proves they control the email address and can receive important communications.

**Step 3: Business Details** gathers professional information—business name, category, description, years of experience, service area (radius in kilometers), and address. The provider also uploads supporting documents: a business card image, a sample of their work, and optionally a certification.

Upon completion, the provider account is created with PENDING status. An admin reviews the application, examining the documents and business details. The admin can approve (allowing the provider to receive bookings), reject (with a reason, allowing resubmission), or request additional information.

Approved providers receive an email notification and gain access to the provider dashboard. Rejected providers can log back in, which takes them directly to Step 3 to update their information and resubmit.

## 5.3 Browsing and Booking Services

Customers browse services through the category-based navigation. Clicking "Plumbing" shows all approved plumbing providers. Each provider card displays their business name, rating, number of reviews, and a brief description.

Clicking a provider opens their detailed profile showing all offered services with prices and durations, the photo gallery, reviews from other customers, and availability schedule.

To book a service, the customer clicks "Book Now" on the specific service. The booking modal collects:
- **Date Selection**: Only today and tomorrow are available, preventing far-future bookings that might be forgotten
- **Time Slot**: Available times based on the provider's schedule
- **Address**: Where the service should be performed
- **Notes**: Any special instructions for the provider

The total amount shown includes the service price, platform fee (7%), and GST (8%). Clicking "Confirm Booking" deducts the amount from the customer's wallet and creates the booking with PENDING status.

The provider receives an instant notification (via Socket.io) and an email about the new booking request.

## 5.4 Provider Booking Management

Providers see incoming bookings on their dashboard. Each booking shows the customer name, service requested, scheduled date and time, address, and total amount.

For pending bookings, providers have two options:

**Accept** confirms they can perform the service. The booking status changes to CONFIRMED, and the customer receives a notification that their booking is confirmed.

**Reject** declines the booking. The booking status changes to CANCELLED, the customer's wallet is refunded (minus any cancellation fee if applicable), and the customer is notified with the rejection.

Once a booking is confirmed and the scheduled time arrives, the provider can **Start Service**, changing the status to IN_PROGRESS.

## 5.5 Service Completion with OTP Verification

The OTP verification system ensures services are actually completed, preventing disputes where providers claim completion without performing the work.

When the provider finishes the work and clicks "Complete Service", a 4-digit OTP is generated and sent to the customer. Only the customer receives this code—through the app and via email.

The provider asks the customer for this code and enters it in the completion dialog. If the code matches, the booking is marked COMPLETED, and the provider's earnings are credited. If it doesn't match, the customer can verify the work wasn't done and dispute the booking.

This verification system protects both parties: customers don't pay for incomplete work, and providers have proof of service delivery.

## 5.6 Reviews and Ratings

After a booking is completed, the customer can leave a review. The review form has a 1-5 star rating and an optional text comment.

Reviews are public and visible on the provider's profile. The provider's average rating is automatically recalculated each time a new review is added.

Providers cannot delete or edit reviews, ensuring the feedback system remains trustworthy. However, inappropriate reviews can be reported to administrators for removal.

## 5.7 Provider Availability Management

Providers set their weekly schedule through the availability editor. For each day of the week, they can:
- Toggle whether they work that day (enabled/disabled)
- Set the start time of their working hours
- Set the end time of their working hours

This schedule determines which time slots are shown to customers during booking. If a provider is unavailable on Sundays, no Sunday slots appear in the booking interface.

## 5.8 Admin Panel Functions

Administrators access a comprehensive management panel with several sections:

**Pending Providers** shows applications awaiting review. Admins see the business details and uploaded documents. They can approve with the existing category, approve with a different category (for custom categories), or reject with a reason.

For custom categories (providers who entered a category not in the system), admins have two options:
- **Create Category**: Creates a new system category with that name and approves the provider
- **Assign to Other**: Approves the provider under the generic "Other" category

**All Providers** lists every provider with filters for status. Admins can suspend providers (temporarily disable booking reception), view detailed profiles, and see provider analytics.

**Users** shows all customer accounts. Admins can view booking history, ban users for policy violations, and unban previously banned users.

**Categories** manages the service taxonomy. Admins can add new categories, edit existing ones, reorder their display, or disable unused categories.

**Analytics** provides platform-wide statistics: total bookings by status, revenue over time, number of active providers, customer registration trends, and popular categories.

## 5.9 Wallet and Payments

The platform uses a wallet system for payments. Customers add money to their wallet through a mock payment interface (in production, this would integrate with payment gateways like Razorpay).

When booking a service, the amount is deducted from the wallet. This prepayment model ensures providers are compensated—customers can't book and refuse to pay.

Providers accumulate earnings as bookings are completed. They can request payouts to their bank accounts (again, through integration with payment processors in production).

Every financial movement is recorded in the transactions table, creating a complete audit trail for accounting and dispute resolution.

---

# CHAPTER 6: TECHNICAL DECISIONS EXPLAINED

## 6.1 Why Not Use a Different Frontend Framework?

Vue.js was considered for its gentler learning curve, but React's larger ecosystem proved decisive. Libraries like Radix UI and TanStack Query have excellent React support. Finding React developers and solutions to problems is easier due to the larger community.

Angular was dismissed for being overly opinionated and complex for this project's scope. Its steep learning curve would slow development without providing benefits this application needs.

## 6.2 Why Not Use Redux for State Management?

Redux is powerful but comes with significant boilerplate. For every piece of state, developers must define actions, action creators, reducers, and selectors. This overhead makes sense for complex applications but is excessive for server-state-centric apps.

TanStack Query handles server state perfectly—automatic caching, background refetching, loading and error states. For simple UI state like modal visibility or form inputs, React's built-in useState is sufficient. This combination covers all needs without Redux's complexity.

## 6.3 Why PostgreSQL Instead of MongoDB?

MongoDB excels at flexible, document-based data—but MH26 Services has highly relational data. A booking references a user, a service, and a provider. Services reference providers and categories. These relationships are natural in a relational database.

MongoDB would require embedding data (duplicating booking information in user documents) or maintaining references manually without foreign key enforcement. PostgreSQL handles relationships natively and guarantees referential integrity.

The JSONB column type gives us MongoDB-like flexibility where needed (the availability schedule) while maintaining overall structure.

## 6.4 Why Use an ORM Instead of Raw SQL?

Prisma provides auto-generated TypeScript types matching the database schema. When querying bookings, the code has full type information—the IDE knows exactly what fields are available and their types.

Migrations are managed automatically. Changing the schema updates the migration history, and deploying to production applies only new migrations.

Raw SQL would provide more control but require maintaining type definitions manually, writing migration scripts by hand, and losing the productivity benefits of modern ORM tooling.

## 6.5 Why Separate Access and Refresh Tokens?

A single long-lived token would be convenient but risky. If stolen (through XSS, network interception, or device theft), the attacker has long-term access.

Short-lived access tokens limit exposure. Even if compromised, they expire quickly. Refresh tokens are stored in the database, allowing immediate revocation—if suspicious activity is detected, invalidating the refresh token locks out the attacker.

---

# CHAPTER 7: CONSISTENCY AND RELIABILITY

## 7.1 Frontend Consistency

All components use the same design language: colors from the predefined palette, consistent spacing based on multiples of 4 pixels, standardized border radii and shadows. This is enforced through Tailwind's configuration file, ensuring a new developer can't accidentally introduce off-brand styling.

Forms all use React Hook Form with Zod validation, providing a consistent user experience. Error messages appear in the same location with the same styling. Loading states use the same spinner component. Success messages use the same toast notification system.

## 7.2 Backend Consistency

Every controller follows the same pattern: validate input, check authorization, perform database operations, handle errors, send response. This predictability makes the codebase maintainable.

All API responses follow a consistent format. Successful responses include a data field. Error responses include a message field and appropriate HTTP status code. Lists include pagination information.

Error handling is centralized. Controllers don't catch errors individually—they propagate to a global error handler that logs the error, determines the appropriate response, and sends it consistently.

## 7.3 Database Consistency

Foreign key constraints prevent orphaned data. Unique constraints prevent duplicate accounts. Check constraints ensure values are within valid ranges.

Transactions group related operations. A booking creation that fails to create the transaction record doesn't leave partial data—the entire operation rolls back.

## 7.4 Data Validation Consistency

Zod schemas define validation rules once and apply everywhere. The same rules that validate a provider registration form in the browser also validate the corresponding API request on the server.

This prevents the common bug where frontend validation is more lenient than backend validation (confusing users whose submissions are accepted by the form but rejected by the server).

---

# CONCLUSION

MH26 Services demonstrates a modern full-stack application architecture. The frontend provides a responsive, accessible interface. The backend offers secure, performant APIs. The database maintains data integrity and relationships. Real-time features enhance user experience. The entire system is type-safe, consistently structured, and built to scale.

Each technology choice was made deliberately to solve specific problems while maintaining simplicity and maintainability. The result is a platform capable of serving local service providers and customers effectively.

---

*This document is intended for demo presentations and technical discussions about the MH26 Services platform.*
