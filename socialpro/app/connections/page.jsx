"use client";
import React, { useEffect } from 'react';
import UserLayout from '../componets/UserLayout';
import DashBoardLayout from '../componets/DashBoardLayout';
import { useDispatch,useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getMyConnectionRequests, acceptConnectionrequest, getAllMyConnections, getAllUsers } from '../../src/config/redux/actions/authAction';
import styles from './styles.module.css';

function Connections() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token) {
      dispatch(getAllUsers());
      dispatch(getMyConnectionRequests({token}));
      dispatch(getAllMyConnections({token}));
    } else {
      console.log("No token found in localStorage");
    }
  },[])

  useEffect(()=>{
    console.log("Connection Requests State:", authState.connectionRequests);
    console.log("Received Requests:", authState.receivedRequests);
    console.log("Sent Requests:", authState.sentRequests);
    console.log("Auth State:", authState);
  },[authState.connectionRequests, authState.receivedRequests, authState.sentRequests, authState])

  // Add effect to refresh connections when page gains focus
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem('token');
      if(token) {
        console.log("Page focused, refreshing connections...");
        dispatch(getMyConnectionRequests({token}));
        dispatch(getAllMyConnections({token}));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Add periodic refresh every 30 seconds to catch updates
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if(token) {
        console.log("Periodic refresh of connections...");
        dispatch(getAllMyConnections({token}));
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (username) => {
    if (username) {
      router.push(`/view_profile/${username}`);
    }
  };

  const handleAcceptReject = async (requestId, action) => {
    const token = localStorage.getItem('token');
    if (token) {
      await dispatch(acceptConnectionrequest({
        connectionId: requestId,
        accept: action,
        token: token
      }));
      // Refresh both pending requests and accepted connections after action
      dispatch(getMyConnectionRequests({token}));
      dispatch(getAllMyConnections({token}));
    }
  };

  const renderAcceptedConnections = () => {
    // Use the same logic as "People you may know" - get from all_users and check connection status
    if (!authState.all_users || !authState.receivedRequests || !authState.sentRequests) {
      return <div className={styles.loadingContainer}><p>Loading connections...</p></div>;
    }

    const connectedUsers = authState.all_users.filter(profile => {
      const userId = profile.userId._id;
      
      // Skip current user
      if (userId === authState.user?.userId?._id) return false;
      
      // Check if user is connected (same logic as DashBoardLayout)
      const inReceivedRequests = authState.receivedRequests.some(
        req => req.userId?._id === userId && req.status === true
      );
      
      const inSentRequests = authState.sentRequests.some(
        req => req.connectionId?._id === userId && req.status === true
      );
      
      return inReceivedRequests || inSentRequests;
    });

    console.log("Connected users:", connectedUsers);
    
    if (connectedUsers.length === 0) {
      return <div className={styles.emptyState}><p>No connections yet.</p></div>;
    }
    
    return connectedUsers.map((profile) => {
      const user = profile.userId;
      
      return (
        <div key={profile._id} className={styles.connectionCard} onClick={() => handleCardClick(user?.username)}>
          <div className={styles.requestInfo}>
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={styles.userDetails}>
              <h3 className={styles.userName}>{user?.name || 'Unknown User'}</h3>
              <p className={styles.userEmail}>{user?.email || 'N/A'}</p>
              <p className={styles.userUsername}>@{user?.username || 'N/A'}</p>
            </div>
          </div>
          <div className={styles.statusSection}>
            <span className={`${styles.statusBadge} ${styles.connected}`}>
              Connected
            </span>
          </div>
        </div>
      );
    });
  };

  const renderConnectionRequests = () => {
    // Use the same logic as "People you may know" - get from all_users and check request status
    if (!authState.all_users || !authState.connectionRequests) {
      return <div className={styles.loadingContainer}><p>Loading connection requests...</p></div>;
    }

    const pendingRequestUsers = authState.all_users.filter(profile => {
      const userId = profile.userId._id;
      
      // Skip current user
      if (userId === authState.user?.userId?._id) return false;
      
      // Check if there's a pending request from this user to me
      return authState.connectionRequests.some(
        req => req.userId?._id === userId && req.status === null
      );
    });

    console.log("Pending request users:", pendingRequestUsers);
    
    if (pendingRequestUsers.length === 0) {
      return <div className={styles.emptyState}><p>No pending connection requests.</p></div>;
    }
    
    return pendingRequestUsers.map((profile) => {
      const user = profile.userId;
      // Find the corresponding request to get the request ID
      const request = authState.connectionRequests.find(
        req => req.userId?._id === user._id && req.status === null
      );
      
      return (
        <div key={profile._id} className={styles.requestCard} onClick={() => handleCardClick(user?.username)}>
          <div className={styles.requestInfo}>
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={styles.userDetails}>
              <h3 className={styles.userName}>{user?.name || 'Unknown User'}</h3>
              <p className={styles.userEmail}>{user?.email || 'N/A'}</p>
              <p className={styles.userUsername}>@{user?.username || 'N/A'}</p>
            </div>
          </div>
          
          <div className={styles.statusSection}>
            <span className={`${styles.statusBadge} ${styles.pending}`}>
              Pending
            </span>
            
            <div className={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
              <button 
                className={`${styles.button} ${styles.acceptButton}`}
                onClick={() => handleAcceptReject(request?._id, 'accept')}
                disabled={authState.isLoading}
              >
                Accept
              </button>
              <button 
                className={`${styles.button} ${styles.rejectButton}`}
                onClick={() => handleAcceptReject(request?._id, 'reject')}
                disabled={authState.isLoading}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Connections</h1>
            <p className={styles.subtitle}>Manage your connections and requests</p>
          </div>
          
          {/* My Connections Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>My Connections</h2>
            <div className={styles.content}>
              {authState.isLoading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Loading connections...</p>
                </div>
              )}
              {!authState.isLoading && renderAcceptedConnections()}
            </div>
          </div>

          {/* Pending Requests Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Pending Requests</h2>
            <div className={styles.content}>
              {authState.isLoading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Processing...</p>
                </div>
              )}
              {authState.isError && (
                <div className={styles.errorContainer}>
                  <p>Error: {authState.message}</p>
                </div>
              )}
              {!authState.isLoading && renderConnectionRequests()}
            </div>
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  )
}

export default Connections
