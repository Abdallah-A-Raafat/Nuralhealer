import apiClient from './apiClient';

/**
 * Authentication Service
 * Handles user authentication with backend API
 * Backend uses HTTP-only cookies for JWT storage
 */

export const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Backend response: { data: { userId, email, firstName, lastName, role }, message }
   */
  login: async (credentials) => {
    console.log('🔐 [AUTH] Logging in user:', credentials.email);
    
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      console.log('📦 [AUTH] Full response:', response.data);
      
      // Backend returns: { data: { userId, email, firstName, lastName, role }, message: "Login successful" }
      // JWT is automatically stored in HTTP-only cookie
      
      // Handle different response formats
      const userData = response.data.data || response.data;
      
      console.log('✅ [AUTH] Login successful, user data:', userData);
      
      return userData; // Return the user data
    } catch (error) {
      console.error('❌ [AUTH] Login failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - { email, password, firstName, lastName, accountType }
   * @returns {Promise} Backend response with user data
   */
  register: async (userData) => {
    console.log('📝 [AUTH] Registering new user:', userData.email);
    
    // Transform frontend format to backend format
    const backendPayload = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.accountType.toUpperCase(), // "patient" → "PATIENT", "doctor" → "DOCTOR"
    };
    
    console.log('🔍 [DEBUG] Sending payload to backend:', backendPayload);
    
    try {
      const response = await apiClient.post('/auth/register', backendPayload);
      
      console.log('✅ [AUTH] Registration successful, response:', response.data);
      
      // Backend returns: { data: { userId, email, firstName, lastName, role, createdAt }, message }
      return response.data.data; // Return the user data
    } catch (error) {
      console.error('❌ [AUTH] Registration failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Logout user - Clears HTTP-only cookie
   * @returns {Promise}
   */
  logout: async () => {
    console.log('👋 [AUTH] Logging out user');
    
    try {
      await apiClient.post('/auth/logout');
      console.log('✅ [AUTH] Logout successful');
    } catch {
      // Even if logout fails, we clear local state
      console.warn('⚠️ [AUTH] Logout request failed, but clearing local state');
    }
  },

  /**
   * Get current authenticated user
   * Uses cookie to authenticate
   * @returns {Promise} User data
   */
  getCurrentUser: async () => {
    console.log('👤 [AUTH] Fetching current user');
    
    const response = await apiClient.get('/users/me');
    
    // Backend returns user data
    console.log('✅ [AUTH] Current user fetched');
    
    return response.data;
  },
  /**
   * Verify OTP code for email verification
   * @param {string} email
   * @param {string} otpCode
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  verifyOtp: async (email, otpCode) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { email, otpCode });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Verification failed';
      return { success: false, error: message };
    }
  },
  /**
   * Resend OTP code for email verification
   * @param {string} email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  resendOtp: async (email) => {
    try {
      const response = await apiClient.post('/auth/resend-otp', { email });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Resend failed';
      return { success: false, error: message };
    }
  },
};
