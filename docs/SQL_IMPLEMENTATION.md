# SQL Implementation & Database Logic

This document details the database architecture of **MH26 Services**, explaining the underlying SQL queries and clauses that power the application. While the application uses **Prisma ORM** to interact with **PostgreSQL**, every Prisma operation translates to optimized SQL queries. This guide demonstrates how these operations work using standard SQL syntax.

---

## 🏗️ 1. Database Schema (DDL)

The core entities are **Users**, **Providers**, **Services**, and **Bookings**. Here is how they are likely defined in SQL:

### Users Table
Stores authentication and profile details.
```sql
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "phone" VARCHAR(20) UNIQUE,
    "role" "UserRole" DEFAULT 'CUSTOMER', -- Enum: CUSTOMER, PROVIDER, ADMIN
    "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### Providers Table
Extends the User entity for service providers.
```sql
CREATE TABLE "Provider" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "businessName" VARCHAR(255) NOT NULL,
    "primaryCategory" VARCHAR(100) NOT NULL,
    "status" "ProviderStatus" DEFAULT 'PENDING',
    "averageRating" FLOAT DEFAULT 0,
    "city" VARCHAR(100) NOT NULL
);
```

### Bookings Table
Connects Users and Providers for a Service.
```sql
CREATE TABLE "Booking" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "User"("id"),
    "providerId" UUID REFERENCES "Provider"("id"),
    "serviceId" UUID REFERENCES "Service"("id"),
    "status" "BookingStatus" DEFAULT 'PENDING',
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    "scheduledAt" TIMESTAMP NOT NULL
);
```

---

## 🔍 2. SQL Queries & Clauses in Action

Here is how specific features of the MH26 Services platform are implemented using SQL logic.

### A. Dashboard Analytics (Aggregations)
**Feature:** The Admin Dashboard shows total revenue, total users, and completed bookings.

**SQL Logic:**
1.  **Count Total Users**
    ```sql
    SELECT COUNT(*) FROM "User";
    ```
2.  **Count Approved Providers** (Using `WHERE` clause)
    ```sql
    SELECT COUNT(*) FROM "Provider" WHERE "status" = 'APPROVED';
    ```
3.  **Calculate Total Revenue** (Using `SUM` aggregate function)
    ```sql
    SELECT SUM("amount") FROM "Transaction" WHERE "status" = 'SUCCESS';
    ```

### B. Finding Service Providers (Filtering & Sorting)
**Feature:** A user searches for "Plumbers" in "Nanded" and sorts by highest rating.

**SQL Logic:**
```sql
SELECT * 
FROM "Provider" 
WHERE "primaryCategory" = 'Plumber' 
  AND "city" = 'Nanded' 
  AND "status" = 'APPROVED'
ORDER BY "averageRating" DESC;
```
*   **`WHERE`**: Filters the results to only show Plumbers in Nanded who are approved.
*   **`ORDER BY`**: Sorts the results so the highest-rated providers appear first (`DESC`).

### C. Booking Details (JOINS)
**Feature:** When viewing a booking, we need to show the Customer's name and the Service details, not just IDs.

**SQL Logic:**
```sql
SELECT 
    b."id", 
    b."scheduledAt", 
    b."status",
    u."name" AS "CustomerName",
    s."title" AS "ServiceTitle",
    p."businessName" AS "ProviderName"
FROM "Booking" b
INNER JOIN "User" u ON b."userId" = u."id"
INNER JOIN "Service" s ON b."serviceId" = s."id"
INNER JOIN "Provider" p ON b."providerId" = p."id"
WHERE b."id" = 'uuid-of-booking';
```
*   **`INNER JOIN`**: Connects the `Booking` table with `User`, `Service`, and `Provider` tables using their foreign keys (`userId`, `serviceId`, `providerId`) to retrieve human-readable names instead of just IDs.

### D. Pagination (LIMIT & OFFSET)
**Feature:** The Admin Panel shows filtered providers in pages of 50 to avoid loading too much data.

**SQL Logic:**
```sql
SELECT * 
FROM "Provider"
WHERE "status" = 'PENDING'
ORDER BY "createdAt" ASC
LIMIT 50 OFFSET 0; -- Page 1
-- LIMIT 50 OFFSET 50; -- Page 2
-- LIMIT 50 OFFSET 100; -- Page 3
```
*   **`LIMIT`**: Restricts the result to 50 rows.
*   **`OFFSET`**: Skips the first N rows (calculated as `(page - 1) * limit`).

### E. Top Providers (Grouping & Aggregation)
**Feature:** Identifying which categories have the most providers.

**SQL Logic:**
```sql
SELECT "primaryCategory", COUNT(*) as "count"
FROM "Provider"
GROUP BY "primaryCategory"
HAVING COUNT(*) > 5
ORDER BY "count" DESC;
```
*   **`GROUP BY`**: Groups all providers by their category.
*   **`COUNT(*)`**: Counts how many providers are in each group.
*   **`HAVING`**: Filters the *groups* (not rows) to only show categories with more than 5 providers.

---

## 🛠️ 3. Transaction Management (ACID)

**Feature:** When a booking is cancelled, we might need to issue a refund and update the booking status simultaneously. If one fails, both should fail.

**SQL Logic:**
```sql
BEGIN; -- Start Transaction

