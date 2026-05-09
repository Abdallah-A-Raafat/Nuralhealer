import apiClient from './apiClient';

const normalizeSession = (session) => {
  if (!session) return session;

  const sessionId = session.sessionId || session.id;
  return {
    ...session,
    id: session.id || sessionId,
    sessionId,
    sessionTitle: session.sessionTitle || 'New AI Chat',
    sessionType: session.sessionType || 'text',
    startTime: session.startTime || session.startedAt || session.createdAt,
    endTime: session.endTime || session.endedAt || null,
    messageCount: session.messageCount || 0,
    status: session.status || (session.isActive ? 'active' : 'completed'),
  };
};

export const chatService = {
  // Start a new chat session
  startSession: async () => {
    const response = await apiClient.post('/chats');
    return { sessionId: response.data?.sessionId || response.data };
  },

  // Send a message in an active session
  sendMessage: async (sessionId, message, messageType = 'text') => {
    const endpoint = sessionId ? `/ai/ask/${sessionId}` : '/ai/ask';
    const response = await apiClient.post(endpoint, {
      question: message,
      country: 'egypt',
      messageType,
    });

    const data = response.data || {};
    return {
      sessionId: data.sessionId || sessionId || null,
      message: data.answer || data.message || '',
      answer: data.answer || data.message || '',
      emotion: data.intent || data.emotion || null,
      userText: data.userText || null,
audioBase64: data.audio_base64 || data.audioBase64 || null,    };
  },

  // Send a voice recording to the AI voice endpoint
  sendVoiceMessage: async (sessionId, audioBlob, conversationHistory = []) => {
    const mimeType = audioBlob?.type || 'audio/webm';
    const supportedFormats = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/mpeg'];
    const isSupported = supportedFormats.includes(mimeType);

    if (!isSupported) {
      console.warn(`Audio format ${mimeType} may not be supported. Attempting upload...`);
    }

    const uploadBlob = mimeType.includes('webm')
      ? new Blob([audioBlob], { type: 'audio/wav' })
      : audioBlob;

    const formData = new FormData();
    const uploadMimeType = uploadBlob?.type || 'audio/wav';
    const extension = uploadMimeType.includes('mp3') || uploadMimeType.includes('mpeg')
      ? 'mp3'
      : uploadMimeType.includes('ogg')
        ? 'ogg'
        : 'wav';
    formData.append('file', uploadBlob, `voice.${extension}`);
    
    const historyString = JSON.stringify(conversationHistory);
    console.debug('Voice message conversation history:', historyString);
    formData.append('conversation_history', historyString);

    const response = await apiClient.post(`/ai/voice/${sessionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data || {};
    return {
      sessionId: data.sessionId || sessionId || null,
      message: data.answer || '',
      answer: data.answer || '',
      userText: data.user_text || data.userText || null,
      audioBase64: data.audio_base64 || data.audioBase64 || null,
      intent: data.intent || null,
      confidence: data.confidence || null,
    };
  },

  // End an active session
  endSession: async (sessionId) => {
    return { success: true, sessionId };
  },

  // Get all session history for the current user
  getSessionHistory: async (page = 0, size = 10) => {
    const response = await apiClient.get('/chats', {
      params: { page, size }
    });

    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload.map(normalizeSession);
    }

    if (payload?.content && Array.isArray(payload.content)) {
      return {
        ...payload,
        content: payload.content.map(normalizeSession),
      };
    }

    return payload;
  },

  // Get session history for a specific patient (doctor view)
  getPatientSessionHistory: async (patientId, page = 0, size = 10) => {
    const response = await apiClient.get('/chats/with-doctors', {
      params: { page, size, patientId }
    });
    return response.data;
  },

  // Get details of a specific session including all messages
  getSessionDetails: async (sessionId) => {
    const response = await apiClient.get(`/chats/${sessionId}/messages`);
    return response.data;
  },

  // Update authorized doctors for a chat session
  updateSessionAccess: async (sessionId, doctorIds) => {
    const response = await apiClient.put(`/chats/sessions/${sessionId}/access`, {
      doctorIds
    });
    return response.data;
  },

  // Search through chat history
  searchHistory: async (query, startDate = null, endDate = null) => {
    const response = await apiClient.get('/chats/search', {
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
    return { totalSessions: 0, totalMessages: 0 };
  },
};

export default chatService;

