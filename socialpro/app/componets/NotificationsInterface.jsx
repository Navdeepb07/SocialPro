"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../src/config/redux/actions/notificationAction/index.js';
import { BASE_URL } from '../../src/config/index.jsx';
import styles from '../styles/Notifications.module.css';

function NotificationsInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    
    const authState = useSelector((state) => state.auth);
    const notificationState = useSelector((state) => state.notifications);
    const { notifications, unreadCount, isLoading } = notificationState;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && token !== 'null' && token !== 'undefined' && isOpen && !notificationState.notificationsFetched) {
            dispatch(getNotifications({ token }));
        }
    }, [isOpen, dispatch, notificationState.notificationsFetched]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            const token = localStorage.getItem("token");
            if (token && token !== 'null' && token !== 'undefined') {
                dispatch(markNotificationAsRead({ 
                    notificationId: notification._id, 
                    token 
                }));
            }
        }
        
        // Handle navigation based on notification type
        switch (notification.type) {
            case 'connection_request':
                // Navigate to connections page
                window.location.href = '/connections';
                break;
            case 'new_post':
                // Navigate to dashboard
                window.location.href = '/dashboard';
                break;
            case 'message':
                // Open messaging interface
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const handleMarkAllAsRead = async () => {
        const token = localStorage.getItem("token");
        if (token && token !== 'null' && token !== 'undefined' && unreadCount > 0) {
            dispatch(markAllNotificationsAsRead({ token }));
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'connection_request':
                return (
                    <svg viewBox="0 0 24 24" className={styles.notificationTypeIcon}>
                        <path fill="#0a66c2" d="M12 16v6H3v-6a3 3 0 013-3h3a3 3 0 013 3zM5.5 7.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"></path>
                    </svg>
                );
            case 'connection_accepted':
                return (
                    <svg viewBox="0 0 24 24" className={styles.notificationTypeIcon}>
                        <path fill="#00a32a" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                    </svg>
                );
            case 'new_post':
            case 'post_like':
            case 'post_comment':
                return (
                    <svg viewBox="0 0 24 24" className={styles.notificationTypeIcon}>
                        <path fill="#0a66c2" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                    </svg>
                );
            case 'message':
                return (
                    <svg viewBox="0 0 24 24" className={styles.notificationTypeIcon}>
                        <path fill="#0a66c2" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .5-.1.7-.3L14.6 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
                    </svg>
                );
            default:
                return (
                    <svg viewBox="0 0 24 24" className={styles.notificationTypeIcon}>
                        <path fill="#666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                    </svg>
                );
        }
    };

    return (
        <div className={styles.notificationsContainer} ref={dropdownRef}>
            <div 
                className={`${styles.notificationTrigger} ${unreadCount > 0 ? styles.hasUnread : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className={styles.notificationIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22 19h-2v-4a5 5 0 00-5-5v-2a7 7 0 017 7zM14 13.5a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 002 2 2 2 0 002-2z"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.notificationBadge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>
            
            {isOpen && (
                <div className={styles.notificationsDropdown}>
                    <div className={styles.notificationsHeader}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                className={styles.markAllButton}
                                onClick={handleMarkAllAsRead}
                                disabled={isLoading}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className={styles.notificationsList}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyState}>
                                <svg className={styles.emptyIcon} viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                                </svg>
                                <p>You're all caught up!</p>
                                <span>No new notifications</span>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification._id}
                                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={styles.notificationAvatar}>
                                        <img 
                                            src={`${BASE_URL}/${notification.sender.profilePicture || 'default.jpeg'}`}
                                            alt={notification.sender.name}
                                            className={styles.senderAvatar}
                                        />
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    
                                    <div className={styles.notificationContent}>
                                        <div className={styles.notificationText}>
                                            <strong>{notification.sender.name}</strong> {notification.message}
                                        </div>
                                        <div className={styles.notificationTime}>
                                            {formatTime(notification.createdAt)}
                                        </div>
                                    </div>
                                    
                                    {!notification.read && (
                                        <div className={styles.unreadDot}></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className={styles.notificationsFooter}>
                            <button className={styles.viewAllButton}>
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationsInterface;