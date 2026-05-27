/**
 * useAiChat Hook (mobile)
 * STOMP WebSocket + REST fallback with full session management
 * Mirrors web useAiChat.js behavior
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import stompService from '../services/stompService';
import { chatService } from '../services/chatService';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'error';
  content: string;
  timestamp: string;
  sources?: string[];
  senderName?: string;
}

export interface ChatSession {
  id: string;
  sessionTitle?: string;
  sessionType?: string;
  startedAt?: string;
  messageCount?: number;
  isActive?: boolean;
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
  sendVoiceMessage: (audioBlob: Blob, history?: any[]) => Promise<boolean>;
  clearMessages: () => void;
  reconnect: () => void;
  fetchSessions: () => Promise<ChatSession[]>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, newTitle: string) => Promise<void>;
  searchSessions: (query?: string) => ChatSession[];
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

  const wsUrl = useMemo(() => stompService.getDefaultWsUrl(), []);

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        ...message,
      },
    ]);
  }, []);

  const handleIncomingMessage = useCallback(
    (message: any) => {
      const { type, content, senderName, timestamp, sources } = message;

      switch (type) {
        case 'AI_TYPING_START':
          setIsAiTyping(true);
          break;
        case 'AI_TYPING_STOP':
          setIsAiTyping(false);
          break;
        case 'AI_RESPONSE':
          setIsAiTyping(false);
          addMessage({
            type: 'bot',
            content,
            sources: sources || [],
            timestamp: timestamp || new Date().toISOString(),
            senderName: senderName || 'AI Assistant',
          });
          break;
        case 'AI_ERROR':
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
    },
    [addMessage]
  );

  // Initialize STOMP connection on mount
  useEffect(() => {
    stompService.connect();

    const unsubscribeStatus = stompService.onStatusChange((status) => {
      setConnectionStatus(status);
      setIsConnected(status === 'connected');

      if (status === 'error' || status === 'failed') {
        setError('Failed to connect to AI service');
      } else if (status === 'connected') {
        setError(null);
      }
    });

    const unsubscribeMessages = stompService.onMessage((message) => {
      handleIncomingMessage(message);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
      stompService.disconnect();
    };
  }, [handleIncomingMessage]);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim()) {
        return false;
      }

      addMessage({
        type: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      });

      // Try STOMP first if connected
      if (stompService.isConnected()) {
        const sent = await stompService.sendQuestion(text, currentSession || undefined);
        if (sent) {
          setError(null);
          return true;
        }
      }

      // REST fallback when STOMP unavailable
      try {
        console.log('🔄 STOMP unavailable, using REST fallback for message');
        const response = await chatService.sendMessage(currentSession || '', text);
        addMessage({
          type: 'bot',
          content: response.answer || response.message,
          timestamp: new Date().toISOString(),
          senderName: 'AI Assistant',
        });
        setError(null);
        return true;
      } catch (err) {
        console.error('❌ REST fallback failed:', err);
        setError('Failed to send message');
        return false;
      }
    },
    [addMessage, currentSession]
  );

  const sendVoiceMessage = useCallback(
    async (audioBlob: Blob, conversationHistory: any[] = []): Promise<boolean> => {
      if (!currentSession) {
        setError('No active session');
        return false;
      }

      try {
        setIsAiTyping(true);
        const result = await chatService.sendVoiceMessage(currentSession, audioBlob, conversationHistory);

        addMessage({
          type: 'user',
          content: result.userText || 'Voice message sent',
          timestamp: new Date().toISOString(),
        });

        addMessage({
          type: 'bot',
          content: result.answer,
          timestamp: new Date().toISOString(),
          senderName: 'AI Assistant',
        });

        setIsAiTyping(false);
        return true;
      } catch (error) {
        console.error('❌ Voice message error:', error);
        setError('Failed to send voice message');
        setIsAiTyping(false);
        return false;
      }
    },
    [currentSession, addMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const fetchSessions = useCallback(async (): Promise<ChatSession[]> => {
    setIsLoadingHistory(true);
    try {
      const data = await chatService.getSessionHistory();
      const normalized = Array.isArray(data)
        ? data
        : data?.content || [];
      setSessions(normalized);
      return normalized;
    } catch (err) {
      console.error('❌ Failed to fetch sessions:', err);
      setError('Failed to load chat history');
      return [];
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadSession = useCallback(
    async (sessionId: string) => {
      if (!sessionId) return;
      setIsLoadingMessages(true);
      setError(null);
      try {
        const details = await chatService.getSessionDetails(sessionId);
        
        // Details is a flat array of messages, not { messages: [...] }
        const messageArray = Array.isArray(details) ? details : [];

        // Transform messages to internal format
        const transformedMessages = messageArray.map((msg: any) => ({
          id: msg.id || `${Date.now()}-${Math.random()}`,
          type: msg.senderType?.toLowerCase() === 'patient' ? 'user' : 'bot',
          content: msg.content,
          timestamp: msg.sentAt || msg.timestamp,
          senderName: msg.senderType === 'ai' ? 'AI Assistant' : 'You',
        }));

        setMessages(transformedMessages);
        setCurrentSession(sessionId);
        stompService.setSessionId(sessionId);
      } catch (err) {
        console.error('❌ Failed to load session:', err);
        setError('Failed to load session messages');
      } finally {
        setIsLoadingMessages(false);
      }
    },
    []
  );

  const createNewSession = useCallback(async () => {
    try {
      setIsLoadingMessages(true);
      const response = await chatService.startSession();
      setMessages([]);
      setCurrentSession(response.sessionId);
      stompService.setSessionId(response.sessionId);
      setError(null);
      
      // Fetch fresh session list
      await fetchSessions();
    } catch (err) {
      console.error('❌ Failed to create session:', err);
      setError('Failed to create new session');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [fetchSessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await chatService.deleteSession(sessionId);
      
      // Remove from sessions list
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      // Clear current session if deleted
      if (currentSession === sessionId) {
        setMessages([]);
        setCurrentSession(null);
        stompService.clearSessionId();
      }
      
      console.log('✅ Session deleted:', sessionId);
    } catch (err) {
      console.error('❌ Failed to delete session:', err);
      setError('Failed to delete session');
      throw err;
    }
  }, [currentSession]);

  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    try {
      await chatService.renameSession(sessionId, newTitle);
      
      // Update sessions list
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, sessionTitle: newTitle }
            : session
        )
      );
      
      console.log('✅ Session renamed:', sessionId, '→', newTitle);
    } catch (err) {
      console.error('❌ Failed to rename session:', err);
      setError('Failed to rename session');
      throw err;
    }
  }, []);

  const searchSessions = useCallback(
    (query?: string) => {
      if (!query) return sessions;
      const q = query.toLowerCase();
      return sessions.filter(
        (session) =>
          session.sessionTitle?.toLowerCase().includes(q) ||
          session.sessionType?.toLowerCase().includes(q)
      );
    },
    [sessions]
  );

  const reconnect = useCallback(() => {
    stompService.reconnect();
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
    sendVoiceMessage,
    clearMessages,
    reconnect,
    fetchSessions,
    loadSession,
    createNewSession,
    deleteSession,
    renameSession,
    searchSessions,
  };
};

export default useAiChat;
