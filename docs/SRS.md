# Software Requirements Specification (SRS)

**Project Name**: MH26 Services
**Description**: A local service marketplace for Nanded.

## 1. Introduction
The goal of this project is to create a platform where people in Nanded can easily find and book local services like plumbing, cleaning, and electrical repairs. It solves the problem of finding reliable help quickly.

## 2. User Roles
- **Customer**: Searches for services, books appointments, and writes reviews.
- **Provider**: Lists their services, accepts bookings, and manages their profile.
- **Admin**: Manages users and ensures the platform is running smoothly.

## 3. Functional Requirements
These are the things the system MUST do:

### Authentication
- Users must be able to Sign Up and Login.
- Passwords must be encrypted.

### Service Discovery
- Customers can search for providers by category (e.g., "Plumber").
- Customers can view provider profiles and photos.

### Booking System
- Customers can book a service for a specific date and time.
- Providers can Accept or Reject bookings.
- An OTP (One-Time Password) is used to verify when a job is completed.

### Messaging
- Customers and Providers can chat with each other to discuss details.

## 4. Non-Functional Requirements
These are about how well the system performs:
- **Performance**: Pages should load quickly.
- **Security**: User data must be protected.
- **Reliability**: The server should not crash easily.

## 5. Technology Used
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL, Prisma
