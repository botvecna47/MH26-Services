/**
 * Report Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { emitNotification } from '../socket';
import logger from '../config/logger';

export const reportController = {
  /**
   * Create report
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id: providerId } = req.params;
      const { reason, details } = req.body;

      // Verify provider exists
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
          user: { select: { id: true } },
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      // Check if user already reported this provider
      const existingReport = await prisma.report.findFirst({
        where: {
          reporterId: userId,
          providerId,
          status: 'OPEN',
        },
      });

      if (existingReport) {
        res.status(400).json({ error: 'You have already reported this provider' });
        return;
      }

      // Create report
      const report = await prisma.report.create({
        data: {
          reporterId: userId,
          providerId,
          reason,
          details,
          status: 'OPEN',
        },
        include: {
          reporter: {
            select: { id: true, name: true, email: true },
          },
          provider: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      // Notify admin users
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      admins.forEach((admin) => {
        emitNotification(admin.id, {
          type: 'report',
          payload: { reportId: report.id, providerId },
        });
      });

      res.status(201).json(report);
    } catch (error) {
      logger.error('Create report error:', error);
      res.status(500).json({ error: 'Failed to create report' });
    }
  },

  /**
   * List reports (admin only)
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (status) {
        where.status = status;
      }

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            reporter: {
              select: { id: true, name: true, email: true },
            },
            provider: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        }),
        prisma.report.count({ where }),
      ]);

      res.json({
        data: reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('List reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  },

  /**
   * Update report status (admin only)
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const updated = await prisma.report.update({
        where: { id },
        data: {
          status,
          // Store admin notes in details if needed
          details: adminNotes ? `${report.details}\n\n[Admin Notes]: ${adminNotes}` : report.details,
        },
        include: {
          reporter: {
            select: { id: true, name: true, email: true },
          },
          provider: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      // Notify reporter
      emitNotification(report.reporterId, {
        type: 'report_status',
        payload: { reportId: report.id, status },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Update report error:', error);
      res.status(500).json({ error: 'Failed to update report' });
    }
  },
};

