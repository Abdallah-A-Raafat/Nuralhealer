import apiClient from './apiClient';

export const bookingService = {
  getDoctors: async () => {
    const response = await apiClient.get('/doctors');
    return response.data;
  },

  getDoctorById: async (doctorId) => {
    const response = await apiClient.get(`/doctors/${doctorId}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await apiClient.post('/booking/create', bookingData);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await apiClient.get('/booking/user');
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await apiClient.delete(`/booking/${bookingId}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await apiClient.get(`/doctors/${doctorId}/slots`, {
      params: { date }
    });
    return response.data;
  },
};
