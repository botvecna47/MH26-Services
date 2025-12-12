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

const PORT = config.port;
const httpServer = http.createServer(app);

// Routes are registered in app.ts

// Setup Socket.io
setupSocketIO(httpServer);

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
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

