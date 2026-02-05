import apiClient from './apiClient';

const STORAGE_KEY = 'neuralhealer_last_sse_id';

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.listeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  /**
   * Connect to SSE stream
   */
  connect() {
    if (this.eventSource) {
      console.warn('SSE already connected');
      return;
    }

    const lastId = localStorage.getItem(STORAGE_KEY);
    // Use relative URL to use Vite's proxy (same-origin cookies will work)
    let url = '/api/notifications/stream';
    
    // Add lastEventId as query param if available
    if (lastId) {
      url += `?lastEventId=${encodeURIComponent(lastId)}`;
    }

    console.log('🔔 Connecting to notification stream:', url);
    
    // EventSource will use the current origin (proxied to backend)
    // Cookies will be sent automatically for same-origin requests
    this.eventSource = new EventSource(url);

    // Handle connection established
    this.eventSource.addEventListener('connected', (event) => {
      console.log('✅ SSE Stream Connected:', JSON.parse(event.data));
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    // Handle incoming notifications
    this.eventSource.onmessage = (event) => {
      try {
        // Store lastEventId for reconnection
        if (event.lastEventId) {
          localStorage.setItem(STORAGE_KEY, event.lastEventId);
        }

        const data = JSON.parse(event.data);
        
        // Skip heartbeat messages
        if (data.status === 'ping') {
          return;
        }

        // Notify all listeners
        this.notifyListeners(data);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    // Handle errors and reconnection
    this.eventSource.onerror = (error) => {
      console.error('SSE Connection Error:', error);
      
      // Close current connection
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      // Attempt reconnection with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
          this.connect();
        }, delay);
      } else {
        console.error('❌ Max reconnection attempts reached');
      }
    };
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect() {
    if (this.eventSource) {
      console.log('🔌 Disconnecting from notification stream');
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners = [];
    this.reconnectAttempts = 0;
  }

  /**
   * Add a listener for notifications
   */
  addListener(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(notification) {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Get notification history
   */
  async getNotifications(page = 0, size = 20) {
    try {
      const response = await apiClient.get('/notifications', {
        params: { page, size, sort: 'sentAt,desc' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await apiClient.put('/notifications/mark-all-read');
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Clear stored lastEventId (useful for testing)
   */
  clearStoredId() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
