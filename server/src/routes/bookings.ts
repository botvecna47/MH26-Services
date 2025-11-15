/**
 * Booking Routes
 */
import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { createBookingSchema, updateBookingSchema } from '../models/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create booking
router.post('/', validate(createBookingSchema), asyncHandler(bookingController.create));

// List bookings (user sees their bookings, provider sees assigned bookings)
router.get('/', asyncHandler(bookingController.list));

// Get booking by ID
router.get('/:id', asyncHandler(bookingController.getById));

// Update booking status (provider can confirm/complete)
router.patch('/:id', requireRole('PROVIDER', 'ADMIN'), validate(updateBookingSchema), asyncHandler(bookingController.update));

// Cancel booking
router.post('/:id/cancel', asyncHandler(bookingController.cancel));

// Get invoice
router.get('/:id/invoice', asyncHandler(bookingController.getInvoice));

export default router;

