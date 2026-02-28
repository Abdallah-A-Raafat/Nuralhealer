import apiClient from '../../services/apiClient';

const BASE = '/live-sessions';

const liveSessionService = {
  create: (participantName) =>
    apiClient.post(BASE, { participantName }).then((r) => r.data),

  get: (sessionId) =>
    apiClient.get(`${BASE}/${sessionId}`).then((r) => r.data),

  join: (sessionId, participantName) =>
    apiClient
      .post(`${BASE}/${sessionId}/join`, { participantName })
      .then((r) => r.data),

  end: (sessionId) =>
    apiClient.delete(`${BASE}/${sessionId}`).then((r) => r.data),
};

export default liveSessionService;
