# MH26 Services

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MH26 Services is a **hyper-local multi-service platform** designed to connect citizens of Nanded, India, with **verified tiffin providers, rental accommodations, and household service providers**. The platform emphasizes **trust, transparency, security, and convenience**, offering a seamless digital ecosystem for consumers, providers, and administrators.

---

## 🚀 Project Overview

In fast-paced urban life, finding reliable services is challenging. MH26 Services addresses this by providing:

- **Verified and rated service providers** (tiffin, rentals, household services)
- **Transparent pricing, availability, and reviews**
- **Secure transactions** with data protection
- **Admin-managed dynamic content**, ads, and analytics

This project is built as a **React + Vite frontend**, **Node.js + Express backend**, and uses **PostgreSQL (via Prisma ORM) + MongoDB** for database management.

---

## 📌 Features

### Consumer Features
- Register/login using **Gmail + OTP verification**
- Browse and filter services by category, rating, price, and location
- View provider details and ratings
- Place bookings and make secure online payments
- Submit reviews after service completion
- Receive email notifications for bookings and updates

### Service Provider Features
- Secure login (admin-generated credentials)
- Update service profiles, availability, and pricing
- View earnings and commission dashboards
- Respond to consumer reviews

### Admin Features
- Secure login with JWT authentication
- Manage service providers, services, categories, and cities
- Update website content (hero section, banners, ads, FAQs) without changing code
- View analytics: bookings, payments, revenue
- Admin panel is **dynamic and modular**, allowing future scalability

---

## 🛠️ Technology Stack

**Frontend**
- React.js + Vite
- Tailwind CSS
- React Router v6
- Axios for API calls

**Backend**
- Node.js + Express
- JWT for authentication
- Prisma ORM with PostgreSQL
- MongoDB for dynamic content (ads, reviews, logs)

**Notifications**
- OTP verification via Gmail

**Deployment**
- Dockerized containers
- AWS/GCP deployment with CI/CD

---

## 📂 Database Schema (PostgreSQL via Prisma)

- **Users**: user_id, name, email, mobile_number, password_hash, role, created_at
- **Service_Providers**: provider_id, user_id, category, description, rating, verified
- **Services**: service_id, provider_id, title, price, available
- **Bookings**: booking_id, consumer_id, service_id, booking_date, status
- **Payments**: payment_id, booking_id, amount, commission, status

**MongoDB** is used for:
- Ads, banners, dynamic content
- Logs and reviews for flexible storage

---

## ⚡ Getting Started

### Prerequisites
- Node.js >= 18.x
- PostgreSQL database
- MongoDB instance
- Git & Docker (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/<your-username>/mh26-services.git
cd mh26-services
