import express from 'express';
import { sendMessage, getConversations, getMessages, markMessagesAsRead, getUnreadMessageCount } from '../controllers/message.controller.js';
import { messageLimiter, readLimiter, apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Message routes with appropriate rate limiting
router.post('/messages/send', messageLimiter, sendMessage);
router.get('/messages/conversations', readLimiter, getConversations);
router.get('/messages/conversation', readLimiter, getMessages);
router.post('/messages/mark-read', apiLimiter, markMessagesAsRead);
router.get('/messages/unread-count', readLimiter, getUnreadMessageCount);

export default router;