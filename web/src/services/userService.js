import apiClient from './apiClient';

/**
 * User Service
 * Handles user profile and data operations
 */

export const userService = {
  /**
   * Get current authenticated user data
   * @returns {Promise} User data from backend
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data.data; // Backend returns { data: {...}, message: "..." }
    } catch (error) {
      console.error('❌ [USER] Failed to fetch user data:', error);
      throw error;
    }
  },

  /**
   * Search for a user by email (Doctor only)
   * @param {string} email - Email address to search for
   * @returns {Promise} User data if found
   */
  searchUserByEmail: async (email) => {
    try {
      const response = await apiClient.get(`/users/by-email?email=${encodeURIComponent(email)}`);
      return response.data; // Returns { data: {...}, message: "..." }
    } catch (error) {
      console.error('❌ [USER] Failed to search user:', error);
      throw error;
    }
  },

  /**
   * Get user statistics (sessions, appointments, etc.)
   * This will be implemented when backend provides the endpoint
   * For now, returns placeholder data
   */
  getUserStats: async () => {
    // TODO: Replace with actual API call when backend implements this endpoint
    // This would be something like: GET /api/users/stats or /api/patients/stats
    return {
      totalSessions: 0,
      totalMinutes: 0,
      voiceSessions: 0,
      textSessions: 0,
      upcomingAppointments: 0,
    };
  },

  /**
   * Get user session history
   * This will be implemented when backend provides the endpoint
   * For now, returns empty array
   */
  getSessionHistory: async () => {
    // TODO: Replace with actual API call when backend implements this endpoint
    // This would be something like: GET /api/ai-chat/sessions or /api/patients/sessions
    return [];
  },
};

export default userService;
