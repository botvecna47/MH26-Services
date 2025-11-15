/**
 * Notification Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import logger from '../config/logger';

export const notificationController = {
  /**
   * List notifications for current user
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { read, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { userId };

      if (read !== undefined) {
        where.read = read === 'true';
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { userId, read: false } }),
      ]);

      res.json({
        data: notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        unreadCount,
      });
    } catch (error) {
      logger.error('List notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      if (notification.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: { read: true },
      });

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      logger.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  },
};

