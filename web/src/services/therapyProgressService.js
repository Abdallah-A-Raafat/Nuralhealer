import apiClient from './apiClient';

/**
 * Therapy Progress Service
 * 
 * Handles all therapy progress and assessment history operations.
 * This service is ready for backend integration once the API endpoints are available.
 * 
 * Backend Requirements:
 * - POST /api/assessments/results - Save assessment results
 * - GET /api/therapy-progress - Get all progress data with pagination
 * - GET /api/therapy-progress/summary - Get progress summary/statistics
 * - GET /api/therapy-progress/{assessmentType} - Get specific assessment history
 * 
 * Database Schema:
 * - therapy_progress table: id, user_id, assessment_type, score, results (JSONB), completion_date, created_at
 * - Include indexes on user_id and completion_date for efficient queries
 */

const therapyProgressService = {
  /**
   * Save assessment results to therapy progress
   * @param {string} assessmentType - Type of assessment (phq9, ipip50, ipip120)
   * @param {object} results - Assessment results data
   * @returns {Promise} Saved progress entry
   */
  saveAssessmentResults: async (assessmentType, results) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.post('/assessments/results', {
    //   assessmentType,
    //   results,
    //   completionDate: new Date().toISOString()
    // });
    // return response.data;
    
    // Mock response for now
    return {
      id: Date.now(),
      assessmentType,
      results,
      completionDate: new Date().toISOString(),
      message: 'Assessment results saved successfully (mock)'
    };
  },

  /**
   * Get all therapy progress data
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Paginated progress data
   */
  getProgressHistory: async (page = 0, size = 20) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.get('/therapy-progress', {
    //   params: { page, size }
    // });
    // return response.data;
    
    // Mock data for now - matches expected backend format
    return {
      content: [
        {
          id: 1,
          assessmentType: 'phq9',
          score: 12,
          severity: 'Moderate',
          completionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          results: { totalScore: 12, severity: 'Moderate' }
        },
        {
          id: 2,
          assessmentType: 'ipip50',
          score: 75,
          completionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          results: {
            traits: {
              openness: 85,
              conscientiousness: 70,
              extraversion: 60,
              agreeableness: 80,
              neuroticism: 45
            }
          }
        },
        {
          id: 3,
          assessmentType: 'phq9',
          score: 8,
          severity: 'Mild',
          completionDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          results: { totalScore: 8, severity: 'Mild' }
        },
        {
          id: 4,
          assessmentType: 'phq9',
          score: 15,
          severity: 'Moderate',
          completionDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          results: { totalScore: 15, severity: 'Moderate' }
        }
      ],
      totalPages: 1,
      totalElements: 4,
      currentPage: page
    };
  },

  /**
   * Get progress summary and statistics
   * @returns {Promise} Summary statistics
   */
  getProgressSummary: async () => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.get('/therapy-progress/summary');
    // return response.data;
    
    // Mock data
    return {
      totalAssessments: 4,
      assessmentTypes: {
        phq9: 3,
        ipip50: 1,
        ipip120: 0
      },
      latestScores: {
        phq9: { score: 12, severity: 'Moderate', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        ipip50: { score: 75, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
      },
      improvementTrend: 'improving', // 'improving', 'stable', 'declining'
      firstAssessmentDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    };
  },

  /**
   * Get history for specific assessment type
   * @param {string} assessmentType - Type of assessment
   * @returns {Promise} Assessment history
   */
  getAssessmentHistory: async (assessmentType) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.get(`/therapy-progress/${assessmentType}`);
    // return response.data;
    
    // Mock data
    const mockData = {
      phq9: [
        { id: 1, score: 12, severity: 'Moderate', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, score: 8, severity: 'Mild', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, score: 15, severity: 'Moderate', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      ipip50: [
        { 
          id: 2, 
          score: 75, 
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          traits: {
            openness: 85,
            conscientiousness: 70,
            extraversion: 60,
            agreeableness: 80,
            neuroticism: 45
          }
        }
      ],
      ipip120: []
    };
    
    return mockData[assessmentType] || [];
  },

  /**
   * Delete a progress entry
   * @param {number} progressId - Progress entry ID
   * @returns {Promise} Deletion result
   */
  deleteProgressEntry: async (progressId) => {
    // TODO: Uncomment when backend is ready
    // const response = await apiClient.delete(`/therapy-progress/${progressId}`);
    // return response.data;
    
    return { message: 'Progress entry deleted successfully (mock)' };
  }
};

export default therapyProgressService;
