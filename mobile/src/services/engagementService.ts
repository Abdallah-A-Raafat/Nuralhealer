/**
 * Engagement Service
 * Handles doctor-patient engagement/relationship management
 */

import apiClient from './apiClient';

export interface Engagement {
  id: string;
  doctorId: string;
  patientId: string;
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  accessLevel: string;
  createdAt: string;
  doctor?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  patient?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const engagementService = {
  // Doctor initiates engagement
  initiateEngagement: async (patientId: string, accessRuleName = 'FULL_ACCESS') => {
    const response = await apiClient.post('/engagements/initiate', {
      patientId,
      accessRuleName,
    });
    return response.data;
  },

  // Patient verifies engagement start
  verifyEngagement: async (token: string) => {
    const response = await apiClient.post('/engagements/verify-start', { token });
    return response.data;
  },

  // Get all my engagements (doctor or patient)
  getMyEngagements: async (): Promise<Engagement[]> => {
    const response = await apiClient.get('/engagements/my-engagements');
    return response.data;
  },

  // Get a specific engagement
  getEngagement: async (engagementId: string): Promise<Engagement> => {
    const response = await apiClient.get(`/engagements/${engagementId}`);
    return response.data;
  },

  // Cancel engagement (soft cancel)
  cancelEngagement: async (engagementId: string, reason: string, newAccessRule: string | null = null) => {
    const payload: { reason: string; newAccessRule?: string } = { reason };
    if (newAccessRule) {
      payload.newAccessRule = newAccessRule;
    }
    const response = await apiClient.post(`/engagements/${engagementId}/cancel`, payload);
    return response.data;
  },

  // Hard delete engagement (doctor only, pending only)
  deleteEngagement: async (engagementId: string) => {
    const response = await apiClient.delete(`/engagements/${engagementId}`);
    return response.data;
  },

  // Reject engagement (patient cancels pending request)
  rejectEngagement: async (engagementId: string, reason = 'Rejected by patient') => {
    const response = await apiClient.post(`/engagements/${engagementId}/cancel`, { reason });
    return response.data;
  },

  // Refresh token (doctor only)
  refreshToken: async (engagementId: string) => {
    const response = await apiClient.post(`/engagements/${engagementId}/refresh-token`);
    return response.data;
  },

  // Get current token (doctor only)
  getCurrentToken: async (engagementId: string) => {
    const response = await apiClient.get(`/engagements/${engagementId}/token`);
    return response.data;
  },

  // Request to end engagement
  requestEnd: async (engagementId: string, reason: string) => {
    const response = await apiClient.post(`/engagements/${engagementId}/end-request`, { reason });
    return response.data;
  },

  // Verify engagement end
  verifyEnd: async (engagementId: string, token: string) => {
    const response = await apiClient.post(`/engagements/${engagementId}/verify-end`, { token });
    return response.data;
  },

  // Helper functions
  getPendingEngagements: (engagements: Engagement[]) => {
    return engagements.filter(e => e.status === 'pending');
  },

  getActiveEngagements: (engagements: Engagement[]) => {
    return engagements.filter(e => e.status === 'active');
  },

  getEndedEngagements: (engagements: Engagement[]) => {
    return engagements.filter(e => e.status === 'ended' || e.status === 'cancelled');
  },
};

export default engagementService;
