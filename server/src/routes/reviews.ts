/**
 * Reviews Routes
 */
import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { createReviewSchema } from '../models/schemas';

const router = Router();

// Public routes
router.get('/providers/:id/reviews', asyncHandler(reviewController.getProviderReviews));

// Protected routes
router.post('/', authenticate, validate(createReviewSchema), asyncHandler(reviewController.create));

export default router;

