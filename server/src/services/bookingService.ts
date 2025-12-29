import crypto from 'crypto';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { emitBookingUpdate, emitRevenueUpdate, emitWalletUpdate } from '../socket';
import { config } from '../config/env';
import logger from '../config/logger';
import { 
  sendBookingConfirmationToCustomer, 
  sendBookingConfirmationToProvider,
  sendBookingCancellationToProvider,
  sendCompletionOTPToCustomer
} from '../utils/email';
import { sendBookingExpiredEmail } from './emailService';

export const bookingService = {
  /**
   * Create a new booking with fee calculation
   */
  async createBooking(userId: string, data: any) {
    const { providerId, serviceId, scheduledAt, address, city, pincode, requirements } = data;

    // SECURITY: Check if the requesting user is banned
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBanned: true }
    });

    if (requestingUser?.isBanned) {
      throw new AppError('Your account is suspended. You cannot make bookings while suspended.', 403);
    }

    // 1. Validation & Usage of Central Config
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: { services: true, user: true },
    });

    if (!provider || provider.status !== 'APPROVED') {
      throw new AppError('Provider not found or not approved', 404);
    }

    // SECURITY: Check if the provider's user account is banned
    if (provider.user.isBanned) {
      throw new AppError('This provider is currently unavailable. Please choose another provider.', 400);
    }

    const service = provider.services.find((s) => s.id === serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Check for duplicate active booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        serviceId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
      }
    });
    
    if (existingBooking) {
      throw new AppError('You already have an active booking for this service. Please wait until it is completed.', 400);
    }

    // Check if provider is currently busy (has IN_PROGRESS booking)
    const providerBusy = await prisma.booking.findFirst({
      where: {
        providerId,
        status: 'IN_PROGRESS'
      }
    });
    
    if (providerBusy) {
      throw new AppError('This provider is currently busy serving another customer. Please try again later.', 400);
    }

    // Validate scheduled time
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    
    // 1. Cannot book in the past
    if (scheduledDate <= now) {
      throw new AppError('Cannot book a time in the past', 400);
    }
    
    // 2. Only today or tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    if (scheduledDate >= dayAfterTomorrow) {
      throw new AppError('Bookings are only available for today or tomorrow', 400);
    }
    
    // 3. Only between 9 AM and 9 PM (IST)
    const scheduledHour = scheduledDate.getHours();
    if (scheduledHour < 9) {
      throw new AppError('Service hours start at 9:00 AM', 400);
    }
    if (scheduledHour >= 21) {
      throw new AppError('Service hours end at 9:00 PM', 400);
    }

    // 4. Check for time conflicts with provider's confirmed bookings (30-minute window)
    const thirtyMinsBefore = new Date(scheduledDate.getTime() - 30 * 60 * 1000);
    const thirtyMinsAfter = new Date(scheduledDate.getTime() + 30 * 60 * 1000);
    
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        providerId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        scheduledAt: {
          gte: thirtyMinsBefore,
          lte: thirtyMinsAfter
        }
      },
      include: { service: true }
    });
    
    if (conflictingBooking) {
      const conflictTime = new Date(conflictingBooking.scheduledAt).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      throw new AppError(
        `Provider is not available at this time. They have a confirmed booking at ${conflictTime}. Please choose a different time.`, 
        400
      );
    }

    // 5. Fee Calculation using Config
  const basePrice = Number(service.basePrice);
  const gstRate = 0.08; // 8% GST
  const platformFeeRate = 0.07; // 7% Platform Fee

  const subtotal = basePrice;
  const taxAmount = subtotal * gstRate;
  const totalAmount = subtotal + taxAmount;
  const platformFee = subtotal * platformFeeRate;
  const providerEarnings = subtotal - platformFee;

  // 3. Database Transaction (Booking + Notification)
  const [booking, notification] = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        userId,
        providerId,
        serviceId,
        scheduledAt: scheduledDate,
        subtotal,
        taxAmount,
        totalAmount,
        platformFee,
        providerEarnings,
        status: 'PENDING',
          paymentStatus: 'PENDING',
          address,
          city,
          pincode,
          requirements,
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          provider: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          service: true,
        },
      });

      const newNotification = await tx.notification.create({
        data: {
          userId: provider.userId,
          type: 'BOOKING_REQUEST',
          title: 'New Booking Request',
          body: `${newBooking.user.name} has requested ${newBooking.service.name} on ${scheduledDate.toLocaleDateString()}`,
          payload: { bookingId: newBooking.id, serviceId: newBooking.serviceId },
        },
      });

      return [newBooking, newNotification];
    });

    // 4. Side Effects (Socket)
    try {
      emitBookingUpdate(provider.userId, booking);
    } catch (error) {
      logger.error('Failed to emit socket update:', error);
    }

    return {
      ...booking,
      qrCodeUrl: provider.qrCodeUrl,
      providerPhone: provider.user?.phone,
    };
  },

  /**
   * Get filtered list of bookings
   */
  async listBookings(userId: string, role: string, query: any) {
    // Check and expire any stale pending bookings (runs in background)
    this.checkStaleBookings().catch(e => logger.error('Stale check failed:', e));
    
    const { status, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (role === 'ADMIN') {
        // Admin sees all? Or specific logic. Currently admin sees everything in admin panel.
        // If this is called from dashboard, implies Admin acting as a user?
        // Let's assume list logic is:
        // Customer -> Own bookings
        // Provider -> Own provider bookings
        // Admin -> ALL bookings (default behavior, maybe filter by their own user ID if they want only 'my' bookings?)
        // The prompt implies Admin wants to "order, track" -> acting as Customer.
        // So if Admin calls this, and query param 'view' is 'personal', filter by userId?
        // Or standard behavior: Admin usually sees everything. Admin dashboard uses specific admin endpoints.
        // If Admin hits this endpoint, we return everything OR we can default to ALL.
    }

    if (role === 'CUSTOMER') where.userId = userId;
    if (role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      if (!provider) return { data: [], pagination: { total: 0 } };
      where.providerId = provider.id;
    }
    
    // If Admin and no specific filters, maybe show everything?
    // But if admin wants "My Bookings", they are a "User".
    // Let's add an override: query.myBookings = true
    if (role === 'ADMIN' && query.myBookings === 'true') {
        where.userId = userId;
    }

    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          provider: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          service: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    // Sanitize for provider
    const sanitizedBookings = role === 'PROVIDER' 
        ? bookings.map(b => bookingService.sanitizeForProvider(b))
        : bookings;

    return {
      data: sanitizedBookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  },

  /**
   * Update booking status logic
   */
  async updateBookingStatus(
    bookingId: string, 
    userId: string, 
    userRole: string, 
    status: 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS',
    reason?: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true, service: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    // Check if booking is already in a terminal state
    const terminalStatuses = ['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'];
    if (terminalStatuses.includes(booking.status)) {
      throw new AppError(`Cannot modify a ${booking.status.toLowerCase()} booking`, 400);
    }

    // Authorization
    const isProvider = booking.provider.userId === userId;
    const isCustomer = booking.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    // State Machine Validation with detailed rules
    // CANCELLED: Customer can cancel PENDING/CONFIRMED; Provider can cancel CONFIRMED only
    if (status === 'CANCELLED') {
      if (isCustomer) {
        if (!['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status)) {
          throw new AppError('You can only cancel pending, confirmed, or in-progress bookings', 400);
        }
      } else if (isProvider) {
        if (!['CONFIRMED', 'IN_PROGRESS'].includes(booking.status)) {
          throw new AppError('Providers can only cancel confirmed or in-progress bookings', 400);
        }
      } else if (!isAdmin) {
        throw new AppError('Unauthorized', 403);
      }
    } 
    // CONFIRMED/REJECTED: Only from PENDING, only by provider/admin
    else if (status === 'CONFIRMED' || status === 'REJECTED') {
      if (!isProvider && !isAdmin) throw new AppError('Only providers can accept or reject bookings', 403);
      if (booking.status !== 'PENDING') throw new AppError(`Can only ${status.toLowerCase()} pending bookings`, 400);
      
      // Direct transition to IN_PROGRESS when accepted by provider (Skipping CONFIRMED)
      if (status === 'CONFIRMED') {
          status = 'IN_PROGRESS';
      }

      // SECURITY: Suspended/Pending/Rejected providers cannot accept new bookings
      if (isProvider && status === 'IN_PROGRESS' && booking.provider.status !== 'APPROVED') {
        throw new AppError(`Your provider account is ${booking.provider.status.toLowerCase()}. Only approved providers can accept bookings.`, 403);
      }
    } 
    // IN_PROGRESS: Handled above for direct transition, but keeping for compatibility if ever needed
    else if (status === 'IN_PROGRESS') {
      if (!isProvider && !isAdmin) throw new AppError('Only providers can start service', 403);
      if (booking.status !== 'CONFIRMED') throw new AppError('Can only start service on confirmed bookings', 400);
    } 
    // COMPLETED: MUST go through OTP verification flow (initiateCompletion + verifyCompletion)
    // Direct COMPLETED transitions are NOT allowed to enforce OTP verification
    else if (status === 'COMPLETED') {
      throw new AppError('Completion requires OTP verification. Use the Complete Service flow.', 400);
    }

    // Update
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        provider: { include: { user: { select: { id: true, email: true, name: true } } } },
        service: true,
      },
    });

    // Send emails based on status change (fire-and-forget, non-blocking)
    if (status === 'IN_PROGRESS' && booking.status === 'PENDING') {
      // Email to customer (async, non-blocking)
      sendBookingConfirmationToCustomer(
        updated.user.email!,
        updated.user.name,
        updated.provider.businessName,
        updated.service.name,
        booking.scheduledAt,
        booking.address || '',
        Number(booking.totalAmount)
      ).catch(err => logger.error('Failed to send customer confirmation email:', err));
      
      // Email to provider (async, non-blocking)
      sendBookingConfirmationToProvider(
        updated.provider.user.email!,
        updated.provider.businessName,
        updated.user.name,
        updated.user.phone || '',
        updated.service.name,
        booking.scheduledAt,
        booking.address || '',
        Number(booking.providerEarnings)
      ).catch(err => logger.error('Failed to send provider confirmation email:', err));
      
      // Auto-reject conflicting PENDING bookings (within 30-min window)
      const thirtyMinsBefore = new Date(booking.scheduledAt.getTime() - 30 * 60 * 1000);
      const thirtyMinsAfter = new Date(booking.scheduledAt.getTime() + 30 * 60 * 1000);
      
      const conflictingPendingBookings = await prisma.booking.findMany({
        where: {
          providerId: booking.providerId,
          id: { not: bookingId }, // Exclude the just-confirmed booking
          status: 'PENDING',
          scheduledAt: {
            gte: thirtyMinsBefore,
            lte: thirtyMinsAfter
          }
        },
        include: { 
          user: { select: { id: true, name: true, email: true } },
          service: { select: { name: true } }
        }
      });
      
      if (conflictingPendingBookings.length > 0) {
        logger.info(`Auto-rejecting ${conflictingPendingBookings.length} conflicting bookings for provider ${booking.providerId}`);
        
        // Reject all conflicting bookings
        await prisma.booking.updateMany({
          where: {
            id: { in: conflictingPendingBookings.map(b => b.id) }
          },
          data: { status: 'REJECTED' }
        });
        
        // Notify affected customers
        for (const conflicting of conflictingPendingBookings) {
          try {
            const conflictTime = new Date(booking.scheduledAt).toLocaleTimeString('en-IN', { 
              hour: '2-digit', minute: '2-digit', hour12: true 
            });
            
            await prisma.notification.create({
              data: {
                userId: conflicting.userId,
                type: 'BOOKING_UPDATE',
                title: 'Booking Could Not Be Confirmed',
                body: `Your booking for ${conflicting.service.name} was auto-rejected as the provider already accepted another booking near the same time (${conflictTime}). Please try booking a different time.`,
                payload: { bookingId: conflicting.id, status: 'REJECTED' }
              }
            });
            
            // Emit socket update
            emitBookingUpdate(conflicting.userId, { ...conflicting, status: 'REJECTED' });
          } catch (e) {
            logger.error('Failed to notify auto-rejected booking:', e);
          }
        }
      }
    } else if (status === 'CANCELLED' && isCustomer) {
      // Customer cancelled - notify provider (async, non-blocking)
      sendBookingCancellationToProvider(
        updated.provider.user.email!,
        updated.provider.businessName,
        updated.user.name,
        updated.service.name,
        booking.scheduledAt,
        reason
      ).catch(err => logger.error('Failed to send cancellation email:', err));
    }

    // Handle Cancellation Reason separately if needed
    if (status === 'CANCELLED' && reason) {
       await prisma.bookingCancellation.create({
         data: { bookingId, cancelledBy: userId, reason },
       });
    }

    // Notifications
    const notificationMap = {
        CONFIRMED: { title: 'Booking Confirmed', msg: 'Provider accepted your booking' },
        IN_PROGRESS: { title: 'Service Started', msg: 'Provider has started working on your service' },
        REJECTED: { title: 'Booking Rejected', msg: 'Provider rejected your booking' },
        COMPLETED: { title: 'Service Completed', msg: 'Service marked as completed' },
        CANCELLED: { title: 'Booking Cancelled', msg: 'Booking was cancelled' }
    };

    const notif = notificationMap[status];
    if (notif) {
        const targetUserId = isProvider ? booking.userId : booking.provider.userId;
        // If customer cancels, notify provider. If provider acts, notify customer.
        
        try {
            await prisma.notification.create({
                data: {
                    userId: targetUserId,
                    type: 'BOOKING_UPDATE',
                    title: notif.title,
                    body: `${notif.msg} for ${booking.service.name}`,
                    payload: { bookingId, status, reason },
                }
            });
        } catch(e) { logger.error('Notif failed', e); }
    }

    emitBookingUpdate(booking.userId, updated);
    emitBookingUpdate(booking.provider.userId, updated);

    return updated;
  },
  
  async getInvoice(bookingId: string, userId: string, role: string) {
     const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            user: true,
            provider: { include: { user: true } },
            service: true
        }
     });
     
     if (!booking) throw new AppError('Booking not found', 404);
     
     if (role !== 'ADMIN' && booking.userId !== userId && booking.provider.userId !== userId) {
         throw new AppError('Unauthorized', 403);
     }
     
     const subtotal = Number(booking.subtotal);
   const taxAmount = Number(booking.taxAmount);
   const total = Number(booking.totalAmount);
   const platformFee = Number(booking.platformFee);
   
   // Note: Platform fee is hidden from customers in the frontend modal
   // but we keep it in the response for admin/provider view
   return {
      invoiceNumber: `INV-${booking.id.slice(0, 8).toUpperCase()}`,
      date: booking.createdAt,
      booking,
      subtotal: subtotal,
      platformFee: platformFee,
      tax: taxAmount,
      total: total,
      providerEarnings: Number(booking.providerEarnings),
   };
  },

  /**
   * Initiate Service Completion (Provider Only)
   */
  async initiateCompletion(bookingId: string, userId: string, userRole: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true, service: true, user: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    
    const isProvider = booking.provider.userId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isProvider && !isAdmin) {
        throw new AppError('Unauthorized', 403);
    }
    
    if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
        throw new AppError('Can only initiate completion for confirmed or in-progress bookings', 400);
    }

    // Generate 6 digit OTP securely
    const otp = crypto.randomInt(100000, 999999).toString();

    // Update booking and reset attempts (Issue 1)
  const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
          completionOtp: otp,
          otpAttempts: 0 
      }
  });
    // Notify Customer with OTP
    try {
        await prisma.notification.create({
            data: {
                userId: booking.userId,
                type: 'COMPLETION_OTP',
                title: 'Verify Service Completion',
                body: `Provider requested completion. Please share this code with them: ${otp}`,
                payload: { bookingId, otp } 
            }
        });
        
        await prisma.notification.create({
            data: {
                userId: booking.provider.userId,
                type: 'COMPLETION_INITIATED',
                title: 'Completion Initiated',
                body: 'Ask the customer for the 6-digit verification code.',
                payload: { bookingId }
            }
        });
        
        // Send OTP via email to customer
        if (booking.user.email) {
          await sendCompletionOTPToCustomer(
            booking.user.email,
            booking.user.name,
            booking.service.name,
            booking.provider.businessName,
            otp
          );
          logger.info(`Completion OTP email sent to ${booking.user.email}`);
        }
    } catch(e) { logger.error('Completion notif failed', e); }

    const providerBooking = { ...updated, completionOtp: undefined };
    emitBookingUpdate(booking.userId, updated); // Customer gets OTP
    emitBookingUpdate(booking.provider.userId, providerBooking); // Provider gets sanitized booking

    return { message: 'OTP sent to customer' };
  },

  /**
   * Helper to sanitize booking for provider
   */
  sanitizeForProvider(booking: any) {
    if (!booking) return booking;
    const { completionOtp, ...rest } = booking;
    return rest;
  },

  /**
   * Verify Service Completion (Provider Only)
   */
  async verifyCompletion(bookingId: string, userId: string, role: string, otp: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true, service: true, user: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    
    const isAuthorized = (booking.provider.userId === userId) || (role === 'ADMIN');
    if (!isAuthorized) throw new AppError('Unauthorized', 403);
    
    if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
        throw new AppError('Can only verify completion for confirmed or in-progress bookings', 400);
    }
    
    if (!booking.completionOtp) throw new AppError('Completion not initiated', 400);

  // Issue 1: Brute-force protection
  if (booking.otpAttempts >= 5) {
    throw new AppError('Too many failed attempts. Verification blocked for security.', 429);
  }
  
  if (booking.completionOtp !== otp) {
      // Increment attempts
      await prisma.booking.update({
          where: { id: bookingId },
          data: { otpAttempts: { increment: 1 } }
      });
      throw new AppError('Invalid OTP', 400);
  }

    // OTP Match -> Complete
    // TRANSACTION: Update Status + Update Financials
    // TRANSACTION: Update Status + Update Financials + Notify
    const [updatedBooking, updatedProvider, updatedUser, notification] = await prisma.$transaction(async (tx) => {
        const bookingUpdate = await tx.booking.update({
            where: { id: bookingId },
            data: { 
                status: 'COMPLETED',
                completionOtp: null, // Clear OTP
                otpAttempts: 0 // Reset attempts
            },
            include: {
                user: { select: { id: true, name: true } },
                provider: { include: { user: { select: { id: true } } } },
                service: true,
            },
        });

        // Update Provider Revenue
        const providerUpdate = await tx.provider.update({
            where: { id: booking.providerId },
            data: { totalRevenue: { increment: booking.providerEarnings } }
        });

        // Update User Spending
        const userUpdate = await tx.user.update({
            where: { id: booking.userId },
            data: { totalSpending: { increment: booking.totalAmount } }
        });

        // Notify Customer (Inside Transaction)
        const newNotification = await tx.notification.create({
            data: {
                userId: booking.userId,
                type: 'BOOKING_UPDATE',
                title: 'Service Completed',
                body: `Your service for ${booking.service.name} has been marked as completed.`,
                payload: { bookingId, status: 'COMPLETED' }
            }
        });

        return [bookingUpdate, providerUpdate, userUpdate, newNotification];
    });

    // Emit Real-time Financial Updates using transaction results
    if (updatedProvider) {
        emitRevenueUpdate(updatedProvider.userId, Number(updatedProvider.totalRevenue));
    }
    
    if (updatedUser) {
         emitWalletUpdate(updatedUser.id, Number(updatedUser.totalSpending));
    }
    
    emitBookingUpdate(booking.userId, updatedBooking);
    emitBookingUpdate(booking.provider.userId, updatedBooking);

    return updatedBooking;
  },

  /**
   * Auto-expire stale PENDING bookings (older than 1 hour)
   * Called on demand or via scheduled job
   */
  async expireStaleBookings() {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    
    const staleBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: oneHourAgo }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        provider: { include: { user: { select: { id: true, email: true } } } },
        service: { select: { id: true, name: true } }
      }
    });

    if (staleBookings.length === 0) {
      return { expiredCount: 0 };
    }

    // Update all stale bookings to EXPIRED
    const result = await prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: oneHourAgo }
      },
      data: { status: 'EXPIRED' }
    });

    // Create notifications for affected users
    for (const booking of staleBookings) {
      try {
        // Notify customer
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'BOOKING_UPDATE',
            title: 'Booking Expired',
            body: `Your booking for ${booking.service.name} has expired as the provider did not respond within 1 hour.`,
            payload: { bookingId: booking.id, status: 'EXPIRED' }
          }
        });
        
        // Send email to customer
        sendBookingExpiredEmail(
          booking.user.email!,
          booking.user.name,
          booking.service.name,
          (booking.provider as any).businessName || 'Provider',
          booking.service.id
        ).catch(err => logger.error('Failed to send booking expired email:', err));
        
        // Notify provider
        await prisma.notification.create({
          data: {
            userId: booking.provider.userId,
            type: 'BOOKING_UPDATE',
            title: 'Booking Expired',
            body: `A booking request from ${booking.user.name} for ${booking.service.name} has expired due to no response.`,
            payload: { bookingId: booking.id, status: 'EXPIRED' }
          }
        });

        // Emit socket updates
        emitBookingUpdate(booking.userId, { ...booking, status: 'EXPIRED' });
        emitBookingUpdate(booking.provider.userId, { ...booking, status: 'EXPIRED' });
      } catch (e) {
        logger.error('Failed to create expiry notification:', e);
      }
    }

    logger.info(`Auto-expired ${result.count} stale bookings`);
    return { expiredCount: result.count, expiredBookings: staleBookings.map(b => b.id) };
  },

  /**
   * Check and expire stale bookings (lightweight, called on list fetch)
   */
  async checkStaleBookings() {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const staleCount = await prisma.booking.count({
      where: {
        status: 'PENDING',
        createdAt: { lt: oneHourAgo }
      }
    });
    
    if (staleCount > 0) {
      // Run expiry in background (don't await)
      this.expireStaleBookings().catch(e => logger.error('Background expiry failed:', e));
    }
    
    return staleCount;
  }
};
