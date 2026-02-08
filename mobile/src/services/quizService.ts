/**
 * Quiz Service
 * Handles all quiz/assessment API calls
 * Supports: IPIP-120, IPIP-50, PHQ-9
 */

import apiClient from './apiClient';

interface QuizQuestion {
  id: number;
  text: string;
  arabicText?: string;
  options?: { value: number; label: string }[];
}

interface QuizResult {
  totalScore: number;
  result: any;
  completionDate: string;
}

const quizService = {
  // ============= IPIP-120 (120-question personality) =============
  ipip120: {
    start: async (userId: string | null = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/ipip120/start${params}`);
      return response.data;
    },
    
    getQuestions: async (questionId: number | null = null) => {
      const params = questionId ? `?questionId=${questionId}` : '';
      const response = await apiClient.get(`/quizzes/ipip120/questions${params}`);
      return response.data;
    },
    
    getResponses: async () => {
      const response = await apiClient.get('/quizzes/ipip120/responses');
      return response.data;
    },
    
    submitQuestion: async (questionId: number, score: number) => {
      const response = await apiClient.post('/quizzes/ipip120/submit-question', {
        questionId,
        score,
      });
      return response.data;
    },
    
    submitQuiz: async (userId: string | null = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/ipip120/submit-quiz${params}`);
      return response.data;
    },
  },

  // ============= IPIP-50 (50-question personality) =============
  ipip50: {
    start: async (userId: string | null = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/ipip50/start${params}`);
      return response.data;
    },
    
    getQuestions: async (questionId: number | null = null) => {
      const params = questionId ? `?questionId=${questionId}` : '';
      const response = await apiClient.get(`/quizzes/ipip50/questions${params}`);
      return response.data;
    },
    
    getProgress: async () => {
      const response = await apiClient.get('/quizzes/ipip50/progress');
      return response.data;
    },
    
    getResponses: async () => {
      const response = await apiClient.get('/quizzes/ipip50/responses');
      return response.data;
    },
    
    submitQuestion: async (questionId: number, score: number) => {
      const response = await apiClient.post('/quizzes/ipip50/submit-question', {
        questionId,
        score,
      });
      return response.data;
    },
    
    submitQuiz: async (userId: string | null = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/ipip50/submit-quiz${params}`);
      return response.data;
    },
    
    reset: async () => {
      const response = await apiClient.delete('/quizzes/ipip50/reset');
      return response.data;
    },
  },

  // ============= PHQ-9 (Depression screening) =============
  phq9: {
    start: async (userId: string | null = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/phq9/start${params}`);
      return response.data;
    },
    
    getQuestions: async () => {
      const response = await apiClient.get('/quizzes/phq9/questions');
      return response.data;
    },
    
    getProgress: async () => {
      const response = await apiClient.get('/quizzes/phq9/progress');
      return response.data;
    },
    
    getResponses: async () => {
      const response = await apiClient.get('/quizzes/phq9/responses');
      return response.data;
    },
    
    submitQuestion: async (questionId: number, score: number) => {
      const response = await apiClient.post('/quizzes/phq9/submit-question', {
        questionId,
        score,
      });
      return response.data;
    },
    
    submitQuiz: async (userId: string | null = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/phq9/submit-quiz${params}`);
      return response.data;
    },
    
    reset: async () => {
      const response = await apiClient.delete('/quizzes/phq9/reset');
      return response.data;
    },
  },

  // ============= Helper Functions =============
  
  getQuizName: (type: string) => {
    const names: Record<string, string> = {
      ipip120: 'IPIP-120 Personality Assessment',
      ipip50: 'IPIP-50 Personality Assessment',
      phq9: 'PHQ-9 Depression Screening',
    };
    return names[type] || type;
  },

  getQuizDescription: (type: string) => {
    const descriptions: Record<string, string> = {
      ipip120: 'Comprehensive 120-question personality assessment based on the Big Five model',
      ipip50: 'Quick 50-question personality assessment for understanding your traits',
      phq9: 'A 9-question screening tool widely used to assess depression severity',
    };
    return descriptions[type] || '';
  },

  getQuizDuration: (type: string) => {
    const durations: Record<string, string> = {
      ipip120: '20-30 minutes',
      ipip50: '10-15 minutes',
      phq9: '5 minutes',
    };
    return durations[type] || '';
  },

  getQuizQuestionCount: (type: string) => {
    const counts: Record<string, number> = {
      ipip120: 120,
      ipip50: 50,
      phq9: 9,
    };
    return counts[type] || 0;
  },
};

export default quizService;
