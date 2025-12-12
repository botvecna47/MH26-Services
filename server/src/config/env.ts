import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

const envSchema = z.object({
  // Core
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  CORS_ORIGIN: z.string().optional(),
  
  // Optional Services
  REDIS_URL: z.string().optional(),
  
  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  
  // Payments (Optional)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  
  // Business Logic
  PLATFORM_FEE_PERCENT: z.string().transform(Number).default('5'),
});

// Validation Logic
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missing = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n  ');
    console.error(`❌ Invalid environment variables:\n  ${missing}`);
    process.exit(1);
  }
  throw error;
}

// Export Centralized Config
export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  db: {
    url: env.DATABASE_URL,
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  business: {
    platformFeePercent: env.PLATFORM_FEE_PERCENT,
  },
  redis: {
    url: env.REDIS_URL,
  },
  email: {
    host: env.SMTP_HOST,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : undefined,
  },
  payment: {
    razorpayKeyId: env.RAZORPAY_KEY_ID,
    razorpayKeySecret: env.RAZORPAY_KEY_SECRET,
  },
};
