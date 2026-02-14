import { Client, IMessage } from '@stomp/stompjs';
import { Platform } from 'react-native';
import apiClient from './apiClient';
import { API_CONFIG } from '../config';
import { useAuthStore } from '../store/authStore';

/**
 * AI Chat STOMP WebSocket Service (mobile)
 * Mirrors web implementation: STOMP over WebSocket with REST fallback and session handling
 */

type MessageCallback = (message: any) => void;
type StatusCallback = (status: string) => void;

class AiChatService {
  private stompClient: Client | null = null;
  private messageListeners: MessageCallback[] = [];
  private statusListeners: StatusCallback[] = [];
  private currentSessionId: string | null = null;
  private isManualDisconnect = false;

  private readonly API_BASE = API_CONFIG.BASE_URL;

  /**
   * Derive the WebSocket URL from API_BASE (keeps dev/prod in sync).
   * Handles Android emulator special-case (10.0.2.2 when backend is localhost).
   */
  private buildWsUrl(overrideUrl?: string) {
    if (overrideUrl) return overrideUrl;

    try {
      const apiUrl = new URL(this.API_BASE);
      const isSecure = apiUrl.protocol === 'https:';

      let host = apiUrl.hostname;
      if (__DEV__ && Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
        host = '10.0.2.2';
      }

      const port = apiUrl.port ? `:${apiUrl.port}` : '';
      const path = apiUrl.pathname.replace(/\/$/, '');

      return `${isSecure ? 'wss' : 'ws'}://${host}${port}${path}/ws`;
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Failed to derive WS URL from API_BASE, using fallback:', error);
      }
      return __DEV__ ? 'ws://10.0.2.2:8080/api/ws' : 'wss://api.neuralhealer.com/api/ws';
    }
  }

  getDefaultWsUrl(customUrl?: string) {
    return this.buildWsUrl(customUrl);
  }

  /**
   * Connect to AI WebSocket using STOMP
   */
  connect(wsUrl?: string) {
    const resolvedUrl = this.buildWsUrl(wsUrl);

    if (this.stompClient && this.stompClient.connected) {
      console.log('✅ Already connected to AI WebSocket (STOMP)');
      return;
    }

    console.log('🔌 Connecting to AI WebSocket via STOMP:', resolvedUrl);
    this.isManualDisconnect = false;

    try {
      const token = useAuthStore.getState().token;
      const authHeader = token && token !== 'session-cookie' ? { Authorization: `Bearer ${token}` } : {};

      this.stompClient = new Client({
        brokerURL: resolvedUrl,
        connectHeaders: authHeader,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (msg) => {
          if (__DEV__) console.log('[STOMP]', msg);
        },
        onWebSocketClose: (evt) => {
          console.error('❌ WebSocket closed', evt.code, evt.reason || '');
          this.notifyStatusListeners('error');
        },
        onConnect: () => {
          console.log('✅ Connected to AI Chat WebSocket (STOMP)');
          this.stompClient?.subscribe('/user/queue/ai', (message) => this.onAiMessage(message));
          this.notifyStatusListeners('connected');
        },
        onDisconnect: () => {
          console.log('🔌 Disconnected from AI Chat WebSocket (STOMP)');
          this.notifyStatusListeners('disconnected');
          if (!this.isManualDisconnect) {
            console.log('🔄 Will attempt to reconnect via STOMP reconnectDelay...');
          }
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame.headers['message']);
          this.notifyStatusListeners('error');
        },
        onWebSocketError: (error) => {
          console.error('❌ WebSocket error:', error);
          this.notifyStatusListeners('error');
        },
      });

      this.stompClient.activate();
    } catch (error) {
      console.error('❌ Failed to create STOMP client:', error);
      this.notifyStatusListeners('error');
    }
  }

  /**
   * Handle incoming AI messages from STOMP
   */
  private onAiMessage(message: IMessage) {
    try {
      const event = JSON.parse(message.body);
      if (__DEV__) {
        console.log('📨 AI event received:', event.type, event);
      }
      this.notifyMessageListeners(event);

      if (event.sessionId && !this.currentSessionId) {
        this.currentSessionId = event.sessionId;
        if (__DEV__) console.log('📝 Session ID set from STOMP:', this.currentSessionId);
      }
    } catch (error) {
      console.error('❌ Failed to parse STOMP message:', error);
    }
  }

  /**
   * Send a question to the AI via STOMP (with REST fallback)
   */
  async sendQuestion(question: string, sessionId?: string): Promise<boolean> {
    const activeSessionId = sessionId || this.currentSessionId;

    if (this.stompClient && this.stompClient.connected) {
      try {
        const destination = activeSessionId
          ? `/app/ai/ask?sessionId=${activeSessionId}`
          : '/app/ai/ask';

        const payload = { question, country: 'egypt' };

        this.stompClient.publish({
          destination,
          body: JSON.stringify(payload),
        });

        return true;
      } catch (error) {
        console.error('❌ Failed to send via STOMP:', error);
      }
    }

    // REST fallback
    try {
      const url = activeSessionId
        ? `${this.API_BASE}/ai/ask/${activeSessionId}`
        : `${this.API_BASE}/ai/ask`;

      const response = await apiClient.post(url, { question, country: 'egypt' });
      const data = response.data;

      if (!this.currentSessionId && data.sessionId) {
        this.currentSessionId = data.sessionId;
        if (__DEV__) console.log('📝 Session ID set from REST:', this.currentSessionId);
      }

      this.notifyMessageListeners({
        type: 'AI_RESPONSE',
        content: data.answer,
        sessionId: data.sessionId,
        sources: data.sources,
      });

      return true;
    } catch (error) {
      console.error('❌ REST fallback failed:', error);
      this.notifyMessageListeners({
        type: 'AI_ERROR',
        content: 'System Error: Unable to reach AI Service.',
      });
      return false;
    }
  }

  /**
   * Subscribe to AI messages
   */
  onMessage(callback: MessageCallback): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all message listeners
   */
  private notifyMessageListeners(message: any) {
    this.messageListeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('❌ Error in message listener:', error);
      }
    });
  }

  /**
   * Notify all status listeners
   */
  private notifyStatusListeners(status: string) {
    this.statusListeners.forEach((callback) => {
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

  isConnected(): boolean {
    return !!(this.stompClient && this.stompClient.connected);
  }

  getStatus(): string {
    if (!this.stompClient) return 'disconnected';
    return this.stompClient.connected ? 'connected' : 'disconnected';
  }

  getSessionId(): string | null {
    return this.currentSessionId;
  }

  setSessionId(sessionId: string) {
    this.currentSessionId = sessionId;
    if (__DEV__) console.log('📝 Session ID manually set:', sessionId);
  }

  clearSession() {
    this.currentSessionId = null;
    if (__DEV__) console.log('🗑️ Session cleared');
  }

  /**
   * Chat history helpers
   */
  async fetchChatHistory() {
    const response = await apiClient.get(`${this.API_BASE}/chats`);
    return response.data;
  }

  async loadSessionMessages(sessionId: string) {
    const response = await apiClient.get(`${this.API_BASE}/chats/${sessionId}/messages`);
    return response.data;
  }

  async renameSession(sessionId: string, newTitle: string) {
    await apiClient.put(`${this.API_BASE}/chats/${sessionId}/title`, newTitle, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
