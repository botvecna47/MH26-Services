/**
 * Email Utility
 * Priority: Resend API → SMTP (nodemailer) → Console log
 * Resend works on Render free tier (HTTP-based, not blocked)
 */
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import logger from '../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Initialize Resend client if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

/**
 * Send email via Resend API, SMTP, or log fallback
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // Priority 1: Try Resend API (works on Render free tier!)
  if (resend && process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'MH26 Services <onboarding@resend.dev>';
      
      logger.info(`📧 Sending email via Resend to: ${options.to}`);
      
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info(`✅ Email sent via Resend! ID: ${data?.id}`, { to: options.to });
      return; // Success - exit early
    } catch (error: any) {
      logger.error(`❌ Resend failed: ${error.message}`, { to: options.to });
      // Fall through to try SMTP
    }
  }

  // Priority 2: Try SMTP (works locally, blocked on Render free tier)
  const smtpConfigured = 
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (smtpConfigured) {
    try {
      const port = parseInt(process.env.SMTP_PORT || '587');
      const isSecure = port === 465;
      
      logger.info(`📧 Sending email via SMTP: ${process.env.SMTP_HOST}:${port}`);

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });

      await transporter.verify();
      
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });

      logger.info(`✅ Email sent via SMTP! MessageId: ${info.messageId}`);
      return; // Success
    } catch (error: any) {
      logger.error(`❌ SMTP failed: ${error.message}`);
      // Fall through to console log
    }
  }

  // Priority 3: Console log fallback (for development/demo without email config)
  logger.warn('⚠️ No email service configured. Email NOT sent.', {
    to: options.to,
    subject: options.subject,
  });
  
  // Extract and prominently log OTP if present
  if (options.subject.includes('OTP') || options.subject.includes('Verification') || options.subject.includes('verification')) {
    const otpMatch = options.html.match(/>(\d{6})</) || options.text?.match(/(\d{6})/);
    if (otpMatch) {
      logger.info('═══════════════════════════════════════════════════════');
      logger.info(`📧 EMAIL FOR: ${options.to}`);
      logger.info(`📋 SUBJECT: ${options.subject}`);
      logger.info(`🔐 OTP CODE: ${otpMatch[1]}`);
      logger.info('═══════════════════════════════════════════════════════');
    }
  }
  
  // Log password for credential emails
  if (options.subject.includes('Provider Account') || options.subject.includes('Credentials')) {
    const passwordMatch = options.html.match(/Password:<\/strong>\s*<code[^>]*>([^<]+)<\/code>/);
    if (passwordMatch) {
      logger.info('═══════════════════════════════════════════════════════');
      logger.info(`📧 CREDENTIALS FOR: ${options.to}`);
      logger.info(`🔑 PASSWORD: ${passwordMatch[1]}`);
      logger.info('═══════════════════════════════════════════════════════');
    }
  }

  // Log booking confirmation/cancellation emails (for Render where SMTP is blocked)
  if (options.subject.includes('Booking') || options.subject.includes('Confirmed') || options.subject.includes('Cancelled')) {
    logger.info('═══════════════════════════════════════════════════════');
    logger.info(`📧 BOOKING EMAIL FOR: ${options.to}`);
    logger.info(`📋 SUBJECT: ${options.subject}`);
    logger.info(`📝 CONTENT: ${options.text || 'See HTML version'}`);
    logger.info('═══════════════════════════════════════════════════════');
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // Default to FRONTEND URL (5173), not backend
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${encodeURIComponent(token)}`;
  
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
  // Reset password page is also on frontend
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${encodeURIComponent(token)}`;
  
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

/**
 * Send booking confirmation email to customer
 */
export async function sendBookingConfirmationToCustomer(
  email: string,
  customerName: string,
  providerName: string,
  serviceName: string,
  scheduledAt: Date,
  address: string,
  totalAmount: number
): Promise<void> {
  const formattedDate = scheduledAt.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await sendEmail({
    to: email,
    subject: '✅ Booking Confirmed - MH26 Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Booking Confirmed!</h2>
        <p>Dear ${customerName},</p>
        <p>Great news! Your booking has been <strong>confirmed</strong> by the provider.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ff6b35;">Booking Details</h3>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Provider:</strong> ${providerName}</p>
          <p><strong>Scheduled:</strong> ${formattedDate}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Amount:</strong> ₹${totalAmount}</p>
        </div>
        
        <p>The provider will arrive at the scheduled time. Please ensure someone is available at the address.</p>
        
        <p>Best regards,<br>MH26 Services Team</p>
      </div>
    `,
    text: `Booking Confirmed! Service: ${serviceName}, Provider: ${providerName}, Scheduled: ${formattedDate}, Amount: ₹${totalAmount}`,
  });
}

/**
 * Send booking confirmation email to provider
 */
export async function sendBookingConfirmationToProvider(
  email: string,
  providerName: string,
  customerName: string,
  customerPhone: string,
  serviceName: string,
  scheduledAt: Date,
  address: string,
  totalAmount: number
): Promise<void> {
  const formattedDate = scheduledAt.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await sendEmail({
    to: email,
    subject: '📋 New Booking Confirmed - MH26 Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">New Booking Confirmed!</h2>
        <p>Dear ${providerName},</p>
        <p>You have a new confirmed booking. Please be ready to provide the service at the scheduled time.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ff6b35;">Booking Details</h3>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          <p><strong>Scheduled:</strong> ${formattedDate}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Your Earnings:</strong> ₹${totalAmount}</p>
        </div>
        
        <p style="color: #666;">Remember to mark the service as complete and collect the OTP from the customer after finishing.</p>
        
        <p>Best regards,<br>MH26 Services Team</p>
      </div>
    `,
    text: `New Booking Confirmed! Customer: ${customerName}, Phone: ${customerPhone}, Service: ${serviceName}, Scheduled: ${formattedDate}, Address: ${address}`,
  });
}

