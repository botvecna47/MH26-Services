# System Unified Modeling Language (UML) Diagrams

## 1. Entity Relationship Diagram (ERD)
Represents the database schema and relationships between Users, Providers, Services, and Bookings.

```mermaid
erDiagram
    User ||--o{ Provider : "has profile"
    User ||--o{ Booking : "makes"
    User ||--o{ Review : "writes"
    User {
        string id PK
        string email
        string password_hash
        string role
        boolean is_verified
    }

    Provider ||--o{ Service : "offers"
    Provider ||--o{ Booking : "receives"
    Provider {
        string id PK
        string user_id FK
        string business_name
        string category
        json documents
        string status
    }

    Service ||--o{ Booking : "included in"
    Service {
        string id PK
        string provider_id FK
        string name
        decimal price
        int duration_min
    }

    Booking {
        string id PK
        string user_id FK
        string provider_id FK
        string service_id FK
        datetime scheduled_at
        string status
        decimal total_amount
    }
```

## 2. Sequence Diagram: Booking Flow
Illustrates the interaction between the User, Frontend, Backend, and Database during a service booking.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (UI)
    participant API as API Gateway
    participant DB as Database
    participant S as Socket.io

    U->>FE: Click "Book Service"
    FE->>U: Show Booking Modal
    U->>FE: Select Date & Enter Address
    U->>FE: Click "Confirm Booking"
    FE->>API: POST /api/bookings
    activate API
    API->>API: Validate Input & auth
    API->>DB: INSERT Booking (Status: PENDING)
    activate DB
    DB-->>API: Returning Booking ID
    deactivate DB
    API->>S: Emit "new_booking" event
    S-->>FE: Notify User (Toast)
    S-->>FE: Notify Provider (Dashboard Update)
    API-->>FE: 201 Created
    deactivate API
    FE->>U: Show Success Message
```

## 3. Component Diagram
High-level architectural view of the system components.

```mermaid
graph TD
    subgraph Client Layer
        Web[Web Browser]
        Mobile[Mobile View]
    end

    subgraph "API Layer (Express)"
        Auth[Auth Service]
        Book[Booking Controller]
        Prov[Provider Controller]
        Admin[Admin Controller]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    Web -->|HTTP/REST| Auth
    Web -->|HTTP/REST| Book
    Web -->|Socket.io| Book
    
    Auth --> Prisma
    Book --> Prisma
    Prov --> Prisma
    
    Prisma --> PG
    Auth -.-> Redis
```

## 4. State Diagram: Booking Lifecycle
Tracks the possible states of a booking from creation to completion.

```mermaid
stateDiagram-v2
    [*] --> PENDING: User Creates Booking
    PENDING --> CONFIRMED: Provider Accepts
    PENDING --> REJECTED: Provider Declines
    PENDING --> CANCELLED: User Cancels
    
    CONFIRMED --> IN_PROGRESS: Provider Starts Job
    CONFIRMED --> CANCELLED: User/Provider Cancels
    
    IN_PROGRESS --> COMPLETED: Provider Finishes
    
    COMPLETED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```
