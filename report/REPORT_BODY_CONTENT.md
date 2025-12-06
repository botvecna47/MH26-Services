# PROJECT REPORT: MH26 Services

## 1. ABSTRACT

In the current digital age, finding reliable local service providers (such as plumbers, electricians, carpenters, etc.) remains a significant challenge in tier-2 cities like Nanded (MH26). "MH26 Services" is a full-stack web application designed to bridge this gap by connecting local service providers with customers in a seamless, secure, and user-friendly environment.

The platform employs a robust "Provider-Consumer" model. Service providers can register, showcase their expertise through portfolios, and manage bookings. Customers can easily search for specific services, view provider profiles including ratings and reviews, and book appointments. The system emphasizes trust and transparency through verified profiles and secure authentication.

Technologically, the project leverages the PERN stack (PostgreSQL, Express.js, React, Node.js) to ensure scalability and performance. Key features include role-based access control (RBAC), geo-location-based service alignment (planned), and a responsive user interface built with Tailwind CSS. This report details the system's analysis, design, implementation, and testing phases, demonstrating a comprehensive solution to the local service marketplace problem.

---

## 2. INTRODUCTION

### 2.1 Project Overview
"MH26 Services" is an online marketplace dedicated to the Nanded region. It serves as a digital directory and booking platform for fragmented local services. Unlike general classifieds, this platform is transactional and service-oriented, focusing on the complete lifecycle of a service request from search to booking completion.

### 2.2 Problem Statement
Residents of Nanded often struggle to find skilled trusted labour for daily household needs.
*   **Lack of Organization:** No central database of verified providers.
*   **Trust Issues:** Difficulty in verifying the background or skill level of a worker.
*   **Inconvenience:** Relying on word-of-mouth or physical searching is time-consuming.
*   **Provider Struggle:** Skilled workers lack a digital presence to market their services to a wider audience.

### 2.3 Objectives
*   To develop a web-based platform for listing and booking local services.
*   To implement secure authentication and authorization for different user roles (Admin, Provider, Customer).
*   To create provider profiles with portfolio capabilities to enhance trust.
*   To design a seamless booking workflow with status tracking (Pending, Confirmed, Completed).
*   To ensure the application is responsive and accessible on mobile devices.

### 2.4 Scope
*   **Geographical:** Focused on Nanded (MH26) but scalable to other regions.
*   **Functional:** User registration, Service Search, Booking Management, Reviews, and Basic Admin functions.
*   **Exclusions:** In-app payments are currently simulated; real-time GPS tracking is future scope.

---

## 3. SYSTEM ANALYSIS

### 3.1 Existing System
Currently, people rely on:
1.  **Yellow Pages/Directories:** Outdated methods with no real-time availability.
2.  **Word of Mouth:** Limited reach and potential for misinformation.
3.  **WhatsApp Groups:** Unorganized and lacks formal booking structure.

**Drawbacks:** Time-consuming, lack of verification, no price standardization, and no feedback mechanism.

### 3.2 Proposed System
The proposed "MH26 Services" system automates the manual process.
*   **Centralized Database:** A single source of truth for all service providers.
*   **Digital Booking:** Formal record of requests and confirmations.
*   **Feedback Loop:** Ratings and reviews to maintain quality.
*   **24/7 Availability:** System is always accessible for browsing and booking.

### 3.3 Feasibility Study
*   **Technical Feasibility:** The chosen technologies (React, Node, Postgres) are open-source, mature, and well-supported. The team has the required skill set.
*   **Economic Feasibility:** Low operational cost as it relies on open-source software. Hosting can be done on free tiers (Vercel, Railway) initially.
*   **Operational Feasibility:** The interface is designed to be intuitive for non-technical users, ensuring high adoption potential in the target demographic.

---

## 4. SYSTEM REQUIREMENTS SPECIFICATION (SRS)

### 4.1 Functional Requirements
1.  **User Module:**
    *   Registration/Login (Email & Password).
    *   Profile Management (Update details, avatar).
2.  **Provider Module:**
    *   Create Business Profile (Name, Category, Description).
    *   Manage Services (Add/Edit Price, Duration).
    *   Upload Portfolio Images.
    *   View and Assess Bookings.
3.  **Booking Module:**
    *   Search Services by Category.
    *   Book Appointment (Select Date/Time).
    *   Status Updates (Confirm/Complete/Cancel).
4.  **Admin Module:**
    *   View all users and providers.
    *   Approve/Reject Provider applications.

