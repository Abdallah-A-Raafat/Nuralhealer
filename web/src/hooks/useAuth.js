import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { handleApiError } from '../utils/errorHandler';

export const useAuth = () => {
  const { user, token, isLoggedIn, accountType, login, logout, updateUser } = useAuthStore();

  const loginUser = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      login(response.user, response.token, response.accountType);
      return { success: true, data: response };
    } catch (error) {
      const message = handleApiError(error);
      return { success: false, error: message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await authService.register(userData);
      login(response.user, response.token, userData.accountType);
      return { success: true, data: response };
    } catch (error) {
      const message = handleApiError(error);
      return { success: false, error: message };
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  const checkAuthStatus = useCallback(async () => {
    if (!token) return false;
    
    try {
      const userData = await authService.getCurrentUser();
      updateUser(userData);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [token, updateUser, logout]);

  useEffect(() => {
    if (token && !user) {
      checkAuthStatus();
    }
  }, [token, user, checkAuthStatus]);

  return {
    user,
    token,
    isLoggedIn,
    accountType,
    loginUser,
    registerUser,
    logoutUser,
    checkAuthStatus,
    isAuthenticated: () => isLoggedIn && token,
  };
};
