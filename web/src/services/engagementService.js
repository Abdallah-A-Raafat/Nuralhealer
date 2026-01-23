import apiClient from './apiClient';

const engagementService = {
  // Doctor initiates engagement
  initiateEngagement: async (patientId, accessRuleName = 'FULL_ACCESS') => {
    const response = await apiClient.post('/engagements/initiate', {
      patientId,
      accessRuleName,
    });
    return response.data;
  },

  // Patient verifies engagement start
  verifyEngagement: async (token) => {
    const response = await apiClient.post('/engagements/verify-start', { token });
    return response.data;
  },

  // Get all my engagements (doctor or patient)
  getMyEngagements: async () => {
    const response = await apiClient.get('/engagements/my-engagements');
    return response.data;
  },

  // Get a specific engagement
  getEngagement: async (engagementId) => {
    const response = await apiClient.get(`/engagements/${engagementId}`);
    return response.data;
  },

  // Cancel engagement (soft cancel)
  cancelEngagement: async (engagementId, reason, newAccessRule = null) => {
    const payload = { reason };
    if (newAccessRule) {
      payload.newAccessRule = newAccessRule;
    }
    const response = await apiClient.post(`/engagements/${engagementId}/cancel`, payload);
    return response.data;
  },

  // Hard delete engagement (doctor only, pending only)
  deleteEngagement: async (engagementId) => {
    const response = await apiClient.delete(`/engagements/${engagementId}`);
    return response.data;
  },

  // Refresh token (doctor only)
  refreshToken: async (engagementId) => {
    const response = await apiClient.post(`/engagements/${engagementId}/refresh-token`);
    return response.data;
  },

  // Get current token (doctor only)
  getCurrentToken: async (engagementId) => {
    const response = await apiClient.get(`/engagements/${engagementId}/token`);
    return response.data;
  },

  // Request to end engagement
  requestEnd: async (engagementId, reason) => {
    const response = await apiClient.post(`/engagements/${engagementId}/end-request`, { reason });
    return response.data;
  },

  // Verify engagement end
  verifyEnd: async (engagementId, token) => {
    const response = await apiClient.post(`/engagements/${engagementId}/verify-end`, { token });
    return response.data;
  },

  // Helper functions
  getPendingEngagements: (engagements) => {
    return engagements.filter(e => e.status === 'pending');
  },

  getActiveEngagements: (engagements) => {
    return engagements.filter(e => e.status === 'active');
  },

  getEndedEngagements: (engagements) => {
    return engagements.filter(e => e.status === 'ended' || e.status === 'cancelled');
  },
};

export default engagementService;
