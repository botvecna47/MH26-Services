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
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, avatarUrl: true, provider: { select: { businessName: true } } },
        });

        const senderName = sender?.provider?.businessName || sender?.name || 'Someone';

        // Emit to receiver with full message data
        io?.to(`user:${data.receiverId}`).emit('message:new', {
          ...message,
          sender: {
            id: userId,
            name: senderName,
            avatarUrl: sender?.avatarUrl,
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

export default io;

