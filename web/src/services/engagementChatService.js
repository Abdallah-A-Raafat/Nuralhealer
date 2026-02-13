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
    const response = await apiClient.post(`/engagements/${engagementId}/messages`, {
      content: message
    });
    return response.data;
  },

  /**
   * Get chat messages for engagement
   * @param {number} engagementId - Engagement ID
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Chat messages
   */
  getChatMessages: async (engagementId) => {
    const response = await apiClient.get(`/engagements/${engagementId}/messages`);
    return response.data;
  },

  /**
   * Mark message as read
   * @param {number} messageId - Message ID
   * @returns {Promise} Updated message
   */
  markAsRead: async (messageId) => {
    // Backend does not yet expose a dedicated mark-as-read endpoint
    return { id: messageId, isRead: true };
  },

  /**
   * Get unread message count for engagement
   * @param {number} engagementId - Engagement ID
   * @returns {Promise} Unread count
   */
  getUnreadCount: async (engagementId) => {
    // Not implemented on backend; return zero to avoid UI regressions
    return { unreadCount: 0 };
  },

  /**
   * Delete message (soft delete)
   * @param {number} messageId - Message ID
   * @returns {Promise} Success response
   */
  deleteMessage: async (messageId) => {
    // Not yet supported on backend
    return { success: false, message: 'Delete not supported' };
  }
};

export default engagementChatService;
