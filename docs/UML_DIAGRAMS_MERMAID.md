# MH26 Services - UML Diagrams (Mermaid)

This document contains 7 UML diagrams for the MH26 Services platform in Mermaid syntax.
Copy these into StarUML or any Mermaid-compatible tool to render them.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    USER ||--o| PROVIDER : "can be"
    USER ||--o{ REVIEW : writes
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ MESSAGE : sends
    USER ||--o{ REFRESH_TOKEN : has
    
    PROVIDER ||--o{ SERVICE : offers
    PROVIDER ||--o{ BOOKING : receives
    PROVIDER }|--|| CATEGORY : "belongs to"
    
    SERVICE }|--|| CATEGORY : "belongs to"
    SERVICE ||--o{ BOOKING : "booked for"
    
    BOOKING ||--o| REVIEW : has
    BOOKING ||--o{ MESSAGE : contains
    
    USER {
        string id PK
        string name
        string email UK
        string phone
        string passwordHash
        enum role
        boolean emailVerified
        decimal walletBalance
        boolean isBanned
        datetime createdAt
    }
    
    PROVIDER {
        string id PK
        string userId FK
        string businessName
        string categoryId FK
        text description
        string address
        enum status
        int yearsExperience
        int serviceRadius
    }
    
    CATEGORY {
        string id PK
        string name UK
        string slug UK
        text description
        string imageUrl
        boolean isActive
    }
    
    SERVICE {
        string id PK
        string providerId FK
        string categoryId FK
        string name
        decimal basePrice
        string priceUnit
        string estimatedDuration
        boolean isActive
    }
    
    BOOKING {
        string id PK
        string customerId FK
        string providerId FK
        string serviceId FK
        enum status
        datetime dateTime
        string address
        decimal totalPrice
        string completionOtp
        datetime completedAt
    }
    
    REVIEW {
        string id PK
        string bookingId FK
        string customerId FK
        string providerId FK
        int rating
        text comment
        datetime createdAt
    }
    
    NOTIFICATION {
        string id PK
        string userId FK
        string title
        string message
        enum type
        boolean read
        datetime createdAt
    }
    
    MESSAGE {
        string id PK
        string bookingId FK
        string senderId FK
        text content
        datetime createdAt
    }
```

---

## 2. Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String phone
        +String passwordHash
        +Role role
        +Boolean emailVerified
        +Decimal walletBalance
        +Boolean isBanned
        +DateTime createdAt
        +login()
        +register()
        +updateProfile()
    }
    
    class Provider {
        +String id
        +String userId
        +String businessName
        +String categoryId
        +String description
        +String address
        +ProviderStatus status
        +Int yearsExperience
        +Int serviceRadius
        +createService()
        +updateService()
        +acceptBooking()
        +rejectBooking()
    }
    
    class Category {
        +String id
        +String name
        +String slug
        +String description
        +String imageUrl
        +Boolean isActive
        +getServices()
        +getProviders()
    }
    
    class Service {
        +String id
        +String providerId
        +String categoryId
        +String name
        +Decimal basePrice
        +String priceUnit
        +String estimatedDuration
        +Boolean isActive
        +updatePrice()
        +toggleActive()
    }
    
    class Booking {
        +String id
        +String customerId
        +String providerId
        +String serviceId
        +BookingStatus status
        +DateTime dateTime
        +String address
        +Decimal totalPrice
        +String completionOtp
        +confirm()
        +cancel()
        +complete()
        +generateOtp()
    }
    
    class Review {
        +String id
        +String bookingId
        +String customerId
        +String providerId
        +Int rating
        +String comment
        +create()
        +update()
    }
    
    class Notification {
        +String id
        +String userId
        +String title
        +String message
        +NotificationType type
        +Boolean read
        +markAsRead()
        +send()
    }
    
    User "1" --> "0..1" Provider : can be
    User "1" --> "*" Booking : creates
    User "1" --> "*" Review : writes
    User "1" --> "*" Notification : receives
    
    Provider "1" --> "*" Service : offers
    Provider "1" --> "*" Booking : receives
    Provider "*" --> "1" Category : belongs to
    
    Service "*" --> "1" Category : belongs to
    Service "1" --> "*" Booking : booked for
    
    Booking "1" --> "0..1" Review : has
```

---

## 3. Sequence Diagram - Booking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend
    participant API
    participant Database
    participant Provider
    
    Customer->>Frontend: Browse Services
    Frontend->>API: GET /api/services
    API->>Database: Query services
    Database-->>API: Return services
    API-->>Frontend: Services list
    Frontend-->>Customer: Display services
    
    Customer->>Frontend: Select service & book
    Frontend->>API: POST /api/bookings
    API->>Database: Create booking
    API->>Database: Create notification for provider
    Database-->>API: Booking created
    API-->>Frontend: Booking confirmed
    Frontend-->>Customer: Show confirmation
    
    Note over Provider: Receives notification
    
    Provider->>API: PATCH /api/bookings/:id/confirm
    API->>Database: Update booking status
    API->>Database: Create notification for customer
    Database-->>API: Status updated
    
    Note over Customer: Service completed
    
    Provider->>API: POST /api/bookings/:id/generate-otp
    API->>Database: Store OTP
    API-->>Provider: OTP generated
    
    Customer->>Frontend: Enter OTP
    Frontend->>API: POST /api/bookings/:id/complete
    API->>Database: Verify OTP & complete booking
    Database-->>API: Booking completed
    API-->>Frontend: Success
    Frontend-->>Customer: Show review prompt
```

---

## 4. Use Case Diagram

```mermaid
flowchart TB
    subgraph Actors
        Customer((Customer))
        Provider((Provider))
        Admin((Admin))
    end
    
    subgraph "Customer Use Cases"
        UC1[Register/Login]
        UC2[Browse Services]
        UC3[Search Services]
        UC4[Book Service]
        UC5[Track Booking]
        UC6[Message Provider]
        UC7[Complete Booking with OTP]
        UC8[Leave Review]
        UC9[View Invoices]
    end
    
    subgraph "Provider Use Cases"
        UC10[Register as Provider]
        UC11[Manage Services]
        UC12[Accept/Reject Booking]
        UC13[Generate Completion OTP]
        UC14[View Earnings]
        UC15[Respond to Reviews]
    end
    
    subgraph "Admin Use Cases"
        UC16[Manage Users]
        UC17[Approve Providers]
        UC18[Manage Categories]
        UC19[View Analytics]
        UC20[Ban/Unban Users]
        UC21[Handle Appeals]
    end
    
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    
    Provider --> UC10
    Provider --> UC11
    Provider --> UC12
    Provider --> UC13
    Provider --> UC14
    Provider --> UC15
    
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
```

---

## 5. State Diagram - Booking Status

```mermaid
stateDiagram-v2
    [*] --> PENDING: Customer creates booking
    
    PENDING --> CONFIRMED: Provider accepts
    PENDING --> CANCELLED: Customer/Provider cancels
    
    CONFIRMED --> IN_PROGRESS: Service starts
    CONFIRMED --> CANCELLED: Customer/Provider cancels
    
    IN_PROGRESS --> COMPLETED: OTP verified
    IN_PROGRESS --> CANCELLED: Issue occurs
    
    COMPLETED --> REVIEWED: Customer leaves review
    COMPLETED --> [*]: No review
    
    REVIEWED --> [*]
    CANCELLED --> [*]
    
    note right of PENDING
        Waiting for provider
        to accept or reject
    end note
    
    note right of IN_PROGRESS
        Provider generates OTP
        Customer enters to complete
    end note
    
    note right of COMPLETED
        Payment processed
        Invoice generated
    end note
```

---

## 6. Activity Diagram - User Registration

```mermaid
flowchart TD
    A([Start]) --> B[Open Registration Page]
    B --> C[Enter Name, Email, Phone, Password]
    C --> D{Validate Input}
    D -->|Invalid| E[Show Error Messages]
    E --> C
    D -->|Valid| F[Submit Registration]
    F --> G[Generate OTP]
    G --> H[Send OTP to Email]
    H --> I[Show OTP Input Screen]
    I --> J[User Enters OTP]
    J --> K{Verify OTP}
    K -->|Invalid| L[Show Error]
    L --> M{Retry?}
    M -->|Yes| I
    M -->|No| N([End - Registration Failed])
    K -->|Valid| O[Create User Account]
    O --> P[Generate Auth Tokens]
    P --> Q[Login User Automatically]
    Q --> R[Redirect to Dashboard]
    R --> S([End - Registration Success])
```

---

## 7. Component Diagram

```mermaid
flowchart TB
    subgraph "Frontend (React + Vite)"
        UI[UI Components]
        Context[User Context]
        API_Client[Axios API Client]
        Router[React Router]
    end
    
    subgraph "Backend (Express.js)"
        Controllers[Controllers]
        Middleware[Middleware]
        Routes[API Routes]
        Services[Business Logic]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL DB)]
        Redis[(Redis Cache)]
    end
    
    subgraph "External Services"
        SMTP[SMTP Email]
        Cloudinary[Cloudinary CDN]
    end
    
    UI --> Context
    UI --> Router
    Context --> API_Client
    
    API_Client -->|HTTP/HTTPS| Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> PostgreSQL
    
    Services --> Redis
    Services --> SMTP
    Services --> Cloudinary
```

---

## How to Use in StarUML

1. **Copy** the Mermaid code block (without the ``` markers)
2. **Open StarUML** and create a new project
3. Go to **Tools → Extensions → Install Mermaid Import** (if available)
4. **Or** use [Mermaid Live Editor](https://mermaid.live/) to export as PNG/SVG
5. **Import** the image into StarUML as a reference diagram

Alternatively, you can manually recreate these diagrams in StarUML using the structure shown in the Mermaid syntax as a guide.
