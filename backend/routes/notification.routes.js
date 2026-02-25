import express from 'express';
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount, markAllNotificationsAsRead } from '../controllers/notification.controller.js';
import { readLimiter, apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Notification routes with appropriate rate limiting
router.get('/notifications', readLimiter, getNotifications);
router.post('/notifications/mark-read', apiLimiter, markNotificationAsRead);
router.get('/notifications/unread-count', readLimiter, getUnreadNotificationCount);
router.post('/notifications/mark-all-read', apiLimiter, markAllNotificationsAsRead);

export default router;