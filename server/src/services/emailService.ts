/**
 * Email Service
 * Handles all email sending functionality
 */
import nodemailer from 'nodemailer';
import logger from '../config/logger';

// Create transporter (configure based on environment)
const createTransporter = () => {
  // In production, use SMTP service (SendGrid, etc.)
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // In development, use console logging
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

const transporter = createTransporter();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@mh26services.com',
        ...options,
      });
      logger.info('Email sent successfully', { to: options.to, subject: options.subject });
    } else {
      // In development, just log
      logger.info('Email would be sent:', {
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    }
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your MH26 Services account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Verify your email address</h2>
        <p>Thank you for signing up for MH26 Services!</p>
        <p>Please click the link below to verify your email address:</p>
        <p style="margin: 20px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
    text: `Verify your email: ${verificationUrl}`,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your MH26 Services password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Password Reset Request</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" 
             style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

/**
 * Send provider approval notification
 */
export async function sendProviderApprovalEmail(email: string, businessName: string, approved: boolean, reason?: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: approved ? 'Your provider application has been approved!' : 'Provider application update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Provider Application ${approved ? 'Approved' : 'Update'}</h2>
        <p>Hello,</p>
        <p>Your provider application for <strong>${businessName}</strong> has been ${approved ? 'approved' : 'reviewed'}.</p>
        ${approved ? (
          '<p style="color: #22c55e; font-weight: bold;">Congratulations! You can now start accepting bookings.</p>'
        ) : (
          `<p style="color: #ef4444;">Unfortunately, your application was not approved at this time.</p>
           ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}`
        )}
        <p style="margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            View Dashboard
          </a>
        </p>
      </div>
    `,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  email: string,
  bookingDetails: {
    bookingId: string;
    providerName: string;
    serviceName: string;
    scheduledAt: Date;
    totalAmount: number;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Booking Confirmed - MH26 Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Booking Confirmed!</h2>
        <p>Your booking has been confirmed.</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Provider:</strong> ${bookingDetails.providerName}</p>
          <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
          <p><strong>Scheduled At:</strong> ${new Date(bookingDetails.scheduledAt).toLocaleString()}</p>
          <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</p>
        </div>
        <p style="margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            View Booking
          </a>
        </p>
      </div>
    `,
  });
}

