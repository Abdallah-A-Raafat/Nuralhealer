/**
 * useAiChat Hook (mobile)
 * STOMP WebSocket + REST fallback, session support to mirror web behavior
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import aiChatService from '../services/aiChatService';

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
  clearMessages: () => void;
  reconnect: () => void;
  fetchSessions: () => Promise<ChatSession[]>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: () => void;
  searchSessions: (query?: string) => ChatSession[];
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

  const wsUrl = useMemo(() => aiChatService.getDefaultWsUrl(), []);

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

  useEffect(() => {
    aiChatService.connect(wsUrl);

    const unsubscribeStatus = aiChatService.onStatusChange((status) => {
      setConnectionStatus(status);
      setIsConnected(status === 'connected');

      if (status === 'error' || status === 'failed') {
        setError('Failed to connect to AI service');
      } else {
        setError(null);
      }
    });

    const unsubscribeMessages = aiChatService.onMessage((message) => {
      handleIncomingMessage(message);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
      aiChatService.disconnect();
    };
  }, [handleIncomingMessage, wsUrl]);

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

      const sent = await aiChatService.sendQuestion(text, currentSession || undefined);

      if (!sent) {
        setError('Failed to send message');
        return false;
      }

      setError(null);
      return true;
    },
    [addMessage, currentSession]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const fetchSessions = useCallback(async (): Promise<ChatSession[]> => {
    setIsLoadingHistory(true);
    try {
      const data = await aiChatService.fetchChatHistory();
      setSessions(data || []);
      return data || [];
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
        const sessionMessages = await aiChatService.loadSessionMessages(sessionId);
        const transformed = (sessionMessages || []).map((msg: any) => ({
          id: msg.id || `${Date.now()}-${Math.random()}`,
          type: msg.senderType?.toLowerCase() === 'patient' ? 'user' : 'bot',
          content: msg.content,
          timestamp: msg.sentAt,
          senderName: msg.senderType === 'ai' ? 'AI Assistant' : 'You',
        }));

        setMessages(transformed);
        setCurrentSession(sessionId);
        aiChatService.setSessionId(sessionId);
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
    setMessages([]);
    const newSessionId = await aiChatService.startNewSession();
    setCurrentSession(newSessionId);
    if (!newSessionId) {
      aiChatService.clearSession();
    }
    setError(null);
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

  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    await aiChatService.renameSession(sessionId, newTitle);
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, sessionTitle: newTitle } : session))
    );
  }, []);

  const reconnect = useCallback(() => {
    aiChatService.disconnect();
    setTimeout(() => aiChatService.connect(wsUrl), 500);
  }, [wsUrl]);

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
