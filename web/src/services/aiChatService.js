/**
 * AI Chat WebSocket Service
 * Manages WebSocket connection to backend AI chat endpoint
 * Backend URL: ws://localhost:8080/api/ai-ws
 */

class AiChatService {
  constructor() {
    this.ws = null;
    this.messageListeners = [];
    this.statusListeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
    this.isManualDisconnect = false;
  }

  /**
   * Connect to AI WebSocket
   * @param {string} wsUrl - WebSocket URL (default: ws://localhost:8080/api/ai-ws)
   */
  connect(wsUrl = 'ws://localhost:8080/api/ai-ws') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected to AI WebSocket');
      return;
    }

    console.log('🔌 Connecting to AI WebSocket:', wsUrl);
    this.isManualDisconnect = false;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to AI Chat WebSocket');
        this.reconnectAttempts = 0;
        this.notifyStatusListeners('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 AI message received:', message);
          this.notifyMessageListeners(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.notifyStatusListeners('error');
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from AI Chat WebSocket');
        this.notifyStatusListeners('disconnected');

        // Attempt reconnection if not manually disconnected
        if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => this.connect(wsUrl), this.reconnectDelay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          this.notifyStatusListeners('failed');
        }
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.notifyStatusListeners('error');
    }
  }

  /**
   * Send a question to the AI
   * @param {string} question - The question to ask
   * @returns {boolean} - True if sent successfully
   */
  sendQuestion(question) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      this.notifyStatusListeners('error');
      return false;
    }

    try {
      const message = { question };
      this.ws.send(JSON.stringify(message));
      console.log('📤 Question sent:', question);
      return true;
    } catch (error) {
      console.error('❌ Failed to send question:', error);
      return false;
    }
  }

  /**
   * Subscribe to AI messages
   * @param {Function} callback - Called when a message is received
   * @returns {Function} - Unsubscribe function
   */
  onMessage(callback) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to connection status changes
   * @param {Function} callback - Called when status changes
   * @returns {Function} - Unsubscribe function
   */
  onStatusChange(callback) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all message listeners
   * @private
   */
  notifyMessageListeners(message) {
    this.messageListeners.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('❌ Error in message listener:', error);
      }
    });
  }

  /**
   * Notify all status listeners
   * @private
   */
  notifyStatusListeners(status) {
    this.statusListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('❌ Error in status listener:', error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.isManualDisconnect = true;
      this.ws.close();
      this.ws = null;
      console.log('🔌 Manually disconnected from AI Chat');
    }
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection status
   * @returns {string} - 'connected', 'connecting', 'disconnected'
   */
  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }
}

// Export singleton instance
const aiChatService = new AiChatService();
export default aiChatService;
