import { Client } from '@stomp/stompjs';
import apiClient from './apiClient';

/**
 * AI Chat STOMP WebSocket Service
 * Manages STOMP WebSocket connection to backend AI chat endpoint
 * Matches stomp-test.html connection pattern exactly
 * Backend WebSocket URL: ws://localhost:8080/api/ws
 * Subscribe to: /user/queue/ai
 * Publish to: /app/ai/ask
 */

class AiChatService {
  constructor() {
    this.stompClient = null;
    this.messageListeners = [];
    this.statusListeners = [];
    this.currentSessionId = null;
    this.isManualDisconnect = false;
    
    // API configuration
    this.API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  }

  /**
   * Connect to AI WebSocket using STOMP
   * @param {string} wsUrl - WebSocket URL (default from VITE_WS_URL env var)
   */
  connect(wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ws') {
    if (this.stompClient && this.stompClient.connected) {
      console.log('✅ Already connected to AI WebSocket (STOMP)');
      return;
    }

    console.log('🔌 Connecting to AI WebSocket via STOMP:', wsUrl);
    this.isManualDisconnect = false;

    try {
      const connectHeaders = {};
      // HTTP-only cookie authentication is handled automatically by the browser
      // No need to manually add Authorization header

      this.stompClient = new Client({
        brokerURL: wsUrl,
        connectHeaders: connectHeaders,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        
        debug: (msg) => {
          console.log('[STOMP]', msg);
        },
        
        onConnect: (frame) => {
          console.log('✅ Connected to AI Chat WebSocket (STOMP)');
          console.log('[STOMP] Connection frame:', frame);
          
          // Subscribe to AI message queue
          this.stompClient.subscribe('/user/queue/ai', (message) => {
            this.onAiMessage(message);
          });
          
          this.notifyStatusListeners('connected');
        },
        
        onDisconnect: () => {
          console.log('🔌 Disconnected from AI Chat WebSocket (STOMP)');
          this.notifyStatusListeners('disconnected');
          
          // Auto-reconnect if not manual disconnect
          if (!this.isManualDisconnect) {
            console.log('🔄 Will attempt to reconnect via STOMP reconnectDelay...');
          }
        },
        
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame.headers['message']);
          console.error('[STOMP] Error details:', frame);
          this.notifyStatusListeners('error');
        },
        
        onWebSocketError: (error) => {
          console.error('❌ WebSocket error:', error);
          this.notifyStatusListeners('error');
        }
      });

      this.stompClient.activate();
    } catch (error) {
      console.error('❌ Failed to create STOMP client:', error);
      this.notifyStatusListeners('error');
    }
  }

  /**
   * Handle incoming AI messages from STOMP
   * @private
   */
  onAiMessage(message) {
    try {
      const event = JSON.parse(message.body);
      console.log('📨 AI event received:', event.type);
      console.log('[STOMP] Message content:', event);
      
      // Notify all listeners with the event
      this.notifyMessageListeners(event);
      
      // Update session ID if returned from server
      if (event.sessionId && !this.currentSessionId) {
        this.currentSessionId = event.sessionId;
        console.log('📝 Session ID set:', this.currentSessionId);
      }
    } catch (error) {
      console.error('❌ Failed to parse STOMP message:', error);
    }
  }

  /**
   * Send a question to the AI via STOMP
   * @param {string} question - The question to ask
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<boolean>} - True if sent successfully
   */
  async sendQuestion(question, sessionId = null) {
    // Use provided sessionId or stored currentSessionId
    const activeSessionId = sessionId || this.currentSessionId;
    
    // HYBRID LOGIC: Try STOMP first, fallback to REST
    if (this.stompClient && this.stompClient.connected) {
      try {
        const destination = activeSessionId 
          ? `/app/ai/ask?sessionId=${activeSessionId}`
          : '/app/ai/ask';
        
        const payload = {
          question: question,
          country: 'egypt' // Match stomp-test.html exactly
        };
        
        console.log('📤 Sending via STOMP to:', destination);
        console.log('[STOMP] Payload:', payload);
        
        this.stompClient.publish({
          destination: destination,
          body: JSON.stringify(payload)
        });
        
        return true;
      } catch (error) {
        console.error('❌ Failed to send via STOMP:', error);
        // Fall through to REST fallback
      }
    }
    
    // REST Fallback
    try {
      console.log('🔄 Using REST fallback for AI question');
      const url = activeSessionId 
        ? `${this.API_BASE}/ai/ask/${activeSessionId}`
        : `${this.API_BASE}/ai/ask`;
      
      const response = await apiClient.post(url, {
        question: question,
        country: 'egypt'
      });
      
      const data = response.data;
      
      // Update session ID from response
      if (!this.currentSessionId && data.sessionId) {
        this.currentSessionId = data.sessionId;
        console.log('📝 Session ID set from REST:', this.currentSessionId);
      }
      
      // Manually trigger AI_RESPONSE event for REST responses
      this.notifyMessageListeners({
        type: 'AI_RESPONSE',
        content: data.answer,
        sessionId: data.sessionId
      });
      
      return true;
    } catch (error) {
      console.error('❌ REST fallback failed:', error);
      
      // Notify error to listeners
      this.notifyMessageListeners({
        type: 'AI_ERROR',
        content: 'System Error: Unable to reach AI Service.'
      });
      
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
    if (this.stompClient) {
      this.isManualDisconnect = true;
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('🔌 Manually disconnected from AI Chat (STOMP)');
    }
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }

  /**
   * Get current connection status
   * @returns {string} - 'connected', 'connecting', 'disconnected'
   */
  getStatus() {
    if (!this.stompClient) return 'disconnected';
    return this.stompClient.connected ? 'connected' : 'disconnected';
  }

  /**
   * Get current session ID
   * @returns {string|null}
   */
  getSessionId() {
    return this.currentSessionId;
  }

  /**
   * Set session ID manually
   * @param {string} sessionId
   */
  setSessionId(sessionId) {
    this.currentSessionId = sessionId;
    console.log('📝 Session ID manually set:', sessionId);
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.currentSessionId = null;
    console.log('🗑️ Session cleared');
  }

  /**
   * Fetch chat history (sessions)
   * @returns {Promise<Array>} Array of chat sessions
   */
  async fetchChatHistory() {
    try {
      const response = await apiClient.get(`${this.API_BASE}/chats`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch chat history:', error);
      throw error;
    }
  }

  /**
   * Load messages from a specific session
   * @param {string} sessionId - The session ID to load
   * @returns {Promise<Array>} Array of messages
   */
  async loadSessionMessages(sessionId) {
    try {
      const response = await apiClient.get(`${this.API_BASE}/chats/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load session messages:', error);
      throw error;
    }
  }

  /**
   * Rename a chat session
   * @param {string} sessionId - The session ID to rename
   * @param {string} newTitle - The new title for the session
   * @returns {Promise} Confirmation of rename
   */
  async renameSession(sessionId, newTitle) {
    try {
      await apiClient.put(`${this.API_BASE}/chats/${sessionId}/title`, newTitle, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      console.log('✅ Session renamed successfully');
    } catch (error) {
      console.error('❌ Failed to rename session:', error);
      throw error;
    }
  }
}

// Export singleton instance
const aiChatService = new AiChatService();
export default aiChatService;
