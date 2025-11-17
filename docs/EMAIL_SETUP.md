# Email Setup Guide

This guide explains how to configure email sending for OTP verification and other email notifications.

## Gmail SMTP Configuration

### Step 1: Enable App Password in Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Go to **App passwords**: https://myaccount.google.com/apppasswords
4. Select **Mail** and **Other (Custom name)**
5. Enter "MH26 Services" as the app name
6. Click **Generate**
7. Copy the 16-character app password (you'll need this for `SMTP_PASS`)

### Step 2: Configure Environment Variables

Add these variables to your `.env` file in the `server` directory:

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
```

**Important Notes:**
- Use your **App Password**, not your regular Gmail password
- The App Password is 16 characters without spaces
- `SMTP_FROM` should match `SMTP_USER` for Gmail

### Step 3: Alternative Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

## Testing Email Configuration

### Check Server Logs

When you attempt to register, check your server console for:

1. **Success message:**
   ```
   SMTP connection verified successfully
   Email sent successfully to: user@example.com
   ```

2. **Error messages:**
   - `SMTP not configured` - Missing environment variables
   - `Invalid login` - Wrong credentials
   - `Connection timeout` - Network/firewall issues

### Development Mode

If SMTP is not configured, the OTP will be logged to the console:
```
📧 EMAIL OTP for user@example.com: 123456
⚠️  Note: SMTP not configured. Email was not actually sent.
```

## Troubleshooting

### Emails Not Received

1. **Check Spam Folder** - Emails might be filtered as spam
2. **Verify SMTP Settings** - Double-check all environment variables
3. **Check Server Logs** - Look for error messages
4. **Test SMTP Connection** - The server will verify connection on startup
5. **Gmail Security** - Make sure "Less secure app access" is enabled OR use App Password

### Common Errors

#### "Invalid login"
- Wrong email or password
- Using regular password instead of App Password (for Gmail)
- 2FA not enabled (required for App Passwords)

#### "Connection timeout"
- Firewall blocking port 587
- Wrong SMTP host
- Network connectivity issues

#### "SMTP not configured"
- Missing environment variables in `.env`
- Variables not loaded (restart server after adding to `.env`)

## Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use App Passwords** - Don't use your main account password
3. **Rotate Passwords** - Change App Passwords periodically
4. **Use Environment-Specific Configs** - Different settings for dev/prod

## Production Recommendations

For production, consider using:
- **SendGrid** - Reliable, scalable email service
- **AWS SES** - Cost-effective for high volume
- **Mailgun** - Developer-friendly API
- **Postmark** - Great deliverability

These services provide better deliverability and analytics than personal Gmail accounts.