### 4.2 Non-Functional Requirements
1.  **Performance:** Pages should load within 2 seconds.
2.  **Security:** Passwords must be hashed (Bcrypt). API endpoints must be protected (JWT).
3.  **Reliability:** Database integrity must be maintained using transactions.
4.  **Scalability:** Codebase structure (MVC) supports adding new features easily.
5.  **Usability:** Responsive design for Mobile and Desktop views.

### 4.3 Hardware & Software Requirements
*   **Server:** Node.js Environment (v16+).
*   **Database:** PostgreSQL (v13+).
*   **Client:** Any modern web browser (Chrome, Edge, Firefox).
*   **Development Tools:** VS Code, Git, Postman.

---

## 5. SYSTEM DESIGN

### 5.1 System Architecture
The application follows a **Client-Server Architecture**.
*   **Frontend (Client):** React.js app communicating via HTTP/REST API.
*   **Backend (Server):** Express.js app handling business logic.
*   **Database:** PostgreSQL storing persistent data.

*(Refer to the Architecture Diagram in `docs/ARCHITECTURE.md`)*

### 5.2 Database Design
The backbone of "MH26 Services" is its robust database, designed using **PostgreSQL** and managed via **Prisma ORM**. The database follows 3rd Normal Form (3NF) to ensure data integrity and reduce redundancy.

#### 5.2.1 Schema Overview
The database schema consists of several interconnected entities handling Users, Service Providers, Bookings, Reviews, and Payments. The core relationships are:
*   **One-to-Many:** Users can have multiple Bookings.
*   **One-to-One:** A User can have one Provider profile.
*   **Many-to-Many:** Implemented via relation tables (e.g., SavedProviders).

#### 5.2.2 Data Dictionary (Table Specifications)

**1. Table: User**
Stores authentication and profile details for all system actors.

| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | Unique identifier for the user. |
| `email` | String | Unique | User's email address (login credential). |
| `name` | String | - | Full name of the user. |
| `passwordHash` | String | - | Bcrypt hashed password. |
| `role` | Enum | - | `CUSTOMER`, `PROVIDER`, or `ADMIN`. |
| `createdAt` | DateTime | - | Timestamp of account creation. |

**2. Table: Provider**
Stores business-specific information for users operating as service providers.

| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | Unique provider identifier. |
| `userId` | String | FK | Links to the `User` table. |
| `businessName` | String | - | Name of the service business. |
| `primaryCategory`| String | - | Main service type (e.g., 'Plumbing'). |
| `status` | Enum | - | `PENDING`, `APPROVED`, `REJECTED`. |
| `gallery` | String[] | - | Array of image URLs (Portfolio). |
| `averageRating` | Float | - | Calculated rating from reviews. |

**3. Table: Service**
Lists individual services offered by a provider.

| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | Unique service identifier. |
| `providerId` | String | FK | Links to `Provider` table. |
| `title` | String | - | Name of the specific service (e.g. 'Tap Repair'). |
| `price` | Decimal | - | Cost of the service. |
| `durationMin` | Int | - | Estimated duration in minutes. |

**4. Table: Booking**
The central transactional entity recording service appointments.

| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | Unique booking identifier. |
| `userId` | String | FK | Customer who requested the service. |
| `providerId` | String | FK | Provider assigned to the job. |
| `serviceId` | String | FK | Specific service booked. |
| `status` | Enum | - | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`. |
| `scheduledAt` | DateTime | - | Date and time of the appointment. |
| `address` | String | - | Service location. |
| `totalAmount` | Decimal | - | Final cost including fees. |

**5. Table: Review**
Stores feedback and ratings for completed services.

| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | Unique review identifier. |
| `bookingId` | String | FK | unique link to a specific booking. |
| `rating` | Int | - | Score from 1 to 5. |
| `comment` | String | - | Textual feedback from customer. |

**6. Table: Transaction**
Records payment details for financial tracking.

| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | Unique transaction ID. |
| `bookingId` | String | FK | Link to the booking paid for. |
| `amount` | Decimal | - | Amount processed. |
| `status` | Enum | - | `SUCCESS`, `FAILED`, `PENDING`. |

**7. Table: Ticket (Report/Appeal)**
Handles content moderation and user disputes.

| Column Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | Unique ticket ID. |
| `reporterId` | String | FK | User who raised the issue. |
| `status` | Enum | - | `OPEN`, `RESOLVED`. |
| `reason` | String | - | Category of the issue. |

#### 5.2.3 Relationships and Cardinality
*   **User 1:1 Provider**: A user account *becomes* a provider profile.
*   **Provider 1:N Service**: One provider offers many distinct services.
*   **User 1:N Booking**: One customer can make many bookings over time.
*   **Provider 1:N Booking**: One provider receives requests from many customers.
*   **Booking 1:1 Transaction**: Each booking has exactly one payment record.
*   **Booking 1:1 Review**: Each completed booking can have one review.

### 5.3 Unified Modeling Language (UML) Diagrams

**Use Case Diagram Description:**
*   **Actors:** Customer, Provider, Admin.
*   **Use Cases:**
    *   *Customer:* Search Service, View Profile, Book Service, Rate Provider.
    *   *Provider:* Manage Profile, Accept/Reject Booking, Update Status.
    *   *Admin:* Verify Provider, Manage Users.

**Data Flow Diagram (Level 0 - Context):**
*   User sends 'Booking Request' -> System.
*   System sends 'Notification' -> Provider.
*   Provider sends 'Confirmation' -> System.
*   System sends 'Ticket' -> User.

---

## 6. IMPLEMENTATION

### 6.1 Technology Stack
*   **Frontend:** React, TypeScript, Tailwind CSS, Lucide React (Icons), Vite (Bundler).
*   **Backend:** Node.js, Express.js.
*   **Database:** PostgreSQL.
*   **ORM:** Prisma.
*   **Authentication:** JSON Web Tokens (JWT), Bcrypt.

### 6.2 Key Code Snippets

**1. Database Schema (Prisma):**
```prisma
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  role     UserRole @default(CUSTOMER)
  bookings Booking[]
}

