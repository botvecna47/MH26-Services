# UML Diagrams for MH26 Services Marketplace

This document contains all UML diagrams for the MH26 Services platform.

---

## Table of Contents

1. [Use Case Diagram](#1-use-case-diagram)
2. [Class Diagram](#2-class-diagram)
3. [Object Diagram](#3-object-diagram)
4. [Sequence Diagrams](#4-sequence-diagrams)

---

## 1. Use Case Diagram

### 1.1 Main Use Case Diagram

```mermaid
graph TB
    %% Actors
    Customer[Customer]
    Provider[Service Provider]
    Admin[Administrator]
    System[System]
    
    %% Customer Use Cases
    Customer --> UC1[Register Account]
    Customer --> UC2[Login/Logout]
    Customer --> UC3[Search Services]
    Customer --> UC4[View Provider Details]
    Customer --> UC5[Create Booking Request]
    Customer --> UC6[Send Message]
    Customer --> UC7[Submit Review]
    Customer --> UC8[Report Provider]
    Customer --> UC9[View Notifications]
    Customer --> UC10[Cancel Booking]
    
    %% Provider Use Cases
    Provider --> UC11[Register Provider Profile]
    Provider --> UC12[Upload Documents]
    Provider --> UC13[Create Service Listing]
    Provider --> UC14[View Booking Requests]
    Provider --> UC15[Accept Booking]
    Provider --> UC16[Reject Booking]
    Provider --> UC17[Complete Booking]
    Provider --> UC18[Update Profile]
    
    %% Admin Use Cases
    Admin --> UC19[Approve Provider]
    Admin --> UC20[Reject Provider]
    Admin --> UC21[Manage Users]
    Admin --> UC22[View Analytics]
    Admin --> UC23[Handle Reports]
    Admin --> UC24[Configure Settings]
    
    %% System Use Cases
    System --> UC25[Send Email Verification]
    System --> UC26[Send Email OTP]
    System --> UC27[Generate Invoice]
    System --> UC28[Calculate Platform Fee]
    System --> UC29[Update Provider Rating]
    System --> UC30[Send Booking Notifications]
    
    %% Relationships
    UC1 -.->|includes| UC25
    UC1 -.->|includes| UC26
    UC5 -.->|includes| UC30
    UC5 -.->|includes| UC28
    UC7 -.->|includes| UC29
    UC11 -.->|includes| UC12
    UC15 -.->|includes| UC30
    UC16 -.->|includes| UC30
    UC19 -.->|extends| UC18
    UC20 -.->|extends| UC18
```

### 1.2 Detailed Use Case Descriptions

#### Customer Use Cases

**UC-1: Register Account**
- **Actor**: Customer
- **Description**: Customer creates a new account with email, phone, and password
- **Preconditions**: None
- **Postconditions**: Account created, verification email sent
- **Main Flow**:
  1. Customer enters registration details
  2. System validates input
  3. System creates user account
  4. System sends verification email
  5. System returns success message

**UC-3: Search Services**
- **Actor**: Customer
- **Description**: Customer searches for service providers by category, location, or keyword
- **Preconditions**: None
- **Postconditions**: Search results displayed
- **Main Flow**:
  1. Customer enters search criteria
  2. System queries database
  3. System returns matching providers
  4. Customer views results

**UC-5: Create Booking Request**
- **Actor**: Customer
- **Description**: Customer creates a booking request for a service
- **Preconditions**: Customer must be logged in, service must exist, provider must be approved
- **Postconditions**: Booking created with PENDING status, provider notified
- **Main Flow**:
  1. Customer selects service
  2. Customer selects date/time
  3. Customer enters address and requirements
  4. System calculates total amount and platform fee
  5. System creates booking with PENDING status
  6. System creates notification for provider
  7. System emits real-time notification via Socket.io
  8. System returns booking details to customer

---

## 2. Class Diagram

### 2.1 Main Class Diagram

```mermaid
classDiagram
    %% User Classes
    class User {
        +String id
        +String name
        +String email
        +String phone
        +String passwordHash
        +String avatarUrl
        +UserRole role
        +Boolean emailVerified
        +Boolean phoneVerified
        +DateTime createdAt
        +DateTime updatedAt
        +register()
        +login()
        +updateProfile()
        +verifyEmail()
        +verifyPhone()
    }
    
    class Provider {
        +String id
        +String userId
        +String businessName
        +String description
        +String primaryCategory
        +String address
        +String city
        +Float averageRating
        +ProviderStatus status
        +createProfile()
        +updateProfile()
        +uploadDocument()
        +createService()
    }
    
    class Service {
        +String id
        +String providerId
        +String title
        +String description
        +Decimal price
        +Int durationMin
        +create()
        +update()
        +delete()
    }
    
    class Booking {
        +String id
        +String userId
        +String providerId
        +String serviceId
        +DateTime scheduledAt
        +BookingStatus status
        +Decimal totalAmount
        +Decimal platformFee
        +Decimal providerEarnings
        +String address
        +String requirements
        +create()
        +accept()
        +reject()
        +cancel()
        +complete()
    }
    
    class Message {
        +String id
        +String conversationId
        +String senderId
        +String receiverId
        +String text
        +Boolean read
        +send()
        +markAsRead()
    }
    
    class Review {
        +String id
        +String providerId
        +String userId
        +Int rating
        +String comment
        +submit()
        +update()
    }
    
    class Notification {
        +String id
        +String userId
        +String type
        +String title
        +String body
        +Boolean read
        +send()
        +markAsRead()
    }
    
    class Report {
        +String id
        +String reporterId
        +String providerId
        +String reason
        +ReportStatus status
        +create()
        +update()
    }
    
    %% Relationships
    User "1" --> "*" Booking : creates
    User "1" --> "*" Message : sends
    User "1" --> "*" Review : writes
    User "1" --> "*" Notification : receives
    User "1" --> "0..1" Provider : has
    
    Provider "1" --> "*" Service : offers
    Provider "1" --> "*" Booking : receives
    Provider "1" --> "*" Review : receives
    Provider "1" --> "*" Report : reported_in
    
    Service "1" --> "*" Booking : booked_for
    
    Booking "1" --> "0..1" Review : generates
```

### 2.2 Controller Classes

```mermaid
classDiagram
    class AuthController {
        +register()
        +login()
        +logout()
        +refreshToken()
        +verifyEmail()
        +forgotPassword()
        +resetPassword()
    }
    
    class ProviderController {
        +list()
        +getById()
        +create()
        +update()
        +approve()
        +reject()
        +uploadDocument()
    }
    
    class BookingController {
        +create()
        +list()
        +getById()
        +accept()
        +reject()
        +update()
        +cancel()
        +getInvoice()
    }
    
    class MessageController {
        +sendMessage()
        +listConversations()
        +getMessages()
        +markAsRead()
    }
    
    class ReviewController {
        +create()
        +getProviderReviews()
    }
    
    class AdminController {
        +getAnalytics()
        +getPendingProviders()
        +approveProvider()
        +rejectProvider()
        +listUsers()
        +banUser()
    }
```

### 2.3 Service Classes

```mermaid
classDiagram
    class EmailService {
        +sendEmail()
        +sendVerificationEmail()
        +sendPasswordResetEmail()
        +sendProviderApprovalEmail()
        +sendBookingConfirmationEmail()
        +sendEmailOTP()
    }
    
    class UploadService {
        +generatePresignedUrl()
        +uploadFile()
        +deleteFile()
    }
    
    class NotificationService {
        +sendNotification()
        +createNotification()
        +markAsRead()
    }
    
    class SocketService {
        +emitMessage()
        +emitNotification()
        +emitBookingUpdate()
        +emitProviderApproval()
    }
```

---

## 3. Object Diagram

### 3.1 Booking Creation Object Diagram

```mermaid
objectDiagram
    customer1 : Customer
    customer1 : id = "user-123"
    customer1 : name = "John Doe"
    customer1 : email = "john@example.com"
    
    provider1 : Provider
    provider1 : id = "provider-456"
    provider1 : businessName = "QuickFix Plumbing"
    provider1 : status = APPROVED
    
    service1 : Service
    service1 : id = "service-789"
    service1 : title = "Pipe Repair"
    service1 : price = 500.00
    
    booking1 : Booking
    booking1 : id = "booking-001"
    booking1 : status = PENDING
    booking1 : scheduledAt = "2024-12-15 10:00"
    booking1 : totalAmount = 500.00
    booking1 : platformFee = 25.00
    booking1 : providerEarnings = 475.00
    
    notification1 : Notification
    notification1 : type = "BOOKING_REQUEST"
    notification1 : title = "New Booking Request"
    
    customer1 --> booking1 : creates
    provider1 --> booking1 : receives
    service1 --> booking1 : booked_for
    booking1 --> notification1 : generates
```

### 3.2 Provider Approval Object Diagram

```mermaid
objectDiagram
    admin1 : Administrator
    admin1 : id = "admin-001"
    admin1 : name = "Admin User"
    admin1 : role = ADMIN
    
    provider2 : Provider
    provider2 : id = "provider-002"
    provider2 : businessName = "New Plumbing Service"
    provider2 : status = PENDING
    
    user2 : User
    user2 : id = "user-002"
    user2 : name = "Provider Owner"
    user2 : role = PROVIDER
    
    doc1 : ProviderDocument
    doc1 : type = "aadhar"
    doc1 : url = "https://s3.../aadhar.pdf"
    
    doc2 : ProviderDocument
    doc2 : type = "trade_license"
    doc2 : url = "https://s3.../license.pdf"
    
    notification1 : Notification
    notification1 : type = "provider_approved"
    notification1 : title = "Provider Approved"
    
    admin1 --> provider2 : approves
    user2 --> provider2 : owns
    provider2 --> doc1 : has
    provider2 --> doc2 : has
    provider2 --> notification1 : generates
```

---

## 4. Sequence Diagrams

### 4.1 User Registration Sequence Diagram

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant A as AuthController
    participant DB as Database
    participant ES as EmailService
    
    C->>F: Enter registration details
    F->>A: POST /api/auth/register
    A->>DB: Check if user exists
    DB-->>A: User not found
    A->>A: Hash password
    A->>DB: Create user record
    DB-->>A: User created
    A->>DB: Create email verification token
    DB-->>A: Token created
    A->>ES: Send verification email
    ES-->>A: Email sent
    A->>A: Generate JWT tokens
    A-->>F: Return user + tokens
    F-->>C: Show success message
```

### 4.2 Booking Creation and Acceptance Sequence Diagram

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant BC as BookingController
    participant DB as Database
    participant NS as NotificationService
    participant SS as SocketService
    participant P as Provider
    
    Note over C,P: Step 1: Customer Creates Booking Request
    C->>F: Select service, date & time
    F->>BC: POST /api/bookings
    BC->>DB: Validate service & provider
    DB-->>BC: Service & provider valid
    BC->>BC: Calculate total amount & platform fee
    BC->>DB: Create booking (PENDING)
    DB-->>BC: Booking created
    BC->>NS: Create notification for provider
    NS->>DB: Save notification
    NS->>SS: Emit notification to provider
    SS-->>P: Real-time notification
    BC-->>F: Return booking details
    F-->>C: Show booking request confirmation
    
    Note over C,P: Step 2: Provider Accepts/Rejects
    P->>F: View booking request
    P->>F: Click Accept/Reject
    alt Provider Accepts
        F->>BC: POST /api/bookings/:id/accept
        BC->>DB: Update booking (CONFIRMED)
        DB-->>BC: Booking updated
        BC->>NS: Create notification for customer
        NS->>DB: Save notification
        NS->>SS: Emit notification to customer
        SS-->>C: Real-time notification
        BC-->>F: Return updated booking
        F-->>P: Show acceptance confirmation
    else Provider Rejects
        F->>BC: POST /api/bookings/:id/reject
        BC->>DB: Update booking (REJECTED)
        DB-->>BC: Booking updated
        BC->>NS: Create notification for customer
        NS->>DB: Save notification
        NS->>SS: Emit notification to customer
        SS-->>C: Real-time notification
        BC-->>F: Return updated booking
        F-->>P: Show rejection confirmation
    end
```

### 4.3 Provider Approval Sequence Diagram

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant AC as AdminController
    participant DB as Database
    participant ES as EmailService
    participant SS as SocketService
    participant NS as NotificationService
    
    A->>F: Click approve provider
    F->>AC: POST /api/admin/providers/:id/approve
    AC->>DB: Get provider details
    DB-->>AC: Provider data
    AC->>DB: Update provider status (APPROVED)
    DB-->>AC: Status updated
    AC->>DB: Get provider user
    DB-->>AC: User data
    AC->>ES: Send approval email
    ES-->>AC: Email sent
    AC->>NS: Create notification
    NS->>DB: Save notification
    NS->>SS: Emit notification to provider
    SS-->>AC: Notification sent
    AC->>DB: Create audit log
    DB-->>AC: Log created
    AC-->>F: Return success
    F-->>A: Show approval confirmation
```

### 4.4 Message Sending Sequence Diagram

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant F as Frontend
    participant MC as MessageController
    participant DB as Database
    participant SS as SocketService
    
    U1->>F: Type message
    U1->>F: Click send
    F->>MC: POST /api/messages
    MC->>DB: Validate users exist
    DB-->>MC: Users valid
    MC->>DB: Get or create conversation
    DB-->>MC: Conversation ID
    MC->>DB: Save message
    DB-->>MC: Message saved
    MC->>SS: Emit message to receiver
    SS-->>MC: Message delivered
    MC-->>F: Return message
    F-->>U1: Show sent message
    SS->>F: Real-time update to receiver
```

### 4.5 Provider Accept/Reject Booking Sequence Diagram

```mermaid
sequenceDiagram
    participant P as Provider
    participant F as Frontend
    participant BC as BookingController
    participant DB as Database
    participant NS as NotificationService
    participant SS as SocketService
    participant C as Customer
    
    P->>F: View pending booking request
    P->>F: Click Accept or Reject
    
    alt Provider Accepts Booking
        F->>BC: POST /api/bookings/:id/accept
        BC->>DB: Get booking details
        DB-->>BC: Booking data
        BC->>BC: Validate booking status (PENDING)
        BC->>DB: Update booking (CONFIRMED)
        DB-->>BC: Booking updated
        BC->>NS: Create notification for customer
        NS->>DB: Save notification
        NS->>SS: Emit notification to customer
        SS-->>C: Real-time notification
        BC-->>F: Return updated booking
        F-->>P: Show acceptance confirmation
        F-->>C: Show booking confirmed (via notification)
    else Provider Rejects Booking
        F->>BC: POST /api/bookings/:id/reject
        BC->>DB: Get booking details
        DB-->>BC: Booking data
        BC->>BC: Validate booking status (PENDING)
        BC->>DB: Update booking (REJECTED)
        DB-->>BC: Booking updated
        BC->>NS: Create notification for customer
        NS->>DB: Save notification with rejection reason
        NS->>SS: Emit notification to customer
        SS-->>C: Real-time notification
        BC-->>F: Return updated booking
        F-->>P: Show rejection confirmation
        F-->>C: Show booking rejected (via notification)
    end
```

### 4.6 Review Submission Sequence Diagram

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant RC as ReviewController
    participant DB as Database
    participant PC as ProviderController
    
    C->>F: Submit review form
    F->>RC: POST /api/reviews
    RC->>DB: Check if booking exists and completed
    DB-->>RC: Booking found
    RC->>DB: Check if review already exists
    DB-->>RC: No existing review
    RC->>DB: Create review
    DB-->>RC: Review created
    RC->>PC: Update provider rating
    PC->>DB: Calculate new average rating
    DB-->>PC: Updated rating
    PC->>DB: Update provider record
    DB-->>PC: Provider updated
    RC-->>F: Return review
    F-->>C: Show success message
```

---

## 5. Activity Diagrams

### 5.1 Provider Onboarding Activity Diagram

```mermaid
flowchart TD
    Start([Provider Registration]) --> Register[Register User Account]
    Register --> VerifyEmail[Verify Email]
    VerifyEmail --> CreateProfile[Create Provider Profile]
    CreateProfile --> UploadDocs[Upload Documents]
    UploadDocs --> Submit[Submit for Review]
    Submit --> Pending{Status: PENDING}
    Pending --> AdminReview[Admin Reviews Application]
    AdminReview --> Decision{Decision}
    Decision -->|Approve| Approved[Status: APPROVED]
    Decision -->|Reject| Rejected[Status: REJECTED]
    Approved --> NotifyApproved[Send Approval Notification]
    Rejected --> NotifyRejected[Send Rejection Notification]
    NotifyApproved --> End([Provider Active])
    NotifyRejected --> End
```

### 5.2 Booking Flow Activity Diagram

```mermaid
flowchart TD
    Start([Customer Views Service]) --> Select[Select Service, Date & Time]
    Select --> EnterDetails[Enter Address & Requirements]
    EnterDetails --> CreateBooking[Create Booking Request]
    CreateBooking --> Pending{Status: PENDING}
    Pending --> NotifyProvider[Notify Provider]
    NotifyProvider --> ProviderDecision{Provider Decision}
    ProviderDecision -->|Accept| Accept[Provider Accepts]
    ProviderDecision -->|Reject| Reject[Provider Rejects]
    Accept --> Confirmed{Status: CONFIRMED}
    Reject --> Rejected{Status: REJECTED}
    Rejected --> NotifyCustomer[Notify Customer of Rejection]
    NotifyCustomer --> End1([Booking Closed])
    Confirmed --> Service[Service Performed]
    Service --> Complete[Provider Marks Complete]
    Complete --> Completed{Status: COMPLETED}
    Completed --> NotifyCustomer2[Notify Customer]
    NotifyCustomer2 --> Review[Customer Reviews]
    Review --> End2([Booking Closed])
    Pending -->|Customer Cancels| Cancel1[Cancel Booking]
    Confirmed -->|Customer/Provider Cancels| Cancel2[Cancel Booking]
    Cancel1 --> End3([Booking Closed])
    Cancel2 --> End3
```

---

## 6. State Diagram

### 6.1 Booking State Diagram

```mermaid
stateDiagram-v2
    [*] --> PENDING: Customer Creates Booking Request
    PENDING --> CONFIRMED: Provider Accepts
    PENDING --> REJECTED: Provider Rejects
    PENDING --> CANCELLED: Customer Cancels
    CONFIRMED --> COMPLETED: Provider Marks Complete
    CONFIRMED --> CANCELLED: Customer/Provider Cancels
    COMPLETED --> [*]: Booking Closed
    CANCELLED --> [*]: Booking Closed
    REJECTED --> [*]: Booking Closed
```

### 6.2 Provider Status State Diagram

```mermaid
stateDiagram-v2
    [*] --> PENDING: Submit Application
    PENDING --> APPROVED: Admin Approves
    PENDING --> REJECTED: Admin Rejects
    APPROVED --> SUSPENDED: Admin Suspends
    SUSPENDED --> APPROVED: Admin Reinstates
    REJECTED --> [*]: Application Closed
```

---

## 7. Component Diagram

### 7.1 System Architecture Component Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        React[React Application]
        UI[UI Components]
        State[State Management]
    end
    
    subgraph "API Layer"
        AuthAPI[Auth API]
        ProviderAPI[Provider API]
        BookingAPI[Booking API]
        MessageAPI[Message API]
        NotificationAPI[Notification API]
        ReviewAPI[Review API]
        AdminAPI[Admin API]
    end
    
    subgraph "Business Logic Layer"
        AuthController[Auth Controller]
        ProviderController[Provider Controller]
        BookingController[Booking Controller]
        MessageController[Message Controller]
        NotificationController[Notification Controller]
        ReviewController[Review Controller]
        AdminController[Admin Controller]
    end
    
    subgraph "Service Layer"
        EmailService[Email Service]
        UploadService[Upload Service]
        SocketService[Socket Service]
        OTPService[OTP Service]
    end
    
    subgraph "Data Layer"
        Database[(PostgreSQL)]
        Cache[(Redis)]
        Storage[(S3 Storage)]
    end
    
    subgraph "External Services"
        PaymentGateway[Razorpay]
        SMTP[Email Service]
        SMS[SMS Service]
    end
    
    React --> AuthAPI
    React --> ProviderAPI
    React --> BookingAPI
    React --> MessageAPI
    React --> NotificationAPI
    React --> ReviewAPI
    React --> AdminAPI
    
    AuthAPI --> AuthController
    ProviderAPI --> ProviderController
    BookingAPI --> BookingController
    MessageAPI --> MessageController
    NotificationAPI --> NotificationController
    ReviewAPI --> ReviewController
    AdminAPI --> AdminController
    
    AuthController --> EmailService
    AuthController --> OTPService
    BookingController --> SocketService
    ProviderController --> UploadService
    MessageController --> SocketService
    NotificationController --> SocketService
    
    AuthController --> Database
    ProviderController --> Database
    BookingController --> Database
    MessageController --> Database
    NotificationController --> Database
    ReviewController --> Database
    AdminController --> Database
    
    EmailService --> SMTP
    UploadService --> Storage
    SocketService --> Cache
    OTPService --> Cache
```

---

## 8. Deployment Diagram

### 8.1 System Deployment Diagram

```mermaid
graph TB
    subgraph "Client Tier"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Load Balancer"
        LB[Load Balancer]
    end
    
    subgraph "Application Tier"
        App1[App Server 1]
        App2[App Server 2]
        App3[App Server 3]
    end
    
    subgraph "Database Tier"
        PrimaryDB[(Primary Database)]
        ReplicaDB[(Read Replica)]
    end
    
    subgraph "Cache Tier"
        Redis1[(Redis Cluster)]
    end
    
    subgraph "Storage Tier"
        S3[S3 Storage]
    end
    
    subgraph "External Services"
        Razorpay[Payment Gateway]
        SMTP[Email Service]
    end
    
    Browser --> LB
    Mobile --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    App1 --> PrimaryDB
    App2 --> PrimaryDB
    App3 --> PrimaryDB
    App1 --> ReplicaDB
    App2 --> ReplicaDB
    App3 --> ReplicaDB
    App1 --> Redis1
    App2 --> Redis1
    App3 --> Redis1
    App1 --> S3
    App2 --> S3
    App3 --> S3
    App1 --> Razorpay
    App2 --> Razorpay
    App3 --> Razorpay
    App1 --> SMTP
    App2 --> SMTP
    App3 --> SMTP
```

---

**Document Status**: Complete  
**Last Updated**: 2024  
**Version**: 1.0


