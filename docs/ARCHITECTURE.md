# System Architecture

This document explains how the **MH26 Services** application is built and how its parts talk to each other.

## 🏗️ High-Level Design

Think of the app in three layers:

1.  **Frontend (The User Interface)**:
    - This is what you see in the browser.
    - Built with **React** and **Tailwind CSS**.
    - It sends requests to the backend (like "Log me in" or "Show me plumbers").

2.  **Backend (The Brain)**:
    - This is the server logic.
    - Built with **Node.js** and **Express**.
    - It receives requests, checks if they are valid, and talks to the database.

3.  **Database (The Memory)**:
    - This is where data lives.
    - **PostgreSQL** stores users, bookings, and services.
    - **Prisma** helps the backend read and write to the database easily.

## 🔄 How Data Flows

Here is an example of what happens when you book a service:

1.  **User** clicks "Book Now" on the Frontend.
2.  **Frontend** sends a `POST` request to the Backend API.
3.  **Backend** checks if the user is logged in (Authentication).
4.  **Backend** saves the booking in the **Database**.
5.  **Database** confirms it's saved.
6.  **Backend** tells the Frontend "Success!".
7.  **Frontend** shows a "Booking Confirmed" message to the user.

## 📁 Folder Structure

- `frontend/`: All the React code.
- `server/`: All the Node.js API code.
- `docs/`: These documentation files.