-- Step 1: Update booking status
UPDATE "Booking" 
SET "status" = 'CANCELLED' 
WHERE "id" = 'booking-123';

-- Step 2: Create a refund record
INSERT INTO "Transaction" ("userId", "amount", "type", "status")
VALUES ('user-456', 500.00, 'REFUND', 'SUCCESS');

COMMIT; -- Save changes only if both steps succeeded
ROLLBACK; -- Reverts changes if any error occurred
```


---

## 📐 4. Database Normalization

The MH26 Services database is designed following **Third Normal Form (3NF)** principles to reduce redundancy and improve integrity.

### **First Normal Form (1NF)**
*   **Rule**: Each column should contain only atomic values (no lists/arrays in a single cell) and each record needs a unique identifier.
*   **Implementation**: 
    *   All our tables (`User`, `Provider`, `Service`) have a Primary Key (`id` UUID).
    *   We avoid storing comma-separated lists. For example, instead of storing multiple services in a text column in the `Provider` table, we have a separate `Service` table where each row acts as a single service entry.

### **Second Normal Form (2NF)**
*   **Rule**: Must be in 1NF, and all non-key attributes must depend on the *entire* primary key.
*   **Implementation**: 
    *   We separated **Providers** from **Users**. A `User` can exist without being a `Provider`.
    *   If we had combined them, a "Customer" would have null values for `businessName`, `gstNumber`, etc., or we might have had a composite key that caused strict dependency issues.
    *   By splitting them (`User` table for auth info, `Provider` table for business info), every column in `Provider` depends solely on the `Provider.id` (or `userId`).

### **Third Normal Form (3NF)**
*   **Rule**: Must be in 2NF, and there should be no "transitive dependencies" (non-key attributes should not depend on other non-key attributes).
*   **Implementation**: 
    *   **Bad Design**: If we stored `ProviderCity` in the `Booking` table, it would depend on `providerId`, not `bookingId`.
    *   **MH26 Design**: The `Booking` table only links to `providerId`. To find the city of the service, we JOIN with the `Provider` table. The `Booking` table only contains data specific to that booking instance (e.g., `scheduledAt`, `status`).
    *   *Note*: We intentionally denormalize slightly in `Booking` by storing `totalAmount` (snapshot) to preserve historical data even if service prices change later.

---

## 🔗 5. Advanced Join Implementation

While the previous section showed a basic JOIN, understanding the *types* of JOINs is critical for different features.

### **A. INNER JOIN (The "Intersection")**
**Use Case**: "Show me verified Bookings."
We only want records where *both* sides match. A booking without a user or service is invalid data.

```sql
-- Get details only for bookings where user and provider still actvely exist
SELECT 
    b.id,
    u.name as Customer,
    p.businessName as Provider
FROM "Booking" b
INNER JOIN "User" u ON b."userId" = u.id
INNER JOIN "Provider" p ON b."providerId" = p.id;
```
*   **Result**: If a User was hard-deleted (unlikely due to cascading, but conceptually), that booking wouldn't show up here if it lost the reference.

### **B. LEFT OUTER JOIN (The "Optional" Data)**
**Use Case**: "List all Providers and their Review scores, even if they have no reviews yet."
If we used INNER JOIN, new providers with 0 reviews would disappear from the list!

```sql
SELECT 
    p."businessName",
    COUNT(r.id) as "ReviewCount",
    AVG(r.rating) as "AverageScore"
FROM "Provider" p
LEFT JOIN "Review" r ON p.id = r."providerId"
GROUP BY p.id;
```
*   **Logic**: 
    *   Take **ALL** rows from `Provider` (Left Table).
    *   Match them with rows from `Review` (Right Table).
    *   If no match is found (Provider has no reviews), the `Review` columns will be `NULL`, but the Provider still appears in the list.

### **C. SELF JOIN (Hierarchical Data)**
**Use Case**: "Find which Admin invited or approved another Admin/Provider."
(Assuming an audit trail or referral system within the User table).

```sql
-- Finding users and who referred them (if we had a referrerId)
SELECT 
    u.name as "User",
    ref.name as "ReferredBy"
FROM "User" u
JOIN "User" ref ON u."referrerId" = ref.id;
```

---

## 🚀 Summary of Clauses Used

| Clause | Purpose | Example in MH26 |
| :--- | :--- | :--- |
| **`SELECT`** | Retrieve specific columns | `SELECT name, email FROM "User"` |
| **`WHERE`** | Filter rows based on conditions | `WHERE role = 'PROVIDER'` |
| **`JOIN`** | Combine data from multiple tables | Linking `Booking` with `User` details |
| **`ORDER BY`** | Sort results | `ORDER BY createdAt DESC` (Newest first) |
| **`LIMIT`** | Restrict number of rows | `LIMIT 10` (Top 10 lists) |
| **`GROUP BY`** | Group data for aggregation | `GROUP BY city` (Providers per city) |
| **`HAVING`** | Filter grouped data | `HAVING count > 10` |
| **`INSERT`** | Add new records | Creating a new `Booking` |
| **`UPDATE`** | Modify existing records | Changing status to `COMPLETED` |
| **`DELETE`** | Remove records | Removing a rejected service |

This logic ensures **MH26 Services** handles data efficiently, securely, and reliably.
