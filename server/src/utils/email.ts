/**
 * Email Utility
 * Sends emails via SMTP (nodemailer) or logs in development
 */
import nodemailer from 'nodemailer';
import logger from '../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via SMTP or log in development
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Check if SMTP is configured
  const smtpConfigured = 
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (smtpConfigured) {
    // Send actual email if SMTP is configured (works in both development and production)
    try {
      const port = parseInt(process.env.SMTP_PORT || '587');
      const isSecure = port === 465;
      
      logger.info(`Attempting to send email via SMTP: ${process.env.SMTP_HOST}:${port}`, {
        to: options.to,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        secure: isSecure,
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: isSecure, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // For Gmail, we might need these options
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates (for development)
        },
      });

      // Verify transporter configuration
      await transporter.verify();
      logger.info('SMTP connection verified successfully');

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const info = await transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to: ${options.to}`, {
        messageId: info.messageId,
        response: info.response,
      });
    } catch (error: any) {
      logger.error('Failed to send email:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack,
      });
      
      // Log OTP to console as fallback for debugging
      if (options.subject.includes('OTP') || options.subject.includes('verification')) {
        const otpMatch = options.html.match(/>(\d{6})</) || options.text?.match(/(\d{6})/);
        if (otpMatch) {
          console.error(`\n❌ EMAIL SEND FAILED - OTP for ${options.to}: ${otpMatch[1]}\n`);
          console.error('Error details:', error.message);
        }
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } else {
    // If SMTP not configured, log the email
    logger.warn('SMTP not configured - email will not be sent. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS to send emails.', {
      to: options.to,
      subject: options.subject,
    });
    
    // Log OTP in console for easy testing
    if (options.subject.includes('OTP') || options.subject.includes('verification')) {
      const otpMatch = options.html.match(/>(\d{6})</) || options.text?.match(/(\d{6})/);
      if (otpMatch) {
        console.log(`\n📧 EMAIL OTP for ${options.to}: ${otpMatch[1]}\n`);
        console.log('⚠️  Note: SMTP not configured. Email was not actually sent. Check your .env file for SMTP settings.');
      }
    }
  }
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

