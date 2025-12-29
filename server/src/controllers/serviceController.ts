/**
 * Service Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const serviceController = {
  /**
   * List services
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { providerId, q, page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};
      
      // If providerId is specified, show all services for that provider (including PENDING)
      // Otherwise, only show APPROVED services in public listings
      if (providerId) {
        where.providerId = providerId;
        // Show all statuses for provider's own services list
      } else {
        // Public listing - only show APPROVED services from APPROVED providers (not suspended/banned)
        where.status = 'APPROVED';
        where.imageUrl = { not: '' }; // Force image URL to be set
        where.provider = {
          status: 'APPROVED', // Only show services from approved providers
          user: {
            isBanned: false, // Exclude services from banned users
          },
        };
      }

      if (q) {
        where.OR = [
          { name: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
          { provider: { businessName: { contains: q as string, mode: 'insensitive' } } },
        ];
      }

      // Category Filter
      if (req.query.category && req.query.category !== 'all') {
        where.provider = {
          ...where.provider,
          primaryCategory: {
            equals: req.query.category as string,
            mode: 'insensitive',
          },
        };
      }

      // Price Range Filter
      if (req.query.minPrice || req.query.maxPrice) {
        where.basePrice = {};
        if (req.query.minPrice) {
          where.basePrice.gte = Number(req.query.minPrice);
        }
        if (req.query.maxPrice) {
          where.basePrice.lte = Number(req.query.maxPrice);
        }
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' }; // Default
      const sort = req.query.sortBy as string;

      if (sort === 'price_asc') {
        orderBy = { price: 'asc' };
      } else if (sort === 'price_desc') {
        orderBy = { price: 'desc' };
      } else if (sort === 'newest') {
        orderBy = { createdAt: 'desc' };
      } else if (sort === 'name') {
        orderBy = { title: 'asc' };
      } else if (sort === 'rating') {
        // Fallback to createdAt for now
        orderBy = { createdAt: 'desc' };
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy,
          include: {
            provider: {
              include: {
                user: {
                  select: { 
                    id: true, 
                    name: true, 
                    email: true,
                    avatarUrl: true,
                  },
                },
                bookings: {
                  where: { status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
                  select: { id: true },
                  take: 1,
                },
              },
            },
          },
        }),
        prisma.service.count({ where }),
      ]);

      // Transform services to include frontend-compatible fields + availability
      const transformedServices = services.map(service => {
        const { bookings: providerBookings, ...providerRest } = service.provider;
        return {
          ...service,
          price: service.basePrice, // Map basePrice to price for frontend
          title: service.name, // Map name to title for frontend
          provider: {
            ...providerRest,
            isAvailable: providerBookings.length === 0, // Available if no IN_PROGRESS bookings
          },
        };
      });

      res.json({
        data: transformedServices,
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
   * Get categories (Dynamic from DB)
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.category.findMany({
          orderBy: { name: 'asc' }
      });
      res.json(categories);
    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  /**
   * Create category (Admin Only)
   */
  async createCategory(req: Request, res: Response): Promise<void> {
      try {
          const { name, slug, icon } = req.body;
          
          // Validate required fields
          if (!name || !slug) {
              res.status(400).json({ error: 'Name and slug are required' });
              return;
          }
          
          // Check if category with same name or slug already exists
          const existing = await prisma.category.findFirst({
              where: {
                  OR: [
                      { name: { equals: name, mode: 'insensitive' } },
                      { slug: { equals: slug, mode: 'insensitive' } }
                  ]
              }
          });
          
          if (existing) {
              res.status(400).json({ 
                  error: `Category with name "${name}" or slug "${slug}" already exists` 
              });
              return;
          }
          
          const category = await prisma.category.create({
              data: { name, slug, icon }
          });
          
          res.status(201).json(category);
      } catch (error: any) {
          logger.error('Create category error:', error);
          // Handle Prisma unique constraint error
          if (error.code === 'P2002') {
              res.status(400).json({ error: 'Category with this name or slug already exists' });
              return;
          }
          res.status(500).json({ error: 'Failed to create category' });
      }
  },

  /**
   * Update category (Admin Only)
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
      try {
          const { id } = req.params;
          const { name, slug, icon } = req.body;
          
          const category = await prisma.category.update({
              where: { id },
              data: { name, slug, icon }
          });
          
          res.json(category);
      } catch (error) {
          logger.error('Update category error:', error);
          res.status(500).json({ error: 'Failed to update category' });
      }
  },

  /**
   * Delete category (Admin Only)
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
      try {
          const { id } = req.params;
          
          await prisma.category.delete({
              where: { id }
          });
          
          res.status(204).send();
      } catch (error) {
          logger.error('Delete category error:', error);
          res.status(500).json({ error: 'Failed to delete category' });
      }
  },

  /**
   * Create service
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { title, description, price, imageUrl, category } = req.body;

      // Verify provider belongs to user (1:1 relationship)
      const provider = await prisma.provider.findUnique({
        where: {
          userId,
        },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider profile not found. Please complete onboarding.' });
        return;
      }
      
      // Security: Only APPROVED providers can create services
      if (provider.status !== 'APPROVED') {
        res.status(403).json({ 
          error: `Your provider account is ${provider.status.toLowerCase()}. Only approved providers can add services.` 
        });
        return;
      }
      
      const providerId = provider.id;

      // Image Fallback Logic: Service Image -> Provider Gallery [0] -> Empty String
      let finalImageUrl = imageUrl || '';
      if (!finalImageUrl && provider.gallery && Array.isArray(provider.gallery) && provider.gallery.length > 0) {
        finalImageUrl = provider.gallery[0];
      }

      if (!finalImageUrl) {
        res.status(400).json({ error: 'Service Image URL is required' });
        return;
      }

      const service = await prisma.service.create({
        data: {
          providerId,
          name: title, // Mapped from title
          description,
          category: category || provider.primaryCategory, // Use provided category or fallback to provider's primary
          basePrice: price, 
          priceUnit: 'per service', // Default
          imageUrl: finalImageUrl,
          isActive: true,
          status: 'APPROVED', // Auto-approve - provider is already verified
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
      const userId = (req as AuthRequest).user!.id;
      const { id } = req.params;
      const { title, description, price, imageUrl, category } = req.body;

      // Verify service belongs to user's provider
      const service = await prisma.service.findFirst({
        where: {
          id,
          provider: {
            userId,
          },
        },
        include: {
          provider: { select: { status: true } }
        }
      });

      if (!service) {
        res.status(404).json({ error: 'Service not found or unauthorized' });
        return;
      }

      // Security: Only APPROVED providers can update services
      if (service.provider.status !== 'APPROVED') {
        res.status(403).json({ 
          error: `Your provider account is ${service.provider.status.toLowerCase()}. Only approved providers can manage services.` 
        });
        return;
      }

      if (!imageUrl) {
        res.status(400).json({ error: 'Service Image URL is required' });
        return;
      }

      const updated = await prisma.service.update({
        where: { id },
        data: {
          name: title,
          description,
          basePrice: price,
          category, // Allow updating category
          imageUrl, // Allow update if provided
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
      const userId = (req as AuthRequest).user!.id;
      const { id } = req.params;

      // Verify service belongs to user's provider
      const service = await prisma.service.findFirst({
        where: {
          id,
          provider: {
            userId,
          },
        },
        include: {
          provider: { select: { status: true } }
        }
      });

      if (!service) {
        res.status(404).json({ error: 'Service not found or unauthorized' });
        return;
      }

      // Security: Only APPROVED providers can delete services
      if (service.provider.status !== 'APPROVED') {
        res.status(403).json({ 
          error: `Your provider account is ${service.provider.status.toLowerCase()}. Only approved providers can manage services.` 
        });
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

  /**
   * Upload Service Image (local storage)
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const file = req.file;
    const authReq = req as AuthRequest;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    // Verify service belongs to user's provider
    const service = await prisma.service.findFirst({
      where: {
        id,
        provider: {
          userId: authReq.user!.id,
        },
      },
    });

    if (!service) {
      throw new AppError('Service not found or unauthorized', 403);
    }

    // Save file to local storage
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads', 'services', id);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    
    const url = `/uploads/services/${id}/${fileName}`;

    // Update service record
    const updated = await prisma.service.update({
      where: { id },
      data: { imageUrl: url },
    });

    res.json({
      message: 'Service image uploaded successfully',
      url,
      service: updated,
    });
  },
};

