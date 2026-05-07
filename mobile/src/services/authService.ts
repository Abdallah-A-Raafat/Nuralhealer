/**
 * Authentication Service
 * Handles login, register, and auth-related API calls
 * Backend uses HTTP-only cookies for web, but mobile needs token-based auth
 */

import apiClient from './apiClient';
import { User } from '../store/authStore';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'PATIENT';
}

// Backend response format: { data: { userId, email, firstName, lastName, role }, message }
interface BackendAuthResponse {
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    token?: string;
    accessToken?: string;
  };
  message: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ApiError {
  message: string;
  status: number;
}

const SESSION_COOKIE_TOKEN = 'session-cookie';

const extractToken = (response: any, userData: any): string => {
  const bodyToken = userData?.token || userData?.accessToken;
  const authorizationHeader = response?.headers?.authorization || response?.headers?.Authorization;
  const headerToken = typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : undefined;

  return bodyToken || headerToken || SESSION_COOKIE_TOKEN;
};

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('🔐 [AUTH] Logging in user:', credentials.email);
      const response = await apiClient.post<BackendAuthResponse>('/auth/login', credentials);
      
      console.log('📦 [AUTH] Response:', response.data);
      
      // Backend returns: { data: { userId, email, firstName, lastName, role }, message }
      const userData = response.data.data;
      const token = extractToken(response, userData);
      
      return {
        user: {
          userId: userData.userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role.toUpperCase() as 'DOCTOR' | 'PATIENT',
        },
        token,
      };
    } catch (error: any) {
      console.error('❌ [AUTH] Login failed:', error.response?.data);
      throw {
        message: error.response?.data?.message || 'Login failed',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('📝 [AUTH] Registering user:', data.email);
      const response = await apiClient.post<BackendAuthResponse>('/auth/register', data);
      
      console.log('📦 [AUTH] Response:', response.data);
      
      const userData = response.data.data;
      const token = extractToken(response, userData);
      
      return {
        user: {
          userId: userData.userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role.toUpperCase() as 'DOCTOR' | 'PATIENT',
        },
        token,
      };
    } catch (error: any) {
      console.error('❌ [AUTH] Registration failed:', error.response?.data);
      throw {
        message: error.response?.data?.message || 'Registration failed',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.log('Logout request failed, but clearing local state');
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ data: any; message: string }>('/users/me');
      const userData = response.data?.data || response.data;
      return {
        userId: userData.id || userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role?.toUpperCase() as 'DOCTOR' | 'PATIENT',
      };
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to get user',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },

  /**
   * Forgot password - Send reset email
   */
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to send reset email',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to reset password',
        status: error.response?.status || 500,
      } as ApiError;
    }
  },
};

export default authService;
