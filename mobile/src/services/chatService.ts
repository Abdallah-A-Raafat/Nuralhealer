/**
 * Chat Service (Mobile)
 * Handles AI chat sessions, history, and voice interactions
 * Mirrors web chatService.js endpoints and methods
 */

import apiClient from './apiClient';

/**
 * Normalize session object to consistent format
 * Handles multiple response formats from backend
 */
const normalizeSession = (session: any) => {
  if (!session) return session;

  const sessionId = session.sessionId || session.id;
  return {
    ...session,
    id: session.id || sessionId,
    sessionId,
    sessionTitle: session.sessionTitle || 'New AI Chat',
    sessionType: session.sessionType || 'text',
    startedAt: session.startedAt || session.startTime || session.createdAt,
    messageCount: session.messageCount || 0,
    status: session.status || (session.isActive ? 'active' : 'completed'),
  };
};

export const chatService = {
  /**
   * Start (or get) an active chat session
   * POST /chats
   * Returns: { sessionId }
   */
  startSession: async () => {
    try {
      const response = await apiClient.post('/chats');
      const data = response.data?.data || response.data;
      return { 
        sessionId: data?.sessionId || data?.id || data 
      };
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      throw error;
    }
  },

  /**
   * Start a voice-based chat session
   * POST /chats/voice
   * Returns: { sessionId }
   */
  startVoiceSession: async () => {
    try {
      const response = await apiClient.post('/chats/voice');
      const data = response.data?.data || response.data;
      return { 
        sessionId: data?.sessionId || data?.id || data 
      };
    } catch (error) {
      console.error('❌ Failed to start voice session:', error);
      throw error;
    }
  },

  /**
   * Send a text message in an active session
   * POST /ai/ask/{sessionId} or POST /ai/ask (if no sessionId)
   * Returns: { sessionId, answer, emotion, audioBase64, userText }
   */
  sendMessage: async (sessionId: string, message: string, messageType = 'text') => {
    try {
      const endpoint = sessionId ? `/ai/ask/${sessionId}` : '/ai/ask';
      const response = await apiClient.post(endpoint, {
        question: message,
        country: 'egypt',
        messageType,
      });

      const data = response.data?.data || response.data || {};
      return {
        sessionId: data.sessionId || sessionId || null,
        message: data.answer || data.message || '',
        answer: data.answer || data.message || '',
        emotion: data.intent || data.emotion || null,
        userText: data.userText || null,
        audioBase64: data.audio_base64 || data.audioBase64 || null,
      };
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  },

  /**
   * Send a voice recording to AI voice endpoint
   * POST /ai/voice/{sessionId} (multipart form-data)
   * 
   * @param sessionId - Active session ID
   * @param audioBlob - Audio recording as Blob/File
   * @param conversationHistory - Previous messages for context
   * Returns: { sessionId, answer, audioBase64, userText, confidence }
   */
  sendVoiceMessage: async (
    sessionId: string,
    audioBlob: Blob,
    conversationHistory: any[] = []
  ) => {
    try {
      // Determine audio format
      const mimeType = audioBlob?.type || 'audio/wav';
      const supportedFormats = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/mpeg'];
      const isSupported = supportedFormats.includes(mimeType);

      if (!isSupported) {
        console.warn(`⚠️ Audio format ${mimeType} may not be supported. Attempting upload...`);
      }

      // Convert to appropriate format
      const uploadBlob = mimeType.includes('webm')
        ? new Blob([audioBlob], { type: 'audio/wav' })
        : audioBlob;

      // Determine file extension
      const uploadMimeType = uploadBlob?.type || 'audio/wav';
      const extension = uploadMimeType.includes('mp3') || uploadMimeType.includes('mpeg')
        ? 'mp3'
        : uploadMimeType.includes('ogg')
          ? 'ogg'
          : 'wav';

      // Build FormData
      const formData = new FormData();
      formData.append('file', uploadBlob, `voice.${extension}`);
      formData.append('conversation_history', JSON.stringify(conversationHistory));

      // Send via multipart
      const response = await apiClient.post(`/ai/voice/${sessionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.data || response.data || {};
      return {
        sessionId: data.sessionId || sessionId || null,
        message: data.answer || '',
        answer: data.answer || '',
        userText: data.user_text || data.userText || null,
        audioBase64: data.audio_base64 || data.audioBase64 || null,
        confidence: data.confidence || null,
      };
    } catch (error) {
      console.error('❌ Failed to send voice message:', error);
      throw error;
    }
  },

  /**
   * Send a voice recording via file URI (React Native native approach).
   * Uses FormData { uri, name, type } — no Blob/Buffer needed.
   * POST /ai/voice/{sessionId} (multipart form-data)
   *
   * @param sessionId - Active session ID
   * @param audioUri - Local file URI from expo-av (file://...)
   * @param conversationHistory - Previous conversation pairs for context
   */
  sendVoiceMessageFromUri: async (
    sessionId: string,
    audioUri: string,
    conversationHistory: any[] = []
  ) => {
    try {
      console.log('📤 [VoiceService] URI:', audioUri, '| Session:', sessionId);

      // Auto-detect extension and MIME type from URI
      const uriLower = audioUri.toLowerCase();
      const extension = uriLower.includes('.m4a') ? 'm4a'
        : uriLower.includes('.mp4') ? 'mp4'
        : uriLower.includes('.mp3') ? 'mp3'
        : uriLower.includes('.ogg') ? 'ogg'
        : 'wav';
      const mimeType = (extension === 'm4a' || extension === 'mp4') ? 'audio/mp4'
        : extension === 'mp3' ? 'audio/mpeg'
        : extension === 'ogg' ? 'audio/ogg'
        : 'audio/wav';

      // React Native FormData: { uri, name, type } — axios handles the multipart natively
      const formData = new FormData();
      formData.append('file', { uri: audioUri, name: `voice.${extension}`, type: mimeType } as any);
      formData.append('conversation_history', JSON.stringify(conversationHistory));

      console.log('📤 [VoiceService] Sending as', mimeType);

      const response = await apiClient.post(`/ai/voice/${sessionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // voice processing can take longer
      });

      const data = response.data?.data || response.data || {};
      console.log('✅ [VoiceService] Response:', { hasAnswer: !!data.answer, userText: data.userText || data.user_text });

      return {
        sessionId: data.sessionId || sessionId || null,
        message: data.answer || '',
        answer: data.answer || '',
        userText: data.user_text || data.userText || null,
        audioBase64: data.audio_base64 || data.audioBase64 || null,
        confidence: data.confidence || null,
      };
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.error || error?.message;
      console.error(`❌ [VoiceService] Failed HTTP ${status}:`, msg);
      throw error;
    }
  },

  /**
   * End an active session (no-op wrapper, backend manages active flag)
   * POST /chats/{sessionId}/end or similar
   * Returns: { success, sessionId }
   */
  endSession: async (sessionId: string) => {
    try {
      // Backend currently manages active flag; implement if API exists
      console.log('ℹ️ Session end requested for:', sessionId);
      return { success: true, sessionId };
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      throw error;
    }
  },

  /**
   * Get all chat sessions for the current user (with pagination)
   * GET /chats?page={page}&size={size}
   * Returns: ChatSession[] or { content: ChatSession[], totalElements, totalPages }
   */
  getSessionHistory: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get('/chats', {
        params: { page, size }
      });

      const payload = response.data?.data || response.data;
      
      // If array response, normalize each session
      if (Array.isArray(payload)) {
        return payload.map(normalizeSession);
      }

      // If paginated response with content
      if (payload?.content && Array.isArray(payload.content)) {
        return {
          ...payload,
          content: payload.content.map(normalizeSession),
        };
      }

      return payload;
    } catch (error) {
      console.error('❌ Failed to get session history:', error);
      throw error;
    }
  },

  /**
   * Get details of a specific chat session including all messages
   * GET /chats/{sessionId}/messages
   * Returns: Flat array of messages directly (not wrapped object)
   */
  getSessionDetails: async (sessionId: string) => {
    try {
      const response = await apiClient.get(`/chats/${sessionId}/messages`);
      // Backend returns messages array directly, not wrapped in object
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Failed to get session details:', error);
      throw error;
    }
  },

  /**
   * Delete a chat session (soft delete)
   * DELETE /chats/{sessionId}
   * Returns: { success }
   */
  deleteSession: async (sessionId: string) => {
    try {
      await apiClient.delete(`/chats/${sessionId}`);
      console.log('✅ Session deleted:', sessionId);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      throw error;
    }
  },

  /**
   * Rename a chat session
   * PUT /chats/{sessionId}/title
   * Backend expects plain text body with Content-Type: text/plain
   * Returns: void (success response)
   */
  renameSession: async (sessionId: string, newTitle: string) => {
    try {
      await apiClient.put(`/chats/${sessionId}/title`, newTitle, {
        headers: { 'Content-Type': 'text/plain' },
      });
      console.log('✅ Session renamed to:', newTitle);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to rename session:', error);
      throw error;
    }
  },

  /**
   * Update authorized doctors for a chat session
   * PUT /chats/sessions/{sessionId}/access
   * Returns: Updated session with access list
   */
  updateSessionAccess: async (sessionId: string, doctorIds: string[]) => {
    try {
      const response = await apiClient.put(`/chats/sessions/${sessionId}/access`, {
        doctorIds
      });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('❌ Failed to update session access:', error);
      throw error;
    }
  },

  /**
   * Search through chat history by query, date range
   * GET /chats/search?query={query}&startDate={startDate}&endDate={endDate}
   * Returns: Matching sessions
   */
  searchHistory: async (query: string, startDate?: string, endDate?: string) => {
    try {
      const response = await apiClient.get('/chats/search', {
        params: { query, startDate, endDate }
      });
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.map(normalizeSession) : data;
    } catch (error) {
      console.error('❌ Failed to search history:', error);
      throw error;
    }
  },

  /**
   * Get doctors authorized to view this AI chat session
   * GET /chats/authorized-doctors
   * Returns: List of authorized doctors
   */
  getAuthorizedDoctors: async () => {
    try {
      const response = await apiClient.get('/chats/authorized-doctors');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Failed to get authorized doctors:', error);
      return [];
    }
  },

  /**
   * Get session statistics
   * GET /chats/stats
   * Returns: { totalSessions, totalMessages, ... }
   */
  getSessionStats: async () => {
    try {
      const response = await apiClient.get('/chats/stats');
      const data = response.data?.data || response.data;
      return data || { totalSessions: 0, totalMessages: 0 };
    } catch (error) {
      console.error('❌ Failed to get session stats:', error);
      return { totalSessions: 0, totalMessages: 0 };
    }
  },

  /**
   * Get chat sessions for a specific patient (doctor view)
   * GET /chats/with-doctors?page={page}&size={size}&patientId={patientId}
   * Returns: Patient's sessions accessible to doctor
   */
  getPatientSessionHistory: async (patientId: string, page = 0, size = 10) => {
    try {
      const response = await apiClient.get('/chats/with-doctors', {
        params: { page, size, patientId }
      });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('❌ Failed to get patient session history:', error);
      throw error;
    }
  },

  /**
   * Get all AI chat sessions for a patient (doctor view)
   * GET /doctors/patients/{patientId}/chats
   * Returns: Patient's chat sessions
   */
  getDoctorPatientChats: async (patientId: string) => {
    try {
      const response = await apiClient.get(`/doctors/patients/${patientId}/chats`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.map(normalizeSession) : [];
    } catch (error) {
      console.error('❌ Failed to get patient chats:', error);
      return [];
    }
  },

  /**
   * Get messages for a specific session (doctor view)
   * GET /doctors/patients/{patientId}/chats/{sessionId}/messages
   * Returns: All messages in session
   */
  getDoctorPatientChatMessages: async (patientId: string, sessionId: string) => {
    try {
      const response = await apiClient.get(
        `/doctors/patients/${patientId}/chats/${sessionId}/messages`
      );
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('❌ Failed to get patient chat messages:', error);
      return [];
    }
  },

  /**
   * Maintenance: Request backend to cleanup empty sessions
   * DELETE /ai/maintenance/cleanup
   * Returns: Cleanup result
   */
  cleanupEmptySessions: async () => {
    try {
      const response = await apiClient.delete('/ai/maintenance/cleanup');
      const data = response.data?.data || response.data;
      console.log('✅ Empty sessions cleaned up');
      return data;
    } catch (error) {
      console.error('❌ Failed to cleanup empty sessions:', error);
      throw error;
    }
  },
};

export default chatService;
