# MH26 Services - Your Local Service Marketplace 🛠️🏡

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-PERN-lightgrey)

Welcome to **MH26 Services**! 👋

We are building a community-driven platform specifically for the people of **Nanded (MH26)**. Our goal is simple: connect local residents with trusted, skilled service providers like plumbers, electricians, carpenters, and more. No more asking around for phone numbers—find help when you need it, right here.

---

## 🚀 Why This Project Exists

Finding a reliable handyman shouldn't be hard. This project aims to:
- **Simplify Search**: Find the right person for the job in seconds.
- **Build Trust**: See profiles, photos, and reviews (coming soon!) before you book.
- **Empower Locals**: Give local skilled workers a digital platform to showcase their talent and grow their business.

## ✨ Key Features

- **For Customers**:
    - 🔍 **Easy Search**: Browse services by category (e.g., Plumbing, Electrical).
    - 📅 **Direct Booking**: Schedule appointments that fit your calendar.
    - 💬 **WhatsApp Integration**: Chat directly with providers to discuss details (simulated).
    - 🔒 **Secure Auth**: Safe login and data protection.

- **For Providers**:
    - 📋 **Profile Management**: customizable profiles with business details.
    - 🖼️ **Portfolio Gallery**: Show off your best work with image uploads.
    - 📈 **Dashboard**: Track your bookings and earnings.

## 🛠️ The Tech Under the Hood

We believe in using robust, modern tools to build a fast and reliable experience:

| Component | Technology | Why? |
| :--- | :--- | :--- |
| **Frontend** | [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) | Blazing fast performance and a smooth user interface. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Beautiful, responsive designs without the bloat. |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | Scalable and efficient server-side logic. |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Rock-solid data storage. |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database interactions that prevent bugs. |

## 🏃‍♂️ Getting Started Guide

Want to run this locally? Awesome! Here is how you can get set up in minutes.

### Prerequisites
- **Node.js** (v16 or higher)
- **PostgreSQL** installed and running locally.

### Installation Steps

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/botvecna47/MH26-Services.git
    cd MH26-Services
    ```

2.  **Install Dependencies**:
    We need to install packages for both the server and the client.
    ```bash
    # Install backend deps
    cd server
    npm install

    # Install frontend deps
    cd ../frontend
    npm install
    ```

3.  **Configure Environment**:
    - Go to `server/` and create a `.env` file.
    - Add your database connection string:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/mh26_services?schema=public"
    JWT_SECRET="super_secret_key"
    ```

4.  **Wake up the Database**:
    Apply the schema and seed some fake data (so it doesn't look empty!).
    ```bash
    cd server
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

5.  **Launch! 🚀**:
    From the root directory:
    ```bash
    npm run dev
    ```
    - **Frontend**: Visit `http://localhost:5173`
    - **Backend API**: Running at `http://localhost:3000`

## 📚 Learn More

We have detailed documentation if you want to dive deeper:
- **[Database Schema](docs/DB.md)** 🗄️: See how our data connects.
- **[Architecture](docs/ARCHITECTURE.md)** 🏗️: Understand the system design.
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** 🔧: Stuck? Check here.

---
*Made with ❤️ for Nanded.*
