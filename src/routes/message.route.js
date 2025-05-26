import express from 'express';
import { messageController } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const messageRouter = express.Router();

// Apply authentication middleware to all routes
messageRouter.use(authenticate);

// Send a new message
messageRouter.post('/', messageController.sendMessage);

// Get all conversations for the current user (supports search via query parameter)
messageRouter.get('/conversations', messageController.getUserConversations);

// Get conversation between current user and specific user
messageRouter.get('/conversation/:userId', messageController.getConversation);

// Get unread messages count
messageRouter.get('/unread-count', messageController.getUnreadCount);

// Mark a specific message as read
messageRouter.patch('/:messageId/read', messageController.markMessageAsRead);

// Mark entire conversation as read
messageRouter.patch('/conversation/:userId/read', messageController.markConversationAsRead);

// Delete a message (soft delete)
messageRouter.delete('/:messageId', messageController.deleteMessage);

export default messageRouter; 