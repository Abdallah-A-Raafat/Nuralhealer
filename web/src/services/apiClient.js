import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Base API configuration - Backend runs on port 8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Enable HTTP-only cookie authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - No need to add Bearer token (cookies handle auth)
apiClient.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent by the browser
    // No manual token management needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
