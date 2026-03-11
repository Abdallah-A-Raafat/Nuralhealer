import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Always use relative path — Vite proxy forwards to the correct backend.
// CORS is avoided entirely: the browser only ever talks to localhost:5173.
const API_BASE_URL = '/api';

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
