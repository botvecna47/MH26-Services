/**
 * Review Controller
 */
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { sanitizeInput } from '../utils/security';
import logger from '../config/logger';

export const reviewController = {
  /**
   * Create review
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { bookingId, providerId, rating, comment } = req.body;

      // Verify provider exists
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' });
        return;
      }

      // If bookingId provided, verify booking exists and belongs to user
      if (bookingId) {
        const booking = await prisma.booking.findFirst({
          where: {
            id: bookingId,
            userId,
            providerId,
            status: 'COMPLETED',
          },
        });

        if (!booking) {
          res.status(404).json({ error: 'Booking not found or not completed' });
          return;
        }
      }

      // Check if user already reviewed this provider
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          providerId,
          bookingId: bookingId || null,
        },
      });

      if (existingReview) {
        res.status(400).json({ error: 'Review already exists' });
        return;
      }

      // Sanitize comment if provided
      const sanitizedComment = comment ? sanitizeInput(comment) : null;

      // Create review
      const review = await prisma.review.create({
        data: {
          bookingId: bookingId || null,
          providerId,
          userId,
          rating,
          comment: sanitizedComment,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      // Update provider rating
      const allReviews = await prisma.review.findMany({
        where: { providerId },
        select: { rating: true },
      });

      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const totalRatings = allReviews.length;

      await prisma.provider.update({
        where: { id: providerId },
        data: {
          averageRating,
          totalRatings,
        },
      });

      res.status(201).json(review);
    } catch (error) {
      logger.error('Create review error:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  },

  /**
   * Get reviews for a provider
   */
  async getProviderReviews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { providerId: id },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        }),
        prisma.review.count({ where: { providerId: id } }),
      ]);

      res.json({
        data: reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Get provider reviews error:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  },
};

