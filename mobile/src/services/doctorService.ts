/**
 * Doctor Service
 * Handles doctor-related API calls
 */

import apiClient from './apiClient';

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  availability?: string;
  profileImage?: string;
}

export interface BookingRequest {
  doctorId: string;
  date: string;
  time: string;
  sessionType: 'online' | 'in-person';
  notes?: string;
}

const doctorService = {
  // Get all available doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get('/doctors');
    return response.data;
  },

  // Get doctor by ID
  getDoctor: async (doctorId: string): Promise<Doctor> => {
    const response = await apiClient.get(`/doctors/${doctorId}`);
    return response.data;
  },

  // Search doctors by specialization
  searchDoctors: async (query: string): Promise<Doctor[]> => {
    const response = await apiClient.get('/doctors/search', {
      params: { query }
    });
    return response.data;
  },

  // Book a session with a doctor
  bookSession: async (booking: BookingRequest) => {
    const response = await apiClient.post('/bookings', booking);
    return response.data;
  },

  // Get my bookings (patient)
  getMyBookings: async () => {
    const response = await apiClient.get('/bookings/my-bookings');
    return response.data;
  },

  // Get doctor's appointments (doctor)
  getDoctorAppointments: async () => {
    const response = await apiClient.get('/bookings/doctor-appointments');
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string) => {
    const response = await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },
};

export default doctorService;
