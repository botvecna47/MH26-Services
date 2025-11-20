# Registration and OTP Flow Documentation

## Overview
This document explains the complete registration flow and OTP verification system for both email and phone verification.

## Registration Flow

### Step 1: User Registration Form
1. User fills out the registration form with:
   - Full Name
   - Email Address
   - Phone Number (10 digits, starting with 6-9)
   - Password
   - Confirm Password
   - Role (CUSTOMER or PROVIDER)

2. Form validation:
   - Email must be valid format
   - Phone must be exactly 10 digits starting with 6-9
   - Password must be at least 8 characters
   - Passwords must match

### Step 2: Send OTP to Email
1. User submits the form
2. Backend validates the data
3. Backend checks if user already exists
4. Backend generates a 6-digit OTP
5. Backend stores registration data temporarily (Redis or in-memory)
6. Backend sends OTP to user's email
7. Frontend shows OTP input screen

**Important Notes:**
- If SMTP is not configured, OTP is logged to server console (development mode)
- OTP expires in 10 minutes
- Registration data is stored temporarily until OTP is verified

### Step 3: Verify OTP
1. User enters the 6-digit OTP received via email
2. Frontend sends OTP to backend for verification
3. Backend verifies OTP:
   - Checks if OTP exists and is not expired
   - Validates OTP matches
   - Retrieves registration data
4. Backend creates user account:
   - Hashes password
   - Creates user in database
   - Marks email as verified
   - Phone verification is set to false (can be done later)
5. Backend generates JWT tokens
6. Frontend stores tokens and redirects user:
   - PROVIDER → `/provider-onboarding`
   - CUSTOMER → `/dashboard`

### Step 4: Resend OTP (Optional)
- User can click "Resend OTP" button if they didn't receive the email
- Backend generates a new OTP and sends it again
- Previous OTP is invalidated

## Phone OTP Verification (For Booking)

### When is Phone OTP Required?
- When a user tries to create a booking
- Only if the user has a phone number in their profile
- Phone verification is optional but recommended

### Phone OTP Flow
1. User selects service, date, time, and address
2. User clicks "Book Service"
3. If phone is not verified, OTP verification modal appears
4. User clicks "Send OTP"
5. Backend:
   - Generates 6-digit OTP
   - Stores OTP in database (PhoneOTP table)
   - Sends OTP via SMS (or logs to console in development)
6. User enters OTP
7. Backend verifies OTP
8. User's phone is marked as verified
9. Booking creation proceeds

## API Endpoints

### Registration
- `POST /api/auth/register` - Send registration OTP
- `POST /api/auth/resend-registration-otp` - Resend registration OTP
- `POST /api/auth/verify-registration-otp` - Verify OTP and create account

### Phone OTP
- `POST /api/auth/send-phone-otp` - Send phone OTP
- `POST /api/auth/verify-phone-otp` - Verify phone OTP

## Development Mode

### Email OTP
- If SMTP is not configured, OTP is logged to server console
- Look for: `📧 REGISTRATION OTP for {email}: {otp}`
- OTP is also logged when resending

### Phone OTP
- If SMS service is not configured, OTP is logged to server console
- Look for: `📱 OTP for {phone}: {otp}`
- Check server terminal/console for the OTP

## Manual OTP Input

### For Development/Testing
If you need to manually enter an OTP:

1. **Email OTP:**
   - Check server console for the OTP
   - Enter it in the OTP input field
   - Format: 6 digits (e.g., 123456)

2. **Phone OTP:**
   - Check server console for the OTP
   - Enter it in the OTP input field
   - Format: 6 digits (e.g., 123456)

### Testing Without Email/SMS
1. Start the backend server
2. Watch the console output
3. When OTP is sent, you'll see:
   ```
   📧 REGISTRATION OTP for user@example.com: 123456
   ```
4. Copy the OTP and enter it in the frontend

## Error Handling

### Common Errors

1. **"Invalid or expired OTP"**
   - OTP has expired (10 minutes)
   - OTP was already used
   - Wrong OTP entered
   - Solution: Request a new OTP

2. **"User with this email or phone already exists"**
   - Email or phone is already registered
   - Solution: Use login instead of registration

3. **"No pending registration found"**
   - Registration session expired
   - Solution: Start registration again

4. **"Failed to send OTP"**
   - SMTP/SMS service not configured
   - Network error
   - Solution: Check server console for OTP (development mode)

## Security Features

1. **OTP Expiration:** OTPs expire after 10 minutes
2. **One-time Use:** OTPs can only be used once
3. **Rate Limiting:** OTP requests are rate-limited to prevent abuse
4. **Secure Storage:** Registration data is stored securely until verification
5. **Password Hashing:** Passwords are hashed before storage

## Frontend Components

### Registration Pages
- `frontend/src/pages/Auth/SignUp.tsx` - Main signup page
- `frontend/src/components/AuthPage.tsx` - Unified auth page with tabs

### OTP Input
- OTP input accepts only numeric characters
- Auto-formats to 6 digits
- Shows validation errors
- Has resend functionality

## Backend Implementation

### OTP Storage
- **Primary:** Redis (if configured)
- **Fallback:** In-memory Map (if Redis unavailable)
- **Database:** PhoneOTP table for phone verification

### OTP Generation
- 6-digit random number
- Range: 100000-999999
- Cryptographically secure random generation

## Troubleshooting

### OTP Not Received
1. Check spam folder
2. Check server console (development mode)
3. Verify email/SMS service configuration
4. Use "Resend OTP" button

### Registration Stuck
1. Clear browser cache
2. Check server logs for errors
3. Verify database connection
4. Restart backend server

### Phone OTP Not Working
1. Verify phone number format (10 digits)
2. Check server console for OTP
3. Ensure phone number is in user profile
4. Try resending OTP

## Configuration

### Environment Variables
```env
# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_PORT=587

# SMS (if using Twilio)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Redis (optional, for OTP storage)
REDIS_URL=redis://localhost:6379
```

## Testing Checklist

- [ ] Registration form validation works
- [ ] OTP is sent to email (or logged to console)
- [ ] OTP input accepts 6 digits
- [ ] OTP verification creates user account
- [ ] Resend OTP works
- [ ] Phone OTP works for booking
- [ ] Error messages are clear
- [ ] Development mode shows OTP in console

