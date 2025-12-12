/**
 * Appeal Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const appealController = {
  /**
   * Create an appeal
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { type, reason, details, providerId } = req.body;

      // Check if there's already a pending appeal
      const existingAppeal = await prisma.appeal.findFirst({
        where: {
          userId,
          status: 'PENDING',
        },
      });

      if (existingAppeal) {
        res.status(400).json({ error: 'You already have a pending appeal' });
        return;
      }

      const appeal = await prisma.appeal.create({
        data: {
          userId,
          providerId, // Optional, if appealing for a provider profile
          type,
          reason,
          details,
          status: 'PENDING',
        },
      });

      res.status(201).json(appeal);
    } catch (error) {
      logger.error('Create appeal error:', error);
      res.status(500).json({ error: 'Failed to create appeal' });
    }
  },

  /**
   * List appeals (Admin only)
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, type, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;

      const [appeals, total] = await Promise.all([
        prisma.appeal.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, isBanned: true },
            },
            provider: {
              select: { id: true, businessName: true, status: true },
            },
            reviewer: {
              select: { id: true, name: true },
            },
          },
        }),
        prisma.appeal.count({ where }),
      ]);

      res.json({
        data: appeals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('List appeals error:', error);
      res.status(500).json({ error: 'Failed to fetch appeals' });
    }
  },

  /**
   * List my appeals (User)
   */
  async listMine(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.user!.id;
        const appeals = await prisma.appeal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                reason: true,
                status: true,
                details: true,
                createdAt: true,
                adminNotes: true
            }
        });
        res.json(appeals);
    } catch (error) {
        logger.error('List my appeals error:', error);
        res.status(500).json({ error: 'Failed to fetch your appeals' });
    }
  },

  /**
   * Get appeal by ID
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const appeal = await prisma.appeal.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, isBanned: true },
          },
          provider: {
            include: { services: true },
          },
          reviewer: {
            select: { id: true, name: true },
          },
        },
      });

      if (!appeal) {
        res.status(404).json({ error: 'Appeal not found' });
        return;
      }

      // Check authorization
      if (userRole !== 'ADMIN' && appeal.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      res.json(appeal);
    } catch (error) {
      logger.error('Get appeal error:', error);
      res.status(500).json({ error: 'Failed to fetch appeal' });
    }
  },

  /**
   * Resolve appeal (Admin only)
   */
  async resolve(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const reviewerId = req.user!.id;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const appeal = await prisma.appeal.findUnique({
        where: { id },
      });

      if (!appeal) {
        res.status(404).json({ error: 'Appeal not found' });
        return;
      }

      // Update appeal
      const updatedAppeal = await prisma.appeal.update({
        where: { id },
        data: {
          status,
          adminNotes,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      // Handle unban logic if approved
      if (status === 'APPROVED') {
        if (appeal.type === 'UNBAN_REQUEST' && appeal.userId) {
          // Unban user
          await prisma.user.update({
            where: { id: appeal.userId },
            data: { isBanned: false },
          });
        }
        
        if (appeal.type === 'SUSPENSION_APPEAL' && appeal.providerId) {
          // Unsuspend provider
          await prisma.provider.update({
            where: { id: appeal.providerId },
            data: { status: 'APPROVED' },
          });
        }
      }

      // Send notification (optional, if we had a notification system for this)
      // For now, just return the updated appeal

      res.json(updatedAppeal);
    } catch (error) {
      logger.error('Resolve appeal error:', error);
      res.status(500).json({ error: 'Failed to resolve appeal' });
    }
  },
};
