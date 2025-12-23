/**
 * Shared TypeScript Type Definitions
 * Used across Web and Mobile applications
 */

// ========================================
// User Types
// ========================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface Patient extends User {
  role: 'patient';
  medicalHistory?: MedicalHistory;
  emergencyContact?: EmergencyContact;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  licenseNumber: string;
  experience: number;
  rating: number;
  bio?: string;
  availability: DoctorAvailability[];
  consultationFee: number;
  languages: string[];
}

export interface MedicalHistory {
  conditions: string[];
  medications: string[];
  allergies: string[];
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// ========================================
// Authentication Types
// ========================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'patient' | 'doctor';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ========================================
// Appointment/Booking Types
// ========================================

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: AppointmentStatus;
  type: 'video' | 'audio' | 'chat';
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  patient?: Patient;
  doctor?: Doctor;
}

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface DoctorAvailability {
  dayOfWeek: number; // 0-6, Sunday-Saturday
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;
  isAvailable: boolean;
}

export interface BookingRequest {
  doctorId: string;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'chat';
  notes?: string;
}

// ========================================
// Chat/Session Types
// ========================================

export interface ChatSession {
  id: string;
  userId: string;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
  messages: ChatMessage[];
  emotionHistory: EmotionData[];
  summary?: SessionSummary;
}

export type SessionStatus = 
  | 'active'
  | 'paused'
  | 'ended';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  sentiment?: string;
  timestamp: string;
  isVoice?: boolean;
  audioUrl?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  isVoice?: boolean;
  audioData?: string; // base64
}

export interface SessionSummary {
  duration: number; // minutes
  messageCount: number;
  dominantEmotions: string[];
  topics: string[];
  recommendations: string[];
}

// ========================================
// AI/Emotion Types
// ========================================

export interface EmotionData {
  emotion: EmotionType;
  confidence: number;
  timestamp: string;
}

export type EmotionType = 
  | 'happy'
  | 'sad'
  | 'angry'
  | 'anxious'
  | 'fearful'
  | 'neutral'
  | 'surprised';

export interface EmotionAnalysisRequest {
  type: 'text' | 'audio';
  content: string; // text or base64 audio
  language: 'en' | 'ar';
}

export interface EmotionAnalysisResponse {
  emotions: EmotionData[];
  primaryEmotion: EmotionType;
  timestamp: string;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  aspects: {
    positivity: number;
    negativity: number;
    neutrality: number;
  };
}

// ========================================
// API Response Types
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// Notification Types
// ========================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'appointment-reminder'
  | 'appointment-confirmed'
  | 'appointment-cancelled'
  | 'message-received'
  | 'session-summary'
  | 'system';

// ========================================
// Dashboard/Statistics Types
// ========================================

export interface DoctorStats {
  totalPatients: number;
  activePatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalSessions: number;
  averageRating: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface PatientStats {
  totalSessions: number;
  upcomingSessions: number;
  emotionTrends: EmotionTrend[];
  lastSessionDate?: string;
  nextAppointment?: Appointment;
}

export interface EmotionTrend {
  date: string;
  emotion: EmotionType;
  count: number;
}

// ========================================
// Form Types
// ========================================

export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ========================================
// Filter/Query Types
// ========================================

export interface DoctorFilters {
  specialization?: string;
  minRating?: number;
  maxFee?: number;
  availability?: string; // ISO date
  language?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  patientId?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
