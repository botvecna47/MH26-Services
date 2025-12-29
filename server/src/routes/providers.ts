/**
 * Provider Routes
 */
import { Router } from 'express';
import { providerController } from '../controllers/providerController';
import { authenticate, requireRole, requireNotBanned } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimit';
import { createProviderSchema, updateProviderSchema } from '../models/schemas';

const router = Router();

// Public routes
router.get('/stats', authenticate, requireRole('PROVIDER'), asyncHandler(providerController.getStats));
router.get('/status/:email', authenticate, asyncHandler(providerController.getStatusByEmail)); // Issue 4 Fix: Requires auth
router.get('/', asyncHandler(providerController.list));
router.get('/:id', asyncHandler(providerController.getById));

// Protected routes
// Allow any authenticated user to apply to become a provider
router.post('/', authenticate, requireNotBanned, validate(createProviderSchema), asyncHandler(providerController.create));
router.patch('/:id', authenticate, requireNotBanned, validate(updateProviderSchema), asyncHandler(providerController.update));
router.post('/:id/documents', authenticate, requireNotBanned, uploadLimiter, upload.single('file'), asyncHandler(providerController.uploadDocument)); // Issue 7 Fix
router.post('/:id/qrcode', authenticate, requireNotBanned, uploadLimiter, upload.single('file'), asyncHandler(providerController.uploadQRCode)); // Issue 7 Fix
router.post('/:id/gallery', authenticate, requireNotBanned, uploadLimiter, upload.single('file'), asyncHandler(providerController.uploadGalleryImage)); // Issue 7 Fix
router.post('/:id/gallery/remove', authenticate, requireNotBanned, asyncHandler(providerController.removeGalleryImage));
router.post('/:id/reveal-phone', authenticate, requireNotBanned, asyncHandler(providerController.revealContact));


// Admin routes
router.post('/:id/approve', authenticate, requireRole('ADMIN'), asyncHandler(providerController.approve));
router.post('/:id/reject', authenticate, requireRole('ADMIN'), asyncHandler(providerController.reject));

export default router;

