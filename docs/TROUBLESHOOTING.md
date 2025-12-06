# Troubleshooting Guide

Run into a problem? Don't worry! Here are some common issues and how to fix them.

## 🔴 Server Won't Start
**Error**: `EADDRINUSE: address already in use :::3000`
**Fix**: This means another program is using port 3000.
1.  Find the process using the port and stop it.
2.  Or, restart your computer.

## 🔴 Database Connection Failed
**Error**: `P1001: Can't reach database server`
**Fix**:
1.  Make sure PostgreSQL is installed and running.
2.  Check your `.env` file in the `server` folder. Is the password correct?

## 🔴 "Unauthorized" Error
**Error**: You get a 401 error when trying to do something.
**Fix**:
1.  Your login session might have expired.
2.  Try logging out and logging back in.

## 🔴 Images Not Loading
**Fix**:
1.  We use Unsplash for images. Sometimes they block "hotlinking".
2.  We added a fix (`referrerPolicy="no-referrer"`) to our code, so it should work now.
3.  If it still fails, check your internet connection.

## ❓ Still Stuck?
If nothing works:
1.  Delete the `node_modules` folder.
2.  Run `npm install` again.
3.  Restart everything.
