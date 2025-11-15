/**
 * Environment Variable Validation
 * Validates all required environment variables on application startup
 * Exits gracefully with clear error messages if validation fails
 */
import { z } from 'zod';
import logger from './logger';

// Define environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT Secrets
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  // Optional but recommended
  REDIS_URL: z.string().url().optional(),
  
  // AWS S3 (required if using file uploads)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().optional(),
  
  // Email Service (required if using email)
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  
  // Payment Gateway (required if using payments)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  CORS_ORIGIN: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * @throws Error if validation fails
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation logic
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check if S3 is configured (all or nothing)
    const s3Vars = [
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
      process.env.AWS_S3_BUCKET,
    ];
    const s3Configured = s3Vars.every(v => v);
    const s3Partial = s3Vars.some(v => v);
    
    if (s3Partial && !s3Configured) {
      errors.push('S3 configuration is incomplete. Provide all of: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET');
    }
    
    // Check if email is configured (all or nothing)
    const emailVars = [
      process.env.SMTP_HOST,
      process.env.SMTP_USER,
      process.env.SMTP_PASS,
    ];
    const emailConfigured = emailVars.every(v => v);
    const emailPartial = emailVars.some(v => v);
    
    if (emailPartial && !emailConfigured) {
      errors.push('Email configuration is incomplete. Provide all of: SMTP_HOST, SMTP_USER, SMTP_PASS');
    }
    
    // Check if payment gateway is configured (all or nothing)
    const paymentVars = [
      process.env.RAZORPAY_KEY_ID,
      process.env.RAZORPAY_KEY_SECRET,
    ];
    const paymentConfigured = paymentVars.every(v => v);
    const paymentPartial = paymentVars.some(v => v);
    
    if (paymentPartial && !paymentConfigured) {
      warnings.push('Payment gateway configuration is incomplete. Provide both: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET');
    }
    
    // Check Redis (warning if not configured in production)
    if (env.NODE_ENV === 'production' && !env.REDIS_URL) {
      warnings.push('REDIS_URL is not configured. Rate limiting will use in-memory store (not recommended for production)');
    }
    
    // Log warnings
    if (warnings.length > 0) {
      logger.warn('Environment variable warnings:');
      warnings.forEach(warning => logger.warn(`  - ${warning}`));
    }
    
    // Throw errors
    if (errors.length > 0) {
      logger.error('Environment variable validation failed:');
      errors.forEach(error => logger.error(`  - ${error}`));
      throw new Error(`Environment validation failed: ${errors.join('; ')}`);
    }
    
    logger.info('✅ Environment variables validated successfully');
    
    // Log configuration status
    logger.info('Configuration status:', {
      database: '✅',
      jwt: '✅',
      redis: env.REDIS_URL ? '✅' : '⚠️',
      s3: s3Configured ? '✅' : '❌',
      email: emailConfigured ? '✅' : '❌',
      payment: paymentConfigured ? '✅' : '❌',
    });
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      logger.error('❌ Environment variable validation failed:');
      missingVars.forEach(msg => logger.error(`  - ${msg}`));
      logger.error('\nPlease check your .env file and ensure all required variables are set.');
      process.exit(1);
    }
    throw error;
  }
}

// Export validated env (will be called in index.ts)
export default validateEnv;

