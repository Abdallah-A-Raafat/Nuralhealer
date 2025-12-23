import apiClient from './apiClient';

export const chatService = {
  startSession: async () => {
    const response = await apiClient.post('/chat/start');
    return response.data;
  },

  sendMessage: async (sessionId, message, messageType = 'text') => {
    const response = await apiClient.post('/chat/message', {
      sessionId,
      message,
      messageType,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },

  endSession: async (sessionId) => {
    const response = await apiClient.post(`/chat/end/${sessionId}`);
    return response.data;
  },

  getSessionHistory: async () => {
    const response = await apiClient.get('/chat/sessions');
    return response.data;
  },

  getSessionDetails: async (sessionId) => {
    const response = await apiClient.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  getSuggestions: async (sessionId) => {
    const response = await apiClient.get(`/sessions/${sessionId}/suggestions`);
    return response.data;
  },
};
