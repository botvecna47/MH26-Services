/**
 * Provider Controller
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { generatePresignedUploadUrl } from '../config/s3';
import { generateSecureToken } from '../utils/security';

export const providerController = {
  /**
   * List providers with filters
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
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
            take: 3,
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
  async getById(req: AuthRequest, res: Response): Promise<void> {
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
  async create(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
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
  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    // Verify ownership or admin
    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new AppError('Provider not found', 404);
    }

    if (provider.userId !== userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const updated = await prisma.provider.update({
      where: { id },
      data,
    });

    res.json(updated);
  },

  /**
   * Upload document (get presigned URL)
   */
  async uploadDocument(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { type, filename, contentType } = req.body;

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider || provider.userId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const key = `providers/${id}/documents/${type}/${Date.now()}-${filename}`;
    const presignedUrl = await generatePresignedUploadUrl(key, contentType);

    // Create placeholder document record
    const document = await prisma.providerDocument.create({
      data: {
        providerId: id,
        type,
        url: key, // Store S3 key, not full URL
        filename,
      },
    });

    res.json({
      documentId: document.id,
      presignedUrl,
      key,
    });
  },

  /**
   * Reveal phone number (with logging)
   */
  async revealPhone(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      throw new AppError('Provider not found', 404);
    }

    if (!provider.phoneVisible) {
      throw new AppError('Phone number is not visible', 403);
    }

    // Log access
    await prisma.phoneRevealLog.create({
      data: {
        providerId: id,
        userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || undefined,
      },
    });

    res.json({
      phone: provider.user.phone,
    });
  },

  /**
   * Approve provider (Admin only)
   */
  async approve(req: AuthRequest, res: Response): Promise<void> {
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
        userId: req.user!.id,
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
  async reject(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;

    const provider = await prisma.provider.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
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
};

