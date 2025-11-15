/**
 * Booking Controller
 */
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { emitBookingUpdate } from '../socket';
import logger from '../config/logger';

export const bookingController = {
  /**
   * Create a new booking
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { providerId, serviceId, scheduledAt, totalAmount } = req.body;

      // Verify provider and service exist
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: { services: true },
      });

      if (!provider || provider.status !== 'APPROVED') {
        res.status(404).json({ error: 'Provider not found or not approved' });
        return;
      }

      const service = provider.services.find((s) => s.id === serviceId);
      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId,
          providerId,
          serviceId,
          scheduledAt: new Date(scheduledAt),
          totalAmount,
          status: 'PENDING',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          provider: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          service: true,
        },
      });

      // Emit socket event
      emitBookingUpdate(provider.userId, booking);

      res.status(201).json(booking);
    } catch (error) {
      logger.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },

  /**
   * List bookings
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { status, page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      let where: any = {};

      // Admin can see all bookings
      if (userRole === 'ADMIN') {
        // No filter - show all bookings
      } else if (userRole === 'CUSTOMER') {
        where.userId = userId;
      } else if (userRole === 'PROVIDER') {
        const provider = await prisma.provider.findUnique({
          where: { userId },
        });
        if (provider) {
          where.providerId = provider.id;
        } else {
          res.json({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
          return;
        }
      }

      if (status) {
        where.status = status;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            provider: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            service: true,
          },
        }),
        prisma.booking.count({ where }),
      ]);

      res.json({
        data: bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('List bookings error:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  },

  /**
   * Get booking by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          provider: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          service: true,
          cancellation: true,
        },
      });

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      // Check authorization
      if (booking.userId !== userId && booking.provider.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      res.json(booking);
    } catch (error) {
      logger.error('Get booking error:', error);
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  },

  /**
   * Update booking status
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { status } = req.body;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          provider: {
            include: {
              user: { select: { id: true } },
            },
          },
          user: { select: { id: true } },
        },
      });

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      // Check authorization (provider or admin)
      if (booking.provider.userId !== userId && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          provider: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          service: true,
        },
      });

      // Emit socket event
      emitBookingUpdate(booking.userId, updated);

      res.json(updated);
    } catch (error) {
      logger.error('Update booking error:', error);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  },

  /**
   * Cancel booking
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          provider: {
            include: {
              user: { select: { id: true } },
            },
          },
          user: { select: { id: true } },
        },
      });

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      // Check authorization
      if (booking.userId !== userId && booking.provider.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      if (booking.status === 'CANCELLED') {
        res.status(400).json({ error: 'Booking already cancelled' });
        return;
      }

      // Update booking and create cancellation record
      const [updated] = await prisma.$transaction([
        prisma.booking.update({
          where: { id },
          data: { status: 'CANCELLED' },
        }),
        prisma.bookingCancellation.create({
          data: {
            bookingId: id,
            cancelledBy: userId,
            reason,
          },
        }),
      ]);

      // Emit socket event
      emitBookingUpdate(booking.userId, updated);
      emitBookingUpdate(booking.provider.userId, updated);

      res.json(updated);
    } catch (error) {
      logger.error('Cancel booking error:', error);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  },

  /**
   * Get invoice for booking
   */
  async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          provider: {
            include: {
              user: true,
            },
          },
          service: true,
        },
      });

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      // Check authorization - allow admin, booking user, or provider
      const userRole = req.user!.role;
      if (userRole !== 'ADMIN' && booking.userId !== userId && booking.provider.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      // Generate invoice data
      const invoice = {
        invoiceNumber: `INV-${booking.id.slice(0, 8).toUpperCase()}`,
        date: booking.createdAt,
        booking,
        subtotal: booking.totalAmount,
        tax: booking.totalAmount * 0.18, // 18% GST
        platformFee: booking.totalAmount * 0.05, // 5% platform fee
        total: booking.totalAmount * 1.23, // subtotal + tax + fee
      };

      res.json(invoice);
    } catch (error) {
      logger.error('Get invoice error:', error);
      res.status(500).json({ error: 'Failed to generate invoice' });
    }
  },
};

