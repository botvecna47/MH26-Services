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

**Document Status**: Complete  
**Last Updated**: January 2025  
**Version**: 1.1


