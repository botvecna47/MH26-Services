# MH26 Services - Local Service Marketplace

Welcome to **MH26 Services**! This is a web application designed to help people in Nanded (MH26) find local service providers like plumbers, electricians, and more. It's built to be simple, fast, and easy to use.

## 🚀 What is this project?

This project is a full-stack web application that connects customers with service providers.
- **Customers** can search for services, book appointments, and chat with providers.
- **Providers** can list their services, manage bookings, and grow their business.
- **Admins** can oversee everything to keep the platform safe.

## 🛠️ Tech Stack

We used modern web technologies to build this:
- **Frontend**: React (with Vite) for a fast and responsive UI.
- **Backend**: Node.js & Express for the API.
- **Database**: PostgreSQL (managed with Prisma) to store all data.
- **Styling**: Tailwind CSS for beautiful designs.

## 📂 Project Structure

Here's a quick look at how the code is organized:

- `frontend/`: Contains all the React code (pages, components, styles).
- `server/`: Contains the backend API, database models, and logic.
- `docs/`: Documentation and guides (DB schema, troubleshooting, etc.).

## 🏃‍♂️ How to Run It

1.  **Install Dependencies**:
    ```bash
    npm install
    cd frontend && npm install
    cd ../server && npm install
    ```

2.  **Setup Database**:
    Make sure you have PostgreSQL running and your `.env` file is set up.
    ```bash
    cd server
    npx prisma migrate dev
    npx prisma db seed
    ```

3.  **Start the App**:
    Go back to the main folder and run:
    ```bash
    npm run dev
    ```
    This will start both the frontend (http://localhost:5173) and backend (http://localhost:3000).

## 📚 Documentation

Check out the `docs/` folder for more details:
- **[Database Guide](docs/DB.md)**: How the database works.
- **[Architecture](docs/ARCHITECTURE.md)**: How the system is designed.
- **[Troubleshooting](docs/TROUBLESHOOTING.md)**: Fix common errors.

---
*Created by Darshdeep for the MH26 Project.*
