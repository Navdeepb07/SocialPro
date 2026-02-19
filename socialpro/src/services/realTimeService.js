// Real-time service for polling updates without WebSocket complexity
class RealTimeService {
  constructor() {
    this.intervals = new Map();
    this.isActive = false;
    this.callbacks = new Map();
  }

  // Start real-time updates
  start(dispatch, authState) {
    if (this.isActive) return;
    
    this.isActive = true;
    const token = localStorage.getItem('token');
    
    if (!token || !authState.profileFetched) return;

    // Poll for unread message count every 30 seconds
    const messageInterval = setInterval(() => {
      this.pollMessageUpdates(dispatch, token);
    }, 30000);
    
    // Poll for notifications every 45 seconds
    const notificationInterval = setInterval(() => {
      this.pollNotificationUpdates(dispatch, token);
    }, 45000);

    // Poll for connection updates every 60 seconds
    const connectionInterval = setInterval(() => {
      this.pollConnectionUpdates(dispatch, token);
    }, 60000);

    this.intervals.set('messages', messageInterval);
    this.intervals.set('notifications', notificationInterval);
    this.intervals.set('connections', connectionInterval);

    // Real-time polling started
  }

  // Stop real-time updates
  stop() {
    this.isActive = false;
    
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    
    this.intervals.clear();
    // Real-time polling stopped
  }

  // Poll for new messages
  async pollMessageUpdates(dispatch, token) {
    try {
      const { getUnreadMessageCount } = await import('../config/redux/actions/messageAction/index.js');
      dispatch(getUnreadMessageCount({ token }));
    } catch (error) {
      // Error in message polling
    }
  }

  // Poll for new notifications
  async pollNotificationUpdates(dispatch, token) {
    try {
      const { getUnreadNotificationCount, getNotifications } = await import('../config/redux/actions/notificationAction/index.js');
      dispatch(getUnreadNotificationCount({ token }));
      
      // Refresh notifications if user has the dropdown open
      const notificationDropdown = document.querySelector('[data-notifications-open="true"]');
      if (notificationDropdown) {
        dispatch(getNotifications({ token }));
      }
    } catch (error) {
      // Error in notification polling
    }
  }

  // Poll for connection updates
  async pollConnectionUpdates(dispatch, token) {
    try {
      const { getAllMyConnections, getConnectionRequests } = await import('../config/redux/actions/authAction/index.js');
      dispatch(getAllMyConnections({ token }));
      dispatch(getConnectionRequests({ token }));
    } catch (error) {
      // Error in connection polling
    }
  }

  // Register callback for specific events
  onUpdate(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  // Remove callback
  offUpdate(event, callback) {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Trigger callbacks for an event
  triggerEvent(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Error in callback
        }
      });
    }
  }

  // Simulate new message notification (for demo)
  simulateNewMessage() {
    this.triggerEvent('newMessage', {
      id: Date.now(),
      sender: 'Demo User',
      content: 'This is a simulated message for demo purposes',
      timestamp: new Date().toISOString()
    });
  }

  // Simulate new notification (for demo)
  simulateNotification(type = 'connection_request') {
    const notifications = {
      connection_request: {
        title: 'New Connection Request',
        message: 'John Doe wants to connect with you',
        type: 'connection_request'
      },
      post_like: {
        title: 'Post Liked',
        message: 'Sarah Johnson liked your post',
        type: 'post_like'
      },
      message: {
        title: 'New Message', 
        message: 'You have a new message from Alex Smith',
        type: 'message'
      }
    };

    this.triggerEvent('newNotification', {
      id: Date.now(),
      ...notifications[type],
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  // Check if user is active (for optimization)
  isUserActive() {
    return document.hasFocus() && !document.hidden;
  }

  // Adaptive polling based on user activity
  adaptivePolling(dispatch, token) {
    const isActive = this.isUserActive();
    
    if (isActive) {
      // User is active, poll more frequently
      this.pollMessageUpdates(dispatch, token);
      this.pollNotificationUpdates(dispatch, token);
    } else {
      // User is inactive, poll less frequently
      setTimeout(() => {
        if (!this.isUserActive()) {
          this.pollNotificationUpdates(dispatch, token);
        }
      }, 60000); // Poll every minute when inactive
    }
  }

  // Handle visibility change
  handleVisibilityChange(dispatch, token) {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // User came back, refresh immediately
        this.pollMessageUpdates(dispatch, token);
        this.pollNotificationUpdates(dispatch, token);
      }
    });
  }

  // Initialize with optimal settings
  initialize(dispatch, authState) {
    const token = localStorage.getItem('token');
    
    if (token && authState.profileFetched) {
      this.start(dispatch, authState);
      this.handleVisibilityChange(dispatch, token);
      
      // Set up page unload cleanup
      window.addEventListener('beforeunload', () => {
        this.stop();
      });
    }
  }
}

// Export singleton instance
const realTimeService = new RealTimeService();
export default realTimeService;