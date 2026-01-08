import { useState, useEffect, useCallback } from 'react';
import aiChatService from '../services/aiChatService';

/**
 * React hook for AI Chat integration
 * Manages WebSocket connection, messages, and AI state
 */
export const useAiChat = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  /**
   * Add a message to the chat
   */
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      ...message
    }]);
  }, []);

  /**
   * Handle incoming WebSocket messages
   */
  const handleIncomingMessage = useCallback((message) => {
    const { type, content, senderName, timestamp, sources } = message;

    switch (type) {
      case 'AI_TYPING_START':
        console.log('✍️ AI is typing...');
        setIsAiTyping(true);
        break;

      case 'AI_TYPING_STOP':
        console.log('✅ AI stopped typing');
        setIsAiTyping(false);
        break;

      case 'AI_RESPONSE':
        console.log('🤖 AI response received');
        setIsAiTyping(false);
        addMessage({
          type: 'bot',
          content: content,
          sources: sources || [],
          timestamp: timestamp || new Date().toISOString(),
          senderName: senderName || 'AI Assistant'
        });
        break;

      case 'AI_ERROR':
        console.error('❌ AI error:', content);
        setIsAiTyping(false);
        setError(content);
        addMessage({
          type: 'error',
          content: content || 'An error occurred',
          timestamp: timestamp || new Date().toISOString(),
        });
        break;

      default:
        console.warn('⚠️ Unknown message type:', type);
    }
  }, [addMessage]);

  // Connect to WebSocket on mount
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ai-ws';
    
    console.log('🔌 Initializing AI Chat connection...');
    aiChatService.connect(wsUrl);

    // Subscribe to status changes
    const unsubscribeStatus = aiChatService.onStatusChange((status) => {
      console.log('📊 Connection status:', status);
      setConnectionStatus(status);
      setIsConnected(status === 'connected');
      
      if (status === 'error' || status === 'failed') {
        setError('Failed to connect to AI service');
      } else {
        setError(null);
      }
    });

    // Subscribe to messages
    const unsubscribeMessages = aiChatService.onMessage((message) => {
      console.log('📨 Received message:', message);
      handleIncomingMessage(message);
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up AI Chat connection...');
      unsubscribeStatus();
      unsubscribeMessages();
      aiChatService.disconnect();
    };
  }, [handleIncomingMessage]);

  /**
   * Send a question to AI
   */
  const sendMessage = useCallback((text) => {
    if (!text.trim()) {
      console.warn('⚠️ Cannot send empty message');
      return false;
    }

    if (!isConnected) {
      console.error('❌ Not connected to AI service');
      setError('Not connected to AI service');
      return false;
    }

    // Add user message to UI
    addMessage({
      type: 'user',
      content: text,
      timestamp: new Date().toISOString()
    });

    // Send to AI via WebSocket
    const sent = aiChatService.sendQuestion(text);
    
    if (!sent) {
      setError('Failed to send message');
      return false;
    }

    setError(null);
    return true;
  }, [isConnected, addMessage]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Retry connection
   */
  const reconnect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ai-ws';
    aiChatService.disconnect();
    setTimeout(() => aiChatService.connect(wsUrl), 1000);
  }, []);

  return {
    messages,
    isConnected,
    isAiTyping,
    connectionStatus,
    error,
    sendMessage,
    clearMessages,
    reconnect
  };
};

export default useAiChat;
