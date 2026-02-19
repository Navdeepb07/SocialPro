import express from 'express';
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount, markAllNotificationsAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

// Notification routes
router.get('/notifications', getNotifications);
router.post('/notifications/mark-read', markNotificationAsRead);
router.get('/notifications/unread-count', getUnreadNotificationCount);
router.post('/notifications/mark-all-read', markAllNotificationsAsRead);

export default router;