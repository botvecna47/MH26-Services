/**
 * Messages Routes
 */
import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticate, requireNotBanned } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { sendMessageSchema } from '../models/schemas';

const router = Router();

// All routes require authentication and user must not be banned
router.use(authenticate, requireNotBanned);

// List conversations
router.get('/conversations', asyncHandler(messageController.listConversations));

// Get messages for a conversation (by Conversation ID or User ID)
router.get('/:id', asyncHandler(messageController.getMessages));

// Start new conversation
router.post('/conversations', asyncHandler(messageController.createConversation));

// Send message
router.post('/', validate(sendMessageSchema), asyncHandler(messageController.sendMessage));

// Mark messages as read (by Sender ID - bulk)
router.put('/:id/read', asyncHandler(messageController.markAsRead));

export default router;

