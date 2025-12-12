/**
 * Appeal Routes
 */
import { Router } from 'express';
import { appealController } from '../controllers/appealController';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public routes (none, user must be logged in to appeal)

// Protected routes
router.post('/', authenticate, asyncHandler(appealController.create));
router.get('/my-appeals', authenticate, asyncHandler(appealController.listMine));
router.get('/:id', authenticate, asyncHandler(appealController.getById));

// Admin routes
router.get('/', authenticate, requireRole('ADMIN'), asyncHandler(appealController.list));
router.post('/:id/resolve', authenticate, requireRole('ADMIN'), asyncHandler(appealController.resolve));

export default router;
