/**
 * Rate Limiting Middleware
 * Uses Redis for distributed rate limiting
 */
import rateLimit from 'express-rate-limit';

// Note: For production with Redis, install 'rate-limit-redis' package
// For now, using in-memory store (works for single instance)
// TODO: Add Redis store for distributed rate limiting:
// import RedisStore from 'rate-limit-redis';
// import { getRedisClient } from '../config/redis';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // TODO: Add Redis store when rate-limit-redis is installed
  // store: new RedisStore({ client: getRedisClient(), prefix: 'rl:api:' }),
});

/**
 * Strict rate limiter for auth endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for file uploads
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

