/**
 * Provider Controller
 */
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { generateSecureToken } from '../utils/security';

export const providerController = {
  /**
   * List providers with filters
   */
  async list(req: Request, res: Response): Promise<void> {
    const { city, category, q, page = '1', limit = '10' } = req.query;

    const where: any = {
      status: 'APPROVED',
    };

    if (city) where.city = city as string;
    if (category) where.primaryCategory = category as string;
    if (q) {
      where.OR = [
        { businessName: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          services: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { averageRating: 'desc' },
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({
      data: providers,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  },

  /**
   * Get provider by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        services: true,
        documents: true,
      },
    });

    if (!provider) {
      throw new AppError('Provider not found', 404);
    }

    res.json(provider);
  },

  /**
   * Create provider application
   */
  async create(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const data = req.body;

    // Check if provider already exists
    const existing = await prisma.provider.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new AppError('Provider profile already exists', 409);
    }

    const provider = await prisma.provider.create({
      data: {
        userId,
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(provider);
  },

  /**
   * Update provider
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const { availability, ...otherData } = req.body;

    // Verify ownership or admin
    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new AppError('Provider not found', 404);
    }

    if (provider.userId !== userId && authReq.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const updated = await prisma.provider.update({
      where: { id },
      data: {
        ...otherData,
        ...(availability ? { availability } : {})
      },
    });

    res.json(updated);
  },

  /**
   * Upload document (local storage)
   */
  async uploadDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const file = req.file;
    const authReq = req as AuthRequest;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider || provider.userId !== authReq.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    // Save file to local storage
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads', 'documents', id);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    
    const url = `/uploads/documents/${id}/${fileName}`;
    const documentType = req.body.type || 'document';

    // Create document record
    const document = await prisma.providerDocument.create({
      data: {
        providerId: id,
        type: documentType,
        url,
        filename: file.originalname,
      },
    });

    res.json({
      documentId: document.id,
      url,
      filename: file.originalname,
    });
  },

  /**
   * Upload QR Code (local storage)
   */
  async uploadQRCode(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const file = req.file;
    const authReq = req as AuthRequest;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider || provider.userId !== authReq.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    // Save file to local storage
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads', 'qrcodes', id);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    
    const url = `/uploads/qrcodes/${id}/${fileName}`;

    // Update provider record
    const updated = await prisma.provider.update({
      where: { id },
      data: { qrCodeUrl: url },
    });

    res.json({
      message: 'QR Code uploaded successfully',
      url,
      provider: updated,
    });
  },



  /**
   * Approve provider (Admin only)
   */
  async approve(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const provider = await prisma.provider.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // Emit socket event for provider approval
    const { emitNotification } = await import('../socket');
    emitNotification(provider.userId, {
      type: 'provider_approved',
      payload: {
        providerId: id,
        message: 'Your provider application has been approved!',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: (req as AuthRequest).user!.id,
        action: 'APPROVE_PROVIDER',
        tableName: 'Provider',
        recordId: id,
        newData: { status: 'APPROVED' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || undefined,
      },
    });

    res.json(provider);
  },

  /**
   * Reject provider (Admin only)
   */
  async reject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;

    const provider = await prisma.provider.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: (req as AuthRequest).user!.id,
        action: 'REJECT_PROVIDER',
        tableName: 'Provider',
        recordId: id,
        newData: { status: 'REJECTED', reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || undefined,
      },
    });

    res.json(provider);
  },

  /**
   * Get provider statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;

    const provider = await prisma.provider.findUnique({
      where: { userId },
      select: { id: true, averageRating: true }
    });

    if (!provider) {
      throw new AppError('Provider profile not found', 404);
    }

    // Parallelize DB queries for performance
    const [
      totalBookings,
      completedBookings,
      earningsResult,
      monthlyRevenueResult,
      pendingBookings
    ] = await Promise.all([
      // 1. Total Bookings
      prisma.booking.count({ 
        where: { providerId: provider.id } 
      }),
      // 2. Completed Bookings
      prisma.booking.count({ 
        where: { providerId: provider.id, status: 'COMPLETED' } 
      }),
      // 3. Total Earnings (Sum)
      prisma.booking.aggregate({
        where: { providerId: provider.id, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      // 4. Monthly Revenue
      prisma.booking.aggregate({
        where: { 
          providerId: provider.id, 
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Start of current month
          }
        },
        _sum: { totalAmount: true }
      }),
      // 5. Pending Bookings Count
      prisma.booking.count({ 
        where: { providerId: provider.id, status: 'PENDING' } 
      })
    ]);

    const stats = {
      totalBookings,
      completedBookings,
      totalEarnings: earningsResult._sum.totalAmount || 0,
      rating: provider.averageRating || 0,
      monthlyRevenue: monthlyRevenueResult._sum.totalAmount || 0,
      pendingBookings
    };

    res.json(stats);
  },
};

