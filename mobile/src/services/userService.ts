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
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/users/stats');
      return response.data;
    } catch (error) {
      // Return default stats if endpoint not available
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
      const response = await apiClient.get('/ai-chat/sessions');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  // Search user by email (for doctor to find patients)
  searchUserByEmail: async (email: string) => {
    const response = await apiClient.get('/users/search', {
      params: { email }
    });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.put('/users/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (formData: FormData) => {
    const response = await apiClient.post('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await apiClient.delete('/users/account');
    return response.data;
  },
};

export default userService;
