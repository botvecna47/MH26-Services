/**
 * Appeal Controller
 */
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { emitNotification } from '../socket';
import logger from '../config/logger';

export const appealController = {
  /**
   * Create appeal (provider)
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { type, reason, details } = req.body;

      // Get provider
      const provider = await prisma.provider.findUnique({
        where: { userId },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      // Check if provider is banned/suspended/rejected
      if (provider.status === 'APPROVED') {
        res.status(400).json({ error: 'Provider is already approved' });
        return;
      }

      // Check for existing pending appeal
      const existingAppeal = await prisma.providerAppeal.findFirst({
        where: {
          providerId: provider.id,
          status: 'PENDING',
        },
      });

      if (existingAppeal) {
        res.status(400).json({ error: 'You already have a pending appeal' });
        return;
      }

      // Create appeal
      const appeal = await prisma.providerAppeal.create({
        data: {
          providerId: provider.id,
          type: type || 'OTHER',
          reason,
          details,
          status: 'PENDING',
        },
        include: {
          provider: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      // Notify admins
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      admins.forEach((admin) => {
        emitNotification(admin.id, {
          type: 'appeal_created',
          payload: {
            appealId: appeal.id,
            providerId: provider.id,
            providerName: provider.businessName,
          },
        });
      });

      res.status(201).json(appeal);
    } catch (error) {
      logger.error('Create appeal error:', error);
      res.status(500).json({ error: 'Failed to create appeal' });
    }
  },

  /**
   * List appeals (admin)
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { status, type, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (status) where.status = status;
      if (type) where.type = type;

      const [appeals, total] = await Promise.all([
        prisma.providerAppeal.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            provider: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            reviewer: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.providerAppeal.count({ where }),
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
   * Get appeal by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const appeal = await prisma.providerAppeal.findUnique({
        where: { id },
        include: {
          provider: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              documents: true,
            },
          },
          reviewer: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!appeal) {
        res.status(404).json({ error: 'Appeal not found' });
        return;
      }

      res.json(appeal);
    } catch (error) {
      logger.error('Get appeal error:', error);
      res.status(500).json({ error: 'Failed to fetch appeal' });
    }
  },

  /**
   * Review appeal (admin)
   */
  async review(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user!.id;
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const appeal = await prisma.providerAppeal.findUnique({
        where: { id },
        include: {
          provider: {
            include: {
              user: { select: { id: true } },
            },
          },
        },
      });

      if (!appeal) {
        res.status(404).json({ error: 'Appeal not found' });
        return;
      }

      // Update appeal
      const updated = await prisma.providerAppeal.update({
        where: { id },
        data: {
          status,
          adminNotes,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
        include: {
          provider: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      // If approved, update provider status
      if (status === 'APPROVED') {
        if (appeal.type === 'UNBAN_REQUEST' || appeal.type === 'SUSPENSION_APPEAL') {
          await prisma.provider.update({
            where: { id: appeal.providerId },
            data: { status: 'APPROVED' },
          });
        } else if (appeal.type === 'REJECTION_APPEAL') {
          await prisma.provider.update({
            where: { id: appeal.providerId },
            data: { status: 'PENDING' },
          });
        }

        // Notify provider
        emitNotification(appeal.provider.user.id, {
          type: 'appeal_approved',
          payload: {
            appealId: id,
            message: 'Your appeal has been approved',
          },
        });
      } else if (status === 'REJECTED') {
        // Notify provider
        emitNotification(appeal.provider.user.id, {
          type: 'appeal_rejected',
          payload: {
            appealId: id,
            message: 'Your appeal has been rejected',
            notes: adminNotes,
          },
        });
      }

      res.json(updated);
    } catch (error) {
      logger.error('Review appeal error:', error);
      res.status(500).json({ error: 'Failed to review appeal' });
    }
  },

  /**
   * Get provider's appeals
   */
  async getMyAppeals(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const provider = await prisma.provider.findUnique({
        where: { userId },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      const appeals = await prisma.providerAppeal.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json({ data: appeals });
    } catch (error) {
      logger.error('Get my appeals error:', error);
      res.status(500).json({ error: 'Failed to fetch appeals' });
    }
  },
};

