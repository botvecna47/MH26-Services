/**
 * Service Routes
 */
import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { createServiceSchema, updateServiceSchema } from '../models/schemas';

const router = Router();

// Public routes
router.get('/categories', asyncHandler(serviceController.getCategories));
router.get('/', asyncHandler(serviceController.list));

// Protected routes
router.post('/categories', authenticate, requireRole('ADMIN'), asyncHandler(serviceController.createCategory));
router.put('/categories/:id', authenticate, requireRole('ADMIN'), asyncHandler(serviceController.updateCategory));
router.delete('/categories/:id', authenticate, requireRole('ADMIN'), asyncHandler(serviceController.deleteCategory));
router.post('/', authenticate, requireRole('PROVIDER', 'ADMIN'), validate(createServiceSchema), asyncHandler(serviceController.create));
router.patch('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), validate(updateServiceSchema), asyncHandler(serviceController.update));
router.delete('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), asyncHandler(serviceController.delete));

export default router;

