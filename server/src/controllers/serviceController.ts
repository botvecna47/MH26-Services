/**
 * Service Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import logger from '../config/logger';

export const serviceController = {
  /**
   * List services
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { providerId, q, page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (providerId) {
        where.providerId = providerId;
      }

      if (q) {
        where.OR = [
          { title: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
        ];
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
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
          },
        }),
        prisma.service.count({ where }),
      ]);

      res.json({
        data: services,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('List services error:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  },

  /**
   * Create service
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { providerId, title, description, price, durationMin } = req.body;

      // Verify provider belongs to user
      const provider = await prisma.provider.findFirst({
        where: {
          id: providerId,
          userId,
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found or unauthorized' });
        return;
      }

      const service = await prisma.service.create({
        data: {
          providerId,
          title,
          description,
          price,
          durationMin,
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

      res.status(201).json(service);
    } catch (error) {
      logger.error('Create service error:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  },

  /**
   * Update service
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, description, price, durationMin } = req.body;

      // Verify service belongs to user's provider
      const service = await prisma.service.findFirst({
        where: {
          id,
          provider: {
            userId,
          },
        },
      });

      if (!service) {
        res.status(404).json({ error: 'Service not found or unauthorized' });
        return;
      }

      const updated = await prisma.service.update({
        where: { id },
        data: {
          title,
          description,
          price,
          durationMin,
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

      res.json(updated);
    } catch (error) {
      logger.error('Update service error:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  },

  /**
   * Delete service
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      // Verify service belongs to user's provider
      const service = await prisma.service.findFirst({
        where: {
          id,
          provider: {
            userId,
          },
        },
      });

      if (!service) {
        res.status(404).json({ error: 'Service not found or unauthorized' });
        return;
      }

      await prisma.service.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete service error:', error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  },
};

