import Notification from '../models/notification.models.js';
import jwt from 'jsonwebtoken';
import { validateToken } from '../utils/tokenValidator.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const userId = userData.userId;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to recent 50 notifications

        res.status(200).json({
            success: true,
            notifications,
            data: 'Notifications retrieved successfully'
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId, token } = req.body;

        if (!notificationId || !token) {
            return res.status(400).json({ message: 'Notification ID and token are required' });
        }

        // Check if token is properly formatted
        if (typeof token !== 'string' || token.trim() === '' || token === 'undefined' || token === 'null') {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Verify token
        const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            notificationId,
            data: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const userId = userData.userId;

        const count = await Notification.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            count,
            data: 'Unread notification count retrieved'
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Check if token is properly formatted
        if (typeof token !== 'string' || token.trim() === '' || token === 'undefined' || token === 'null') {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Verify token
        const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            data: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create notification (helper function for other controllers)
export const createNotification = async (recipientId, senderId, type, title, message, data = {}) => {
    try {
        const notification = await Notification.createNotification({
            recipient: recipientId,
            sender: senderId,
            type,
            title,
            message,
            data
        });
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
};