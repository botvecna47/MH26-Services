/**
 * Admin Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { emitNotification, emitProviderApproval } from '../socket';
import logger from '../config/logger';

export const adminController = {
  /**
   * Get analytics dashboard data
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        totalProviders,
        pendingProviders,
        totalBookings,
        completedBookings,
        totalRevenue,
        recentBookings,
        topProviders,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.provider.count({ where: { status: 'APPROVED' } }),
        prisma.provider.count({ where: { status: 'PENDING' } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'COMPLETED' } }),
        prisma.transaction.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        prisma.booking.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true } },
            provider: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        }),
        prisma.provider.findMany({
          where: { status: 'APPROVED' },
          take: 10,
          orderBy: { averageRating: 'desc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        }),
      ]);

      res.json({
        stats: {
          totalUsers,
          totalProviders,
          pendingProviders,
          totalBookings,
          completedBookings,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        recentBookings,
        topProviders,
      });
    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  /**
   * Get pending providers
   */
  async getPendingProviders(req: Request, res: Response): Promise<void> {
    try {
      const providers = await prisma.provider.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
          },
          documents: true,
          services: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ data: providers });
    } catch (error) {
      logger.error('Get pending providers error:', error);
      res.status(500).json({ error: 'Failed to fetch pending providers' });
    }
  },

  /**
   * Get all providers (for admin panel)
   */
  async getAllProviders(req: Request, res: Response): Promise<void> {
    try {
      const { status, page = 1, limit = 50 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (status && status !== 'all') {
        where.status = status;
      }

      const [providers, total] = await Promise.all([
        prisma.provider.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
            },
            services: {
              take: 3,
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.provider.count({ where }),
      ]);

      res.json({
        data: providers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Get all providers error:', error);
      res.status(500).json({ error: 'Failed to fetch providers' });
    }
  },

  /**
   * Approve provider
   */
  async approveProvider(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: { select: { id: true } },
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      const updated = await prisma.provider.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          documents: true,
        },
      });

      // Emit socket event
      emitProviderApproval(id, 'APPROVED');

      // Notify provider
      emitNotification(provider.userId, {
        type: 'provider_approval',
        payload: { providerId: id, status: 'APPROVED' },
      });

      // Send email notification
      await sendProviderApprovalEmail(
        updated.user.email,
        updated.businessName,
        true
      );

      res.json(updated);
    } catch (error) {
      logger.error('Approve provider error:', error);
      res.status(500).json({ error: 'Failed to approve provider' });
    }
  },

  /**
   * Reject provider
   */
  async rejectProvider(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: { select: { id: true } },
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      const updated = await prisma.provider.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Emit socket event
      emitProviderApproval(id, 'REJECTED');

      // Notify provider
      emitNotification(provider.userId, {
        type: 'provider_approval',
        payload: { providerId: id, status: 'REJECTED', reason },
      });

      // Send email notification
      await sendProviderApprovalEmail(
        updated.user.email,
        updated.businessName,
        false,
        reason
      );

      res.json(updated);
    } catch (error) {
      logger.error('Reject provider error:', error);
      res.status(500).json({ error: 'Failed to reject provider' });
    }
  },

  /**
   * Suspend provider
   */
  async suspendProvider(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: { select: { id: true } },
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      const updated = await prisma.provider.update({
        where: { id },
        data: { status: 'SUSPENDED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Emit socket event
      emitProviderApproval(id, 'SUSPENDED');

      // Notify provider
      emitNotification(provider.userId, {
        type: 'provider_suspended',
        payload: { providerId: id, status: 'SUSPENDED' },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Suspend provider error:', error);
      res.status(500).json({ error: 'Failed to suspend provider' });
    }
  },

  /**
   * Unsuspend provider
   */
  async unsuspendProvider(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: { select: { id: true } },
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      if (provider.status !== 'SUSPENDED') {
        res.status(400).json({ error: 'Provider is not suspended' });
        return;
      }

      const updated = await prisma.provider.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Emit socket event
      emitProviderApproval(id, 'APPROVED');

      // Notify provider
      emitNotification(provider.userId, {
        type: 'provider_unsuspended',
        payload: { providerId: id, status: 'APPROVED' },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Unsuspend provider error:', error);
      res.status(500).json({ error: 'Failed to unsuspend provider' });
    }
  },

  /**
   * List users
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            provider: {
              select: {
                id: true,
                businessName: true,
                status: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('List users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  /**
   * Get user by ID
   */
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          provider: {
            include: {
              services: true,
              documents: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              reports: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  /**
   * Ban user
   */
  async banUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          provider: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Prevent banning admins
      if (user.role === 'ADMIN') {
        res.status(403).json({ error: 'Cannot ban admin users' });
        return;
      }

      // Suspend provider if they have one
      if (user.provider) {
        await prisma.provider.update({
          where: { id: user.provider.id },
          data: { status: 'SUSPENDED' },
        });
      }

      // Revoke all refresh tokens (force logout)
      await prisma.refreshToken.updateMany({
        where: {
          userId: id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Notify user
      emitNotification(id, {
        type: 'account_suspended',
        payload: { reason: reason || 'Your account has been suspended by an administrator' },
      });

      // Log admin action
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'BAN_USER',
          tableName: 'User',
          recordId: id,
          newData: { reason, bannedAt: new Date() },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });

      res.json({ message: 'User banned successfully' });
    } catch (error) {
      logger.error('Ban user error:', error);
      res.status(500).json({ error: 'Failed to ban user' });
    }
  },

  /**
   * Get reports (admin view)
   */
  async getReports(req: Request, res: Response): Promise<void> {
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
      logger.error('Get reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  },

  /**
   * Update settings
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implement settings storage (could be a Settings model or env vars)
      const settings = req.body;

      // For now, just return success
      // In production, store settings in database
      res.json({ message: 'Settings updated', settings });
    } catch (error) {
      logger.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  },

  /**
   * Export providers
   */
  async exportProviders(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'json' } = req.query;

      const providers = await prisma.provider.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          services: true,
        },
      });

      if (format === 'csv') {
        // CSV export implementation
        const csvHeader = 'Business Name,Email,Phone,Category,City,Status,Rating\n';
        const csvRows = providers.map((p: any) => 
          `"${p.businessName}","${p.user?.email || ''}","${p.user?.phone || ''}","${p.primaryCategory}","${p.city}","${p.status}","${p.averageRating || 0}"`
        ).join('\n');
        const csvContent = csvHeader + csvRows;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=providers_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);
      } else {
        res.json({ data: providers });
      }
    } catch (error) {
      logger.error('Export providers error:', error);
      res.status(500).json({ error: 'Failed to export providers' });
    }
  },
};

