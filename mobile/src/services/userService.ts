/**
 * User Service
 * Handles user-related API calls
 */

import apiClient from './apiClient';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR';
  profileImage?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  createdAt?: string;
}

const userService = {
  // Get current authenticated user data
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return response.data?.data || response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return response.data?.data || response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/chats');
      const sessions = response.data || [];
      const textSessions = sessions.filter((session: any) => (session.sessionType || '').toLowerCase() !== 'voice').length;
      const voiceSessions = sessions.filter((session: any) => (session.sessionType || '').toLowerCase() === 'voice').length;

      return {
        totalSessions: sessions.length,
        totalMinutes: 0,
        voiceSessions,
        textSessions,
      };
    } catch (error) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        voiceSessions: 0,
        textSessions: 0,
      };
    }
  },

  // Get user session history
  getSessionHistory: async () => {
    try {
      const response = await apiClient.get('/chats');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<UserProfile>) => {
    void data;
    throw new Error('Profile update endpoint is not available in backend yet.');
  },

  // Search user by email (for doctor to find patients)
  searchUserByEmail: async (email: string) => {
    const response = await apiClient.get('/users/by-email', {
      params: { email }
    });
    return response.data?.data || response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserProfile> => {
    void userId;
    throw new Error('User-by-id endpoint is not available in backend yet.');
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    void currentPassword;
    void newPassword;
    throw new Error('Password update endpoint is not available in backend yet.');
  },

  // Upload profile image
  uploadProfileImage: async (formData: FormData) => {
    void formData;
    throw new Error('Profile image upload endpoint is not available in backend yet.');
  },

  // Delete account
  deleteAccount: async () => {
    throw new Error('Delete account endpoint is not available in backend yet.');
  },
};

export default userService;
