/**
 * AI Chat WebSocket Service
 * Manages WebSocket connection to backend AI chat endpoint
 */

type MessageCallback = (message: any) => void;
type StatusCallback = (status: string) => void;

class AiChatService {
  private ws: WebSocket | null = null;
  private messageListeners: MessageCallback[] = [];
  private statusListeners: StatusCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isManualDisconnect = false;
  private wsUrl: string = '';

  /**
   * Connect to AI WebSocket
   */
  connect(wsUrl: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected to AI WebSocket');
      return;
    }

    console.log('🔌 Connecting to AI WebSocket:', wsUrl);
    this.wsUrl = wsUrl;
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

        if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => this.connect(this.wsUrl), this.reconnectDelay);
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
   */
  sendQuestion(question: string): boolean {
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
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('🔌 Disconnecting from AI WebSocket...');
    this.isManualDisconnect = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
