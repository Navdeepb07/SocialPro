"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/DashBoardLayout.module.css";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setTokenIsThere } from "../../src/config/redux/reducer/authReducer";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../src/config/index.jsx";
import { getAllUsers, sendConnectionRequest, getAllMyConnections } from "../../src/config/redux/actions/authAction";
import newsService from "../../src/services/newsService.js";
import analyticsService from "../../src/services/analyticsService.js";
import realTimeService from "../../src/services/realTimeService.js";
import MessagingPage from "../messaging/page.jsx";

function DashBoardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  
  // State for dynamic content
  const [newsItems, setNewsItems] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true); 

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
    dispatch(setTokenIsThere());
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAllUsers());
      dispatch(getAllMyConnections({token}));
    }
  }, [authState.isTokenThere]);

  // Fetch news and analytics when profile is loaded
  useEffect(() => {
    if (authState.profileFetched) {
      fetchNews();
      fetchAnalytics();
      // Initialize real-time updates
      realTimeService.initialize(dispatch, authState);
    }
    
    // Cleanup real-time service on unmount
    return () => {
      realTimeService.stop();
    };
  }, [authState.profileFetched]);

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const news = await newsService.fetchNews();
      setNewsItems(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to default news
      setNewsItems([
        { title: "Tech industry trends", time: "2h ago", readers: "1,234" },
        { title: "Remote work updates", time: "4h ago", readers: "856" },
        { title: "Career development", time: "6h ago", readers: "623" }
      ]);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const connections = authState.receivedRequests?.filter(req => req.status === true) || [];
      const analytics = await analyticsService.getUserAnalytics(
        authState.user,
        connections
      );
      setUserAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback analytics
      setUserAnalytics({
        profileViews: 25,
        postImpressions: 1847
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Helper function to check if user is connected
  const isUserConnected = (userId) => {
    if (!authState.receivedRequests || !authState.sentRequests) return false;
    
    // Check if user is in accepted received requests (they sent me a request I accepted)
    const inReceivedRequests = authState.receivedRequests.some(
      req => req.userId._id === userId && req.status === true
    );
    
    // Check if user is in accepted sent requests (I sent them a request they accepted)
    const inSentRequests = authState.sentRequests.some(
      req => req.connectionId._id === userId && req.status === true
    );
    
    return inReceivedRequests || inSentRequests;
  };

  // Helper function to check if connection request is pending
  const isRequestPending = (userId) => {
    if (!authState.sentRequests) return false;
    
    return authState.sentRequests.some(
      req => req.connectionId._id === userId && req.status === null
    );
  };

  // Handle connect button click
  const handleConnectClick = async (userId) => {
    const token = localStorage.getItem("token");
    if (token && !isUserConnected(userId) && !isRequestPending(userId)) {
      await dispatch(sendConnectionRequest({
        userId: userId,
        token: token
      }));
      // Refresh connections data
      dispatch(getAllMyConnections({token}));
    }
  };

  // Get button text based on connection status
  const getButtonText = (userId) => {
    if (isUserConnected(userId)) return "Connected";
    if (isRequestPending(userId)) return "Pending";
    return "Connect";
  };

  // Get button class based on connection status
  const getButtonClass = (userId) => {
    if (isUserConnected(userId)) return `${styles.connectBtn} ${styles.connected}`;
    if (isRequestPending(userId)) return `${styles.connectBtn} ${styles.pending}`;
    return styles.connectBtn;
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.dashboardContainer}>
        <div className={styles.contentArea}>
          {/* Left Sidebar */}
          <aside className={styles.leftSidebar}>
            <div className={styles.sidebarCard}>
              {/* User Profile Section */}
              {authState.profileFetched && (
                <div className={styles.profileSection}>
                  <div className={styles.profileCover}></div>
                  <div className={styles.profileContent}>
                    <img 
                      className={styles.profileAvatar}
                      src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                      alt={authState.user.userId.name}
                    />
                    <div className={styles.profileInfo}>
                      <h3 className={styles.profileName}>{authState.user.userId.name}</h3>
                      <p className={styles.profileUsername}>@{authState.user.userId.username}</p>
                    </div>
                    <div className={styles.profileStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Profile viewers</span>
                        <span className={styles.statValue}>
                          {loadingAnalytics ? '...' : (userAnalytics?.profileViews || 0)}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Post impressions</span>
                        <span className={styles.statValue}>
                          {loadingAnalytics ? '...' : analyticsService.formatNumber(userAnalytics?.postImpressions || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Menu */}
              <div className={styles.sidebarNav}>
                <div 
                  className={`${styles.navItem} ${router.pathname === '/dashboard' ? styles.active : ''}`}
                  onClick={() => router.push("/dashboard")}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 5 3.18V2h3v5.09z"></path>
                  </svg>
                  <span>Home Feed</span>
                </div>
                
                <div 
                  className={`${styles.navItem} ${router.pathname === '/discover' ? styles.active : ''}`}
                  onClick={() => router.push("/discover")}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.41 18.59l-5.27-5.28A6.83 6.83 0 0017 10a7 7 0 10-7 7 6.83 6.83 0 003.31-.86l5.28 5.27a2 2 0 002.82-2.82zM5 10a5 5 0 115 5 5 5 0 01-5-5z"></path>
                  </svg>
                  <span>Discover</span>
                </div>
                
                <div 
                  className={`${styles.navItem} ${router.pathname === '/connections' ? styles.active : ''}`}
                  onClick={() => router.push("/connections")}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 16v6H3v-6a3 3 0 013-3h3a3 3 0 013 3zM5.5 7.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM18.5 10a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0zM21 16v6h-4v-6a3 3 0 013-3h1z"></path>
                  </svg>
                  <span>My Network</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {children}
          </main>

          {/* Right Sidebar */}
          <aside className={styles.rightSidebar}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>People you may know</h3>
              
              {authState.all_profiles_fetched && authState.all_users
                .filter(profile => profile.userId._id !== authState.user?.userId?._id) // Don't show current user
                .slice(0, 5)
                .map((profile) => {
                const user = profile.userId;
                const buttonText = getButtonText(user._id);
                const buttonClass = getButtonClass(user._id);
                const isClickable = buttonText === "Connect";
                
                return (
                  <div key={profile._id} className={styles.suggestionItem}>
                    <img 
                      className={styles.suggestionAvatar}
                      src={`${BASE_URL}/${user.profilePicture || 'default.jpeg'}`}
                      alt={user.name}
                    />
                    <div className={styles.suggestionInfo}>
                      <h4 className={styles.suggestionName}>{user.name}</h4>
                      <p className={styles.suggestionTitle}>@{user.username}</p>
                      <button 
                        className={buttonClass}
                        onClick={() => handleConnectClick(user._id)}
                        disabled={!isClickable || authState.isLoading}
                      >
                        {buttonText}
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {!authState.all_profiles_fetched && (
                <div className={styles.loadingState}>
                  <p>Loading suggestions...</p>
                </div>
              )}
            </div>
            
            {/* Professional News */}
            <div className={styles.sidebarCard}>
              <div className={styles.newsHeader}>
                <h3 className={styles.sidebarTitle}>Professional News</h3>
                {!loadingNews && (
                  <button 
                    className={styles.refreshButton}
                    onClick={fetchNews}
                    title="Refresh news"
                  >
                    ↻
                  </button>
                )}
              </div>
              
              {loadingNews ? (
                <div className={styles.loadingNews}>
                  <div className={styles.newsSkeletonItem}></div>
                  <div className={styles.newsSkeletonItem}></div>
                  <div className={styles.newsSkeletonItem}></div>
                </div>
              ) : (
                newsItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={styles.newsItem} 
                    onClick={() => item.url ? window.open(item.url, '_blank', 'noopener,noreferrer') : null}
                    style={{ cursor: item.url ? 'pointer' : 'default' }}
                  >
                    <div className={styles.newsTitle}>{item.title}</div>
                    <div className={styles.newsTime}>
                      {item.time} • {item.readers} readers
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
      {/* Messaging Widget */}
      <MessagingPage />
    </div>
  );
}

export default DashBoardLayout;
