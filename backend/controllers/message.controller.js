import Message from '../models/message.models.js';
import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import { validateToken } from '../utils/tokenValidator.js';

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, token } = req.body;

        if (!receiverId || !content || !token) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const senderId = userData.userId;

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Create message
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        await message.save();
        await message.populate('sender receiver', 'name username profilePicture');

        res.status(201).json({
            success: true,
            message: message,
            data: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get conversations for a user
export const getConversations = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const userId = userData.userId;

        const conversations = await Message.getUserConversations(userId);

        res.status(200).json({
            success: true,
            conversations,
            data: 'Conversations retrieved successfully'
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get messages in a conversation
export const getMessages = async (req, res) => {
    try {
        const { userId, token } = req.query;

        if (!userId || !token) {
            return res.status(400).json({ message: 'User ID and token are required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const currentUserId = userData.userId;

        const messages = await Message.getConversation(currentUserId, userId);

        res.status(200).json({
            success: true,
            messages,
            data: 'Messages retrieved successfully'
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId, token } = req.body;

        if (!conversationId || !token) {
            return res.status(400).json({ message: 'Conversation ID and token are required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const userId = userData.userId;

        // Mark messages as read where current user is the receiver
        const result = await Message.updateMany(
            { 
                receiver: userId,
                sender: conversationId,
                read: false
            },
            { read: true, updatedAt: new Date() }
        );

        res.status(200).json({
            success: true,
            markedCount: result.modifiedCount,
            data: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get unread message count
export const getUnreadMessageCount = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Validate token
        const userData = await validateToken(token);
        const userId = userData.userId;

        const count = await Message.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            count,
            data: 'Unread message count retrieved'
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};