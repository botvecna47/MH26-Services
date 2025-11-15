/**
 * OTP Utility Functions
 */
import { prisma } from '../config/db';
import logger from '../config/logger';

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
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
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

