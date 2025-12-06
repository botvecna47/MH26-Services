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
      const { providerId, serviceId, scheduledAt, totalAmount, address, city, pincode, requirements } = req.body;

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

      // Calculate platform fee and provider earnings
      const price = Number(service.price);
      const platformFeeRate = 0.05; // 5% platform fee
      const platformFee = price * platformFeeRate;
      const providerEarnings = price - platformFee;
      
      // Use price from service to ensure accuracy, ignore client-sent totalAmount if mismatch?
      // For now, let's trust the service price.
      const finalAmount = price;

      const scheduledDate = new Date(scheduledAt);

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId,
          providerId,
          serviceId,
          scheduledAt: scheduledDate,
          totalAmount: finalAmount,
          platformFee,
          providerEarnings,
          status: 'PENDING', // Default to PENDING until provider confirms
          paymentStatus: 'PENDING', // Default to PENDING
          address,
          city: "Nanded", // Default to Nanded for now or extract from address if structured
          pincode: "431601", // Default
          requirements,
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

      // Create notification for provider
      try {
        await prisma.notification.create({
          data: {
            userId: provider.userId,
            type: 'BOOKING_REQUEST',
            title: 'New Booking Request',
            message: `${booking.user.name} has requested ${booking.service.title} on ${scheduledDate.toLocaleDateString()}`,
            metadata: {
              bookingId: booking.id,
              serviceId: booking.serviceId,
              scheduledAt: booking.scheduledAt.toISOString(),
            },
          },
        });
      } catch (error) {
        logger.error('Failed to create booking notification:', error);
      }

      // Emit socket event
      emitBookingUpdate(provider.userId, booking);

      res.status(201).json({
        message: 'Booking request sent successfully',
        booking: {
          ...booking,
          qrCodeUrl: provider.qrCodeUrl, // Include QR code in response
          providerPhone: provider.phone,
        },
        instructions: "Please pay the provider directly using the QR code or Cash. The provider will confirm your booking."
      });
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
      const { status, paymentStatus } = req.body;

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

      const dataToUpdate: any = {};
      if (status) dataToUpdate.status = status;
      if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

      const updated = await prisma.booking.update({
        where: { id },
        data: dataToUpdate,
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
          service: { select: { title: true } },
        },
      });

      // Create notification for customer when status changes
      try {
        let notificationTitle = '';
        let notificationMessage = '';

        if (status === 'COMPLETED') {
          notificationTitle = 'Service Completed';
          notificationMessage = `Your booking for ${updated.service.title} has been marked as completed`;
        } else if (status === 'CONFIRMED') {
            notificationTitle = 'Booking Confirmed';
            notificationMessage = `Your booking for ${updated.service.title} has been confirmed`;
        } else if (status === 'REJECTED') {
            notificationTitle = 'Booking Rejected';
            notificationMessage = `Your booking for ${updated.service.title} has been rejected`;
        }

        if (notificationTitle) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              type: 'BOOKING_UPDATE',
              title: notificationTitle,
              message: notificationMessage,
              metadata: {
                bookingId: booking.id,
                status: status,
              },
            },
          });
        }
      } catch (error) {
        logger.error('Failed to create booking update notification:', error);
      }

      // Emit socket events
      emitBookingUpdate(booking.userId, updated);
      emitBookingUpdate(booking.provider.userId, updated);

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
   * Accept booking (provider action)
   */
  async accept(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          provider: {
            include: {
              user: { select: { id: true } },
            },
          },
          user: { select: { id: true, name: true } },
          service: { select: { title: true } },
        },
      });

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      // Check authorization (only provider can accept)
      if (booking.provider.userId !== userId && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Only the provider can accept this booking' });
        return;
      }

      if (booking.status !== 'PENDING') {
        res.status(400).json({ error: 'Can only accept pending bookings' });
        return;
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'CONFIRMED' },
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

      // Create notification for customer
      try {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'BOOKING_UPDATE',
            title: 'Booking Confirmed',
            message: `Your booking for ${booking.service.title} has been confirmed by the provider`,
            metadata: {
              bookingId: booking.id,
              status: 'CONFIRMED',
            },
          },
        });
      } catch (error) {
        logger.error('Failed to create acceptance notification:', error);
      }

      // Emit socket events
      emitBookingUpdate(booking.userId, updated);
      emitBookingUpdate(booking.provider.userId, updated);

      res.json(updated);
    } catch (error) {
      logger.error('Accept booking error:', error);
      res.status(500).json({ error: 'Failed to accept booking' });
    }
  },

  /**
   * Reject booking (provider action)
   */
  async reject(req: Request, res: Response): Promise<void> {
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
          user: { select: { id: true, name: true } },
          service: { select: { title: true } },
        },
      });

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      // Check authorization (only provider can reject)
      if (booking.provider.userId !== userId && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Only the provider can reject this booking' });
        return;
      }

      if (booking.status !== 'PENDING') {
        res.status(400).json({ error: 'Can only reject pending bookings' });
        return;
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'REJECTED' },
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

      // Create notification for customer
      try {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'BOOKING_UPDATE',
            title: 'Booking Rejected',
            message: `Your booking request for ${booking.service.title} has been rejected${reason ? `: ${reason}` : ' by the provider'}`,
            metadata: {
              bookingId: booking.id,
              status: 'REJECTED',
              reason: reason || null,
            },
          },
        });
      } catch (error) {
        logger.error('Failed to create rejection notification:', error);
      }

      // Emit socket events
      emitBookingUpdate(booking.userId, updated);
      emitBookingUpdate(booking.provider.userId, updated);

      res.json(updated);
    } catch (error) {
      logger.error('Reject booking error:', error);
      res.status(500).json({ error: 'Failed to reject booking' });
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
        tax: Number(booking.totalAmount) * 0.18, // 18% GST
        platformFee: Number(booking.totalAmount) * 0.05, // 5% platform fee
        total: Number(booking.totalAmount) * 1.23, // subtotal + tax + fee
      };

      res.json(invoice);
    } catch (error) {
      logger.error('Get invoice error:', error);
      res.status(500).json({ error: 'Failed to generate invoice' });
    }
  },
};
