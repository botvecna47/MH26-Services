/**
 * OTP Utility Functions
 */
import { prisma } from '../config/db';
import logger from '../config/logger';

// In-memory fallback for OTP storage (if Redis is unavailable)
const inMemoryOTPStore = new Map<string, { otp: string; registrationData: any; expiresAt: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of inMemoryOTPStore.entries()) {
    if (value.expiresAt < now) {
      inMemoryOTPStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in database
 */
export async function storeOTP(phone: string, otp: string, userId?: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

  // Delete any existing OTPs for this phone
  await prisma.phoneOTP.deleteMany({
    where: { phone },
  });

  // Create new OTP record
  await prisma.phoneOTP.create({
    data: {
      phone,
      code: otp,
      expiresAt,
      userId: userId || null,
    },
  });
}

/**
 * Verify OTP
 */
export async function verifyOTP(phone: string, otp: string): Promise<boolean> {
  const otpRecord = await prisma.phoneOTP.findFirst({
    where: {
      phone,
      code: otp,
      expiresAt: { gt: new Date() },
      verified: false,
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark OTP as verified
  await prisma.phoneOTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return true;
}

/**
 * Send OTP via SMS (placeholder - implement with actual SMS service)
 */
export async function sendOTP(phone: string, otp: string): Promise<void> {
  // TODO: Integrate with SMS service (Twilio, etc.)
  // For now, just log
  logger.info('OTP would be sent via SMS:', {
    phone,
    otp,
    // In production, never log OTPs!
  });

  // Example implementation with Twilio:
  /*
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Your MH26 Services verification code is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
  */

  // For development/testing, you can use console.log
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
  }
}

/**
 * Store email OTP (Redis or in-memory fallback)
 */
export async function storeEmailOTP(email: string, otp: string, registrationData: any): Promise<void> {
  const key = `email_otp:${email}`;
  const expiresIn = 600; // 10 minutes in seconds
  const expiresAt = Date.now() + (expiresIn * 1000); // Convert to milliseconds
  
  try {
    // Try Redis first
    const { getRedisClient } = await import('../config/redis');
    const redis = getRedisClient();
    
    // Test Redis connection with timeout
    try {
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout')), 1000))
      ]);
    } catch (pingError) {
      // If ping fails, Redis is not available, use in-memory
      throw new Error('Redis not available');
    }
    
    await redis.setex(key, expiresIn, JSON.stringify({
      otp,
      registrationData,
      createdAt: new Date().toISOString(),
    }));
    
    logger.debug(`Email OTP stored in Redis for: ${email}`);
  } catch (error: any) {
    // Fallback to in-memory storage if Redis fails
    logger.warn('Redis unavailable, using in-memory storage for OTP:', {
      error: error?.message || 'Unknown error',
      email,
    });
    
    try {
      inMemoryOTPStore.set(key, {
        otp,
        registrationData,
        expiresAt,
      });
      logger.debug(`Email OTP stored in memory for: ${email}`);
    } catch (memoryError: any) {
      logger.error('Failed to store OTP in memory:', memoryError);
      throw new Error('Failed to store OTP. Please try again.');
    }
  }
}

/**
 * Verify email OTP and get registration data
 */
export async function verifyEmailOTP(email: string, otp: string): Promise<any | null> {
  const key = `email_otp:${email}`;
  
  try {
    // Try Redis first
    const { getRedisClient } = await import('../config/redis');
    const redis = getRedisClient();
    
    const data = await redis.get(key);
    if (!data) {
      // Check in-memory fallback
      return verifyFromMemory(key, otp);
    }
    
    const parsed = JSON.parse(data);
    if (parsed.otp !== otp) {
      return null; // Invalid OTP
    }
    
    // Delete OTP after verification
    await redis.del(key);
    
    return parsed.registrationData;
  } catch (error) {
    // Fallback to in-memory storage
    logger.warn('Redis unavailable, checking in-memory storage:', error);
    return verifyFromMemory(key, otp);
  }
}

/**
 * Verify OTP from in-memory storage
 */
function verifyFromMemory(key: string, otp: string): any | null {
  const stored = inMemoryOTPStore.get(key);
  
  if (!stored) {
    return null; // OTP expired or doesn't exist
  }
  
  // Check if expired
  if (stored.expiresAt < Date.now()) {
    inMemoryOTPStore.delete(key);
    return null;
  }
  
  if (stored.otp !== otp) {
    return null; // Invalid OTP
  }
  
  // Delete OTP after verification
  inMemoryOTPStore.delete(key);
  
  return stored.registrationData;
}

/**
 * Send OTP via email
 */
export async function sendEmailOTP(email: string, otp: string): Promise<void> {
  const { sendEmail } = await import('./email');
  
  await sendEmail({
    to: email,
    subject: 'MH26 Services - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">MH26 Services</h2>
        <h3>Email Verification</h3>
        <p>Your verification code is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #ff6b35; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `,
    text: `Your MH26 Services verification code is: ${otp}. This code will expire in 10 minutes.`,
  });
  
  // For development/testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📧 OTP for ${email}: ${otp}\n`);
  }
}

