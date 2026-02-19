"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getConversations, getMessages, sendMessage, markMessagesAsRead } from '../../src/config/redux/actions/messageAction/index.js';
import { setCurrentConversation, clearMessages } from '../../src/config/redux/reducer/messageReducer/index.js';
import { BASE_URL } from '../../src/config/index.jsx';
import styles from './styles.module.css';

function MessagingPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    
    const authState = useSelector((state) => state.auth);
    const messageState = useSelector((state) => state.messages);
    const { conversations, messages, currentConversation, isLoading } = messageState;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && token !== 'null' && token !== 'undefined' && isOpen) {
            dispatch(getConversations({ token }));
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for custom event to open a conversation
    useEffect(() => {
        const handleOpenConversation = (event) => {
            const { userId, userName, userAvatar } = event.detail;
            
            // Create a mock conversation object to open the chat
            const mockConversation = {
                participant: {
                    _id: userId,
                    name: userName,
                    profilePicture: userAvatar,
                    username: userName.toLowerCase().replace(' ', '')
                },
                unreadCount: 0
            };
            
            // Open the messaging widget and select this conversation
            setIsOpen(true);
            setSelectedConversation(mockConversation);
            dispatch(setCurrentConversation(mockConversation));
            
            // Load messages for this conversation
            const token = localStorage.getItem("token");
            if (token && token !== 'null' && token !== 'undefined') {
                dispatch(getMessages({ 
                    userId: userId, 
                    token 
                }));
                dispatch(getConversations({ token })); // Refresh conversations list
            }
        };

        window.addEventListener('openMessagingConversation', handleOpenConversation);
        
        // Cleanup event listener
        return () => {
            window.removeEventListener('openMessagingConversation', handleOpenConversation);
        };
    }, [dispatch]);

    // Listen for navbar messaging toggle event
    useEffect(() => {
        const handleToggleWidget = () => {
            setIsOpen(!isOpen);
            
            // If opening, load conversations
            if (!isOpen) {
                const token = localStorage.getItem("token");
                if (token && token !== 'null' && token !== 'undefined') {
                    dispatch(getConversations({ token }));
                }
            }
        };

        window.addEventListener('toggleMessagingWidget', handleToggleWidget);
        
        return () => {
            window.removeEventListener('toggleMessagingWidget', handleToggleWidget);
        };
    }, [isOpen, dispatch]);

    const handleConversationClick = async (conversation) => {
        setSelectedConversation(conversation);
        dispatch(setCurrentConversation(conversation));
        
        const token = localStorage.getItem("token");
        if (token && token !== 'null' && token !== 'undefined') {
            await dispatch(getMessages({ 
                userId: conversation.participant._id, 
                token 
            }));
            
            // Mark messages as read
            if (conversation.unreadCount > 0) {
                dispatch(markMessagesAsRead({ 
                    conversationId: conversation.participant._id, 
                    token 
                }));
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation) return;
        
        const token = localStorage.getItem("token");
        if (token && token !== 'null' && token !== 'undefined') {
            await dispatch(sendMessage({
                receiverId: selectedConversation.participant._id,
                content: messageText.trim(),
                token
            }));
            setMessageText('');
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays <= 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    if (!isOpen) {
        return (
            <div className={styles.messagingTrigger} onClick={() => setIsOpen(true)}>
                <svg className={styles.messageIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16 4H8a7 7 0 000 14h4v4l8.16-5.39A6.78 6.78 0 0023 11a7 7 0 00-7-7z"></path>
                </svg>
                <span>Messages</span>
            </div>
        );
    }

    return (
        <div className={styles.messagingContainer}>
            <div className={styles.messagingHeader}>
                <h3>Messages</h3>
                <button 
                    className={styles.closeButton}
                    onClick={() => {
                        setIsOpen(false);
                        setSelectedConversation(null);
                        dispatch(clearMessages());
                    }}
                >
                    ×
                </button>
            </div>
            
            <div className={styles.messagingBody}>
                {/* Conversations List */}
                <div className={`${styles.conversationsList} ${selectedConversation ? styles.hidden : ''}`}>
                    <div className={styles.searchBox}>
                        <svg className={styles.searchIcon} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M21.41 18.59l-5.27-5.28A6.83 6.83 0 0017 10a7 7 0 10-7 7 6.83 6.83 0 003.31-.86l5.28 5.27a2 2 0 002.82-2.82z"></path>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search messages" 
                            className={styles.searchInput}
                        />
                    </div>
                    
                    <div className={styles.conversationsContainer}>
                        {conversations.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No conversations yet</p>
                                <span>Start a conversation by visiting someones profile</span>
                            </div>
                        ) : (
                            conversations.map((conversation) => (
                                <div 
                                    key={conversation._id}
                                    className={styles.conversationItem}
                                    onClick={() => handleConversationClick(conversation)}
                                >
                                    <img 
                                        src={`${BASE_URL}/${conversation.participant.profilePicture || 'default.jpeg'}`}
                                        alt={conversation.participant.name}
                                        className={styles.conversationAvatar}
                                    />
                                    <div className={styles.conversationContent}>
                                        <div className={styles.conversationHeader}>
                                            <h4 className={styles.conversationName}>
                                                {conversation.participant.name}
                                            </h4>
                                            <span className={styles.conversationTime}>
                                                {formatTime(conversation.lastMessage.createdAt)}
                                            </span>
                                        </div>
                                        <p className={`${styles.conversationPreview} ${conversation.unreadCount > 0 ? styles.unread : ''}`}>
                                            {conversation.lastMessage.content}
                                        </p>
                                    </div>
                                    {conversation.unreadCount > 0 && (
                                        <div className={styles.unreadBadge}>
                                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Interface */}
                {selectedConversation && (
                    <div className={styles.chatInterface}>
                        <div className={styles.chatHeader}>
                            <button 
                                className={styles.backButton}
                                onClick={() => {
                                    setSelectedConversation(null);
                                    dispatch(clearMessages());
                                }}
                            >
                                ←
                            </button>
                            <img 
                                src={`${BASE_URL}/${selectedConversation.participant.profilePicture || 'default.jpeg'}`}
                                alt={selectedConversation.participant.name}
                                className={styles.chatAvatar}
                            />
                            <div className={styles.chatUserInfo}>
                                <h4>{selectedConversation.participant.name}</h4>
                                <span>@{selectedConversation.participant.username}</span>
                            </div>
                        </div>
                        
                        <div className={styles.messagesContainer}>
                            {messages.map((message) => (
                                <div 
                                    key={message._id}
                                    className={`${styles.messageItem} ${
                                        message.sender._id === authState.user.userId._id ? styles.sent : styles.received
                                    }`}
                                >
                                    <div className={styles.messageContent}>
                                        <p>{message.content}</p>
                                        <span className={styles.messageTime}>
                                            {formatTime(message.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <form className={styles.messageForm} onSubmit={handleSendMessage}>
                            <input 
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type a message..."
                                className={styles.messageInput}
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                className={styles.sendButton}
                                disabled={!messageText.trim() || isLoading}
                            >
                                <svg viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                                </svg>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagingPage;