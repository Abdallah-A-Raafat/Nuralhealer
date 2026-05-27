/**
 * App Configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://192.168.1.10/24:8080/api' : 'https://api.neuralhealer.com/api',
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'NeuralHealer',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'ar'] as const,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  ONBOARDING_COMPLETE: 'onboarding_complete',
};
