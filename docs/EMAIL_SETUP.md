# Email Setup Guide

The app sends emails for things like "Verify your account" or "Reset Password". Here is how to set it up.

## 📧 Using Gmail

The easiest way is to use a Gmail account.

1.  **Go to Google Account Settings**: Security > 2-Step Verification.
2.  **App Passwords**: Scroll to the bottom and create an "App Password".
    - Select "Mail" and "Other (Custom name)".
    - Name it "MH26 Services".
3.  **Copy the Password**: You will get a 16-character password.
4.  **Update `.env`**:
    Open the `.env` file in the `server` folder and add this:

    ```env
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-16-char-password
    ```

## 🧪 Testing

Try signing up a new user. If you get an email with an OTP code, it works!
