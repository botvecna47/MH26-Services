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
        connectionTimeout: 10000, // 10 seconds timeout
        greetingTimeout: 5000,    // 5 seconds greeting timeout
        socketTimeout: 10000,     // 10 seconds socket timeout
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
          logger.error(`\n❌ EMAIL SEND FAILED - OTP for ${options.to}: ${otpMatch[1]}\n`);
          logger.error(`Error details: ${error.message}`);
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
        logger.info(`\n📧 EMAIL OTP for ${options.to}: ${otpMatch[1]}\n`);
        logger.warn('⚠️  Note: SMTP not configured. Email was not actually sent. Check your .env file for SMTP settings.');
      }
    }
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
  
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

/**
 * Send provider credentials email (for admin-created providers)
 */
export async function sendProviderCredentialsEmail(
  email: string, 
  businessName: string, 
  password: string
): Promise<void> {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth`;
  
  await sendEmail({
    to: email,
    subject: 'Welcome to MH26 Services - Your Provider Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">Welcome to MH26 Services!</h2>
        <p>Dear ${businessName},</p>
        <p>Your provider account has been created by our admin team. You can now start offering your services on our platform.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Login Credentials</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <code style="background-color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
        </div>
        
        <p>
          <a href="${loginUrl}" style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Login to Your Account
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          <strong>Important:</strong> Please change your password after your first login for security purposes.
        </p>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>MH26 Services Team</p>
      </div>
    `,
    text: `
Welcome to MH26 Services!

Your provider account has been created.

Login Credentials:
Email: ${email}
Password: ${password}

Login here: ${loginUrl}

Please change your password after your first login.

Best regards,
MH26 Services Team
    `,
  });
}

/**
 * Send provider approval/rejection email
 */
export async function sendProviderApprovalEmail(
  email: string,
  businessName: string,
  approved: boolean,
  reason?: string
): Promise<void> {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth`;
  
  if (approved) {
    await sendEmail({
      to: email,
      subject: '✅ Your Provider Application has been Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations, ${businessName}!</h2>
          <p>Your provider application has been <strong>approved</strong>.</p>
          <p>You can now start accepting bookings and offering your services on MH26 Services.</p>
          
          <p>
            <a href="${loginUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Login to Your Dashboard
            </a>
          </p>
          
          <p>Best regards,<br>MH26 Services Team</p>
        </div>
      `,
      text: `Congratulations! Your provider application has been approved. Login at: ${loginUrl}`,
    });
  } else {
    await sendEmail({
      to: email,
      subject: 'Provider Application Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Application Update</h2>
          <p>Dear ${businessName},</p>
          <p>We regret to inform you that your provider application has been <strong>${reason?.includes('suspend') ? 'suspended' : 'rejected'}</strong>.</p>
          
          ${reason ? `
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          ` : ''}
          
          <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team.</p>
          
          <p>Best regards,<br>MH26 Services Team</p>
        </div>
      `,
      text: `Your provider application status has been updated. ${reason ? `Reason: ${reason}` : ''} Contact support for more information.`,
    });
  }
}
