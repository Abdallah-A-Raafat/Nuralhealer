import apiClient from './apiClient';

/**
 * Engagement Chat Service
 * 
 * Handles patient-doctor messaging within active engagements.
 * Provides real-time messaging capabilities with access control.
 * 
 * Backend Requirements:
 * - POST /api/engagement-chat/send - Send message to doctor
 * - GET /api/engagement-chat/{engagementId} - Get chat history
 * - GET /api/engagement-chat/{engagementId}/messages?page=0&size=50 - Paginated messages
 * - PUT /api/engagement-chat/messages/{messageId}/read - Mark message as read
 * - DELETE /api/engagement-chat/messages/{messageId} - Delete message (soft delete)
 * - WebSocket /ws/engagement-chat/{engagementId} - Real-time message updates
 * 
 * Database Schema:
 * - engagement_messages table: id, engagement_id, sender_id, sender_type (PATIENT/DOCTOR), 
 *   message_text, is_read, created_at, updated_at, deleted_at
 * - Include indexes on engagement_id and created_at for efficient queries
 */

const engagementChatService = {
  /**
   * Send message to doctor
   * @param {number} engagementId - Engagement ID
   * @param {string} message - Message text
   * @returns {Promise} Sent message data
   */
  sendMessage: async (engagementId, message) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.post('/engagement-chat/send', {
    //   engagementId,
    //   message,
    //   timestamp: new Date().toISOString()
    // });
    // return response.data;
    
    // Mock response
    return {
      id: Date.now(),
      engagementId,
      senderId: 1,
      senderType: 'PATIENT',
      senderName: 'Current User',
      message,
      isRead: false,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get chat messages for engagement
   * @param {number} engagementId - Engagement ID
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Chat messages
   */
  getChatMessages: async (engagementId, page = 0, size = 50) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.get(`/engagement-chat/${engagementId}/messages`, {
    //   params: { page, size }
    // });
    // return response.data;
    
    // Mock data
    return {
      content: [
        {
          id: 1,
          engagementId,
          senderId: 2,
          senderType: 'DOCTOR',
          senderName: 'Dr. Smith',
          message: 'Hello! How are you feeling today?',
          isRead: true,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          engagementId,
          senderId: 1,
          senderType: 'PATIENT',
          senderName: 'You',
          message: 'Hi Doctor, I\'m doing better. Thanks for asking!',
          isRead: true,
          timestamp: new Date(Date.now() - 3000000).toISOString()
        },
        {
          id: 3,
          engagementId,
          senderId: 2,
          senderType: 'DOCTOR',
          senderName: 'Dr. Smith',
          message: 'That\'s great to hear! Have you been practicing the coping strategies we discussed?',
          isRead: true,
          timestamp: new Date(Date.now() - 2400000).toISOString()
        },
        {
          id: 4,
          engagementId,
          senderId: 1,
          senderType: 'PATIENT',
          senderName: 'You',
          message: 'Yes, the breathing exercises have been really helpful.',
          isRead: false,
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ],
      totalElements: 4,
      totalPages: 1,
      currentPage: 0
    };
  },

  /**
   * Mark message as read
   * @param {number} messageId - Message ID
   * @returns {Promise} Updated message
   */
  markAsRead: async (messageId) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.put(`/engagement-chat/messages/${messageId}/read`);
    // return response.data;
    
    // Mock response
    return { id: messageId, isRead: true };
  },

  /**
   * Get unread message count for engagement
   * @param {number} engagementId - Engagement ID
   * @returns {Promise} Unread count
   */
  getUnreadCount: async (engagementId) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.get(`/engagement-chat/${engagementId}/unread-count`);
    // return response.data;
    
    // Mock response
    return { unreadCount: 2 };
  },

  /**
   * Delete message (soft delete)
   * @param {number} messageId - Message ID
   * @returns {Promise} Success response
   */
  deleteMessage: async (messageId) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.delete(`/engagement-chat/messages/${messageId}`);
    // return response.data;
    
    // Mock response
    return { success: true, message: 'Message deleted successfully' };
  }
};

export default engagementChatService;
