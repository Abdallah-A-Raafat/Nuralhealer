import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
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
      const userData = await authService.login(credentials);
      
      // Backend returns: { userId, email, firstName, lastName, role }
      login(userData);
      
      return { success: true, data: userData };
    } catch (error) {
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

  return {
    user,
    isLoggedIn,
    role, // 'DOCTOR' or 'PATIENT'
    accountType, // 'doctor' or 'patient' (for backward compatibility)
    loginUser,
    registerUser,
    logoutUser,
    checkAuthStatus,
    isAuthenticated: () => isLoggedIn,
    isDoctor: () => role === 'DOCTOR',
    isPatient: () => role === 'PATIENT',
  };
};
