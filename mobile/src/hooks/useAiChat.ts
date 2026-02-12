/**
 * useAiChat Hook
 * React hook for AI Chat integration with STOMP WebSocket
 * Includes session management and chat history
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

interface ChatSession {
  id: string;
  sessionTitle: string;
  startedAt: string;
  messageCount: number;
  isActive: boolean;
}

interface UseAiChatReturn {
  messages: Message[];
  isConnected: boolean;
  isAiTyping: boolean;
  connectionStatus: string;
  error: string | null;
  sessions: ChatSession[];
  currentSession: string | null;
  isLoadingHistory: boolean;
  isLoadingMessages: boolean;
  sendMessage: (text: string) => Promise<boolean>;
  clearMessages: () => void;
  reconnect: () => void;
  fetchSessions: () => Promise<ChatSession[]>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: () => void;
  searchSessions: (query: string) => Promise<ChatSession[]>;
  renameSession: (sessionId: string, newTitle: string) => Promise<void>;
}

export const useAiChat = (): UseAiChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
    console.log('🔌 Initializing AI Chat connection...', API_CONFIG.WS_URL);
    aiChatService.connect(API_CONFIG.WS_URL);

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

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
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

    const sent = await aiChatService.sendQuestion(text);
    
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

  /**
   * Fetch all chat sessions
   */
  const fetchSessions = useCallback(async (): Promise<ChatSession[]> => {
    setIsLoadingHistory(true);
    try {
      const sessionData = await aiChatService.fetchChatHistory();
      setSessions(sessionData);
      return sessionData;
    } catch (error) {
      console.error('❌ Failed to fetch sessions:', error);
      setError('Failed to load chat history');
      return [];
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  /**
   * Load a specific session and its messages
   */
  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!sessionId) return;
    
    setIsLoadingMessages(true);
    setError(null);
    
    try {
      const sessionMessages = await aiChatService.loadSessionMessages(sessionId);
      
      // Transform backend format to frontend format
      // Backend uses 'patient' but frontend uses 'user' for consistency
      const transformedMessages: Message[] = sessionMessages.map((msg: any) => ({
        id: msg.id,
        type: msg.senderType.toLowerCase() === 'patient' ? 'user' : msg.senderType.toLowerCase(),
        content: msg.content,
        timestamp: msg.sentAt,
      }));
      
      setMessages(transformedMessages);
      setCurrentSession(sessionId);
      aiChatService.setSessionId(sessionId);
      
      console.log('✅ Loaded session:', sessionId, 'with', transformedMessages.length, 'messages');
    } catch (error) {
      console.error('❌ Failed to load session:', error);
      setError('Failed to load session');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  /**
   * Create a new chat session
   */
  const createNewSession = useCallback(() => {
    setMessages([]);
    setCurrentSession(null);
    aiChatService.clearSession();
    setError(null);
    console.log('🆕 New session created');
  }, []);

  /**
   * Search sessions by query
   */
  const searchSessions = useCallback(async (query: string): Promise<ChatSession[]> => {
    if (!query || query.trim() === '') {
      return sessions;
    }
    
    const lowerQuery = query.toLowerCase();
    return sessions.filter(session => 
      session.sessionTitle?.toLowerCase().includes(lowerQuery)
    );
  }, [sessions]);

  /**
   * Rename a session
   */
  const renameSession = useCallback(async (sessionId: string, newTitle: string): Promise<void> => {
    try {
      await aiChatService.renameSession(sessionId, newTitle);
      
      // Update local sessions list
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, sessionTitle: newTitle }
            : session
        )
      );
      
      console.log('✅ Session renamed locally');
    } catch (error) {
      console.error('❌ Failed to rename session:', error);
      setError('Failed to rename session');
      throw error;
    }
  }, []);

  const reconnect = useCallback(() => {
    aiChatService.disconnect();
    setTimeout(() => aiChatService.connect(API_CONFIG.WS_URL), 1000);
  }, []);

  // Fetch sessions when connected
  useEffect(() => {
    if (isConnected) {
      fetchSessions();
    }
  }, [isConnected, fetchSessions]);

  return {
    messages,
    isConnected,
    isAiTyping,
    connectionStatus,
    error,
    sessions,
    currentSession,
    isLoadingHistory,
    isLoadingMessages,
    sendMessage,
    clearMessages,
    reconnect,
    fetchSessions,
    loadSession,
    createNewSession,
    searchSessions,
    renameSession,
  };
};

export default useAiChat;
