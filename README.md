# MH26 Services Platform

**Empowering Local Commerce via Digital Efficiency**

MH26 Services is a robust, full-stack marketplace application engineered to bridge the gap between local service professionals and homeowners in the Nanded region. By digitizing the discovery, booking, and transaction lifecycle, this platform modernizes how essential services—from plumbing to electrical repairs—are accessed and delivered.

This repository hosts a scalable, production-ready solution featuring real-time resource management, secure financial transaction flows, and a comprehensive administration suite. It is designed not just as a utilitarian tool, but as a complete ecosystem for service commerce.

---

## Technical Architecture

The platform is built on a high-performance monolithic architecture that emphasizes type safety, data integrity, and real-time responsiveness.

### Backend Infrastructure
*   **Runtime Environment**: Node.js with Express, structured for scalability.
*   **Language**: TypeScript throughout, ensuring rigorous static typing and reducing runtime errors.
*   **Database**: PostgreSQL managed via Prisma ORM. We utilize complex schema relations including foreign key constraints, indexes for query performance, and atomic transactions for financial integrity.
*   **Real-time Communication**: Socket.io integration handles live status updates for bookings and payments, ensuring users are never out of sync.
*   **Authentication**: Dual-layer security using JWT (access/refresh tokens) and secure password hashing with bcrypt.

### Frontend Experience
*   **Framework**: React 18, utilizing the latest hook patterns and context APIs.
*   **State Management**: React Query (TanStack Query) for efficient server state synchronization and caching.
*   **Design System**: Tailwind CSS combined with deeply customized Shadcn UI components creates a premium, responsive interface.
*   **Data Visualization**: Recharts provides administrative analytics for revenue and user growth.

---

## Core Capabilities

### For Costumers
*   **Intelligent Discovery**: Services are organized into intuitive categories locally sourced from real-world data. Advanced filtering allows users to find the exact service they need.
*   **Seamless Booking**: A streamlined reservation flow allows users to schedule services for specific dates and times, with conflict detection built-in.
*   **Secure Transactions**: Integrated wallet and payment gateway structures ensure money is handled safely.
*   **Transparency**: Live tracking of booking status from "Confirmed" to "Provider En Route" to "Completed".

### For Service Providers
*   **Digital Office**: Providers receive a dedicated dashboard to manage their availability, view incoming jobs, and track earnings.
*   **Portfolio Management**: Providers can showcase their work through image galleries, building trust with potential clients.
*   **Revenue Tracking**: Detailed financial reports breakdown earnings, platform fees, and net profit in real-time.

### For Administrators
*   **God-Mode Control**: A powerful dashboard offers oversight of the entire ecosystem. Admins can moderate users, verify provider credentials, and intervene in bookings.
*   **Financial Oversight**: Automated calculation of platform fees (7%) and revenue aggregation provides a clear picture of business health.
*   **Data Integrity**: Built-in seed tools and verification scripts ensure the platform is always populated with valid, realistic data for testing and demos.

---

## Getting Started

Follow these instructions to deploy a local instance of the MH26 Services Platform.

### Prerequisites
Ensure your environment is equipped with:
*   Node.js (v18+)
*   PostgreSQL (v14+)
*   npm (v9+)

### Installation

1.  **Clone the Repository**
    Begin by cloning the codebase to your local machine.
    ```bash
    git clone https://github.com/botvecna47/MH26-Services.git
    cd MH26-Services
    ```

2.  **Backend Configuration**
    Navigate to the server directory and install dependencies.
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file with your database credentials and secret keys. Refer to the codebase for the required variable names (PORT, DATABASE_URL, ACCESS_TOKEN_SECRET, etc.).

    Initialize the database schema and populate it with initial data:
    ```bash
    npx prisma migrate deploy
    npm run seed
    ```
    Start the backend server:
    ```bash
    npm run dev
    ```

3.  **Frontend Initialization**
    In a separate terminal, navigate to the frontend directory.
    ```bash
    cd frontend
    npm install
    ```
    Configure the frontend `.env` file to point to your backend API and Socket URL.
    Start the interface:
    ```bash
    npm run dev
    ```

Your application should now be live at your local host address.

---

## Deployment Strategy

The application is structured for easy deployment to cloud services like Railway or AWS. The distinct separation of frontend (static assets) and backend (API service) allows for independent scaling.

*   **Build**: Run `npm run build` in both directories to generate optimized production assets.
*   **Serve**: The backend is configured to serve the frontend's static build files, allowing for a simplified single-process deployment if desired.

---

**MH26 Services Platform**
*Digital Solutions for Local Needs.*
