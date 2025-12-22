/**
 * Application Bootstrap
 * Starts Express server and Socket.io
 */
import 'dotenv/config';
import http from 'http';
import app from './app';
import { setupSocketIO } from './socket';
import logger from './config/logger';
import { closeRedisConnection } from './config/redis';
import { config } from './config/env'; // Validation happens on import
import { bookingService } from './services/bookingService';

const PORT = config.port;
const httpServer = http.createServer(app);

// Routes are registered in app.ts

// Setup Socket.io
setupSocketIO(httpServer);

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start scheduled job for booking expiration (every 5 minutes)
  setInterval(async () => {
    try {
      const result = await bookingService.expireStaleBookings();
      if (result.expiredCount > 0) {
        logger.info(`⏰ Auto-expired ${result.expiredCount} stale bookings`);
      }
    } catch (error) {
      logger.error('Booking expiration job failed:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  logger.info('⏰ Booking expiration scheduler started (runs every 5 minutes)');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await closeRedisConnection();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await closeRedisConnection();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

