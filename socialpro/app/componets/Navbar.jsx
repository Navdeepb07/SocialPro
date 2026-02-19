"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { reset } from '../../src/config/redux/reducer/authReducer/index.js';
import { getUnreadMessageCount } from '../../src/config/redux/actions/messageAction/index.js';
import { getUnreadNotificationCount } from '../../src/config/redux/actions/notificationAction/index.js';
import styles from '../styles/Navbar.module.css';
import { BASE_URL } from '../../src/config';
import NotificationsInterface from './NotificationsInterface.jsx';
import { getValidToken, handleAuthError, clearOldToken } from '../utils/tokenUtils';

function Navbar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const authState = useSelector((state) => state.auth);
    const messageState = useSelector((state) => state.messages);
    const notificationState = useSelector((state) => state.notifications);
    const dispatch = useDispatch();

    // Fetch unread counts when user is logged in
    useEffect(() => {
        const token = getValidToken();
        if (token && authState.profileFetched) {
            dispatch(getUnreadMessageCount({ token }));
            dispatch(getUnreadNotificationCount({ token }));
            
            // Set up polling for real-time updates (every 30 seconds)
            const interval = setInterval(() => {
                const currentToken = getValidToken();
                if (currentToken) {
                    dispatch(getUnreadMessageCount({ token: currentToken }));
                    dispatch(getUnreadNotificationCount({ token: currentToken }));
                } else {
                    // Token became invalid, redirect to login
                    handleLogout();
                }
            }, 30000);
            
            return () => clearInterval(interval);
        }
    }, [authState.profileFetched, dispatch]);

    // Handle auth errors
    useEffect(() => {
        if (messageState.error && handleAuthError(messageState.error)) {
            handleLogout();
        }
        if (notificationState.error && handleAuthError(notificationState.error)) {
            handleLogout();
        }
    }, [messageState.error, notificationState.error]);

    const handleLogout = () => {
        clearOldToken();
        router.push("/login");
        dispatch(reset());
        setShowUserMenu(false);
    };
    return (
        <header className={styles.navbar}>
            <div className={styles.navContainer}>
                {/* Logo and Search Section */}
                <div className={styles.navLeft}>
                    <div className={styles.logo} onClick={() => router.push("/")}>
                        <div className={styles.logoIcon}>
                            <svg viewBox="0 0 24 24" className={styles.logoSvg}>
                                <path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                            </svg>
                        </div>
                        <span className={styles.logoText}>Pro Connect</span>
                    </div>
                    
                    {authState.profileFetched && (
                        <div className={styles.searchContainer}>
                            <svg className={styles.searchIcon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M21.41 18.59l-5.27-5.28A6.83 6.83 0 0017 10a7 7 0 10-7 7 6.83 6.83 0 003.31-.86l5.28 5.27a2 2 0 002.82-2.82zM5 10a5 5 0 115 5 5 5 0 01-5-5z"></path>
                            </svg>
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Navigation Icons */}
                {authState.profileFetched && (
                    <div className={styles.navCenter}>
                        <div 
                            className={`${styles.navItem} ${router.pathname === '/dashboard' ? styles.active : ''}`}
                            onClick={() => router.push("/dashboard")}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 5 3.18V2h3v5.09z"></path>
                            </svg>
                            <span>Home</span>
                        </div>
                        
                        <div 
                            className={`${styles.navItem} ${router.pathname === '/connections' ? styles.active : ''}`}
                            onClick={() => router.push("/connections")}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 16v6H3v-6a3 3 0 013-3h3a3 3 0 013 3zM5.5 7.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM18.5 10a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0zM21 16v6h-4v-6a3 3 0 013-3h1z"></path>
                            </svg>
                            <span>Network</span>
                        </div>
                        
                        <div 
                            className={`${styles.navItem} ${router.pathname === '/discover' ? styles.active : ''}`}
                            onClick={() => router.push("/discover")}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M17 6V5a3 3 0 00-3-3h-4a3 3 0 00-3 3v1H2v4a3 3 0 003 3h14a3 3 0 003-3V6zM9 5a1 1 0 011-1h4a1 1 0 011 1v1H9zm10 9a4 4 0 01-4 4H9a4 4 0 01-4-4v-1h14z"></path>
                            </svg>
                            <span>Jobs</span>
                        </div>
                        
                        <div 
                            className={`${styles.navItem} ${messageState.unreadCount > 0 ? styles.navItemWithBadge : ''}`}
                            onClick={() => {
                                // Trigger messaging widget to open
                                const messageEvent = new CustomEvent('toggleMessagingWidget');
                                window.dispatchEvent(messageEvent);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M16 4H8a7 7 0 000 14h4v4l8.16-5.39A6.78 6.78 0 0023 11a7 7 0 00-7-7zm-8 8.25A1.25 1.25 0 119.25 11 1.25 1.25 0 018 12.25zm4 0A1.25 1.25 0 1113.25 11 1.25 1.25 0 0112 12.25zm4 0A1.25 1.25 0 1117.25 11 1.25 1.25 0 0116 12.25z"></path>
                            </svg>
                            {messageState.unreadCount > 0 && (
                                <span className={styles.messageBadge}>
                                    {messageState.unreadCount > 99 ? '99+' : messageState.unreadCount}
                                </span>
                            )}
                            <span>Messaging</span>
                        </div>
                        
                        <NotificationsInterface />
                    </div>
                )}

                {/* User Menu */}
                <div className={styles.navRight}>
                    {authState.profileFetched ? (
                        <div className={styles.userMenu}>
                            <div 
                                className={styles.userProfile}
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <img 
                                    className={styles.userAvatar} 
                                    src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                                    alt={authState.user.userId.name}
                                />
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>Me</span>
                                    <svg className={`${styles.dropdownIcon} ${showUserMenu ? styles.rotated : ''}`} viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M8.5 11.5L12 15l3.5-3.5z"></path>
                                    </svg>
                                </div>
                            </div>
                            
                            {showUserMenu && (
                                <div className={styles.dropdownMenu}>
                                    <div className={styles.menuHeader}>
                                        <img 
                                            className={styles.menuAvatar} 
                                            src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                                            alt={authState.user.userId.name}
                                        />
                                        <div>
                                            <div className={styles.menuUserName}>{authState.user.userId.name}</div>
                                            <div className={styles.menuUserTitle}>@{authState.user.userId.username}</div>
                                        </div>
                                    </div>
                                    <div className={styles.menuDivider}></div>
                                    <button className={styles.menuItem} onClick={()=>{
                                        router.push("/profile")
                                    }}>
                                        View Profile
                                    </button>
                                    <div className={styles.menuDivider}></div>
                                    <button className={styles.menuItem} onClick={handleLogout}>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            className={styles.joinButton}
                            onClick={() => router.push("/login")}
                        >
                            Join now
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
}

export default Navbar;