/**
 * Socket.io Setup
 * Real-time messaging and notifications
 */
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../config/db';
import logger from '../config/logger';

let io: SocketIOServer | null = null;

export function setupSocketIO(httpServer: HTTPServer): void {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // In development, allow all origins
        if (process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }

        const envOrigins = process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
          : [];
        const allowedOrigins = [...envOrigins, 'http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5000'];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Socket.io CORS Blocked: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const payload = verifyAccessToken(token);

      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isBanned: true, // Issue 9 Fix
          provider: {
            select: {
              status: true,
            },
          },
        },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Issue 9 Fix: Block banned users from socket connections
      if (user.isBanned) {
        return next(new Error('Authentication error: Account banned'));
      }

      // Check if provider is suspended (for provider users)
      if (user.role === 'PROVIDER' && user.provider?.status === 'SUSPENDED') {
        return next(new Error('Authentication error: Account suspended'));
      }

      socket.data.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    logger.info(`Socket connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle message sending
    socket.on('message:send', async (data: { conversationId: string; receiverId: string; text: string }) => {
      try {
        // Issue 1 Fix: Replicate REST API authorization in socket handler
        // 1. Check if sender is banned
        const sender = await prisma.user.findUnique({ 
          where: { id: userId },
          select: { isBanned: true, role: true }
        });
        
        if (sender?.isBanned) {
          socket.emit('error', { message: 'Your account is banned. Messaging is disabled.' });
          return;
        }

        // 2. Check receiver exists and get their role
        const receiver = await prisma.user.findUnique({
          where: { id: data.receiverId },
          select: { id: true, role: true }
        });

        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        // 3. Check booking relationship (unless Admin is involved)
        if (sender?.role !== 'ADMIN' && receiver.role !== 'ADMIN') {
          const hasBooking = await prisma.booking.findFirst({
            where: {
              OR: [
                { userId: userId, provider: { userId: data.receiverId } },
                { userId: data.receiverId, provider: { userId: userId } }
              ],
              status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] }
            }
          });

          if (!hasBooking) {
            socket.emit('error', { message: 'You can only message users you have a booking with.' });
            return;
          }
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: userId,
            receiverId: data.receiverId,
            text: data.text,
          },
        });

        // Get sender info for notification
        const senderInfo = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, avatarUrl: true, provider: { select: { businessName: true } } },
        });

        const senderName = senderInfo?.provider?.businessName || senderInfo?.name || 'Someone';

        // Emit to receiver with full message data
        io?.to(`user:${data.receiverId}`).emit('message:new', {
          ...message,
          sender: {
            id: userId,
            name: senderName,
            avatarUrl: senderInfo?.avatarUrl,
          },
        });

        // Also emit notification event
        io?.to(`user:${data.receiverId}`).emit('notification:new', {
          type: 'message',
          payload: {
            title: 'New Message',
            body: `${senderName}: ${data.text.substring(0, 100)}${data.text.length > 100 ? '...' : ''}`,
            messageId: message.id,
            conversationId: data.conversationId,
            senderId: userId,
          },
        });

        // Confirm to sender
        socket.emit('message:sent', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
        logger.error('Socket message error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { conversationId: string; receiverId: string }) => {
      io?.to(`user:${data.receiverId}`).emit('typing:start', {
        conversationId: data.conversationId,
        userId,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string; receiverId: string }) => {
      io?.to(`user:${data.receiverId}`).emit('typing:stop', {
        conversationId: data.conversationId,
        userId,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });
}

/**
 * Emit notification to user
 */
export function emitNotification(userId: string, notification: any): void {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }
}

/**
 * Emit booking update
 */
export function emitBookingUpdate(userId: string, booking: any): void {
  if (io) {
    io.to(`user:${userId}`).emit('booking:update', booking);
  }
}

/**
 * Emit provider approval
 */
export function emitProviderApproval(providerId: string, status: string): void {
  if (io) {
    io.to(`provider:${providerId}`).emit('provider:approval', { providerId, status });
  }
}

export function emitRevenueUpdate(userId: string, totalRevenue: number): void {
  if (io) {
    io.to(`user:${userId}`).emit('revenue:update', { totalRevenue });
  }
}

export function emitWalletUpdate(userId: string, totalSpending: number): void {
  if (io) {
    io.to(`user:${userId}`).emit('wallet:update', { totalSpending });
  }
}

/**
 * Notify user of account status change (banned/suspended)
 * This will trigger the frontend to update the user's status and show appropriate UI
 */
export function emitAccountStatusChange(userId: string, status: 'banned' | 'suspended' | 'unbanned' | 'unsuspended', reason?: string): void {
  if (io) {
    io.to(`user:${userId}`).emit('account:status_changed', { status, reason });
  }
}

export default io;

