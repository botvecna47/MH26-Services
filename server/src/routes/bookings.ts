/**
 * Booking Routes
 */
import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { authenticate, requireRole, requireNotBanned } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { createBookingSchema, updateBookingSchema, rejectBookingSchema } from '../models/schemas';

const router = Router();

// All routes require authentication and user must not be banned
router.use(authenticate, requireNotBanned);

// Create booking (customer creates booking request)
router.post('/', validate(createBookingSchema), asyncHandler(bookingController.create));

// List bookings (user sees their bookings, provider sees assigned bookings)
router.get('/', asyncHandler(bookingController.list));

// Get booking by ID
router.get('/:id', asyncHandler(bookingController.getById));

// Accept booking (provider accepts pending booking)
router.post('/:id/accept', requireRole('PROVIDER', 'ADMIN'), asyncHandler(bookingController.accept));

// Reject booking (provider rejects pending booking)
router.post('/:id/reject', requireRole('PROVIDER', 'ADMIN'), validate(rejectBookingSchema), asyncHandler(bookingController.reject));

// Update booking status (provider can confirm/complete)
router.patch('/:id', requireRole('PROVIDER', 'ADMIN'), validate(updateBookingSchema), asyncHandler(bookingController.update));

// Cancel booking
router.post('/:id/cancel', asyncHandler(bookingController.cancel));

// Get invoice
router.get('/:id/invoice', asyncHandler(bookingController.getInvoice));

// Completion OTP
router.post('/:id/completion-initiate', requireRole('PROVIDER', 'ADMIN'), asyncHandler(bookingController.initiateCompletion));
router.post('/:id/completion-verify', requireRole('PROVIDER', 'ADMIN'), asyncHandler(bookingController.verifyCompletion));

// Start service (CONFIRMED -> IN_PROGRESS)
router.post('/:id/start', requireRole('PROVIDER', 'ADMIN'), asyncHandler(bookingController.startService));

// Admin: Force expire stale bookings
router.post('/admin/expire-stale', requireRole('ADMIN'), asyncHandler(bookingController.expireStale));

export default router;

