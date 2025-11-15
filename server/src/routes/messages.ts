/**
 * Messages Routes
 */
import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { sendMessageSchema } from '../models/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List conversations
router.get('/conversations', asyncHandler(messageController.listConversations));

// Get messages for a conversation
router.get('/conversations/:id/messages', asyncHandler(messageController.getMessages));

// Start new conversation
router.post('/conversations', asyncHandler(messageController.createConversation));

// Send message
router.post('/', validate(sendMessageSchema), asyncHandler(messageController.sendMessage));

// Mark message as read
router.patch('/:id/read', asyncHandler(messageController.markAsRead));

export default router;

