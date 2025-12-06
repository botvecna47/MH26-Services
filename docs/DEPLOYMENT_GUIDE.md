# Deployment Guide

This guide explains how to put the **MH26 Services** website on the internet so everyone can use it.

## 🌍 Where to Deploy?

You can deploy this project to many places. Here are two popular options:

### Option 1: Vercel (Best for Frontend)
1.  Create an account on [Vercel](https://vercel.com).
2.  Connect your GitHub repository.
3.  Vercel will automatically detect the React app and deploy it.

### Option 2: Render or Railway (Best for Full Stack)
Since we have a Backend (Node.js) and a Database (PostgreSQL), we need a service that supports them.
1.  **Render.com** is a great free option.
2.  Create a "Web Service" for the Backend.
3.  Create a "PostgreSQL" database.
4.  Connect them using Environment Variables (like `DATABASE_URL`).

## ⚙️ Environment Variables

When you deploy, don't forget to set these secret keys in your host's settings:
- `DATABASE_URL`: The link to your live database.
- `JWT_SECRET`: A secret password for security.
- `SMTP_HOST`: For sending emails.

## 🚀 Build Command

If the host asks for a build command:
- **Frontend**: `npm run build`
- **Backend**: `npm run build`
