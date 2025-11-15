/**
 * Notifications Routes
 */
import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List notifications
router.get('/', asyncHandler(notificationController.list));

// Mark notification as read
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

// Mark all notifications as read
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));

export default router;

