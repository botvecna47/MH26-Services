/**
 * Reviews Routes
 */
import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authenticate, requireNotBanned } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { createReviewSchema } from '../models/schemas';

const router = Router();

// Public routes
router.get('/providers/:id/reviews', asyncHandler(reviewController.getProviderReviews));

// Protected routes - user must not be banned to leave reviews
router.post('/', authenticate, requireNotBanned, validate(createReviewSchema), asyncHandler(reviewController.create));

export default router;

