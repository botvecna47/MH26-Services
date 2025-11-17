/**
 * Redis Client Configuration
 * Used for rate limiting, caching, and session management
 */
import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        // Don't retry if Redis is not available
        if (times > 3) {
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 1, // Reduce retries to fail fast
      lazyConnect: true, // Don't connect immediately
      enableOfflineQueue: false, // Don't queue commands when offline
    });

    redisClient.on('error', (err) => {
      console.warn('Redis Client Error (will use in-memory fallback):', err.message);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    // Try to connect, but don't throw if it fails
    redisClient.connect().catch((err) => {
      console.warn('Redis connection failed (will use in-memory fallback):', err.message);
    });
  }

  return redisClient;
}

export function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    return redisClient.quit();
  }
  return Promise.resolve();
}

export default getRedisClient;

