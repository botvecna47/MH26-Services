import { prisma } from '../config/db';
import logger from '../config/logger';
import { sendEmail } from '../utils/email';
import { AppError } from '../middleware/errorHandler';

// In-memory fallback for OTP storage
const inMemoryOTPStore = new Map<string, { otp: string; data: any; expiresAt: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of inMemoryOTPStore.entries()) {
    if (value.expiresAt < now) {
      inMemoryOTPStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export class OTPService {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP (Redis with Memory Fallback)
   * @param identifier Email or Phone
   * @param otp The OTP code
   * @param data Additional data to store (e.g., registration details)
   * @param ttlSeconds Time to live in seconds (default 10 mins)
   */
  static async storeOTP(identifier: string, otp: string, data: any = {}, ttlSeconds: number = 600): Promise<void> {
    const key = `otp:${identifier}`;
    const expiresAt = Date.now() + (ttlSeconds * 1000);

    try {
      // Try Redis first
      const { getRedisClient } = await import('../config/redis');
      const redis = getRedisClient();
      
      // Quick ping check
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 500))
      ]);

      await redis.setex(key, ttlSeconds, JSON.stringify({
        otp,
        data,
        createdAt: new Date().toISOString(),
      }));
      
      logger.debug(`OTP stored in Redis for: ${identifier}`);
    } catch (error) {
      // Fallback to memory
      logger.warn(`Redis unavailable for OTP storage, using memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
      inMemoryOTPStore.set(key, { otp, data, expiresAt });
    }
  }

  /**
   * Verify OTP
   * @returns The stored data if valid, null otherwise
   */
  static async verifyOTP(identifier: string, otp: string): Promise<any | null> {
    const key = `otp:${identifier}`;

    try {
      // Try Redis
      const { getRedisClient } = await import('../config/redis');
      const redis = getRedisClient();
      
      const stored = await redis.get(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.otp === otp) {
          await redis.del(key); // Consume OTP
          return parsed.data;
        }
        return null;
      }
    } catch (error) {
      // Redis failed, check memory
    }

    // Check memory
    const memoryStored = inMemoryOTPStore.get(key);
    if (memoryStored) {
      if (memoryStored.expiresAt < Date.now()) {
        inMemoryOTPStore.delete(key);
        return null;
      }
      if (memoryStored.otp === otp) {
        inMemoryOTPStore.delete(key); // Consume OTP
        return memoryStored.data;
      }
    }

    return null;
  }

  /**
   * Send OTP via SMS
   */
  /**
   * Send OTP via SMS
   */
  static async sendSMS(phone: string, otp: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[DEV] SMS to ${phone}: ${otp}`);
    }

    const hasTwilioCreds = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
    
    if (hasTwilioCreds) {
      try {
        logger.info(`Attempting to send SMS via Twilio to ${phone}`);
        const { Twilio } = await import('twilio');
        // Initialize with Account SID and Auth Token
        const client = new Twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // Format number for Twilio (E.164)
        // Assume India (+91) for 10-digit numbers
        let formattedPhone = phone;
        if (/^\d{10}$/.test(phone)) {
          formattedPhone = `+91${phone}`;
        }

        await client.messages.create({
          body: `Your MH26 Services verification code is: ${otp}`,
          from: process.env.TWILIO_FROM_NUMBER,
          to: formattedPhone
        });
        
        logger.info(`SMS sent to ${formattedPhone} via Twilio`);
      } catch (error: any) {
        logger.error(`Failed to send SMS to ${phone} via Twilio`, {
          message: error.message,
          code: error.code,
          moreInfo: error.moreInfo
        });
        
        // If it's a trial account error (21608), inform the user
        if (error.code === 21608) {
          logger.warn('Twilio Trial Account: Destination number not verified.');
        }

        // Don't throw if we want to fallback to just logging (or throw if strict)
        // For now, we log error but don't crash the request if dev mode is on
        if (process.env.NODE_ENV === 'production') {
          throw new AppError('Failed to send SMS', 500);
        }
      }
    } else {
      logger.warn('Twilio credentials missing. SMS not sent (check .env). Falling back to console log.');
      logger.debug('Twilio Config Status:', {
        hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        hasFromNumber: !!process.env.TWILIO_FROM_NUMBER
      });
    }
  }

  /**
   * Send OTP via Email
   */
  static async sendEmail(email: string, otp: string): Promise<void> {
    // Development logging
    if (process.env.NODE_ENV !== 'production') {
      logger.info('------------------------------------------------');
      logger.info(`📧 [DEV MODE] Email OTP for ${email}: ${otp}`);
      logger.info('------------------------------------------------');
    }

    try {
      await sendEmail({
        to: email,
        subject: 'MH26 Services - Verification Code',
        html: `
          <div style="font-family: sans-serif; padding: 20px; text-align: center;">
            <h2>Verification Code</h2>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
        text: `Your verification code is: ${otp}`,
      });
    } catch (error) {
      logger.error(`Failed to send email to ${email}`, error);
      // We don't throw here to allow the flow to continue if in dev mode (user can see console)
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }
}
