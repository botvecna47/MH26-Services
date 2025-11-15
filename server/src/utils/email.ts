/**
 * Email Utility (Placeholder)
 * TODO: Integrate with SMTP service (SendGrid, AWS SES, etc.)
 */
import logger from '../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email (placeholder - implement with actual SMTP service)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Implement actual email sending
  // For now, just log
  logger.info('Email would be sent:', {
    to: options.to,
    subject: options.subject,
  });

  // Example implementation with nodemailer:
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    ...options,
  });
  */
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.API_BASE_URL}/api/auth/verify-email?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Verify your MH26 Services account',
    html: `
      <h2>Verify your email address</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
    text: `Verify your email: ${verificationUrl}`,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.API_BASE_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Reset your MH26 Services password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

