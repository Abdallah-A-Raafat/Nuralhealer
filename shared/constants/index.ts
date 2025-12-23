/**
 * Shared Constants
 * Used across Web and Mobile applications
 */

// ========================================
// API Error Codes
// ========================================

export const ERROR_CODES = {
  // Authentication Errors (1000-1099)
  INVALID_CREDENTIALS: 'AUTH_1001',
  TOKEN_EXPIRED: 'AUTH_1002',
  TOKEN_INVALID: 'AUTH_1003',
  UNAUTHORIZED: 'AUTH_1004',
  EMAIL_ALREADY_EXISTS: 'AUTH_1005',
  WEAK_PASSWORD: 'AUTH_1006',
  ACCOUNT_DISABLED: 'AUTH_1007',
  EMAIL_NOT_VERIFIED: 'AUTH_1008',

  // User Errors (1100-1199)
  USER_NOT_FOUND: 'USER_1101',
  USER_ALREADY_EXISTS: 'USER_1102',
  INVALID_USER_DATA: 'USER_1103',
  PROFILE_UPDATE_FAILED: 'USER_1104',

  // Appointment Errors (1200-1299)
  APPOINTMENT_NOT_FOUND: 'APPT_1201',
  SLOT_NOT_AVAILABLE: 'APPT_1202',
  PAST_DATE_BOOKING: 'APPT_1203',
  DOCTOR_NOT_AVAILABLE: 'APPT_1204',
  APPOINTMENT_CONFLICT: 'APPT_1205',
  CANCELLATION_FAILED: 'APPT_1206',
  TOO_LATE_TO_CANCEL: 'APPT_1207',

  // Chat/Session Errors (1300-1399)
  SESSION_NOT_FOUND: 'CHAT_1301',
  SESSION_ENDED: 'CHAT_1302',
  MESSAGE_SEND_FAILED: 'CHAT_1303',
  INVALID_MESSAGE_FORMAT: 'CHAT_1304',
  SESSION_LIMIT_REACHED: 'CHAT_1305',

  // AI Service Errors (1400-1499)
  AI_SERVICE_UNAVAILABLE: 'AI_1401',
  EMOTION_ANALYSIS_FAILED: 'AI_1402',
  VOICE_PROCESSING_FAILED: 'AI_1403',
  RESPONSE_GENERATION_FAILED: 'AI_1404',
  INVALID_AUDIO_FORMAT: 'AI_1405',
  AUDIO_TOO_LONG: 'AI_1406',

  // Doctor Errors (1500-1599)
  DOCTOR_NOT_FOUND: 'DOC_1501',
  INVALID_SPECIALIZATION: 'DOC_1502',
  SCHEDULE_UPDATE_FAILED: 'DOC_1503',

  // Payment Errors (1600-1699)
  PAYMENT_FAILED: 'PAY_1601',
  INSUFFICIENT_FUNDS: 'PAY_1602',
  INVALID_PAYMENT_METHOD: 'PAY_1603',
  REFUND_FAILED: 'PAY_1604',

  // Validation Errors (1700-1799)
  INVALID_INPUT: 'VAL_1701',
  MISSING_REQUIRED_FIELD: 'VAL_1702',
  INVALID_EMAIL_FORMAT: 'VAL_1703',
  INVALID_PHONE_FORMAT: 'VAL_1704',
  INVALID_DATE_FORMAT: 'VAL_1705',

  // Server Errors (1800-1899)
  INTERNAL_SERVER_ERROR: 'SRV_1801',
  DATABASE_ERROR: 'SRV_1802',
  NETWORK_ERROR: 'SRV_1803',
  TIMEOUT_ERROR: 'SRV_1804',

  // Rate Limiting (1900-1999)
  RATE_LIMIT_EXCEEDED: 'RATE_1901',
  TOO_MANY_REQUESTS: 'RATE_1902',
} as const;

// ========================================
// Status Constants
// ========================================

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
} as const;

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
} as const;

// ========================================
// Emotion Constants
// ========================================

export const EMOTIONS = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  ANXIOUS: 'anxious',
  FEARFUL: 'fearful',
  NEUTRAL: 'neutral',
  SURPRISED: 'surprised',
} as const;

