import { Client, IMessage } from '@stomp/stompjs';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { API_CONFIG } from '../config';

/**
 * STOMP WebSocket Service (Mobile)
 * Manages connection, subscriptions, and message publishing over WebSocket
 * Mirrors web aiChatService.js STOMP implementation
 *
 * Features:
 * - Bearer token authentication (mobile token-based, not cookies)
 * - Automatic reconnection with exponential backoff
 * - Heartbeat mechanism
 * - Android emulator special handling (10.0.2.2 for localhost)
 * - Message and status listeners (pub/sub pattern)
 */

type MessageCallback = (message: any) => void;
type StatusCallback = (status: 'connected' | 'disconnected' | 'error' | 'connecting') => void;

interface StompConnectionConfig {
  wsUrl?: string;
  reconnectDelay?: number;
  heartbeatIn?: number;
  heartbeatOut?: number;
}

class StompService {
  private stompClient: Client | null = null;
  private messageListeners: MessageCallback[] = [];
  private statusListeners: StatusCallback[] = [];
  private currentSessionId: string | null = null;
  private isManualDisconnect = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  /**
   * Build WebSocket URL from API base URL
   * Handles:
   * - Protocol mapping (http → ws, https → wss)
   * - Android emulator special case (localhost → 10.0.2.2)
   * - Port preservation
   * - Path appending
   */
  private buildWsUrl(overrideUrl?: string): string {
    if (overrideUrl) return overrideUrl;

    try {
      const apiUrl = new URL(API_CONFIG.BASE_URL);
      const isSecure = apiUrl.protocol === 'https:';

      let host = apiUrl.hostname;
      // Android emulator cannot reach host machine via localhost; use 10.0.2.2
      if (__DEV__ && Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
        host = '10.0.2.2';
      }

      const port = apiUrl.port ? `:${apiUrl.port}` : '';
      const path = apiUrl.pathname.replace(/\/$/, ''); // Remove trailing slash

      const wsProtocol = isSecure ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${host}${port}${path}/ws`;

      console.log(`🔌 Derived WS URL: ${wsUrl}`);
      return wsUrl;
    } catch (error) {
      console.warn('⚠️ Failed to derive WS URL from API_BASE, using fallback:', error);
      // Fallback URLs
      const fallback = __DEV__ ? 'ws://10.0.2.2:8080/api/ws' : 'wss://api.neuralhealer.com/api/ws';
      console.log(`📡 Using fallback WS URL: ${fallback}`);
      return fallback;
    }
  }

  /**
   * Get the default WebSocket URL
   */
  getDefaultWsUrl(customUrl?: string): string {
    return this.buildWsUrl(customUrl);
  }

  /**
   * Connect to WebSocket using STOMP protocol
   * Retrieves Bearer token from auth store and adds to headers
   */
  connect(config: StompConnectionConfig = {}): void {
    const wsUrl = this.buildWsUrl(config.wsUrl);

    // Already connected
    if (this.stompClient?.connected) {
      console.log('✅ Already connected to AI WebSocket (STOMP)');
      return;
    }

    console.log('🔌 Connecting to AI WebSocket via STOMP:', wsUrl);
    this.isManualDisconnect = false;
    this.reconnectAttempts = 0;

    try {
      const token = useAuthStore.getState().token;
      const connectHeaders: Record<string, string> = {};

      // Add Bearer token to connect headers if available
      if (token && token !== 'session-cookie') {
        connectHeaders.Authorization = `Bearer ${token}`;
        console.log('🔐 Using Bearer token for STOMP authentication');
      }

      this.stompClient = new Client({
        brokerURL: wsUrl,
        connectHeaders,
        reconnectDelay: config.reconnectDelay || 5000,
        heartbeatIncoming: config.heartbeatIn || 10000,
        heartbeatOutgoing: config.heartbeatOut || 10000,

        // Debug logging
        debug: (msg) => {
          if (__DEV__) {
            console.log('[STOMP Debug]', msg);
          }
        },

        // Connection established
        onConnect: (frame) => {
          console.log('✅ Connected to AI Chat WebSocket (STOMP)');
          if (__DEV__) {
            console.log('[STOMP] Connection frame:', frame);
          }

          // Subscribe to user-specific AI queue
          this.stompClient?.subscribe('/user/queue/ai', (message: IMessage) => {
            this.onAiMessage(message);
          });

          this.reconnectAttempts = 0;
          this.notifyStatusListeners('connected');
        },

        // Connection closed
        onDisconnect: (frame) => {
          console.log('🔌 Disconnected from AI Chat WebSocket (STOMP)');
          this.notifyStatusListeners('disconnected');

          // Auto-reconnect unless manually disconnected
          if (!this.isManualDisconnect) {
            console.log('🔄 Will attempt to reconnect via STOMP reconnectDelay...');
          }
        },

        // STOMP protocol error
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame.headers['message']);
          if (__DEV__) {
            console.error('[STOMP] Error frame:', frame);
          }
          this.notifyStatusListeners('error');
        },

        // WebSocket connection error
        onWebSocketClose: (event) => {
          console.error('❌ WebSocket closed:', event.code, event.reason);
          this.notifyStatusListeners('error');
        },

        onWebSocketError: (error) => {
          console.error('❌ WebSocket error:', error);
          this.notifyStatusListeners('error');
        },
      });

      this.stompClient.activate();
      console.log('📡 STOMP client activation initiated');
    } catch (error) {
      console.error('❌ Failed to create STOMP client:', error);
      this.notifyStatusListeners('error');
    }
  }

  /**
   * Handle incoming AI messages from STOMP subscription
   * Parses JSON body and notifies all message listeners
   * @private
   */
  private onAiMessage(message: IMessage): void {
    try {
      const event = JSON.parse(message.body);
      console.log('📨 AI event received:', event.type);
      if (__DEV__) {
        console.log('[STOMP] Message body:', event);
      }

      // Update session ID if returned from server
      if (event.sessionId) {
        this.currentSessionId = event.sessionId;
        console.log('📝 Session ID set:', this.currentSessionId);
      }

      // Notify all listeners
      this.notifyMessageListeners(event);
    } catch (error) {
      console.error('❌ Failed to parse STOMP message:', error);
    }
  }

  /**
   * Send a question/message to AI via STOMP
   * Publishes to /app/ai/ask destination with optional headers
   *
   * @param question - The question/message to send
   * @param sessionId - Optional existing session ID
   * @param forceNewSession - If true, backend creates new session
   * @returns True if published successfully
   */
  async sendQuestion(
    question: string,
    sessionId?: string,
    forceNewSession: boolean = false
  ): Promise<boolean> {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ STOMP not connected; cannot send question');
      return false;
    }

    try {
      const destination = '/app/ai/ask';
      const headers: Record<string, string> = {};

      // Add session headers
      if (forceNewSession) {
        headers.forceNewSession = 'true';
      } else if (sessionId || this.currentSessionId) {
        headers.sessionId = sessionId || this.currentSessionId!;
      }

      const payload = {
        question,
        country: 'egypt',
      };

      console.log('📤 Sending question via STOMP to:', destination);
      if (__DEV__) {
        console.log('[STOMP] Headers:', headers);
        console.log('[STOMP] Payload:', payload);
      }

      this.stompClient.publish({
        destination,
        headers,
        body: JSON.stringify(payload),
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send question via STOMP:', error);
      return false;
    }
  }

  /**
   * Subscribe to message events from the AI
   * Called when STOMP receives a message on /user/queue/ai
   *
   * @param callback - Function called with each message event
   * @returns Unsubscribe function
   */
  onMessage(callback: MessageCallback): () => void {
    this.messageListeners.push(callback);
    console.log(`📬 Message listener added (total: ${this.messageListeners.length})`);

    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
      console.log(`📬 Message listener removed (total: ${this.messageListeners.length})`);
    };
  }

  /**
   * Subscribe to connection status changes
   * Status: 'connected' | 'disconnected' | 'error' | 'connecting'
   *
   * @param callback - Function called when status changes
   * @returns Unsubscribe function
   */
  onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.push(callback);
    console.log(`⚡ Status listener added (total: ${this.statusListeners.length})`);

    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
      console.log(`⚡ Status listener removed (total: ${this.statusListeners.length})`);
    };
  }

  /**
   * Notify all message listeners of incoming message
   * @private
   */
  private notifyMessageListeners(message: any): void {
    this.messageListeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('❌ Error in message listener:', error);
      }
    });
  }

  /**
   * Notify all status listeners of connection status change
   * @private
   */
  private notifyStatusListeners(status: ReturnType<StatusCallback>): void {
    this.statusListeners.forEach((callback) => {
      try {
        callback(status as any);
      } catch (error) {
        console.error('❌ Error in status listener:', error);
      }
    });
  }

  /**
   * Manually disconnect from WebSocket
   * Prevents auto-reconnection
   */
  disconnect(): void {
    if (this.stompClient) {
      this.isManualDisconnect = true;
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('🔌 Manually disconnected from AI Chat (STOMP)');
    }
  }

  /**
   * Reconnect to WebSocket (useful for error recovery)
   */
  reconnect(config?: StompConnectionConfig): void {
    this.disconnect();
    setTimeout(() => {
      this.connect(config);
    }, 1000);
  }

  /**
   * Check if WebSocket is currently connected
   */
  isConnected(): boolean {
    return !!(this.stompClient?.connected);
  }

  /**
   * Get current connection status
   */
  getStatus(): 'connected' | 'disconnected' | 'error' {
    if (!this.stompClient) return 'disconnected';
    return this.stompClient.connected ? 'connected' : 'disconnected';
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
  setSessionId(sessionId: string | null): void {
    this.currentSessionId = sessionId;
    console.log('📝 Session ID manually set to:', sessionId);
  }

  /**
   * Clear session ID
   */
  clearSessionId(): void {
    this.currentSessionId = null;
    console.log('📝 Session ID cleared');
  }
}

// Export singleton instance
export const stompService = new StompService();
export default stompService;
