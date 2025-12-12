/**
 * Booking Controller
 */
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { emitBookingUpdate } from '../socket';
import logger from '../config/logger';
import { bookingService } from '../services/bookingService';



export const bookingController = {
  /**
   * Create a new booking
   */
  async create(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    
    // Service handles validation, fee calc, and notifications
    const result = await bookingService.createBooking(userId, req.body);
    
    res.status(201).json({
      message: 'Booking request sent successfully',
      booking: result,
      instructions: "Please pay the provider directly using the QR code or Cash."
    });
  },

  /**
   * List bookings
   */
  async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const result = await bookingService.listBookings(
      authReq.user!.id, 
      authReq.user!.role, 
      req.query
    );
    res.json(result);
  },

  /**
   * Get booking by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user!.id;
    const { id } = req.params;

    // We can keep simple read logic here or move to service
    // For consistency, let's keep it direct if it's just a query, 
    // OR allow the service to handle auth logic. 
    // Let's use Prisma directly for simple reads to allow 'includes' flexibility,
    // BUT strictly enforcing auth.
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        provider: { include: { user: { select: { id: true, name: true, email: true } } } },
        service: true,
        cancellation: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.userId !== userId && booking.provider.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const isProvider = booking.provider.userId === userId;
    const responseData = isProvider ? bookingService.sanitizeForProvider(booking) : booking;

    res.json(responseData);
  },

  /**
   * Update booking status (Generic)
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    // If it's just payment status update, maybe handle separately?
    // For now, let's assume status update is the main action
    if (status) {
         const result = await bookingService.updateBookingStatus(
             id, 
             (req as AuthRequest).user!.id, 
             (req as AuthRequest).user!.role, 
             status
         );
         res.json(result);
    } else if (paymentStatus) {
        // Quick one-off for payment status if needed
        const updated = await prisma.booking.update({
            where: { id },
            data: { paymentStatus }
        });
        res.json(updated);
    }
  },

  /**
   * Cancel booking
   */
  async cancel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await bookingService.updateBookingStatus(
        id, 
        (req as AuthRequest).user!.id, 
        (req as AuthRequest).user!.role, 
        'CANCELLED',
        reason
    );
    res.json(result);
  },

  /**
   * Accept booking
   */
  async accept(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await bookingService.updateBookingStatus(
        id, 
        (req as AuthRequest).user!.id, 
        (req as AuthRequest).user!.role, 
        'CONFIRMED'
    );
    res.json(result);
  },

  /**
   * Reject booking
   */
  async reject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await bookingService.updateBookingStatus(
        id, 
        (req as AuthRequest).user!.id, 
        (req as AuthRequest).user!.role, 
        'REJECTED',
        reason
    );
    res.json(result);
  },

  /**
   * Get invoice
   */
  async getInvoice(req: Request, res: Response): Promise<void> {
    const result = await bookingService.getInvoice(
        req.params.id, 
        (req as AuthRequest).user!.id, 
        (req as AuthRequest).user!.role
    );
    res.json(result);
  },

  async initiateCompletion(req: Request, res: Response): Promise<void> {
      const result = await bookingService.initiateCompletion(req.params.id, (req as AuthRequest).user!.id);
      res.json(result);
  },

  async verifyCompletion(req: Request, res: Response): Promise<void> {
      const { otp } = req.body;
      const result = await bookingService.verifyCompletion(
          req.params.id, 
          (req as AuthRequest).user!.id, 
          (req as AuthRequest).user!.role,
          otp
      );
      res.json(result);
  },
};
