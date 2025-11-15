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
import { validateEnv } from './config/validateEnv';

// Validate environment variables before starting
validateEnv();

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

// Import routes
import authRoutes from './routes/auth';
import providerRoutes from './routes/providers';
import bookingRoutes from './routes/bookings';
import serviceRoutes from './routes/services';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import reviewRoutes from './routes/reviews';
import reportRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import userRoutes from './routes/users';
import healthRoutes from './routes/health';
import appealRoutes from './routes/appeals';
// TODO: Import other routes as they are created
// import paymentRoutes from './routes/payments';

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/appeals', appealRoutes);
// TODO: Register other routes
// app.use('/api/payments', paymentRoutes);

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

