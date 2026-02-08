/**
 * Chat Service
 * Handles AI chat sessions and history
 */

import apiClient from './apiClient';

export const chatService = {
  // Start a new chat session
  startSession: async () => {
    const response = await apiClient.post('/chat/start');
    return response.data;
  },

  // Send a message in an active session
  sendMessage: async (sessionId: string, message: string, messageType = 'text') => {
    const response = await apiClient.post('/chat/message', {
      sessionId,
      message,
      messageType,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },

  // End an active session
  endSession: async (sessionId: string) => {
    const response = await apiClient.post(`/chat/end/${sessionId}`);
    return response.data;
  },

  // Get all session history for the current user
  getSessionHistory: async (page = 0, size = 10) => {
    const response = await apiClient.get('/chat/sessions', {
      params: { page, size }
    });
    return response.data;
  },

  // Get details of a specific session including all messages
  getSessionDetails: async (sessionId: string) => {
    const response = await apiClient.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  // Get session statistics
  getSessionStats: async () => {
    const response = await apiClient.get('/chat/stats');
    return response.data;
  },
};

export default chatService;
