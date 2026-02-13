import apiClient from './apiClient';

export const chatService = {
  // Start a new chat session
  startSession: async () => {
    const response = await apiClient.post('/chat/start');
    return response.data;
  },

  // Send a message in an active session
  sendMessage: async (sessionId, message, messageType = 'text') => {
    const response = await apiClient.post('/chat/message', {
      sessionId,
      message,
      messageType,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },

  // End an active session
  endSession: async (sessionId) => {
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

  // Get session history for a specific patient (doctor view)
  getPatientSessionHistory: async (patientId, page = 0, size = 10) => {
    const response = await apiClient.get('/chat/sessions', {
      params: { page, size, patientId }
    });
    return response.data;
  },

  // Get details of a specific session including all messages
  getSessionDetails: async (sessionId) => {
    const response = await apiClient.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  // Get AI suggestions for the current session
  getSuggestions: async (sessionId) => {
    const response = await apiClient.get(`/sessions/${sessionId}/suggestions`);
    return response.data;
  },

  // Search through chat history
  searchHistory: async (query, startDate = null, endDate = null) => {
    const response = await apiClient.get('/chat/search', {
      params: { query, startDate, endDate }
    });
    return response.data;
  },

  // Get doctors authorized to view my AI chat history
  getAuthorizedDoctors: async () => {
    const response = await apiClient.get('/chats/authorized-doctors');
    return response.data;
  },

  // Get session statistics
  getSessionStats: async () => {
    const response = await apiClient.get('/chat/stats');
    return response.data;
  },
};

export default chatService;

