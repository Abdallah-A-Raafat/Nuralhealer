import { useState, useEffect, useCallback } from 'react';
import aiChatService from '../services/aiChatService';

/**
 * React hook for AI Chat integration
 * Manages WebSocket connection, messages, AI state, and session history
 */
export const useAiChat = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
          setIsAiTyping(false);
          addMessage({
            type: 'bot',
            content: content,
            sources: sources || [],
            timestamp: timestamp || new Date().toISOString(),
            senderName: senderName || 'AI Assistant'
          });
          // ✅ Refresh session list to update message count and title
          setTimeout(() => fetchSessions(), 800);
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
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ws';
    
    console.log('🔌 Initializing AI Chat connection (STOMP)...');
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
  const sendMessage = useCallback(async (text) => {
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

    // Send to AI via WebSocket (with REST fallback)
    const sent = await aiChatService.sendQuestion(text);
    
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
   * Fetch all chat sessions
   */
  const fetchSessions = useCallback(async () => {
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
  const loadSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    
    setIsLoadingMessages(true);
    setError(null);
    
    try {
      const sessionMessages = await aiChatService.loadSessionMessages(sessionId);
      
      // Transform backend format to frontend format
      // Backend uses 'patient' but frontend uses 'user' for consistency
      const transformedMessages = sessionMessages.map(msg => ({
        id: msg.id,
        type: msg.senderType === 'patient' ? 'user' : 'bot',
        content: msg.content,
        timestamp: msg.sentAt,
        senderName: msg.senderType === 'ai' ? 'AI Assistant' : 'You'
    }));

      
      setMessages(transformedMessages);
      setCurrentSession(sessionId);
      aiChatService.setSessionId(sessionId);
      
      console.log('✅ Loaded session:', sessionId, 'with', transformedMessages.length, 'messages');
    } catch (error) {
      console.error('❌ Failed to load session:', error);
      setError('Failed to load session messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  /**
   * Create a new chat session
   */
    const createNewSession = useCallback(async () => {
      setMessages([]);
      setCurrentSession(null);
      aiChatService.requestNewSession();
      setError(null);
      // ✅ Refresh sidebar after a short delay to pick up newly created session
      setTimeout(() => fetchSessions(), 1000);
      console.log('🆕 New session created');
    }, [fetchSessions]);
  /**
   * Search sessions by query
   */
  const searchSessions = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      return sessions;
    }
    
    const lowerQuery = query.toLowerCase();
    return sessions.filter(session => 
      session.sessionTitle?.toLowerCase().includes(lowerQuery) ||
      session.sessionType?.toLowerCase().includes(lowerQuery)
    );
  }, [sessions]);

  /**
   * Rename a session
   */
  const renameSession = useCallback(async (sessionId, newTitle) => {
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

  /**
   * Retry connection
   */
  const reconnect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ws';
    aiChatService.disconnect();
    setTimeout(() => aiChatService.connect(wsUrl), 1000);
  }, []);

  // Fetch sessions when connected
  useEffect(() => {
    if (isConnected) {
      fetchSessions();
    }
  }, [isConnected, fetchSessions]);

  return {
    // Messages
    messages,
    isAiTyping,
    
    // Connection
    isConnected,
    connectionStatus,
    error,
    
    // Session Management
    sessions,
    currentSession,
    isLoadingHistory,
    isLoadingMessages,
    
    // Actions
    sendMessage,
    clearMessages,
    reconnect,
    fetchSessions,
    loadSession,
    createNewSession,
    searchSessions,
    renameSession
  };
};

export default useAiChat;