export const EMOTION_COLORS = {
  happy: '#10B981',     // Green
  sad: '#3B82F6',       // Blue
  angry: '#EF4444',     // Red
  anxious: '#F59E0B',   // Orange
  fearful: '#8B5CF6',   // Purple
  neutral: '#6B7280',   // Gray
  surprised: '#EC4899', // Pink
} as const;

// ========================================
// Time Constants
// ========================================

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
] as const;

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAYS_OF_WEEK_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
] as const;

// ========================================
// Appointment Types
// ========================================

export const APPOINTMENT_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  CHAT: 'chat',
} as const;

export const APPOINTMENT_DURATION = {
  SHORT: 30,    // 30 minutes
  STANDARD: 45, // 45 minutes
  LONG: 60,     // 60 minutes
} as const;

// ========================================
// Languages
// ========================================

export const LANGUAGES = {
  ENGLISH: 'en',
  ARABIC: 'ar',
} as const;

export const LANGUAGE_NAMES = {
  en: 'English',
  ar: 'العربية',
} as const;

// ========================================
// Notification Types
// ========================================

export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment-reminder',
  APPOINTMENT_CONFIRMED: 'appointment-confirmed',
  APPOINTMENT_CANCELLED: 'appointment-cancelled',
  MESSAGE_RECEIVED: 'message-received',
  SESSION_SUMMARY: 'session-summary',
  SYSTEM: 'system',
} as const;

// ========================================
// Specializations
// ========================================

export const DOCTOR_SPECIALIZATIONS = [
  'Clinical Psychology',
  'Psychiatry',
  'Counseling Psychology',
  'Child Psychology',
  'Family Therapy',
  'Cognitive Behavioral Therapy',
  'Trauma Therapy',
  'Addiction Counseling',
  'Marriage Counseling',
  'Anxiety & Depression',
] as const;

// ========================================
// Pagination
// ========================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ========================================
// Validation Rules
// ========================================

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_LENGTH: 10,
  BIO_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 2000,
  AUDIO_MAX_DURATION: 60, // seconds
  AUDIO_MAX_SIZE: 5 * 1024 * 1024, // 5 MB
} as const;

// ========================================
// API Endpoints Base
// ========================================

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  DOCTORS: {
    LIST: '/doctors',
    DETAIL: (id: string) => `/doctors/${id}`,
    SLOTS: (id: string) => `/doctors/${id}/slots`,
    STATS: '/doctor/stats',
    PATIENTS: '/doctor/patients',
    SCHEDULE: '/doctor/schedule',
  },
  APPOINTMENTS: {
    LIST: '/booking/appointments',
    CREATE: '/booking/create',
    DETAIL: (id: string) => `/booking/appointments/${id}`,
    CANCEL: (id: string) => `/booking/appointments/${id}/cancel`,
  },
  CHAT: {
    START: '/chat/start',
    SEND_MESSAGE: '/chat/message',
    END: (id: string) => `/chat/sessions/${id}/end`,
    SESSIONS: '/chat/sessions',
    SESSION_DETAIL: (id: string) => `/chat/sessions/${id}`,
  },
  AI: {
    ANALYZE_EMOTION: '/ai/analyze-emotion',
    ANALYZE_SENTIMENT: '/ai/analyze-sentiment',
    GENERATE_RESPONSE: '/ai/generate-response',
    VOICE_TO_TEXT: '/ai/voice-to-text',
    TEXT_TO_VOICE: '/ai/text-to-voice',
  },
} as const;

// ========================================
// Storage Keys
// ========================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'neuralhealer_access_token',
  REFRESH_TOKEN: 'neuralhealer_refresh_token',
  USER: 'neuralhealer_user',
  LANGUAGE: 'neuralhealer_language',
  THEME: 'neuralhealer_theme',
  LAST_SESSION: 'neuralhealer_last_session',
} as const;

// ========================================
// Theme Constants
// ========================================

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// ========================================
// Crisis Keywords (for detection)
// ========================================

export const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'hurt myself',
  'no reason to live',
  'better off dead',
] as const;

// ========================================
// Emergency Contacts
// ========================================

export const EMERGENCY_CONTACTS = {
  NATIONAL_SUICIDE_PREVENTION: '988',
  CRISIS_TEXT_LINE: '741741',
  EMERGENCY: '911',
} as const;
