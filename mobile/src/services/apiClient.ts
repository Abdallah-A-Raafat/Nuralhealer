/**
 * API Client
 * Axios instance with interceptors for authentication
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config';
import { useAuthStore } from '../store/authStore';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    
    if (token && token !== 'session-cookie') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (__DEV__) {
      console.log(`📤 [API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [API] Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`📥 [API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    
    // Handle 401 Unauthorized
    if (status === 401) {
      console.log('🔒 [API] Unauthorized - logging out');
      useAuthStore.getState().logout();
    }
    
    // Handle other errors
    if (__DEV__) {
      console.error(`❌ [API] ${status} ${error.config?.url}:`, error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// API helper functions
export const api = {
  get: <T>(url: string, params?: object) => 
    apiClient.get<T>(url, { params }),
    
  post: <T>(url: string, data?: object) => 
    apiClient.post<T>(url, data),
    
  put: <T>(url: string, data?: object) => 
    apiClient.put<T>(url, data),
    
  patch: <T>(url: string, data?: object) => 
    apiClient.patch<T>(url, data),
    
  delete: <T>(url: string) => 
    apiClient.delete<T>(url),
};
