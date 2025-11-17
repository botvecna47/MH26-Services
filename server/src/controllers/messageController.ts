/**
 * Message Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { emitNotification } from '../socket';
import { sanitizeInput } from '../utils/security';
import logger from '../config/logger';

export const messageController = {
  /**
   * List conversations for current user
   */
  async listConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Get all unique conversation IDs for this user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              avatarUrl: true,
              provider: {
                select: {
                  businessName: true,
                },
              },
            },
          },
          receiver: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              avatarUrl: true,
              provider: {
                select: {
                  businessName: true,
                },
              },
            },
          },
        },
      });

      // Group by conversation (other user)
      const conversationsMap = new Map<string, any>();

      messages.forEach((message) => {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        const otherUserRaw = message.senderId === userId ? message.receiver : message.sender;
        // Use '::' as separator to avoid conflicts with UUID hyphens
        const conversationId = [userId, otherUserId].sort().join('::');

        // Enhance otherUser with businessName if provider
        const otherUser = {
          ...otherUserRaw,
          businessName: otherUserRaw.provider?.businessName || null,
        };

        if (!conversationsMap.has(conversationId)) {
          conversationsMap.set(conversationId, {
            id: conversationId,
            otherUser,
            lastMessage: message,
            unreadCount: 0,
            updatedAt: message.createdAt,
          });
        }

        const conv = conversationsMap.get(conversationId);
        if (message.receiverId === userId && !message.read) {
          conv.unreadCount++;
        }
        if (message.createdAt > conv.updatedAt) {
          conv.lastMessage = message;
          conv.updatedAt = message.createdAt;
        }
      });

      const conversations = Array.from(conversationsMap.values()).sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );

      res.json({ data: conversations });
    } catch (error) {
      logger.error('List conversations error:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params; // conversationId

      // Parse conversation ID to get other user ID
      // Support both '::' (new format) and '-' (old format for backward compatibility)
      let parts: string[];
      if (id.includes('::')) {
        // New format: UUID::UUID
        parts = id.split('::');
      } else {
        // Old format: try to parse UUIDs (36 chars each)
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
        if (id.length === 73) { // 36 + 1 (hyphen) + 36
          const firstUuid = id.substring(0, 36);
          const secondUuid = id.substring(37);
          parts = [firstUuid, secondUuid];
        } else {
          // Fallback: try splitting by '-' and taking first and last UUID-like parts
          const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
          const matches = id.match(uuidPattern);
          if (matches && matches.length === 2) {
            parts = matches;
          } else {
            res.status(400).json({ error: 'Invalid conversation ID format' });
            return;
          }
        }
      }
      
      if (parts.length !== 2) {
        res.status(400).json({ error: 'Invalid conversation ID format' });
        return;
      }
      
      const [user1Id, user2Id] = parts.sort();
      if (user1Id !== userId && user2Id !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const otherUserId = user1Id === userId ? user2Id : user1Id;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          receiver: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          receiverId: userId,
          senderId: otherUserId,
          read: false,
        },
        data: { read: true },
      });

      res.json({ data: messages });
    } catch (error) {
      logger.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  },

  /**
   * Create new conversation (start conversation)
   */
  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { receiverId, text } = req.body;

      if (!receiverId) {
        res.status(400).json({ error: 'Receiver ID is required' });
        return;
      }

      // Verify receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        res.status(404).json({ error: 'Receiver not found' });
        return;
      }

      // Create conversation ID (use :: separator for UUID compatibility)
      const conversationId = [userId, receiverId].sort().join('::');

      // If text provided, create first message
      let message = null;
      if (text) {
        message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            receiverId,
            text,
          },
          include: {
            sender: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            receiver: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        });

        // Create notification in database
        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, provider: { select: { businessName: true } } },
        });

        const senderName = sender?.provider?.businessName || sender?.name || 'Someone';

        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'message',
            payload: {
              title: 'New Message',
              body: `${senderName}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
              messageId: message.id,
              conversationId,
              senderId: userId,
            },
          },
        });

        // Emit notification via Socket.io
        emitNotification(receiverId, {
          type: 'message',
          payload: {
            title: 'New Message',
            body: `${senderName}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
            messageId: message.id,
            conversationId,
            senderId: userId,
          },
        });
      }

      res.status(201).json({
        conversationId,
        message,
      });
    } catch (error) {
      logger.error('Create conversation error:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  },

  /**
   * Send message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { conversationId, receiverId, text, attachments } = req.body;

      if (!receiverId || !text || !text.trim()) {
        res.status(400).json({ error: 'Receiver ID and message text are required' });
        return;
      }

      // Verify receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        res.status(404).json({ error: 'Receiver not found' });
        return;
      }

      // Prevent self-messaging (optional - remove if you want to allow it)
      if (userId === receiverId) {
        res.status(400).json({ error: 'Cannot send message to yourself' });
        return;
      }

      // Sanitize message text
      const sanitizedText = sanitizeInput(text.trim());
      if (!sanitizedText) {
        res.status(400).json({ error: 'Message text cannot be empty after sanitization' });
        return;
      }

      // Create or use conversation ID (using :: separator for UUID compatibility)
      const convId = conversationId || [userId, receiverId].sort().join('::');

      const message = await prisma.message.create({
        data: {
          conversationId: convId,
          senderId: userId,
          receiverId,
          text: sanitizedText,
          attachments: attachments || null,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          receiver: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      // Create notification in database
      try {
        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, provider: { select: { businessName: true } } },
        });

        const senderName = sender?.provider?.businessName || sender?.name || 'Someone';
        const messagePreview = sanitizedText.substring(0, 100) + (sanitizedText.length > 100 ? '...' : '');

        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'message',
            payload: {
              title: 'New Message',
              body: `${senderName}: ${messagePreview}`,
              messageId: message.id,
              conversationId: convId,
              senderId: userId,
            },
          },
        });

        // Emit notification via Socket.io (non-blocking - don't fail if socket is down)
        try {
          emitNotification(receiverId, {
            type: 'message',
            payload: {
              title: 'New Message',
              body: `${senderName}: ${messagePreview}`,
              messageId: message.id,
              conversationId: convId,
              senderId: userId,
            },
          });
        } catch (socketError) {
          // Log but don't fail the request if socket emit fails
          logger.warn('Failed to emit socket notification:', socketError);
        }
      } catch (notificationError) {
        // Log but don't fail the request if notification creation fails
        logger.warn('Failed to create notification:', notificationError);
      }

      res.status(201).json({
        ...message,
        conversationId: convId, // Include conversationId in response for frontend
      });
    } catch (error: any) {
      logger.error('Send message error:', error);
      // Include more details in error response for debugging
      const errorMessage = error?.message || 'Failed to send message';
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
    }
  },

  /**
   * Mark message as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const message = await prisma.message.findUnique({
        where: { id },
      });

      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      if (message.receiverId !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const updated = await prisma.message.update({
        where: { id },
        data: { read: true },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  },
};

