/**
 * useAiChat Hook
 * React hook for AI Chat integration with WebSocket
 */

import { useState, useEffect, useCallback } from 'react';
import aiChatService from '../services/aiChatService';
import { API_CONFIG } from '../config';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'error';
  content: string;
  timestamp: string;
  sources?: string[];
}

interface UseAiChatReturn {
  messages: Message[];
  isConnected: boolean;
  isAiTyping: boolean;
  connectionStatus: string;
  error: string | null;
  sendMessage: (text: string) => boolean;
  clearMessages: () => void;
  reconnect: () => void;
}

export const useAiChat = (): UseAiChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      ...message
    }]);
  }, []);

  const handleIncomingMessage = useCallback((message: any) => {
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

  useEffect(() => {
    // Use ws:// for Android emulator (10.0.2.2 is localhost from emulator)
    const wsUrl = __DEV__ 
      ? 'ws://10.0.2.2:8080/api/ai-ws' 
      : 'wss://api.neuralhealer.com/api/ai-ws';
    
    console.log('🔌 Initializing AI Chat connection...', wsUrl);
    aiChatService.connect(wsUrl);

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

    const unsubscribeMessages = aiChatService.onMessage((message) => {
      console.log('📨 Received message:', message);
      handleIncomingMessage(message);
    });

    return () => {
      console.log('🧹 Cleaning up AI Chat connection...');
      unsubscribeStatus();
      unsubscribeMessages();
      aiChatService.disconnect();
    };
  }, [handleIncomingMessage]);

  const sendMessage = useCallback((text: string): boolean => {
    if (!text.trim()) {
      console.warn('⚠️ Cannot send empty message');
      return false;
    }

    if (!isConnected) {
      console.error('❌ Not connected to AI service');
      setError('Not connected to AI service');
      return false;
    }

    addMessage({
      type: 'user',
      content: text,
      timestamp: new Date().toISOString()
    });

    const sent = aiChatService.sendQuestion(text);
    
    if (!sent) {
      setError('Failed to send message');
      return false;
    }

    setError(null);
    return true;
  }, [isConnected, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const reconnect = useCallback(() => {
    const wsUrl = __DEV__ 
      ? 'ws://10.0.2.2:8080/api/ai-ws' 
      : 'wss://api.neuralhealer.com/api/ai-ws';
    aiChatService.disconnect();
    setTimeout(() => aiChatService.connect(wsUrl), 500);
  }, []);

  return {
    messages,
    isConnected,
    isAiTyping,
    connectionStatus,
    error,
    sendMessage,
    clearMessages,
    reconnect,
  };
};

export default useAiChat;
