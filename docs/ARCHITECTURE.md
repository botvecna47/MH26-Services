# System Architecture 🏗️

Curious how MH26 Services works under the hood? You're in the right place.
We follow a standard **Client-Server** architecture.

## 🗺️ The Big Picture

Here is how data flows through our system:

```mermaid
graph TD
    User((User 👤))
    Frontend[Frontend (React + Vite) 💻]
    Backend[Backend API (Node.js + Express) ⚙️]
    DB[(PostgreSQL Database 🗄️)]

    User -- "Clicks 'Book Now'" --> Frontend
    Frontend -- "POST /api/bookings" --> Backend
    Backend -- "Saves Data" --> DB
    DB -- "Confirmation" --> Backend
    Backend -- "Success Response" --> Frontend
    Frontend -- "Show 'Booking Confirmed'" --> User
```

## 🧩 The Three Musketeers (Layers)

### 1. The Frontend (What you see) 🎨
- **Tech**: React, Typescript, Tailwind CSS.
- **Job**: Shows the UI, handles clicks, animations, and formatting.
- **Location**: `frontend/` folder.

### 2. The Backend (The Brains) 🧠
- **Tech**: Node.js, Express.
- **Job**: Validates requests ("Is this user logged in?"), calculates prices, and talks to the database.
- **Location**: `server/src/` folder.

### 3. The Database (The Vault) 🔒
- **Tech**: PostgreSQL.
- **Job**: Safely stores your user info, booking history, and service details.
- **ORM**: We use **Prisma** so we don't have to write raw SQL (mostly).

## 📁 Folder Structure Explained

```text
MH26-Services/
├── frontend/           # The User Interface
│   ├── src/
│   │   ├── components/ # Reusable buttons, forms, cards
│   │   ├── pages/      # Full pages (Home, Login, Dashboard)
│   │   └── services/   # API helper functions
│   └── ...
├── server/             # The API Server
│   ├── prisma/         # Database schema & seeds
│   ├── src/
│   │   ├── controllers/ # Logic for each route
│   │   ├── routes/      # API endpoints definitions
│   │   └── middleware/  # Security checks (auth, logging)
│   └── ...
└── docs/               # You are here! 📖
```

## 🔄 How Booking Works (Step-by-Step)

1.  **Selection**: User picks a service (e.g., "AC Repair") and a time.
2.  **Request**: Frontend sends a JSON package to the server.
3.  **Verification**: Server checks if the time slot is free.
4.  **Creation**: Server asks Database to create a new `Booking` row.
5.  **Response**: Server tells Frontend "Done!", and Frontend shows a success checkmark.
