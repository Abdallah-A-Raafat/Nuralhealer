import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import aiChatService from '../services/aiChatService';
import { handleApiError } from '../utils/errorHandler';

/**
 * Authentication Hook
 * Provides authentication methods and state
 */
export const useAuth = () => {
  const { user, isLoggedIn, role, login, logout, updateUser } = useAuthStore();

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const loginUser = async (credentials) => {
    try {
      // Prevent reusing stale socket auth/session across account switches
      aiChatService.disconnect();
      aiChatService.clearSession();

      const userData = await authService.login(credentials);
      
      console.log('👤 [useAuth] Received user data:', userData);
      
      // Validate userData has required fields
      if (!userData) {
        throw new Error('No user data received from server');
      }
      
      if (!userData.role) {
        console.warn('⚠️ [useAuth] Missing role, setting default to PATIENT');
        userData.role = 'PATIENT';
      }
      
      // Backend returns: { userId, email, firstName, lastName, role }
      login(userData);
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('❌ [useAuth] Login error:', error);
      const message = handleApiError(error);
      return { success: false, error: message };
    }
  };

  /**
   * Register new user
   * @param {Object} userData - { email, password, firstName, lastName, accountType }
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const registerUser = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      // Backend returns: { userId, email, firstName, lastName, role, createdAt }
      login(response);
      
      return { success: true, data: response };
    } catch (error) {
      const message = handleApiError(error);
      return { success: false, error: message };
    }
  };

  /**
   * Logout user
   */
  const logoutUser = async () => {
    try {
      aiChatService.disconnect();
      aiChatService.clearSession();
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state even if API call fails
      logout();
    }
  };

  /**
   * Check authentication status by fetching current user
   * Used for session restore on page refresh
   */
  const checkAuthStatus = useCallback(async () => {
    if (!isLoggedIn) return false;
    
    try {
      const userData = await authService.getCurrentUser();
      updateUser(userData);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [isLoggedIn, updateUser, logout]);

  /**
   * Auto-check auth status on mount if logged in
   */
  useEffect(() => {
    if (isLoggedIn && !user) {
      checkAuthStatus();
    }
  }, [isLoggedIn, user, checkAuthStatus]);

  /**
   * Get account type in lowercase for backward compatibility
   */
  const accountType = role ? role.toLowerCase() : null;

  /**
   * Verify OTP code for email verification
   * @param {string} email
   * @param {string} otpCode
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const verifyOtp = async (email, otpCode) => {
    return await authService.verifyOtp(email, otpCode);
  };

  /**
   * Resend OTP code for email verification
   * @param {string} email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const resendOtp = async (email) => {
    return await authService.resendOtp(email);
  };

  return {
    user,
    isLoggedIn,
    role, // 'DOCTOR' or 'PATIENT'
    accountType, // 'doctor' or 'patient' (for backward compatibility)
    loginUser,
    registerUser,
    logoutUser,
    checkAuthStatus,
    verifyOtp,
    resendOtp,
    isAuthenticated: () => isLoggedIn,
    isDoctor: () => role === 'DOCTOR',
    isPatient: () => role === 'PATIENT',
  };
};
