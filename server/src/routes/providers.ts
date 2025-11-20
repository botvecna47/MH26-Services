/**
 * Provider Routes
 */
import { Router } from 'express';
import { providerController } from '../controllers/providerController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../middleware/upload';
import { createProviderSchema, updateProviderSchema } from '../models/schemas';

const router = Router();

// Public routes
router.get('/', asyncHandler(providerController.list));
router.get('/:id', asyncHandler(providerController.getById));

// Protected routes
router.post('/', authenticate, requireRole('PROVIDER', 'ADMIN'), validate(createProviderSchema), asyncHandler(providerController.create));
router.patch('/:id', authenticate, validate(updateProviderSchema), asyncHandler(providerController.update));
router.post('/:id/documents', authenticate, upload.single('file'), asyncHandler(providerController.uploadDocument));
router.post('/:id/reveal-phone', authenticate, asyncHandler(providerController.revealPhone));

// Admin routes
router.post('/:id/approve', authenticate, requireRole('ADMIN'), asyncHandler(providerController.approve));
router.post('/:id/reject', authenticate, requireRole('ADMIN'), asyncHandler(providerController.reject));

export default router;

