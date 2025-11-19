# Quick Email Setup Guide

## Yes, you need to configure email settings to send OTP emails!

### Step 1: Create `.env` file

Create a file named `.env` in the `server` directory (copy from `.env.example` if it exists).

### Step 2: Set up Gmail App Password

**For Gmail users:**

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to enable **2-Step Verification** first (if not already enabled)
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other (Custom name)**
5. Type: `MH26 Services`
6. Click **Generate**
7. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop` - remove spaces when using)

### Step 3: Add to `.env` file

Open `server/.env` and add these lines:

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the App Password you generated (no spaces)

### Step 4: Restart your server

After adding the email configuration:
1. Stop your server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 5: Test it!

Try registering a new account. You should see in the server console:
- ✅ `SMTP connection verified successfully`
- ✅ `Email sent successfully to: user@example.com`

If you see errors, check the troubleshooting section below.

---

## Alternative: Use Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
```

---

## Troubleshooting

### ❌ "SMTP not configured"
- Check that all 5 variables are in your `.env` file
- Make sure the file is named `.env` (not `.env.txt`)
- Restart your server after adding variables

### ❌ "Invalid login" or "Authentication failed"
- **For Gmail**: Make sure you're using an **App Password**, not your regular password
- Make sure 2-Step Verification is enabled
- Check that the App Password is correct (no spaces)

### ❌ "Connection timeout"
- Check your internet connection
- Make sure port 587 is not blocked by firewall
- Try using port 465 with `secure: true` (change `SMTP_PORT=465`)

### ✅ Emails not arriving
- Check **Spam/Junk folder**
- Wait a few minutes (can take 1-5 minutes)
- Check server logs for error messages
- Verify the email address is correct

---

## Without Email Configuration

If you don't configure email, the OTP will be **logged to the console** instead of being sent:

```
📧 REGISTRATION OTP for user@example.com: 123456
⚠️  Configure SMTP settings in .env to send actual emails.
```

You can still test registration by checking the server console for the OTP!

---

## Need Help?

Check the detailed guide: `docs/EMAIL_SETUP.md`

