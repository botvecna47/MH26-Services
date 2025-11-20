# UML Diagrams for MH26 Services Marketplace

This document contains all UML diagrams for the MH26 Services platform.

---

## Table of Contents

1. [Use Case Diagram](#1-use-case-diagram)
2. [Class Diagram](#2-class-diagram)
3. [Object Diagram](#3-object-diagram)
4. [Sequence Diagrams](#4-sequence-diagrams)
5. [Activity Diagrams](#5-activity-diagrams)
6. [State Diagram](#6-state-diagram)
7. [Component Diagram](#7-component-diagram)
8. [Deployment Diagram](#8-deployment-diagram)
9. [Database Schema (ER Diagram)](#9-database-schema-er-diagram)
10. [Package Diagram](#10-package-diagram)
11. [Communication Diagram](#11-communication-diagram)
12. [Collaboration Diagrams](#12-collaboration-diagrams)
13. [Simplified Diagrams for Academic Reports](#13-simplified-diagrams-for-academic-reports)

---

## 1. Use Case Diagram

### 1.1 Main Use Case Diagram

```mermaid
graph TB
    %% Styling
    classDef actorStyle fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff,font-weight:bold
    classDef customerUC fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px
    classDef providerUC fill:#FFF3E0,stroke:#FF9800,stroke-width:2px
    classDef adminUC fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px
    classDef systemUC fill:#E1F5FE,stroke:#00BCD4,stroke-width:2px
    
    %% Actors
    Customer((Customer))
    Provider((Service Provider))
    Admin((Administrator))
    System((System))
    
    %% Customer Use Cases
    UC1[Register Account]
    UC2[Login/Logout]
    UC3[Search Services]
    UC4[View Provider Details]
    UC5[Create Booking Request]
    UC6[Send Message]
    UC7[Submit Review]
    UC8[Report Provider]
    UC9[View Notifications]
    UC10[Cancel Booking]
    
    %% Provider Use Cases
    UC11[Register Provider Profile]
    UC12[Upload Documents]
    UC13[Create Service Listing]
    UC14[View Booking Requests]
    UC15[Accept Booking]
    UC16[Reject Booking]
    UC17[Complete Booking]
    UC18[Update Profile]
    
    %% Admin Use Cases
    UC19[Approve Provider]
    UC20[Reject Provider]
    UC21[Manage Users]
    UC22[View Analytics]
    UC23[Handle Reports]
    UC24[Configure Settings]
    
    %% System Use Cases
    UC25[Send Email Verification]
    UC26[Send Email OTP]
    UC27[Generate Invoice]
    UC28[Calculate Platform Fee]
    UC29[Update Provider Rating]
    UC30[Send Booking Notifications]
    
    %% Customer Relationships
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    Customer --> UC10
    
    %% Provider Relationships
    Provider --> UC11
    Provider --> UC12
    Provider --> UC13
    Provider --> UC14
    Provider --> UC15
    Provider --> UC16
    Provider --> UC17
    Provider --> UC18
    
    %% Admin Relationships
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    
    %% System Relationships
    System --> UC25
    System --> UC26
    System --> UC27
    System --> UC28
    System --> UC29
    System --> UC30
    
    %% Include Relationships (dashed)
    UC1 -.->|includes| UC25
    UC1 -.->|includes| UC26
    UC5 -.->|includes| UC30
    UC5 -.->|includes| UC28
    UC7 -.->|includes| UC29
    UC11 -.->|includes| UC12
    UC15 -.->|includes| UC30
    UC16 -.->|includes| UC30
    
    %% Extend Relationships (dashed)
    UC19 -.->|extends| UC18
    UC20 -.->|extends| UC18
    
    %% Apply Styles
    class Customer,Provider,Admin,System actorStyle
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10 customerUC
    class UC11,UC12,UC13,UC14,UC15,UC16,UC17,UC18 providerUC
    class UC19,UC20,UC21,UC22,UC23,UC24 adminUC
    class UC25,UC26,UC27,UC28,UC29,UC30 systemUC
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
    class User {
        <<entity>>
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
        <<entity>>
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
        <<entity>>
        +String id
        +String providerId
        +String title
        +String description
        +Decimal price
        +Int durationMin
        +String imageUrl
        +create()
        +update()
        +delete()
    }
    
    class Booking {
        <<entity>>
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
        <<entity>>
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
        <<entity>>
        +String id
        +String providerId
        +String userId
        +Int rating
        +String comment
        +submit()
        +update()
    }
    
    class Notification {
        <<entity>>
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
        <<entity>>
        +String id
        +String reporterId
        +String providerId
        +String reason
        +ReportStatus status
        +create()
        +update()
    }
    
    User --> Booking : creates
    User --> Message : sends
    User --> Review : writes
    User --> Notification : receives
    User --> Provider : has
    
    Provider --> Service : offers
    Provider --> Booking : receives
    Provider --> Review : receives
    Provider --> Report : reported_in
    
    Service --> Booking : booked_for
    
    Booking --> Review : generates
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
    
    class ServiceController {
        +list()
        +getById()
        +create()
        +update()
        +delete()
    }
    
    AuthController ..> User : manages
    ProviderController ..> Provider : manages
    BookingController ..> Booking : manages
    MessageController ..> Message : manages
    ReviewController ..> Review : manages
    AdminController ..> User : manages
    AdminController ..> Provider : manages
    ServiceController ..> Service : manages
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
    
    class OTPService {
        +generateOTP()
        +verifyOTP()
        +storeOTP()
    }
    
    EmailService ..> User : sends to
    NotificationService ..> Notification : creates
    SocketService ..> Message : emits
    SocketService ..> Notification : emits
    OTPService ..> User : verifies
```

---

## 3. Object Diagram

### 3.1 Booking Creation Object Diagram

```mermaid
graph LR
    subgraph Customer1["Customer Instance"]
        C1_ID["id: user-123"]
        C1_NAME["name: John Doe"]
        C1_EMAIL["email: john@example.com"]
    end
    
    subgraph Provider1["Provider Instance"]
        P1_ID["id: provider-456"]
        P1_NAME["businessName: QuickFix Plumbing"]
        P1_STATUS["status: APPROVED"]
    end
    
    subgraph Service1["Service Instance"]
        S1_ID["id: service-789"]
        S1_TITLE["title: Pipe Repair"]
        S1_PRICE["price: 500.00"]
    end
    
    subgraph Booking1["Booking Instance"]
        B1_ID["id: booking-001"]
        B1_STATUS["status: PENDING"]
        B1_DATE["scheduledAt: 2024-12-15 10:00"]
        B1_AMOUNT["totalAmount: 500.00"]
        B1_FEE["platformFee: 25.00"]
        B1_EARNINGS["providerEarnings: 475.00"]
    end
    
    subgraph Notification1["Notification Instance"]
        N1_TYPE["type: BOOKING_REQUEST"]
        N1_TITLE["title: New Booking Request"]
    end
    
    Customer1 -->|creates| Booking1
    Provider1 -->|receives| Booking1
    Service1 -->|booked_for| Booking1
    Booking1 -->|generates| Notification1
```

### 3.2 Provider Approval Object Diagram

```mermaid
graph LR
    subgraph Admin1["Administrator Instance"]
        A1_ID["id: admin-001"]
        A1_NAME["name: Admin User"]
        A1_ROLE["role: ADMIN"]
    end
    
    subgraph Provider2["Provider Instance"]
        P2_ID["id: provider-002"]
        P2_NAME["businessName: New Plumbing Service"]
        P2_STATUS["status: PENDING"]
    end
    
    subgraph User2["User Instance"]
        U2_ID["id: user-002"]
        U2_NAME["name: Provider Owner"]
        U2_ROLE["role: PROVIDER"]
    end
    
    subgraph Doc1["ProviderDocument Instance"]
        D1_TYPE["type: aadhar"]
        D1_URL["url: https://s3.../aadhar.pdf"]
    end
    
    subgraph Doc2["ProviderDocument Instance"]
        D2_TYPE["type: trade_license"]
        D2_URL["url: https://s3.../license.pdf"]
    end
    
    subgraph Notification1["Notification Instance"]
        N1_TYPE["type: provider_approved"]
        N1_TITLE["title: Provider Approved"]
    end
    
    Admin1 -->|approves| Provider2
    User2 -->|owns| Provider2
    Provider2 -->|has| Doc1
    Provider2 -->|has| Doc2
    Provider2 -->|generates| Notification1
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
    App1 --> SMTP
    App2 --> SMTP
    App3 --> SMTP
```

---

## 9. Database Schema (ER Diagram)

### 9.1 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Booking : creates
    User ||--o| Provider : has
    User ||--o{ Message : "sends/receives"
    User ||--o{ Review : writes
    User ||--o{ Notification : receives
    User ||--o{ Report : creates
    User ||--o{ RefreshToken : has
    User ||--o{ EmailVerificationToken : has
    User ||--o{ PasswordResetToken : has
    User ||--o{ PhoneOTP : has
    User ||--o{ SavedProvider : saves
    User ||--o{ AuditLog : "performs actions"
    User ||--o{ ProviderAppeal : reviews
    
    Provider ||--o{ Service : offers
    Provider ||--o{ Booking : receives
    Provider ||--o{ Review : receives
    Provider ||--o{ Report : reported_in
    Provider ||--o{ ProviderDocument : has
    Provider ||--o{ Payout : receives
    Provider ||--o{ SavedProvider : saved_by
    Provider ||--o{ ProviderAppeal : appeals
    
    Service ||--o{ Booking : booked_for
    
    Booking ||--o| BookingCancellation : has
    Booking ||--o| Transaction : has
    Booking ||--o| Review : generates
    
    User {
        string id PK
        string name
        string email UK
        string phone UK
        string passwordHash
        string avatarUrl
        enum role
        boolean emailVerified
        boolean phoneVerified
        datetime createdAt
        datetime updatedAt
    }
    
    Provider {
        string id PK
        string userId FK,UK
        string businessName
        string description
        string primaryCategory
        string secondaryCategory
        string address
        string city
        string state
        string pincode
        float lat
        float lng
        float averageRating
        int totalRatings
        enum status
        boolean phoneVisible
        datetime createdAt
        datetime updatedAt
    }
    
    Service {
        string id PK
        string providerId FK
        string title
        string description
        decimal price
        int durationMin
        datetime createdAt
        datetime updatedAt
    }
    
    Booking {
        string id PK
        string userId FK
        string providerId FK
        string serviceId FK
        datetime scheduledAt
        enum status
        decimal totalAmount
        decimal platformFee
        decimal providerEarnings
        string address
        string requirements
        datetime createdAt
        datetime updatedAt
    }
    
    Message {
        string id PK
        string conversationId
        string senderId FK
        string receiverId FK
        string text
        json attachments
        boolean read
        datetime createdAt
    }
    
    Notification {
        string id PK
        string userId FK
        string type
        string title
        string body
        json payload
        boolean read
        datetime createdAt
    }
    
    Review {
        string id PK
        string bookingId FK,UK
        string providerId FK
        string userId FK
        int rating
        string comment
        datetime createdAt
        datetime updatedAt
    }
    
    Report {
        string id PK
        string reporterId FK
        string providerId FK
        string reason
        string details
        json attachments
        enum status
        string adminNotes
        datetime createdAt
        datetime updatedAt
        datetime resolvedAt
    }
    
    Transaction {
        string id PK
        string userId FK
        string bookingId FK,UK
        decimal amount
        string currency
        string gateway
        string gatewayOrderId
        string gatewayPaymentId
        enum status
        json metadata
        datetime createdAt
        datetime updatedAt
    }
    
    BookingCancellation {
        string id PK
        string bookingId FK,UK
        string cancelledBy
        string reason
        datetime createdAt
    }
    
    ProviderDocument {
        string id PK
        string providerId FK
        string type
        string url
        string filename
        datetime uploadedAt
    }
    
    ProviderAppeal {
        string id PK
        string providerId FK
        enum type
        string reason
        string details
        enum status
        string adminNotes
        string reviewedBy FK
        datetime reviewedAt
        datetime createdAt
        datetime updatedAt
    }
    
    RefreshToken {
        string id PK
        string userId FK
        string token UK
        datetime expiresAt
        datetime createdAt
        datetime revokedAt
    }
    
    EmailVerificationToken {
        string id PK
        string userId FK,UK
        string token UK
        datetime expiresAt
        datetime createdAt
    }
    
    PasswordResetToken {
        string id PK
        string userId FK
        string token UK
        datetime expiresAt
        datetime createdAt
        boolean used
    }
    
    PhoneOTP {
        string id PK
        string phone
        string code
        string userId FK
        boolean verified
        datetime expiresAt
        datetime createdAt
    }
    
    AuditLog {
        string id PK
        string userId FK
        string action
        string tableName
        string recordId
        json oldData
        json newData
        string ipAddress
        string userAgent
        datetime createdAt
    }
    
    Payout {
        string id PK
        string providerId FK
        decimal amount
        enum status
        string gatewayRef
        json metadata
        datetime createdAt
        datetime updatedAt
    }
    
    SavedProvider {
        string id PK
        string userId FK
        string providerId FK
        datetime createdAt
    }
```

### 9.2 Database Schema Details

#### Core Models

**User Model**
- Primary Key: `id` (UUID)
- Unique Constraints: `email`, `phone`
- Indexes: `email`, `phone`, `role`
- Relationships:
  - One-to-Many: Bookings, Messages, Reviews, Notifications, Reports
  - One-to-One: Provider (optional)
  - One-to-Many: RefreshTokens, EmailVerificationToken, PasswordResetTokens, PhoneOTPs

**Provider Model**
- Primary Key: `id` (UUID)
- Foreign Key: `userId` (unique, references User)
- Indexes: `city + primaryCategory`, `status`, `userId`, `lat + lng`
- Relationships:
  - Many-to-One: User
  - One-to-Many: Services, Bookings, Reviews, Documents, Payouts, Appeals

**Booking Model**
- Primary Key: `id` (UUID)
- Foreign Keys: `userId`, `providerId`, `serviceId`
- Indexes: `userId + status`, `providerId + scheduledAt`, `status`, `scheduledAt`
- Status Enum: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `REJECTED`
- Relationships:
  - Many-to-One: User, Provider, Service
  - One-to-One: BookingCancellation, Transaction, Review (optional)

**Service Model**
- Primary Key: `id` (UUID)
- Foreign Key: `providerId`
- Index: `providerId`
- Relationships:
  - Many-to-One: Provider
  - One-to-Many: Bookings

**Message Model**
- Primary Key: `id` (UUID)
- Foreign Keys: `senderId`, `receiverId`
- Indexes: `conversationId + createdAt`, `senderId`, `receiverId`, `read`
- Relationships:
  - Many-to-One: User (as sender and receiver)

**Notification Model**
- Primary Key: `id` (UUID)
- Foreign Key: `userId`
- Indexes: `userId + read + createdAt`, `type`
- Relationships:
  - Many-to-One: User

**Review Model**
- Primary Key: `id` (UUID)
- Foreign Keys: `providerId`, `userId`, `bookingId` (unique, optional)
- Indexes: `providerId`, `userId`, `rating`
- Relationships:
  - Many-to-One: Provider, User
  - One-to-One: Booking (optional)

**Report Model**
- Primary Key: `id` (UUID)
- Foreign Keys: `reporterId`, `providerId`
- Status Enum: `OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`
- Indexes: `providerId`, `status`, `reporterId`
- Relationships:
  - Many-to-One: User (reporter), Provider

#### Authentication & Security Models

**RefreshToken Model**
- Primary Key: `id` (UUID)
- Foreign Key: `userId`
- Unique: `token`
- Indexes: `userId`, `token`, `expiresAt`

**EmailVerificationToken Model**
- Primary Key: `id` (UUID)
- Foreign Key: `userId` (unique)
- Unique: `token`
- Indexes: `token`, `expiresAt`

**PasswordResetToken Model**
- Primary Key: `id` (UUID)
- Foreign Key: `userId`
- Unique: `token`
- Indexes: `token`, `expiresAt`, `userId`

**PhoneOTP Model**
- Primary Key: `id` (UUID)
- Foreign Key: `userId` (optional)
- Indexes: `phone`, `code`, `userId`, `expiresAt`

#### Supporting Models

**ProviderDocument Model**
- Primary Key: `id` (UUID)
- Foreign Key: `providerId`
- Index: `providerId`
- Document types: `aadhar`, `trade_license`, `gst`, `shop_photo`, etc.

**BookingCancellation Model**
- Primary Key: `id` (UUID)
- Foreign Key: `bookingId` (unique)
- Stores cancellation reason and who cancelled

**Transaction Model**
- Primary Key: `id` (UUID)
- Foreign Keys: `userId`, `bookingId` (unique, optional)
- Status Enum: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
- Indexes: `userId`, `bookingId`, `status`, `gatewayOrderId`
- Note: Payment integration not yet implemented

**ProviderAppeal Model**
- Primary Key: `id` (UUID)
- Foreign Keys: `providerId`, `reviewedBy` (optional)
- Type Enum: `UNBAN_REQUEST`, `REJECTION_APPEAL`, `SUSPENSION_APPEAL`, `OTHER`
- Status Enum: `PENDING`, `APPROVED`, `REJECTED`, `UNDER_REVIEW`
- Indexes: `providerId`, `status`, `type`

**Payout Model**
- Primary Key: `id` (UUID)
- Foreign Key: `providerId`
- Status Enum: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
- Indexes: `providerId`, `status`

**SavedProvider Model**
- Primary Key: `id` (UUID)
- Foreign Keys: `userId`, `providerId`
- Unique Constraint: `userId + providerId`
- Index: `userId`

**AuditLog Model**
- Primary Key: `id` (UUID)
- Foreign Key: `userId` (optional)
- Indexes: `userId`, `tableName + recordId`, `createdAt`
- Stores all admin actions and changes

### 9.3 Enums

**UserRole**
- `CUSTOMER` - Regular customer user
- `PROVIDER` - Service provider user
- `ADMIN` - Administrator user

**ProviderStatus**
- `PENDING` - Application submitted, awaiting review
- `APPROVED` - Application approved, provider active
- `REJECTED` - Application rejected
- `SUSPENDED` - Provider temporarily suspended

**BookingStatus**
- `PENDING` - Booking request created, awaiting provider response
- `CONFIRMED` - Provider accepted the booking
- `COMPLETED` - Service completed by provider
- `CANCELLED` - Booking cancelled by customer or provider
- `REJECTED` - Booking rejected by provider

**TransactionStatus**
- `PENDING` - Transaction initiated
- `SUCCESS` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

**ReportStatus**
- `OPEN` - Report submitted
- `INVESTIGATING` - Under investigation
- `RESOLVED` - Issue resolved
- `DISMISSED` - Report dismissed

**AppealType**
- `UNBAN_REQUEST` - Request to unban account
- `REJECTION_APPEAL` - Appeal against rejection
- `SUSPENSION_APPEAL` - Appeal against suspension
- `OTHER` - Other appeal types

**AppealStatus**
- `PENDING` - Appeal submitted
- `APPROVED` - Appeal approved
- `REJECTED` - Appeal rejected
- `UNDER_REVIEW` - Under review

**PayoutStatus**
- `PENDING` - Payout requested
- `PROCESSING` - Payout being processed
- `COMPLETED` - Payout completed
- `FAILED` - Payout failed

### 9.4 Key Relationships Summary

1. **User ↔ Provider**: One-to-One (optional) - A user can have one provider profile
2. **User ↔ Booking**: One-to-Many - A user can create multiple bookings
3. **Provider ↔ Service**: One-to-Many - A provider can offer multiple services
4. **Service ↔ Booking**: One-to-Many - A service can be booked multiple times
5. **Booking ↔ Review**: One-to-One (optional) - A booking can have one review
6. **User ↔ Message**: One-to-Many (as sender and receiver) - Users can send/receive messages
7. **Provider ↔ Review**: One-to-Many - A provider can receive multiple reviews
8. **User ↔ Notification**: One-to-Many - A user can receive multiple notifications
9. **Provider ↔ Report**: One-to-Many - A provider can be reported multiple times

---

## 10. Package Diagram

### 10.1 System Package Structure

The Package Diagram shows the organization of the system into logical packages/modules.

```mermaid
graph TB
    subgraph Frontend["Frontend Package"]
        UI[UI Components]
        Pages[Pages]
        API_Client[API Client]
        Hooks[Custom Hooks]
        Context[Context Providers]
        Utils[Utilities]
    end
    
    subgraph Backend["Backend Package"]
        Controllers[Controllers]
        Services[Services]
        Routes[Routes]
        Middleware[Middleware]
        Models[Models/Schemas]
        Utils_Backend[Utilities]
    end
    
    subgraph Database["Database Package"]
        Prisma[Prisma ORM]
        Schema[Schema Definition]
        Migrations[Migrations]
        Seed[Seed Data]
    end
    
    subgraph External["External Services"]
        Socket[Socket.io]
        Email[Email Service]
        S3[S3 Storage]
        Redis[Redis Cache]
    end
    
    Frontend --> Backend
    Backend --> Database
    Backend --> External
    
    UI --> Pages
    Pages --> API_Client
    API_Client --> Hooks
    Hooks --> Context
    
    Controllers --> Services
    Controllers --> Routes
    Routes --> Middleware
    Services --> Models
    Services --> Utils_Backend
    
    Prisma --> Schema
    Prisma --> Migrations
    Prisma --> Seed
```

### 10.2 Package Dependencies

```mermaid
graph LR
    subgraph Frontend_Pkg["frontend/"]
        React[React Components]
        Router[React Router]
        Query[TanStack Query]
        Axios[Axios Client]
    end
    
    subgraph Backend_Pkg["server/"]
        Express[Express Server]
        Prisma_Client[Prisma Client]
        Socket_Server[Socket.io Server]
        JWT[JWT Utils]
    end
    
    subgraph Database_Pkg["database/"]
        PostgreSQL[(PostgreSQL)]
        Redis_Cache[(Redis)]
    end
    
    React --> Router
    Router --> Query
    Query --> Axios
    Axios --> Express
    Express --> Prisma_Client
    Express --> Socket_Server
    Express --> JWT
    Prisma_Client --> PostgreSQL
    Express --> Redis_Cache
```

---

## 11. Communication Diagram

### 11.1 Booking Creation Communication Diagram

Communication diagrams (also called Collaboration diagrams) show object interactions in a different format than sequence diagrams, emphasizing the relationships between objects.

```mermaid
graph TB
    subgraph Customer_Object["customer:Customer"]
        C1[id = user-123]
        C2[name = John Doe]
    end
    
    subgraph Frontend_Object["frontend:ReactApp"]
        F1[BookingModal Component]
        F2[API Client]
    end
    
    subgraph Backend_Object["backend:ExpressServer"]
        B1[BookingController]
        B2[BookingService]
        B3[NotificationService]
    end
    
    subgraph Database_Object["database:PostgreSQL"]
        D1[(Booking Table)]
        D2[(Notification Table)]
    end
    
    subgraph Provider_Object["provider:Provider"]
        P1[id = provider-456]
        P2[businessName = QuickFix]
    end
    
    Customer_Object -->|1: createBooking| Frontend_Object
    Frontend_Object -->|2: POST /api/bookings| Backend_Object
    Backend_Object -->|3: save| Database_Object
    Backend_Object -->|4: createNotification| Database_Object
    Backend_Object -->|5: notify| Provider_Object
    Backend_Object -->|6: response| Frontend_Object
    Frontend_Object -->|7: showConfirmation| Customer_Object
    
    style Customer_Object fill:#E8F5E9
    style Frontend_Object fill:#E3F2FD
    style Backend_Object fill:#FFF3E0
    style Database_Object fill:#F3E5F5
    style Provider_Object fill:#E8F5E9
```

### 11.2 Provider Approval Communication Diagram

```mermaid
graph TB
    subgraph Admin_Object["admin:Admin"]
        A1[id = admin-001]
        A2[name = Admin User]
    end
    
    subgraph Frontend_Object["frontend:AdminPanel"]
        F1[Provider Management UI]
        F2[API Client]
    end
    
    subgraph Backend_Object["backend:ExpressServer"]
        B1[AdminController]
        B2[ProviderService]
        B3[EmailService]
    end
    
    subgraph Database_Object["database:PostgreSQL"]
        D1[(Provider Table)]
        D2[(Notification Table)]
    end
    
    subgraph Provider_Object["provider:Provider"]
        P1[id = provider-789]
        P2[status = PENDING]
    end
    
    Admin_Object -->|1: approveProvider| Frontend_Object
    Frontend_Object -->|2: POST /api/admin/providers/:id/approve| Backend_Object
    Backend_Object -->|3: updateStatus| Database_Object
    Backend_Object -->|4: sendEmail| Provider_Object
    Backend_Object -->|5: createNotification| Database_Object
    Backend_Object -->|6: response| Frontend_Object
    Frontend_Object -->|7: showSuccess| Admin_Object
    
    style Admin_Object fill:#F3E5F5
    style Frontend_Object fill:#E3F2FD
    style Backend_Object fill:#FFF3E0
    style Database_Object fill:#F3E5F5
    style Provider_Object fill:#E8F5E9
```

---

## 12. Collaboration Diagrams

### 12.1 Detailed Collaboration Diagram - Booking Creation Flow

This diagram shows the detailed object interactions during booking creation, emphasizing the relationships and message flow between objects.

```mermaid
graph TB
    subgraph Customer_Layer["Customer Layer"]
        Customer[Customer Object<br/>id: user-123<br/>name: John Doe<br/>email: customer1@example.com]
    end
    
    subgraph Frontend_Layer["Frontend Layer"]
        BookingModal[BookingModal Component<br/>state: formData<br/>selectedService: service-456]
        API_Client[API Client<br/>baseURL: http://localhost:3000/api<br/>headers: Authorization]
        BookingHook[useCreateBooking Hook<br/>mutation: createBooking]
    end
    
    subgraph Backend_Layer["Backend Layer"]
        BookingRoute[Booking Route<br/>POST /api/bookings<br/>middleware: authenticate]
        BookingController[BookingController<br/>method: create<br/>userId: from token]
        BookingService[BookingService<br/>validateProvider<br/>calculateFees]
        NotificationService[NotificationService<br/>createNotification<br/>sendEmail]
    end
    
    subgraph Database_Layer["Database Layer"]
        PrismaClient[Prisma Client<br/>booking.create<br/>provider.findUnique<br/>service.findUnique]
        BookingTable[(Booking Table<br/>id, userId, providerId<br/>status: PENDING)]
        NotificationTable[(Notification Table<br/>userId, type, title)]
        ProviderTable[(Provider Table<br/>id, status: APPROVED)]
    end
    
    subgraph Provider_Layer["Provider Layer"]
        Provider[Provider Object<br/>id: provider-456<br/>businessName: QuickFix<br/>status: APPROVED]
    end
    
    Customer -->|1: clicks Book Now| BookingModal
    BookingModal -->|2: validates form| BookingModal
    BookingModal -->|3: calls mutation| BookingHook
    BookingHook -->|4: POST /api/bookings| API_Client
    API_Client -->|5: sends request with token| BookingRoute
    BookingRoute -->|6: validates auth| BookingController
    BookingController -->|7: extracts userId| BookingController
    BookingController -->|8: validates provider| BookingService
    BookingService -->|9: queries provider| PrismaClient
    PrismaClient -->|10: SELECT * FROM Provider| ProviderTable
    ProviderTable -->|11: returns provider| PrismaClient
    PrismaClient -->|12: returns provider| BookingService
    BookingService -->|13: calculates fees| BookingService
    BookingController -->|14: creates booking| PrismaClient
    PrismaClient -->|15: INSERT INTO Booking| BookingTable
    BookingTable -->|16: returns booking| PrismaClient
    PrismaClient -->|17: returns booking| BookingController
    BookingController -->|18: creates notification| NotificationService
    NotificationService -->|19: creates notification| PrismaClient
    PrismaClient -->|20: INSERT INTO Notification| NotificationTable
    NotificationTable -->|21: returns notification| PrismaClient
    PrismaClient -->|22: returns notification| NotificationService
    NotificationService -->|23: sends email| Provider
    BookingController -->|24: returns response| BookingRoute
    BookingRoute -->|25: returns JSON| API_Client
    API_Client -->|26: returns data| BookingHook
    BookingHook -->|27: updates cache| BookingHook
    BookingHook -->|28: shows success| BookingModal
    BookingModal -->|29: closes modal| Customer
    
    style Customer_Layer fill:#E8F5E9
    style Frontend_Layer fill:#E3F2FD
    style Backend_Layer fill:#FFF3E0
    style Database_Layer fill:#F3E5F5
    style Provider_Layer fill:#E8F5E9
```

### 12.2 Simple Collaboration Diagram - User Authentication Flow

A simplified view of the authentication process showing key object interactions.

```mermaid
graph LR
    User[User] -->|1: enters credentials| LoginForm[Login Form]
    LoginForm -->|2: validates input| LoginForm
    LoginForm -->|3: POST /api/auth/login| AuthAPI[Auth API Client]
    AuthAPI -->|4: sends request| AuthRoute[Auth Route]
    AuthRoute -->|5: validates schema| AuthController[Auth Controller]
    AuthController -->|6: finds user| Prisma[Prisma Client]
    Prisma -->|7: SELECT FROM User| Database[(User Table)]
    Database -->|8: returns user| Prisma
    Prisma -->|9: returns user| AuthController
    AuthController -->|10: verifies password| AuthController
    AuthController -->|11: generates tokens| JWTUtils[JWT Utils]
    JWTUtils -->|12: returns tokens| AuthController
    AuthController -->|13: saves refresh token| Prisma
    Prisma -->|14: INSERT INTO RefreshToken| Database
    AuthController -->|15: returns response| AuthRoute
    AuthRoute -->|16: returns JSON| AuthAPI
    AuthAPI -->|17: stores tokens| LocalStorage[Local Storage]
    AuthAPI -->|18: returns user data| LoginForm
    LoginForm -->|19: updates context| UserContext[User Context]
    UserContext -->|20: redirects to dashboard| User
    
    style User fill:#E8F5E9
    style LoginForm fill:#E3F2FD
    style AuthAPI fill:#E3F2FD
    style AuthRoute fill:#FFF3E0
    style AuthController fill:#FFF3E0
    style Prisma fill:#F3E5F5
    style Database fill:#F3E5F5
    style JWTUtils fill:#FFF3E0
    style LocalStorage fill:#E3F2FD
    style UserContext fill:#E3F2FD
```

### 12.3 Detailed Collaboration Diagram - Provider Approval Flow

Shows the complete interaction flow when an admin approves a provider.

```mermaid
graph TB
    subgraph Admin_Layer["Admin Layer"]
        Admin[Admin User<br/>id: admin-001<br/>role: ADMIN]
    end
    
    subgraph Frontend_Layer["Frontend Layer"]
        AdminPanel[Admin Panel<br/>component: ProviderManagement]
        ProviderCard[Provider Card<br/>status: PENDING<br/>actions: Approve/Reject]
        API_Client[API Client<br/>method: POST<br/>endpoint: /api/admin/providers/:id/approve]
    end
    
    subgraph Backend_Layer["Backend Layer"]
        AdminRoute[Admin Route<br/>POST /api/admin/providers/:id/approve<br/>middleware: requireRole ADMIN]
        AdminController[Admin Controller<br/>method: approveProvider<br/>providerId: from params]
        ProviderService[Provider Service<br/>updateStatus<br/>sendNotification]
        EmailService[Email Service<br/>sendApprovalEmail<br/>template: provider-approved]
    end
    
    subgraph Database_Layer["Database Layer"]
        PrismaClient[Prisma Client<br/>provider.update<br/>notification.create]
        ProviderTable[(Provider Table<br/>id, status: PENDING → APPROVED<br/>updatedAt: now)]
        NotificationTable[(Notification Table<br/>userId, type: PROVIDER_APPROVED<br/>read: false)]
        UserTable[(User Table<br/>id, email, name)]
    end
    
    subgraph Provider_Layer["Provider Layer"]
        Provider[Provider Object<br/>id: provider-789<br/>businessName: TechFix<br/>status: PENDING → APPROVED]
        ProviderUser[Provider User<br/>id: user-456<br/>email: provider1@example.com]
    end
    
    Admin -->|1: clicks Approve| ProviderCard
    ProviderCard -->|2: confirms action| AdminPanel
    AdminPanel -->|3: calls API| API_Client
    API_Client -->|4: POST request| AdminRoute
    AdminRoute -->|5: validates admin| AdminController
    AdminController -->|6: gets provider| PrismaClient
    PrismaClient -->|7: SELECT FROM Provider| ProviderTable
    ProviderTable -->|8: returns provider| PrismaClient
    PrismaClient -->|9: returns provider| AdminController
    AdminController -->|10: updates status| ProviderService
    ProviderService -->|11: updates provider| PrismaClient
    PrismaClient -->|12: UPDATE Provider SET status| ProviderTable
    ProviderTable -->|13: returns updated| PrismaClient
    PrismaClient -->|14: returns updated| ProviderService
    ProviderService -->|15: creates notification| PrismaClient
    PrismaClient -->|16: INSERT INTO Notification| NotificationTable
    NotificationTable -->|17: returns notification| PrismaClient
    ProviderService -->|18: sends email| EmailService
    EmailService -->|19: gets user email| PrismaClient
    PrismaClient -->|20: SELECT FROM User| UserTable
    UserTable -->|21: returns user| PrismaClient
    EmailService -->|22: sends email| ProviderUser
    AdminController -->|23: returns success| AdminRoute
    AdminRoute -->|24: returns JSON| API_Client
    API_Client -->|25: updates UI| AdminPanel
    AdminPanel -->|26: shows success| Admin
    AdminPanel -->|27: refreshes list| AdminPanel
    
    style Admin_Layer fill:#F3E5F5
    style Frontend_Layer fill:#E3F2FD
    style Backend_Layer fill:#FFF3E0
    style Database_Layer fill:#F3E5F5
    style Provider_Layer fill:#E8F5E9
```

### 12.4 Simple Collaboration Diagram - Message Sending Flow

A simplified collaboration diagram showing how messages are sent between users.

```mermaid
graph LR
    Sender[User A] -->|1: types message| MessageInput[Message Input]
    MessageInput -->|2: validates| MessageInput
    MessageInput -->|3: POST /api/messages| MessageAPI[Message API]
    MessageAPI -->|4: sends request| MessageRoute[Message Route]
    MessageRoute -->|5: authenticates| MessageController[Message Controller]
    MessageController -->|6: creates message| Prisma[Prisma Client]
    Prisma -->|7: INSERT INTO Message| Database[(Message Table)]
    Database -->|8: returns message| Prisma
    Prisma -->|9: returns message| MessageController
    MessageController -->|10: emits socket event| SocketIO[Socket.io Server]
    SocketIO -->|11: broadcasts to receiver| Receiver[User B]
    MessageController -->|12: returns response| MessageRoute
    MessageRoute -->|13: returns JSON| MessageAPI
    MessageAPI -->|14: updates UI| MessageList[Message List]
    MessageList -->|15: shows message| Sender
    MessageList -->|16: shows message| Receiver
    
    style Sender fill:#E8F5E9
    style MessageInput fill:#E3F2FD
    style MessageAPI fill:#E3F2FD
    style MessageRoute fill:#FFF3E0
    style MessageController fill:#FFF3E0
    style Prisma fill:#F3E5F5
    style Database fill:#F3E5F5
    style SocketIO fill:#FFF3E0
    style Receiver fill:#E8F5E9
    style MessageList fill:#E3F2FD
```

---

## 13. Simplified Diagrams for Academic Reports

This section contains simplified versions of all UML diagrams suitable for Software Engineering practicals and mini project reports. These diagrams focus on essential functionality while maintaining accuracy to the main project.

---

### 10.1 Simplified Use Case Diagram

```mermaid
graph TB
    classDef actorStyle fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff,font-weight:bold
    classDef customerUC fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px
    classDef providerUC fill:#FFF3E0,stroke:#FF9800,stroke-width:2px
    classDef adminUC fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px
    
    Customer((Customer))
    Provider((Service Provider))
    Admin((Administrator))
    
    UC1[Register & Login]
    UC2[Search Services]
    UC3[Create Booking]
    UC4[View Bookings]
    UC5[Send Messages]
    UC6[Submit Review]
    
    UC7[Register Provider]
    UC8[Manage Services]
    UC9[Accept/Reject Booking]
    UC10[View Bookings]
    
    UC11[Approve Provider]
    UC12[Manage Users]
    UC13[View Reports]
    
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    
    Provider --> UC7
    Provider --> UC8
    Provider --> UC9
    Provider --> UC10
    
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    
    class Customer,Provider,Admin actorStyle
    class UC1,UC2,UC3,UC4,UC5,UC6 customerUC
    class UC7,UC8,UC9,UC10 providerUC
    class UC11,UC12,UC13 adminUC
```

---

### 10.2 Simplified Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String phone
        +UserRole role
        +register()
        +login()
        +updateProfile()
    }
    
    class Provider {
        +String id
        +String businessName
        +String category
        +String city
        +Float rating
        +createProfile()
        +updateProfile()
    }
    
    class Service {
        +String id
        +String title
        +String description
        +Decimal price
        +create()
        +update()
    }
    
    class Booking {
        +String id
        +DateTime scheduledAt
        +BookingStatus status
        +Decimal totalAmount
        +create()
        +accept()
        +reject()
        +cancel()
    }
    
    class Message {
        +String id
        +String text
        +send()
        +markAsRead()
    }
    
    class Review {
        +String id
        +Int rating
        +String comment
        +submit()
        +update()
    }
    
    User "1" --> "*" Booking : creates
    User "1" --> "*" Message : sends
    User "1" --> "*" Review : writes
    User "1" --> "0..1" Provider : has
    
    Provider "1" --> "*" Service : offers
    Provider "1" --> "*" Booking : receives
    
    Service "1" --> "*" Booking : booked_for
    Booking "1" --> "0..1" Review : generates
```

---

### 10.3 Simplified Object Diagram

```mermaid
graph LR
    subgraph Customer1["customer1:Customer"]
        C1_ID["id = user-123"]
        C1_NAME["name = John Doe"]
        C1_EMAIL["email = john@example.com"]
    end
    
    subgraph Provider1["provider1:Provider"]
        P1_ID["id = provider-456"]
        P1_NAME["businessName = QuickFix Plumbing"]
        P1_STATUS["status = APPROVED"]
    end
    
    subgraph Service1["service1:Service"]
        S1_ID["id = service-789"]
        S1_TITLE["title = Pipe Repair"]
        S1_PRICE["price = 500.00"]
    end
    
    subgraph Booking1["booking1:Booking"]
        B1_ID["id = booking-001"]
        B1_STATUS["status = PENDING"]
        B1_AMOUNT["totalAmount = 500.00"]
    end
    
    Customer1 -->|creates| Booking1
    Provider1 -->|receives| Booking1
    Service1 -->|booked_for| Booking1
```

---

### 10.4 Simplified Sequence Diagram - Booking Process

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant P as Provider
    
    C->>F: Select service & book
    F->>B: Create booking request
    B->>DB: Save booking (PENDING)
    DB-->>B: Booking saved
    B->>P: Notify provider
    B-->>F: Booking created
    F-->>C: Confirmation shown
    
    P->>F: View booking request
    P->>F: Accept booking
    F->>B: Update booking status
    B->>DB: Update to CONFIRMED
    DB-->>B: Updated
    B->>C: Notify customer
    B-->>F: Booking confirmed
    F-->>P: Confirmation shown
```

---

### 10.5 Simplified Activity Diagram - Booking Flow

```mermaid
flowchart TD
    Start([●]) --> Search[Search Services]
    Search --> Select[Select Service]
    Select --> Fill[Fill Booking Details]
    Fill --> Submit[Submit Booking Request]
    Submit --> Pending{Provider Decision?}
    Pending -->|Accept| Notify1[Notify Provider]
    Pending -->|Reject| Notify2[Notify Customer]
    Notify1 --> Update1[Update Status: CONFIRMED]
    Notify2 --> Update2[Update Status: REJECTED]
    Update1 --> Complete([●])
    Update2 --> End([●])
    
    style Start fill:#000,stroke:#000,color:#fff
    style Complete fill:#000,stroke:#000,stroke-width:3px,color:#fff
    style End fill:#000,stroke:#000,stroke-width:3px,color:#fff
```

---

### 10.6 Simplified State Diagram - Booking States

```mermaid
stateDiagram-v2
    [*] --> PENDING: create()
    PENDING --> CONFIRMED: accept()
    PENDING --> REJECTED: reject()
    CONFIRMED --> COMPLETED: complete()
    CONFIRMED --> CANCELLED: cancel()
    REJECTED --> [*]
    COMPLETED --> [*]
    CANCELLED --> [*]
    
    note right of PENDING
        Initial state when
        customer creates booking
    end note
    
    note right of CONFIRMED
        Provider has accepted
        the booking request
    end note
```

---

### 10.7 Simplified Component Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend (React)"]
        UI[User Interface]
        Pages[Pages]
        Components[Components]
    end
    
    subgraph Backend["Backend (Node.js)"]
        API[API Routes]
        Controllers[Controllers]
        Services[Services]
    end
    
    subgraph Database["Database"]
        DB[(PostgreSQL)]
    end
    
    subgraph External["External Services"]
        Email[Email Service]
        Socket[Socket.io]
    end
    
    UI --> Pages
    Pages --> Components
    Components --> API
    API --> Controllers
    Controllers --> Services
    Services --> DB
    Services --> Email
    Services --> Socket
```

---

### 10.8 Simplified Deployment Diagram

```mermaid
graph TB
    subgraph Client["Client Side"]
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph Server["Server Side"]
        WebServer[Web Server<br/>Node.js + Express]
        AppServer[Application Server]
    end
    
    subgraph Database["Data Layer"]
        PostgreSQL[(PostgreSQL<br/>Database)]
    end
    
    subgraph External["External Services"]
        EmailService[Email Service<br/>SMTP]
    end
    
    Browser --> WebServer
    Mobile --> WebServer
    WebServer --> AppServer
    AppServer --> PostgreSQL
    AppServer --> EmailService
```

---

### 10.9 Simplified ER Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    USER ||--o| PROVIDER : has
    USER ||--o{ MESSAGE : sends
    USER ||--o{ REVIEW : writes
    
    PROVIDER ||--o{ SERVICE : offers
    PROVIDER ||--o{ BOOKING : receives
    PROVIDER ||--o{ REVIEW : receives
    
    SERVICE ||--o{ BOOKING : booked_for
    
    BOOKING ||--o| REVIEW : generates
```

### 10.10 Simplified Collaboration Diagram - Booking Flow

A simplified collaboration diagram showing the key object interactions during the booking creation process, suitable for academic reports.

```mermaid
graph LR
    Customer[Customer] -->|1: Book Service| BookingUI[Booking UI]
    BookingUI -->|2: Validate Form| BookingUI
    BookingUI -->|3: POST /api/bookings| API[API Client]
    API -->|4: Send Request| Backend[Backend Server]
    Backend -->|5: Authenticate| Auth[Auth Middleware]
    Auth -->|6: Validate Token| Auth
    Backend -->|7: Create Booking| Controller[Booking Controller]
    Controller -->|8: Validate Provider| Service[Booking Service]
    Service -->|9: Query Database| Database[(Database)]
    Database -->|10: Return Provider| Service
    Service -->|11: Calculate Fees| Service
    Controller -->|12: Save Booking| Database
    Database -->|13: Return Booking| Controller
    Controller -->|14: Create Notification| Notification[Notification Service]
    Notification -->|15: Save Notification| Database
    Controller -->|16: Return Response| Backend
    Backend -->|17: Return JSON| API
    API -->|18: Update UI| BookingUI
    BookingUI -->|19: Show Success| Customer
    
    style Customer fill:#E8F5E9
    style BookingUI fill:#E3F2FD
    style API fill:#E3F2FD
    style Backend fill:#FFF3E0
    style Auth fill:#FFF3E0
    style Controller fill:#FFF3E0
    style Service fill:#FFF3E0
    style Database fill:#F3E5F5
    style Notification fill:#FFF3E0
```

---

---

## UML Diagrams Summary

This document contains the following UML diagrams:

| Diagram Type | Section | Status |
|--------------|---------|--------|
| Use Case Diagram | Section 1 | ✅ Complete |
| Class Diagram | Section 2 | ✅ Complete |
| Object Diagram | Section 3 | ✅ Complete |
| Sequence Diagrams | Section 4 | ✅ Complete (6 diagrams) |
| Activity Diagrams | Section 5 | ✅ Complete (2 diagrams) |
| State Diagram | Section 6 | ✅ Complete (2 diagrams) |
| Component Diagram | Section 7 | ✅ Complete |
| Deployment Diagram | Section 8 | ✅ Complete |
| ER Diagram | Section 9 | ✅ Complete |
| Package Diagram | Section 10 | ✅ Complete |
| Communication Diagram | Section 11 | ✅ Complete (2 diagrams) |
| Collaboration Diagrams | Section 12 | ✅ Complete (4 diagrams) |
| Simplified Diagrams | Section 13 | ✅ Complete (10 diagrams) |

**Total Diagrams**: 35+ diagrams covering all aspects of the system.

---

**Document Status**: Complete  
**Last Updated**: September 19, 2025  
**Version**: 2.0


