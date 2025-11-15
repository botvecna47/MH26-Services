/**
 * Health Check Routes
 * Provides health status and dependency checks
 */
import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import { getRedisClient } from '../config/redis';
import logger from '../config/logger';

const router = Router();

/**
 * Basic health check
 * GET /api/health
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Detailed health check with dependencies
 * GET /api/health/detailed
 */
router.get('/detailed', async (req: Request, res: Response): Promise<void> => {
  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown' as 'connected' | 'disconnected' | 'unknown',
      redis: 'unknown' as 'connected' | 'disconnected' | 'unknown',
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
  } catch (error) {
    logger.error('Database health check failed:', error);
    health.services.database = 'disconnected';
    health.status = 'unhealthy';
  }

  // Check Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    health.services.redis = 'connected';
  } catch (error) {
    logger.warn('Redis health check failed:', error);
    health.services.redis = 'disconnected';
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }

  // Determine overall status
  if (health.services.database === 'disconnected') {
    health.status = 'unhealthy';
  } else if (health.services.redis === 'disconnected') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'unhealthy' ? 503 : health.status === 'degraded' ? 200 : 200;
  res.status(statusCode).json(health);
});

export default router;

