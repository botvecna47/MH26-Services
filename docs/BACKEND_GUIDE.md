# Backend Guide

This is the "Brain" of the MH26 Services project. It handles all the logic, data, and security.

## 🛠️ Tech Stack
- **Node.js & Express**: The server framework.
- **TypeScript**: For safer code.
- **Prisma**: To talk to the database.
- **PostgreSQL**: The database itself.

## 📡 API Endpoints
Here are the main links the Frontend uses to talk to the Backend:

### Auth (Login/Signup)
- `POST /api/auth/register`: Create a new account.
- `POST /api/auth/login`: Sign in.

### Providers
- `GET /api/providers`: Show all service providers.
- `POST /api/providers`: Apply to become a provider.

### Bookings
- `POST /api/bookings`: Book a service.
- `GET /api/bookings`: See your bookings.

## 🔒 Security
We take security seriously!
- **Passwords**: We hash them so no one can read them.
- **Tokens**: We use JWTs to keep you logged in safely.
- **Rate Limiting**: We stop hackers from spamming the server.

## 🧪 How to Test
To run the tests for the backend:
```bash
cd server
npm test
```
