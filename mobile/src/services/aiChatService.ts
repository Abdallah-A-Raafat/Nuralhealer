/**
 * AI Chat STOMP WebSocket Service for React Native
 * Manages STOMP connection to backend AI chat endpoint
 * Matches the exact connection pattern from stomp-test.html
 */

import { Client, StompConfig } from '@stomp/stompjs';
import apiClient from './apiClient';

type MessageCallback = (message: any) => void;
type StatusCallback = (status: string) => void;

class AiChatService {
  private client: Client | null = null;
  private messageListeners: MessageCallback[] = [];
  private statusListeners: StatusCallback[] = [];
  private currentSessionId: string | null = null;
  private readonly API_BASE = '/api';

  /**
   * Connect to AI WebSocket using STOMP
   */
  connect(wsUrl: string) {
    if (this.client && this.client.connected) {
      console.log('✅ Already connected to AI STOMP');
      return;
    }

    console.log('🔌 Connecting to AI STOMP:', wsUrl);

    const stompConfig: StompConfig = {
      brokerURL: wsUrl,
      
      // Connection settings
      connectHeaders: {},
      
      // Heartbeat (10 seconds)
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      
      // Reconnect settings
      reconnectDelay: 5000,
      
      // Debug logging
      debug: (str: string) => {
        if (__DEV__) {
          console.log('🔍 [STOMP]:', str);
        }
      },

      // Connection callbacks
      onConnect: () => {
        console.log('✅ Connected to STOMP');
        this.notifyStatusListeners('connected');
        this.subscribe();
      },

      onDisconnect: () => {
        console.log('🔌 Disconnected from STOMP');
        this.notifyStatusListeners('disconnected');
      },

      onStompError: (frame: any) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        this.notifyStatusListeners('error');
      },

      onWebSocketError: (event: any) => {
        console.error('❌ WebSocket error:', event);
        this.notifyStatusListeners('error');
      },
    };

    this.client = new Client(stompConfig);
    this.client.activate();
  }

  /**
   * Subscribe to AI messages queue
   */
  private subscribe() {
    if (!this.client || !this.client.connected) {
      console.error('❌ Cannot subscribe - not connected');
      return;
    }

    // Subscribe to personal queue (same as stomp-test.html)
    this.client.subscribe('/user/queue/ai', (message) => {
      try {
        const body = JSON.parse(message.body);
        console.log('📨 STOMP message received:', body);
        this.notifyMessageListeners(body);
      } catch (error) {
        console.error('❌ Failed to parse STOMP message:', error);
      }
    });

    console.log('✅ Subscribed to /user/queue/ai');
  }

  /**
   * Send a question to AI via STOMP
   * Falls back to REST if STOMP is not connected
   */
  async sendQuestion(question: string, sessionId?: string): Promise<boolean> {
    const targetSessionId = sessionId || this.currentSessionId;

    // Try STOMP first
    if (this.client && this.client.connected) {
      try {
        const destination = targetSessionId 
          ? `/app/ai/ask?sessionId=${targetSessionId}`
          : '/app/ai/ask';

        this.client.publish({
          destination,
          body: JSON.stringify({
            question,
            country: 'egypt'
          })
        });

        console.log('📤 STOMP question sent:', question);
        return true;
      } catch (error) {
        console.error('❌ STOMP send failed, falling back to REST:', error);
      }
    }

    // REST fallback
    try {
      console.log('🔄 Using REST fallback for question');
      const endpoint = targetSessionId
        ? `${this.API_BASE}/ai/ask/${targetSessionId}`
        : `${this.API_BASE}/ai/ask`;

      const response = await apiClient.post(endpoint, {
        question,
        country: 'egypt'
      });

      if (response.data) {
        // Simulate STOMP response format
        this.notifyMessageListeners({
          type: 'AI_RESPONSE',
          content: response.data.answer || response.data.response,
          timestamp: new Date().toISOString()
        });
        return true;
      }
    } catch (error) {
      console.error('❌ REST fallback failed:', error);
    }

    return false;
  }

  /**
   * Subscribe to AI messages
   */
  onMessage(callback: MessageCallback): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private notifyMessageListeners(message: any) {
    this.messageListeners.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('❌ Error in message listener:', error);
      }
    });
  }

  private notifyStatusListeners(status: string) {
    this.statusListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('❌ Error in status listener:', error);
      }
    });
  }

  /**
   * Disconnect from STOMP
   */
  disconnect() {
    console.log('🔌 Disconnecting from STOMP...');
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Set session ID manually
   */
  setSessionId(sessionId: string | null) {
    this.currentSessionId = sessionId;
    console.log('📝 Session ID set:', sessionId);
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
   */
  async fetchChatHistory(): Promise<any[]> {
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
   */
  async loadSessionMessages(sessionId: string): Promise<any[]> {
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
   */
  async renameSession(sessionId: string, newTitle: string): Promise<void> {
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

export const aiChatService = new AiChatService();
export default aiChatService;
