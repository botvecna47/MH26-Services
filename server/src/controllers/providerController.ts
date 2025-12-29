/**
 * Provider Controller
 */
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { validateFileContent } from '../middleware/upload';
import { generateSecureToken } from '../utils/security';
import { 
  sendProviderApprovalEmail, 
  sendProviderApplicationReceivedEmail,
  sendAdminNewProviderNotification
} from '../utils/email';
import logger from '../config/logger';

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

    // Map services for frontend compatibility
    const mappedProviders = providers.map(provider => ({
      ...provider,
      services: provider.services.map(service => ({
        ...service,
        price: service.basePrice,
        title: service.name,
      })),
    }));

    res.json({
      data: mappedProviders,
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
        bookings: {
          where: { status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
          select: { id: true, status: true },
          take: 1, // We only need to know if there's at least one
        },
      },
    });

    if (!provider) {
      throw new AppError('Provider not found', 404);
    }

    // Map services to frontend format (basePrice -> price)
    const mappedProvider = {
      ...provider,
      services: provider.services.map(service => ({
        ...service,
        price: service.basePrice, // Map basePrice to price for frontend
        title: service.name, // Map name to title for frontend
      })),
    };

    res.json(mappedProvider);
  },


  /**
   * Create provider application
   */
  async create(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const body = req.body;

    // Check if provider already exists
    const existing = await prisma.provider.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new AppError('Provider profile already exists', 409);
    }

    // Extract only valid fields that match the Provider schema
    const providerData: any = {
      userId,
      businessName: body.businessName,
      primaryCategory: body.primaryCategory,
      description: body.description || null,
      address: body.address,
      city: body.city || 'Nanded',
      state: body.state || 'Maharashtra',
      pincode: body.pincode,
      serviceRadius: body.serviceRadius ? parseInt(body.serviceRadius) : 10,
      status: 'PENDING', // Always start as pending for admin review
      gallery: body.gallery || [],
      aadharPanUrl: body.aadharPanUrl || null,
      portfolioUrls: body.portfolioUrls || [],
      socialMediaLinks: body.socialMediaLinks || null,
      insuranceInfo: body.insuranceInfo || null,
      termsAccepted: body.termsAccepted || false,
      termsAcceptedAt: body.termsAcceptedAt ? new Date(body.termsAcceptedAt) : null,
    };

    const provider = await prisma.provider.create({
      data: providerData,
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

    // Send application received email
    if (provider.user.email) {
      await sendProviderApplicationReceivedEmail(provider.user.email, provider.businessName);
      logger.info(`Provider application received email sent to ${provider.user.email}`);
    }

    // Create notification for admin (can also be a socket event for real-time dashboard update)
    // We can assume admin periodically checks pending providers, but a notification record is good
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'system_alert',
            title: 'New Provider Application',
            body: `${provider.businessName} has applied to be a provider.`,
            payload: { providerId: provider.id },
          }
        });
        
        // Send email notification to admin
        if (admin.email) {
          await sendAdminNewProviderNotification(
            admin.email,
            provider.businessName,
            provider.user.name,
            body.primaryCategory,
            body.city || 'Nanded'
          );
          logger.info(`Admin notification email sent to ${admin.email} for new provider: ${provider.businessName}`);
        }
      }
    } catch (e) {
      logger.error('Failed to create admin notification for new provider', e);
    }

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

    // Issue 6 Fix: Validate file content against magic bytes
    if (!validateFileContent(file.buffer, file.mimetype)) {
      throw new AppError('Invalid file content. File type mismatch detected.', 400);
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
   * Upload Gallery Image (local storage)
   * Adds an image to the provider's gallery array
   */
  async uploadGalleryImage(req: Request, res: Response): Promise<void> {
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

    // Max 5 gallery images
    const currentGallery = provider.gallery || [];
    if (currentGallery.length >= 5) {
      throw new AppError('Maximum 5 gallery images allowed. Please remove an image first.', 400);
    }

    // Issue 6 Fix: Validate file content
    if (!validateFileContent(file.buffer, file.mimetype)) {
      throw new AppError('Invalid file content. File type mismatch detected.', 400);
    }

    // Save file to local storage
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads', 'gallery', id);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    
    const url = `/uploads/gallery/${id}/${fileName}`;

    // Add to gallery array
    const updated = await prisma.provider.update({
      where: { id },
      data: { 
        gallery: [...currentGallery, url]
      },
    });

    res.json({
      message: 'Gallery image uploaded successfully',
      url,
      gallery: updated.gallery,
    });
  },

  /**
   * Remove Gallery Image
   * Removes an image from the provider's gallery array
   */
  async removeGalleryImage(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const authReq = req as AuthRequest;

    if (!imageUrl) {
      throw new AppError('Image URL is required', 400);
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider || provider.userId !== authReq.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const currentGallery = provider.gallery || [];
    if (!currentGallery.includes(imageUrl)) {
      throw new AppError('Image not found in gallery', 404);
    }

    // Remove from array
    const newGallery = currentGallery.filter(url => url !== imageUrl);

    // Optionally delete the file from disk
    try {
      const fs = await import('fs');
      const path = await import('path');
      // imageUrl is like '/uploads/gallery/id/filename.jpg'
      const filePath = path.join(process.cwd(), 'server', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // Log but don't fail if file deletion fails
      logger.warn('Failed to delete gallery image file:', e);
    }

    const updated = await prisma.provider.update({
      where: { id },
      data: { gallery: newGallery },
    });

    res.json({
      message: 'Gallery image removed successfully',
      gallery: updated.gallery,
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

    // Issue 6 Fix: Validate file content
    if (!validateFileContent(file.buffer, file.mimetype)) {
      throw new AppError('Invalid file content. File type mismatch detected.', 400);
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

    // CRITICAL: Promote user role to PROVIDER
    await prisma.user.update({
      where: { id: provider.userId },
      data: { role: 'PROVIDER' },
    });

    // Send approval email
    if (provider.user.email) {
      await sendProviderApprovalEmail(provider.user.email, provider.businessName, true);
      logger.info(`Provider approval email sent to ${provider.user.email}`);
    }

    // Emit socket event for provider approval
    try {
      const { emitNotification } = await import('../socket');
      emitNotification(provider.userId, {
        type: 'provider_approved',
        payload: {
          providerId: id,
          message: 'Your provider application has been approved!',
        },
      });
    } catch (e) {
      logger.error('Failed to emit socket notification for provider approval', e);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: (req as AuthRequest).user!.id,
        action: 'APPROVE_PROVIDER',
        tableName: 'Provider',
        recordId: id,
        newData: { status: 'APPROVED', role_promoted: 'PROVIDER' },
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
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Send rejection email
    if (provider.user.email) {
      await sendProviderApprovalEmail(provider.user.email, provider.businessName, false, reason);
      logger.info(`Provider rejection email sent to ${provider.user.email}`);
    }

    // Emit socket event for provider rejection
    try {
      const { emitNotification } = await import('../socket');
      emitNotification(provider.userId, {
        type: 'provider_rejected',
        payload: {
          providerId: id,
          reason,
          message: `Your provider application has been rejected. Reason: ${reason}`,
        },
      });
    } catch (e) {
      logger.error('Failed to emit socket notification for provider rejection', e);
    }

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
        _sum: { providerEarnings: true }
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
        _sum: { providerEarnings: true }
      }),
      // 5. Pending Bookings Count
      prisma.booking.count({ 
        where: { providerId: provider.id, status: 'PENDING' } 
      })
    ]);

    const stats = {
      totalBookings,
      completedBookings,
      totalEarnings: earningsResult._sum.providerEarnings || 0,
      rating: provider.averageRating || 0,
      monthlyRevenue: monthlyRevenueResult._sum.providerEarnings || 0,
      pendingBookings
    };

    res.json(stats);
  },
  /**
   * Reveal provider contact details
   */
  async revealContact(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    
    // Ensure user is authenticated
    if (!authReq.user) {
      throw new AppError('Unauthorized', 401);
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            phone: true,
            email: true
          }
        }
      }
    });

    if (!provider) {
      throw new AppError('Provider not found', 404);
    }

    // Log the reveal action for analytics if needed
    // await prisma.auditLog.create(...)

    res.json({
      phone: provider.user.phone,
      email: provider.user.email
    });
  },

  // Get provider application status by email (for pending page)
  // Issue 4 Fix: Requires authentication and restricts to own email
  async getStatusByEmail(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const { email } = req.params;
    
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const decodedEmail = decodeURIComponent(email);

    // Issue 4 Fix: User can only check their own status
    if (!authReq.user) {
      throw new AppError('Authentication required', 401);
    }

    if (authReq.user.role !== 'ADMIN' && authReq.user.email !== decodedEmail) {
      throw new AppError('You can only check your own provider status', 403);
    }

    // Find user by email and their provider profile
    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
      include: {
        provider: true,
      },
    });

    if (!user || !user.provider) {
      throw new AppError('No provider application found for this email', 404);
    }

    res.json({
      status: user.provider.status,
      businessName: user.provider.businessName,
      rejectionReason: user.provider.rejectionReason,
    });
  },
};
