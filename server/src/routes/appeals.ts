/**
 * Appeal Routes
 */
import { Router } from 'express';
import { appealController } from '../controllers/appealController';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Provider routes
router.post('/', authenticate, asyncHandler(appealController.create));
router.get('/my', authenticate, asyncHandler(appealController.getMyAppeals));

// Admin routes
router.get('/', authenticate, requireRole('ADMIN'), asyncHandler(appealController.list));
router.get('/:id', authenticate, requireRole('ADMIN'), asyncHandler(appealController.getById));
router.patch('/:id/review', authenticate, requireRole('ADMIN'), asyncHandler(appealController.review));

export default router;