model Booking {
  id          String        @id @default(uuid())
  status      BookingStatus @default(PENDING)
  scheduledAt DateTime
  user        User          @relation(fields: [userId], references: [id])
}
```

**2. Authentication Middleware (Node.js/Express):**
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

---

## 7. TESTING

### 7.1 Testing Strategy
We employed **Black Box Testing** focusing on functionality without peering into internal code structures during the QA phase.

### 7.2 Test Cases

| TC ID | Test Case Description | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | User Registration with valid data | Account created, logged in | Account created | **PASS** |
| TC-02 | Login with incorrect password | Error message displayed | Error message | **PASS** |
| TC-03 | Search for "Plumber" | List of plumbing providers | Providers listed | **PASS** |
| TC-04 | User creates a booking | Booking status: "Pending" | Status: "Pending" | **PASS** |
| TC-05 | Provider accepts booking | Booking status: "Confirmed" | Status: "Confirmed" | **PASS** |

### 7.3 Screenshots
*(Placeholders - Please insert screenshots from the running application)*

*   **Figure 7.1:** Landing Page
    *   *[Insert Screenshot of Home Page]*
*   **Figure 7.2:** Login Screen
    *   *[Insert Screenshot of Login Page]*
*   **Figure 7.3:** Service Search Results
    *   *[Insert Screenshot of Search Page]*
*   **Figure 7.4:** Provider Dashboard
    *   *[Insert Screenshot of Dashboard]*

---

## 8. RESULTS AND DISCUSSIONS
The application was successfully deployed locally and tested. All critical workflows (Auth -> Search -> Book) function as expected. The user interface was found to be intuitive during informal user testing. The database handles concurrent relationships (User-Provider-Service) effectively without data redundancy.

One challenge faced was handling dates and time zones for bookings, which was resolved by standardizing all times to UTC in the backend and converting to local time on the client.

## 9. CONCLUSION & FUTURE SCOPE

### 9.1 Conclusion
"MH26 Services" successfully demonstrates the digitalization of local services. It provides a structured platform that benefits both service seekers and providers in Nanded. By reducing information asymmetry and providing a formal booking channel, it effectively solves the problem of finding reliable local help.

### 9.2 Future Scope
*   **Payment Gateway:** Integration of Razorpay/Stripe for online payments.
*   **Mobile App:** Development of a React Native mobile app for better accessibility.
*   **Real-time Chat:** Implementing Socket.io for live chat between user and provider.
*   **AI Recommendations:** Suggesting services based on user booking history and seasonal needs.

---

## 10. REFERENCES

1.  Pressman, R. S., *Software Engineering: A Practitioner’s Approach*, 8th ed. McGraw-Hill Education, 2014.
2.  Silberschatz, A., Korth, H. F., and Sudarshan, S., *Database System Concepts*, 7th ed. McGraw-Hill Education, 2019.
3.  Banks, A. and Porcello, E., *Learning React: Modern Patterns for Developing React Apps*, 2nd ed. O'Reilly Media, 2020.
4.  Casciaro, M. and Mammino, L., *Node.js Design Patterns*, 3rd ed. Packt Publishing, 2020.
5.  Martin, R. C., *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall, 2008.
6.  Sommerville, I., *Software Engineering*, 10th ed. Pearson, 2015.

