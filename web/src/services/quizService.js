import apiClient from './apiClient';

/**
 * Quiz Service - Handles all quiz/assessment API calls
 * Supports: IPIP-120, IPIP-50, PHQ-9
 */

const quizService = {
  // ============= IPIP-120 (120-question personality) =============
  ipip120: {
    start: async (userId = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/ipip120/start${params}`);
      return response.data;
    },
    
    getQuestions: async (language = 'en', questionId = null) => {
      const params = [];
      if (questionId) params.push(`questionId=${questionId}`);
      if (language) params.push(`lang=${language}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const response = await apiClient.get(`/quizzes/ipip120/questions${query}`);
      return response.data;
    },
    
    getResponses: async () => {
      const response = await apiClient.get('/quizzes/ipip120/responses');
      return response.data;
    },
    
    submitQuestion: async (questionId, score) => {
      const response = await apiClient.post('/quizzes/ipip120/submit-question', {
        questionId,
        score,
      });
      return response.data;
    },
    
    submitQuiz: async (userId = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/ipip120/submit-quiz${params}`);
      return response.data;
    },
  },

  // ============= IPIP-50 (50-question personality) =============
  ipip50: {
    start: async (userId = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/ipip50/start${params}`);
      return response.data;
    },
    
    getQuestions: async (language = 'en', questionId = null) => {
      const params = [];
      if (questionId) params.push(`questionId=${questionId}`);
      if (language) params.push(`lang=${language}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const response = await apiClient.get(`/quizzes/ipip50/questions${query}`);
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
    
    submitQuestion: async (questionId, score) => {
      const response = await apiClient.post('/quizzes/ipip50/submit-question', {
        questionId,
        score,
      });
      return response.data;
    },
    
    submitQuiz: async (userId = null) => {
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
    start: async (userId = null) => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.post(`/quizzes/phq9/start${params}`);
      return response.data;
    },
    
    getQuestions: async (language = 'en') => {
      const query = language ? `?lang=${language}` : '';
      const response = await apiClient.get(`/quizzes/phq9/questions${query}`);
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
    
    submitQuestion: async (questionId, score) => {
      const response = await apiClient.post('/quizzes/phq9/submit-question', {
        questionId,
        score,
      });
      return response.data;
    },
    
    submitQuiz: async (userId = null) => {
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
  
  /**
   * Get quiz type display name
   */
  getQuizName: (type) => {
    const names = {
      ipip120: 'IPIP-120 Personality Assessment',
      ipip50: 'IPIP-50 Personality Assessment',
      phq9: 'PHQ-9 Depression Screening',
    };
    return names[type] || type;
  },

  /**
   * Get quiz description
   */
  getQuizDescription: (type) => {
    const descriptions = {
      ipip120: 'Comprehensive 120-question personality assessment based on the Big Five model',
      ipip50: 'Quick 50-question personality assessment for understanding your traits',
      phq9: 'Clinical depression screening tool (9 questions) - widely used by healthcare professionals',
    };
    return descriptions[type] || '';
  },

  /**
   * Get quiz duration estimate
   */
  getQuizDuration: (type) => {
    const durations = {
      ipip120: '20-30 minutes',
      ipip50: '10-15 minutes',
      phq9: '5 minutes',
    };
    return durations[type] || 'Unknown';
  },

  /**
   * Get total questions count
   */
  getTotalQuestions: (type) => {
    const counts = {
      ipip120: 120,
      ipip50: 50,
      phq9: 9,
    };
    return counts[type] || 0;
  },
};

export default quizService;
