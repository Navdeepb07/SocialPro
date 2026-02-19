import express from 'express';
import { sendMessage, getConversations, getMessages, markMessagesAsRead, getUnreadMessageCount } from '../controllers/message.controller.js';

const router = express.Router();

// Message routes
router.post('/messages/send', sendMessage);
router.get('/messages/conversations', getConversations);
router.get('/messages/conversation', getMessages);
router.post('/messages/mark-read', markMessagesAsRead);
router.get('/messages/unread-count', getUnreadMessageCount);

export default router;