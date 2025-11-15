/**
 * Users Routes
 */
import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user
router.get('/me', asyncHandler(userController.getMe));

// Update current user profile
router.patch('/me', asyncHandler(userController.updateMe));

// Upload profile picture
router.post('/me/avatar', asyncHandler(userController.uploadAvatar));

// Get user by ID (public info only)
router.get('/:id', asyncHandler(userController.getById));

export default router;

