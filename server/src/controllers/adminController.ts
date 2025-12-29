/**
 * Admin Controller
 */
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { emitNotification, emitProviderApproval, emitAccountStatusChange } from '../socket';
import { sendProviderApprovalEmail, sendProviderCredentialsEmail } from '../utils/email';
import { hashPassword } from '../utils/security';
import crypto from 'crypto';
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
        prisma.booking.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { totalAmount: true, platformFee: true, taxAmount: true },
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

      const [
        allUsers,
        completedBookingsData, // Renamed from allTransactions for revenue growth
        providerCategories
      ] = await Promise.all([
         prisma.user.findMany({ select: { createdAt: true } }),
         prisma.booking.findMany({ 
            where: { status: 'COMPLETED' },
            select: { createdAt: true, platformFee: true }
         }),
         prisma.provider.groupBy({
            by: ['primaryCategory'],
            _count: { primaryCategory: true }
         })
      ]);

      // Calculate User Growth (Last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const userGrowth = new Array(6).fill(0).map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - 5 + i);
          return { month: months[d.getMonth()], users: 0, sortKey: d.toISOString().slice(0, 7) };
      });

      allUsers.forEach(u => {
          const m = u.createdAt.toISOString().slice(0, 7); // YYYY-MM
          const slot = userGrowth.find(g => g.sortKey === m);
          if (slot) slot.users++;
      });

      // Calculate Revenue Growth (Last 6 months)
      const revenueGrowth = new Array(6).fill(0).map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - 5 + i);
          return { month: months[d.getMonth()], revenue: 0, sortKey: d.toISOString().slice(0, 7) };
      });

        completedBookingsData.forEach(b => {
          const m = b.createdAt.toISOString().slice(0, 7);
          const slot = revenueGrowth.find(g => g.sortKey === m);
          if (slot) slot.revenue += Number(b.platformFee);
      });

      // Format Category Distribution
      const categoryDistribution = providerCategories.map(c => ({
          name: c.primaryCategory,
          value: c._count.primaryCategory
      }));

      res.json({
        stats: {
          totalUsers,
          totalProviders,
          pendingProviders,
          totalBookings,
          completedBookings,
          totalRevenue: totalRevenue._sum.platformFee || 0,
          grossVolume: totalRevenue._sum.totalAmount || 0,
          totalTaxCollected: totalRevenue._sum.taxAmount || 0,
        },
        userGrowth: userGrowth.map(({ sortKey, ...rest }) => rest),
        revenueGrowth: revenueGrowth.map(({ sortKey, ...rest }) => rest),
        categoryDistribution,
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
   * Create a new provider (User + Provider Profile)
   */
  async createProvider(req: Request, res: Response): Promise<void> {
    try {
      const { 
        name, 
        email, 
        phone, 
        businessName, 
        primaryCategory, 
        address, 
        city, 
        pincode, 
        serviceRadius 
      } = req.body;

      // 1. Validation
      if (!name || !email || !phone || !businessName || !primaryCategory) {
         res.status(400).json({ error: 'Missing required fields' });
         return;
      }

      // Check existing user
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] }
      });

      if (existingUser) {
        res.status(409).json({ error: 'User with this email or phone already exists' });
        return;
      }

      // 2. Generate Secure Random Password (Issue 2 Fix)
      const generatedPassword = crypto.randomBytes(9).toString('base64').slice(0, 12);
      const passwordHash = await hashPassword(generatedPassword);

      // 3. Create User & Provider in Transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Ensure Category exists (Auto-create if custom)
        const slug = primaryCategory.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        
        // Try to find existing category (case-insensitive) or create new
        const existingCategory = await tx.category.findFirst({
            where: { 
                OR: [
                    { name: { equals: primaryCategory, mode: 'insensitive' } },
                    { slug: { equals: slug, mode: 'insensitive' } }
                ]
            }
        });

        if (!existingCategory) {
            await tx.category.create({
                data: {
                    name: primaryCategory, // Preserve original casing
                    slug: slug,
                    description: `Services for ${primaryCategory}`,
                    icon: '📦', // Default icon
                    isActive: true
                }
            });
        }

        // 2. Create User
        // Fix: Use hashPassword utility instead of direct bcrypt
        const hashedPassword = await hashPassword(generatedPassword);
        
        const user = await tx.user.create({
            data: {
                name,
                email,
                phone,
                passwordHash: hashedPassword,
                role: 'PROVIDER', // Fix: Use string literal if UserRole enum not imported
                emailVerified: true, // Admin created users are verified
                address,
                city: city || 'Nanded', // Default
            },
        });

        // 3. Create Provider Profile
        const provider = await tx.provider.create({
          data: {
            userId: user.id,
            businessName,
            primaryCategory,
            address: address || '',
            city: city || 'Nanded',
            pincode: pincode || '',
            status: 'PENDING', // Start as pending for admin verification
            serviceRadius: Number(serviceRadius) || 10,
            availability: {
               mon: ["09:00-18:00"],
               tue: ["09:00-18:00"],
               wed: ["09:00-18:00"],
               thu: ["09:00-18:00"],
               fri: ["09:00-18:00"],
               sat: ["09:00-18:00"]
            }
          }
        });

        return { user, provider };
      });

      // 4. Send Credentials Email
    try {
      await sendProviderCredentialsEmail(email, businessName, generatedPassword);
      logger.info(`✅ Credentials email sent to: ${email}`);
    } catch (emailError) {
      logger.error('Failed to send provider credentials email:', emailError);
      // Don't fail the request, just log it. The provider is created.
    }

    // 5. Log creation success (Issue 3 Fix: No plaintext passwords in logs)
    logger.info(`🔑 NEW PROVIDER CREATED: ${email} for ${businessName} (${primaryCategory})`);
      // 6. Audit Log
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthRequest).user!.id,
          action: 'CREATE_PROVIDER',
          tableName: 'Provider',
          recordId: result.provider.id,
          newData: { businessName, email, category: primaryCategory },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });

      res.status(201).json({ 
        message: 'Provider created successfully', 
        provider: result.provider,
        user: { id: result.user.id, email: result.user.email } 
      });

    } catch (error) {
      logger.error('Create provider error:', error);
      res.status(500).json({ error: 'Failed to create provider' });
    }
  },

  /**
   * Approve provider
   */
  async approveProvider(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { category } = req.body; // Optional category override

      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true } },
          documents: true,
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      // 1. Strict Verification Check: Ensure Identity Proof is present
      const hasIdProof = !!(provider.aadharPanUrl || provider.documents.some(d => d.type === 'IDENTITY_PROOF' || d.type === 'AADHAR_PAN'));
      if (!hasIdProof) {
          res.status(400).json({ error: 'Cannot approve provider without Identity Proof (Aadhar/PAN)' });
          return;
      }

      // 2. Category Sync/Creation
      const finalCategory = category || provider.primaryCategory;
      if (finalCategory) {
          const slug = finalCategory.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          // Ensure category exists in Category table
          await prisma.category.upsert({
              where: { slug },
              create: {
                  name: finalCategory,
                  slug: slug,
                  description: `Services for ${finalCategory}`,
                  icon: '📦',
                  isActive: true
              },
              update: {} // Already exists, just ensure it's there
          });
      }

      // Build update data
      const updateData: any = { 
        status: 'APPROVED',
        verifiedById: (req as AuthRequest).user?.id,
        verifiedAt: new Date(),
      };
      
      // If admin provided a category override or we're using current
      updateData.primaryCategory = finalCategory;

      const updated = await prisma.provider.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          documents: true,
        },
      });

      // Promote user role to PROVIDER
      await prisma.user.update({
        where: { id: updated.userId },
        data: { role: 'PROVIDER' },
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
          user: { select: { id: true, email: true } }, // Include email for sending rejection email
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      const updated = await prisma.provider.update({
        where: { id },
        data: { 
          status: 'REJECTED',
          rejectionReason: reason || 'Application did not meet requirements',
        },
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
      const { reason } = req.body; // Capture reason

      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true } },
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

      // Log to AuditLog (History)
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthRequest).user!.id,
          action: 'SUSPEND_PROVIDER',
          tableName: 'Provider',
          recordId: id,
          newData: { status: 'SUSPENDED', reason: reason || 'No reason provided' },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });

      // Emit socket event
      emitProviderApproval(id, 'SUSPENDED');

      // Notify provider
      emitNotification(provider.userId, {
        type: 'provider_suspended',
        payload: { providerId: id, status: 'SUSPENDED', reason },
      });

      // Notify user immediately of their suspension status (UI will reflect this in real-time)
      emitAccountStatusChange(provider.userId, 'suspended', reason);

      // Send email
      await sendProviderApprovalEmail(
        updated.user.email,
        updated.businessName,
        false, // rejected/suspended
        reason || 'Violation of platform policies'
      );

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

      // Log to AuditLog
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthRequest).user!.id,
          action: 'UNSUSPEND_PROVIDER',
          tableName: 'Provider',
          recordId: id,
          newData: { status: 'APPROVED', reason: reason || 'Admin action' },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
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
   * Get provider details with history
   */
  async getProviderDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
            services: true,
            documents: true,
            reviews: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            },
            _count: {
                select: { bookings: true, reviews: true }
            }
        }
      });

      if (!provider) {
         res.status(404).json({ error: 'Provider not found' });
         return;
      }

      // Fetch History from AuditLog
      const history = await prisma.auditLog.findMany({
        where: {
            OR: [
                { tableName: 'Provider', recordId: id },
                { tableName: 'User', recordId: provider.userId } // Include user-level bans if any
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true } } // Admin who performed action
        }
      });

      // Map services to frontend format (basePrice -> price, name -> title)
      const mappedProvider = {
        ...provider,
        services: provider.services.map(service => ({
          ...service,
          price: service.basePrice,
          title: service.name,
        })),
        history,
      };

      res.json(mappedProvider);
    } catch (error) {
        logger.error('Get provider details error:', error);
        res.status(500).json({ error: 'Failed to fetch provider details' });
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
            isBanned: true,
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

      if (!reason || reason.trim().length < 5) {
        res.status(400).json({ error: 'Ban reason is required (minimum 5 characters)' });
        return;
      }

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

      // Actually ban the user with reason and timestamp
      await prisma.user.update({
        where: { id },
        data: { 
          isBanned: true,
          banReason: reason.trim(),
          bannedAt: new Date(),
        },
      });

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

      // Notify user via socket
      emitNotification(id, {
        type: 'account_suspended',
        payload: { reason: reason },
      });

      // Notify user immediately of their ban status (UI will reflect this in real-time)
      emitAccountStatusChange(id, 'banned', reason);

      // Send formal ban email with appeal instructions
      try {
        const { sendBanNotificationEmail } = await import('../utils/email');
        await sendBanNotificationEmail(user.email, user.name, reason);
      } catch (emailError) {
        logger.warn('Failed to send ban notification email:', emailError);
      }

      // Log admin action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthRequest).user!.id,
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
   * Get appeals (admin)
   */
  async getAppeals(req: Request, res: Response): Promise<void> {
    try {
      const { status, type, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (status && status !== 'all') where.status = status;
      if (type && type !== 'all') where.type = type;

      const [appeals, total] = await Promise.all([
        prisma.appeal.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
            provider: { select: { id: true, businessName: true } },
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
      logger.error('Get appeals error:', error);
      res.status(500).json({ error: 'Failed to fetch appeals' });
    }
  },

  /**
   * Unban user
   */
  async unbanUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Update user - clear ban, reason, and timestamp
      await prisma.user.update({
        where: { id },
        data: { 
          isBanned: false,
          banReason: null,
          bannedAt: null,
        },
      });

      // Resolve any pending UNBAN_REQUEST appeals for this user
      await prisma.appeal.updateMany({
        where: {
            userId: id,
            type: 'UNBAN_REQUEST',
            status: 'PENDING'
        },
        data: {
            status: 'APPROVED',
            adminNotes: 'User unbanned by administrator action.',
            reviewedBy: (req as AuthRequest).user?.id,
            reviewedAt: new Date()
        }
      });

      // Log admin action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthRequest).user!.id,
          action: 'UNBAN_USER',
          tableName: 'User',
          recordId: id,
          newData: { reason, unbannedAt: new Date() },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });

      res.json({ message: 'User unbanned successfully' });
    } catch (error) {
      logger.error('Unban user error:', error);
      res.status(500).json({ error: 'Failed to unban user' });
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
      // NOTE: In a full production app, these settings would be persisted to a 'Settings' table or Redis.
      // For this demo, we accept the update to simulate the admin action, but state is not persisted.
      const settings = req.body;

      logger.info('Admin updated settings (Simulated):', settings);

      res.json({ message: 'Settings updated successfully', settings });
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
      res.status(500).json({ error: 'Failed to export providers' });
    }
  },

  /**
   * Get audit logs for a specific record (e.g. user history)
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
        const { entityId, entityType, limit = 20 } = req.query;

        if (!entityId || !entityType) {
            res.status(400).json({ error: 'Entity ID and Type are required' });
            return;
        }

        const logs = await prisma.auditLog.findMany({
            where: {
                recordId: String(entityId),
                tableName: String(entityType)
            },
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        res.json({ data: logs });
    } catch (error) {
        logger.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  },

  /**
   * Get all bookings (for admin panel)
   */
  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (status && status !== 'all') {
        where.status = status;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
            provider: { select: { id: true, businessName: true } },
            service: { select: { id: true, name: true, basePrice: true } },
          },
        }),
        prisma.booking.count({ where }),
      ]);

      // Map service fields for frontend (name → title, basePrice → price)
      const mappedBookings = bookings.map(booking => ({
        ...booking,
        service: booking.service ? {
          ...booking.service,
          title: booking.service.name,
          price: booking.service.basePrice,
        } : null,
      }));

      res.json({
        data: mappedBookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Get all bookings error:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  },

  /**
   * Get pending services for admin verification
   */
  async getPendingServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await prisma.service.findMany({
        where: { status: 'PENDING' },
        include: {
          provider: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform for frontend
      const transformed = services.map(s => ({
        ...s,
        title: s.name,
        price: s.basePrice,
      }));

      res.json({ data: transformed });
    } catch (error) {
      logger.error('Get pending services error:', error);
      res.status(500).json({ error: 'Failed to fetch pending services' });
    }
  },

  /**
   * Approve a service
   */
  async approveService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const service = await prisma.service.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          provider: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      res.json({ message: 'Service approved', service });
    } catch (error) {
      logger.error('Approve service error:', error);
      res.status(500).json({ error: 'Failed to approve service' });
    }
  },

  /**
   * Reject a service
   */
  async rejectService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const service = await prisma.service.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
            provider: {
                include: {
                    user: { select: { name: true, email: true } }
                }
            }
        }
      });

      // Send notification to provider with rejection reason
      try {
          const { sendEmail } = await import('../utils/email');
          await sendEmail({
              to: service.provider.user.email,
              subject: `Service Rejected: ${service.name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px;">
                    <h2 style="color: #ef4444;">Service Application Rejected</h2>
                    <p>Dear ${service.provider.businessName},</p>
                    <p>Your request to add the service <strong>${service.name}</strong> has been rejected by our moderation team.</p>
                    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Reason:</strong> ${reason || 'Does not meet platform guidelines'}</p>
                    </div>
                    <p>You can update your service details and try again from your dashboard.</p>
                    <p>Best regards,<br>MH26 Services Team</p>
                </div>
              `
          });
      } catch (emailError) {
          logger.warn('Failed to send service rejection email:', emailError);
      }

      logger.info(`Service ${id} rejected. Reason: ${reason}`);

      res.json({ message: 'Service rejected', service });
    } catch (error) {
      logger.error('Reject service error:', error);
      res.status(500).json({ error: 'Failed to reject service' });
    }
  },
};

