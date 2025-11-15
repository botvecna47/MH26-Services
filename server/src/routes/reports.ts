/**
 * Reports Routes
 */
import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { createReportSchema } from '../models/schemas';

const router = Router();

// Report provider (authenticated users)
router.post('/providers/:id', authenticate, validate(createReportSchema), asyncHandler(reportController.create));

// Admin routes
router.get('/', authenticate, requireRole('ADMIN'), asyncHandler(reportController.list));
router.patch('/:id', authenticate, requireRole('ADMIN'), asyncHandler(reportController.update));

export default router;