/**
 * Send booking cancellation email to provider
 */
export async function sendBookingCancellationToProvider(
  email: string,
  providerName: string,
  customerName: string,
  serviceName: string,
  scheduledAt: Date,
  reason?: string
): Promise<void> {
  const formattedDate = scheduledAt.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await sendEmail({
    to: email,
    subject: '❌ Booking Cancelled - MH26 Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Booking Cancelled</h2>
        <p>Dear ${providerName},</p>
        <p>A booking has been <strong>cancelled</strong> by the customer.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0;">Cancelled Booking</h3>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Was Scheduled:</strong> ${formattedDate}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p>This time slot is now available for other bookings.</p>
        
        <p>Best regards,<br>MH26 Services Team</p>
      </div>
    `,
    text: `Booking Cancelled. Customer: ${customerName}, Service: ${serviceName}, Was Scheduled: ${formattedDate}${reason ? `, Reason: ${reason}` : ''}`,
  });
}

/**
 * Send ban notification email with formal language and appeal instructions
 */
export async function sendBanNotificationEmail(
  email: string,
  userName: string,
  banReason: string
): Promise<void> {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth`;
  
  await sendEmail({
    to: email,
    subject: '⚠️ Account Suspension Notice - MH26 Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Account Suspension Notice</h1>
        </div>
        
        <div style="padding: 30px; background-color: #fff;">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <p>We regret to inform you that your MH26 Services account has been <strong>suspended</strong> due to a violation of our platform policies.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">Reason for Suspension</h3>
            <p style="margin-bottom: 0;">${banReason}</p>
          </div>
          
          <p>While your account is suspended, you will not be able to:</p>
          <ul>
            <li>Access your dashboard</li>
            <li>Make or receive bookings</li>
            <li>Use messaging features</li>
            <li>Access any platform services</li>
          </ul>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0284c7;">How to Appeal This Decision</h3>
            <p>If you believe this suspension was made in error or you wish to have your account reinstated, please follow these steps:</p>
            <ol style="margin-bottom: 0;">
              <li><strong>Log in to your account</strong> - You will see the banned page with an appeal form</li>
              <li><strong>Submit an appeal</strong> - Provide a detailed explanation of why you believe your account should be reinstated</li>
              <li><strong>Wait for review</strong> - Our admin team will review your appeal within 3-5 business days</li>
              <li><strong>Receive decision</strong> - You will be notified via email about the outcome of your appeal</li>
            </ol>
          </div>
          
          <div style="background-color: #450a0a; color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <h3 style="margin-top: 0; color: #fca5a5;">⚠️ CRITICAL: 30-DAY DEADLINE ⚠️</h3>
            <p style="font-size: 16px; margin-bottom: 10px;">
              Your account and <strong>ALL associated data</strong> will be <strong>PERMANENTLY DELETED</strong> 
              after <strong>30 days</strong> from the date of suspension.
            </p>
            <p style="margin-bottom: 0; font-size: 14px; color: #fca5a5;">
              To prevent data loss, submit your appeal as soon as possible. This action is irreversible.
            </p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              🚨 Submit Appeal Now
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong> Please ensure your appeal is respectful and provides factual information. 
            False or misleading appeals may result in permanent suspension.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px;">
            If you have any questions, please contact our support team at support@mh26services.com.<br>
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} MH26 Services. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Nanded, Maharashtra, India</p>
        </div>
      </div>
    `,
    text: `
Account Suspension Notice

Dear ${userName},

Your MH26 Services account has been suspended.

REASON: ${banReason}

While suspended, you cannot:
- Access your dashboard
- Make or receive bookings
- Use messaging features
- Access any platform services

⚠️ CRITICAL: 30-DAY DEADLINE ⚠️
Your account and ALL associated data will be PERMANENTLY DELETED after 30 days from the date of suspension.
To prevent data loss, submit your appeal as soon as possible. This action is irreversible.

HOW TO APPEAL:
1. Log in to your account at ${loginUrl}
2. You will see the banned page with an appeal form
3. Submit a detailed appeal explaining why your account should be reinstated
4. Wait 3-5 business days for admin review
5. You will receive an email with the outcome

ACT NOW: Submit your appeal before time runs out!

If you have questions, contact support@mh26services.com

MH26 Services Team
    `,
  });
}
