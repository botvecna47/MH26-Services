# Software Requirements Specification (SRS)
## MH26 Services Marketplace Platform

**Version:** 1.0  
**Date:** 2025  
**Prepared by:** Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Models](#6-system-models)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the MH26 Services Marketplace Platform, a web-based application that connects customers with local service providers in Nanded, Maharashtra (MH26).

### 1.2 Scope
The system provides:
- Provider registration and management
- Service discovery and booking
- Real-time messaging between users
- Payment processing
- Review and rating system
- Administrative dashboard
- Notification system

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS**: Software Requirements Specification
- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **REST**: Representational State Transfer
- **UI/UX**: User Interface/User Experience
- **SMS**: Short Message Service
- **OTP**: One-Time Password

### 1.4 References
- Prisma Schema Documentation
- React Documentation
- Express.js Documentation
- PostgreSQL Documentation

### 1.5 Overview
This document is organized into sections covering system features, functional requirements, non-functional requirements, and system models.

---

## 2. Overall Description

### 2.1 Product Perspective
MH26 Services is a standalone web application that operates as a marketplace platform connecting service providers with customers.

### 2.2 Product Functions
- User authentication and authorization
- Provider profile management
- Service listing and search
- Booking management
- Payment processing
- Real-time messaging
- Review and rating system
- Administrative controls

### 2.3 User Classes and Characteristics

#### 2.3.1 Customers
- Browse and search for service providers
- Book services
- Make payments
- Communicate with providers
- Leave reviews and ratings

#### 2.3.2 Service Providers
- Create and manage profiles
- List services with pricing
- Accept/reject bookings
- Communicate with customers
- View earnings and analytics

#### 2.3.3 Administrators
- Approve/reject provider applications
- Manage users and providers
- View system analytics
- Handle reports and disputes
- Configure system settings

### 2.4 Operating Environment
- **Frontend**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Backend**: Node.js runtime environment
- **Database**: PostgreSQL 12+
- **Cache**: Redis
- **Storage**: S3-compatible storage

### 2.5 Design and Implementation Constraints
- Must use TypeScript for type safety
- RESTful API architecture
- Responsive mobile-first design
- WCAG AA accessibility compliance
- JWT-based authentication

### 2.6 Assumptions and Dependencies
- Users have internet connectivity
- Payment gateway (Razorpay) is available
- Email service (SMTP) is configured
- SMS service for OTP verification

---

## 3. System Features

### 3.1 User Authentication and Authorization
- User registration (Customer/Provider)
- Email verification
- Phone verification (OTP)
- Login/Logout
- Password reset
- Role-based access control

### 3.2 Provider Management
- Provider registration and onboarding
- Profile creation and editing
- Document upload (Aadhar, License, GST, etc.)
- Service listing
- Provider approval workflow
- Provider status management

### 3.3 Service Discovery
- Browse providers by category
- Search functionality
- Filter by location, rating, price
- Provider detail pages
- Service listings

### 3.4 Booking System
- Create bookings
- Booking confirmation
- Booking cancellation
- Booking status tracking
- Calendar integration
- Invoice generation

### 3.5 Payment Processing
- Payment gateway integration
- Order creation
- Payment verification
- Refund processing
- Transaction history
- Platform fee calculation

### 3.6 Messaging System
- Real-time messaging
- Conversation management
- File attachments
- Read receipts
- Typing indicators

### 3.7 Review and Rating
- Submit reviews
- Rate providers (1-5 stars)
- View provider ratings
- Review moderation

### 3.8 Notification System
- Email notifications
- In-app notifications
- Real-time updates
- Notification preferences

### 3.9 Administrative Features
- Provider approval/rejection
- User management
- Report handling
- Analytics dashboard
- System configuration

---

## 4. Functional Requirements

### 4.1 Authentication Module

#### FR-1.1: User Registration
- **Description**: Users can register with email, phone, password, and role
- **Input**: Name, email, phone, password, role (CUSTOMER/PROVIDER)
- **Output**: User account created, verification email sent
- **Precondition**: Email and phone must be unique
- **Postcondition**: User account created, email verification pending

#### FR-1.2: Email Verification
- **Description**: Users verify email via token sent to their email
- **Input**: Verification token
- **Output**: Email marked as verified
- **Precondition**: User must be registered
- **Postcondition**: Email verified status updated

#### FR-1.3: Phone Verification
- **Description**: Users verify phone via OTP sent via SMS
- **Input**: OTP code
- **Output**: Phone marked as verified
- **Precondition**: User must be logged in
- **Postcondition**: Phone verified status updated

#### FR-1.4: User Login
- **Description**: Authenticated users can log in with email and password
- **Input**: Email, password
- **Output**: Access token and refresh token
- **Precondition**: User account must exist
- **Postcondition**: User session created

#### FR-1.5: Password Reset
- **Description**: Users can reset forgotten passwords via email
- **Input**: Email address
- **Output**: Password reset email sent
- **Precondition**: User account must exist
- **Postcondition**: Reset token generated and sent

### 4.2 Provider Module

#### FR-2.1: Provider Registration
- **Description**: Users with PROVIDER role can create provider profiles
- **Input**: Business name, description, category, address, documents
- **Output**: Provider profile created (status: PENDING)
- **Precondition**: User must have PROVIDER role
- **Postcondition**: Provider profile created, awaiting approval

#### FR-2.2: Provider Profile Update
- **Description**: Providers can update their profile information
- **Input**: Updated profile data
- **Output**: Profile updated
- **Precondition**: Provider must be authenticated
- **Postcondition**: Profile information updated

#### FR-2.3: Document Upload
- **Description**: Providers can upload verification documents
- **Input**: Document file (Aadhar, License, GST, etc.)
- **Output**: Document uploaded and stored
- **Precondition**: Provider must be authenticated
- **Postcondition**: Document available for admin review

#### FR-2.4: Provider Approval
- **Description**: Admins can approve or reject provider applications
- **Input**: Provider ID, approval status, reason (if rejected)
- **Output**: Provider status updated, notification sent
- **Precondition**: Admin must be authenticated
- **Postcondition**: Provider status changed, notification sent

### 4.3 Service Module

#### FR-3.1: Service Listing
- **Description**: Providers can create service listings
- **Input**: Service title, description, price, duration
- **Output**: Service created and listed
- **Precondition**: Provider must be approved
- **Postcondition**: Service available for booking

#### FR-3.2: Service Search
- **Description**: Customers can search for services
- **Input**: Search query, filters (category, location, price)
- **Output**: List of matching services
- **Precondition**: None
- **Postcondition**: Search results displayed

#### FR-3.3: Service Details
- **Description**: Users can view detailed service information
- **Input**: Service ID
- **Output**: Service details with provider information
- **Precondition**: Service must exist
- **Postcondition**: Service details displayed

### 4.4 Booking Module

#### FR-4.1: Create Booking
- **Description**: Customers can create bookings for services
- **Input**: Service ID, scheduled date/time, address, requirements
- **Output**: Booking created (status: PENDING)
- **Precondition**: Customer must be authenticated, service must exist
- **Postcondition**: Booking created, provider notified

#### FR-4.2: Confirm Booking
- **Description**: Providers can confirm customer bookings
- **Input**: Booking ID
- **Output**: Booking status updated to CONFIRMED
- **Precondition**: Provider must be authenticated, booking must be PENDING
- **Postcondition**: Booking confirmed, customer notified

#### FR-4.3: Cancel Booking
- **Description**: Users can cancel bookings
- **Input**: Booking ID, cancellation reason
- **Output**: Booking status updated to CANCELLED
- **Precondition**: User must be authenticated, booking must exist
- **Postcondition**: Booking cancelled, refund processed if applicable

#### FR-4.4: Complete Booking
- **Description**: Providers can mark bookings as completed
- **Input**: Booking ID
- **Output**: Booking status updated to COMPLETED
- **Precondition**: Booking must be CONFIRMED
- **Postcondition**: Booking completed, customer can review

### 4.5 Payment Module

#### FR-5.1: Create Payment Order
- **Description**: System creates payment order with gateway
- **Input**: Booking ID, amount
- **Output**: Payment order ID
- **Precondition**: Booking must exist
- **Postcondition**: Payment order created

#### FR-5.2: Process Payment
- **Description**: Customer payment is processed
- **Input**: Payment order ID, payment details
- **Output**: Payment status (SUCCESS/FAILED)
- **Precondition**: Payment order must exist
- **Postcondition**: Payment processed, transaction recorded

#### FR-5.3: Verify Payment
- **Description**: System verifies payment with gateway
- **Input**: Payment signature, payment ID
- **Output**: Payment verification result
- **Precondition**: Payment must be initiated
- **Postcondition**: Payment verified, booking confirmed

#### FR-5.4: Process Refund
- **Description**: System processes refunds for cancelled bookings
- **Input**: Transaction ID, refund amount
- **Output**: Refund status
- **Precondition**: Transaction must exist
- **Postcondition**: Refund processed

### 4.6 Messaging Module

#### FR-6.1: Send Message
- **Description**: Users can send messages to other users
- **Input**: Receiver ID, message text, attachments (optional)
- **Output**: Message sent and stored
- **Precondition**: User must be authenticated
- **Postcondition**: Message delivered, notification sent

#### FR-6.2: View Conversations
- **Description**: Users can view their conversation list
- **Input**: None
- **Output**: List of conversations
- **Precondition**: User must be authenticated
- **Postcondition**: Conversations displayed

#### FR-6.3: Mark Message as Read
- **Description**: Users can mark messages as read
- **Input**: Message ID
- **Output**: Message marked as read
- **Precondition**: Message must exist
- **Postcondition**: Read status updated

### 4.7 Review Module

#### FR-7.1: Submit Review
- **Description**: Customers can submit reviews after completed bookings
- **Input**: Provider ID, rating (1-5), comment
- **Output**: Review created
- **Precondition**: Booking must be completed
- **Postcondition**: Review submitted, provider rating updated

#### FR-7.2: View Reviews
- **Description**: Users can view provider reviews
- **Input**: Provider ID
- **Output**: List of reviews
- **Precondition**: Provider must exist
- **Postcondition**: Reviews displayed

### 4.8 Notification Module

#### FR-8.1: Send Notification
- **Description**: System sends notifications to users
- **Input**: User ID, notification type, message
- **Output**: Notification created and sent
- **Precondition**: User must exist
- **Postcondition**: Notification delivered

#### FR-8.2: View Notifications
- **Description**: Users can view their notifications
- **Input**: None
- **Output**: List of notifications
- **Precondition**: User must be authenticated
- **Postcondition**: Notifications displayed

#### FR-8.3: Mark Notification as Read
- **Description**: Users can mark notifications as read
- **Input**: Notification ID
- **Output**: Notification marked as read
- **Precondition**: Notification must exist
- **Postcondition**: Read status updated

### 4.9 Admin Module

#### FR-9.1: View Analytics
- **Description**: Admins can view system analytics
- **Input**: Date range, filters
- **Output**: Analytics data (users, providers, bookings, revenue)
- **Precondition**: Admin must be authenticated
- **Postcondition**: Analytics displayed

#### FR-9.2: Manage Providers
- **Description**: Admins can approve/reject/suspend providers
- **Input**: Provider ID, action, reason
- **Output**: Provider status updated
- **Precondition**: Admin must be authenticated
- **Postcondition**: Provider status changed, notification sent

#### FR-9.3: Manage Users
- **Description**: Admins can ban/unban users
- **Input**: User ID, action
- **Output**: User status updated
- **Precondition**: Admin must be authenticated
- **Postcondition**: User status changed

#### FR-9.4: Handle Reports
- **Description**: Admins can view and handle user reports
- **Input**: Report ID, action, notes
- **Output**: Report status updated
- **Precondition**: Admin must be authenticated
- **Postcondition**: Report handled

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

#### NFR-1.1: Response Time
- **Requirement**: API endpoints must respond within 200ms for 95% of requests
- **Priority**: High
- **Measurement**: Response time metrics

#### NFR-1.2: Throughput
- **Requirement**: System must handle 1000 concurrent users
- **Priority**: High
- **Measurement**: Load testing

#### NFR-1.3: Database Performance
- **Requirement**: Database queries must complete within 100ms
- **Priority**: High
- **Measurement**: Query execution time

### 5.2 Security Requirements

#### NFR-2.1: Authentication
- **Requirement**: All API endpoints (except public) must require authentication
- **Priority**: Critical
- **Implementation**: JWT tokens

#### NFR-2.2: Password Security
- **Requirement**: Passwords must be hashed using bcrypt with 12 rounds
- **Priority**: Critical
- **Implementation**: bcrypt hashing

#### NFR-2.3: Data Encryption
- **Requirement**: Sensitive data (PAN, bank details) must be encrypted
- **Priority**: High
- **Implementation**: AES encryption

#### NFR-2.4: HTTPS
- **Requirement**: All communications must use HTTPS
- **Priority**: Critical
- **Implementation**: SSL/TLS certificates

#### NFR-2.5: Input Validation
- **Requirement**: All user inputs must be validated and sanitized
- **Priority**: High
- **Implementation**: Zod schemas, input sanitization

#### NFR-2.6: Rate Limiting
- **Requirement**: API endpoints must have rate limiting
- **Priority**: High
- **Implementation**: Redis-based rate limiting

### 5.3 Reliability Requirements

#### NFR-3.1: Uptime
- **Requirement**: System must have 99.9% uptime
- **Priority**: High
- **Measurement**: Monitoring tools

#### NFR-3.2: Error Handling
- **Requirement**: System must handle errors gracefully without crashing
- **Priority**: High
- **Implementation**: Error boundaries, try-catch blocks

#### NFR-3.3: Data Backup
- **Requirement**: Database must be backed up daily
- **Priority**: High
- **Implementation**: Automated backup system

### 5.4 Usability Requirements

#### NFR-4.1: Responsive Design
- **Requirement**: Application must work on mobile, tablet, and desktop
- **Priority**: High
- **Implementation**: Mobile-first responsive design

#### NFR-4.2: Accessibility
- **Requirement**: Application must meet WCAG AA standards
- **Priority**: Medium
- **Implementation**: ARIA labels, keyboard navigation

#### NFR-4.3: User Interface
- **Requirement**: Interface must be intuitive and easy to use
- **Priority**: High
- **Implementation**: User testing, design system

### 5.5 Scalability Requirements

#### NFR-5.1: Horizontal Scaling
- **Requirement**: System must support horizontal scaling
- **Priority**: Medium
- **Implementation**: Stateless API design

#### NFR-5.2: Database Scaling
- **Requirement**: Database must support read replicas
- **Priority**: Medium
- **Implementation**: Database replication

### 5.6 Maintainability Requirements

#### NFR-6.1: Code Quality
- **Requirement**: Code must follow TypeScript best practices
- **Priority**: Medium
- **Implementation**: ESLint, TypeScript strict mode

#### NFR-6.2: Documentation
- **Requirement**: Code must be well-documented
- **Priority**: Medium
- **Implementation**: JSDoc comments, README files

#### NFR-6.3: Testing
- **Requirement**: Code coverage must be at least 70%
- **Priority**: Medium
- **Implementation**: Unit tests, integration tests

### 5.7 Portability Requirements

#### NFR-7.1: Browser Compatibility
- **Requirement**: Application must work on Chrome, Firefox, Safari, Edge
- **Priority**: High
- **Implementation**: Cross-browser testing

#### NFR-7.2: Operating System
- **Requirement**: Application must work on Windows, macOS, Linux
- **Priority**: Medium
- **Implementation**: Cross-platform development

---

## 6. System Models

### 6.1 Use Case Model
See `docs/UML_DIAGRAMS.md` for detailed use case diagrams.

### 6.2 Class Model
See `docs/UML_DIAGRAMS.md` for detailed class diagrams.

### 6.3 Sequence Diagrams
See `docs/UML_DIAGRAMS.md` for detailed sequence diagrams.

---

## 7. Appendices

### 7.1 Glossary
- **Provider**: Service provider offering services on the platform
- **Booking**: A scheduled service appointment
- **Transaction**: A payment transaction
- **Review**: Customer feedback on a provider
- **Report**: User complaint about a provider

### 7.2 Data Dictionary
See Prisma schema for complete data model.

### 7.3 API Endpoints
See API documentation for complete endpoint list.

---

**Document Status**: Draft  
**Last Updated**: 2024  
**Next Review**: TBD


