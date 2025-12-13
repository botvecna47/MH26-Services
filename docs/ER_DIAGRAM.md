# MH26 Services - Simple ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    USER ||--o| PROVIDER : "can be"
    PROVIDER ||--o{ SERVICE : offers
    PROVIDER }|--|| CATEGORY : "belongs to"
    BOOKING }|--|| SERVICE : "for"
    BOOKING ||--o| REVIEW : has

    USER {
        string id PK
        string name
        string email UK
        string phone
        enum role
    }

    PROVIDER {
        string id PK
        string userId FK
        string businessName
        string categoryId FK
        enum status
    }

    CATEGORY {
        string id PK
        string name UK
        string slug UK
        string description
        boolean isActive
    }

    SERVICE {
        string id PK
        string providerId FK
        string name
        decimal basePrice
        boolean isActive
    }

    BOOKING {
        string id PK
        string customerId FK
        string serviceId FK
        enum status
        datetime dateTime
    }

    REVIEW {
        string id PK
        string bookingId FK
        int rating
        text comment
        datetime createdAt
    }
```

## Cardinalities Explained

| Relationship | Cardinality | Meaning |
|--------------|-------------|---------|
| USER → BOOKING | 1:N | One user can create many bookings |
| USER → PROVIDER | 1:0..1 | One user can optionally be one provider |
| PROVIDER → SERVICE | 1:N | One provider can offer many services |
| PROVIDER → CATEGORY | N:1 | Many providers belong to one category |
| BOOKING → SERVICE | N:1 | Many bookings are for one service |
| BOOKING → REVIEW | 1:0..1 | One booking can optionally have one review |
