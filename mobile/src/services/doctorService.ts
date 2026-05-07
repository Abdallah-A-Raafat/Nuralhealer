/**
 * Doctor Service
 * Handles doctor-related API calls
 */

import apiClient from './apiClient';

export interface Doctor {
  id: string;
  userId?: string;
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
  mapDoctor: (doctor: any): Doctor => {
    const [firstName = '', ...restName] = (doctor.fullName || '').replace(/^Dr\.\s*/i, '').trim().split(' ');
    const lastName = restName.join(' ');

    return {
      id: doctor.id,
      userId: doctor.userId,
      firstName: doctor.firstName || firstName,
      lastName: doctor.lastName || lastName,
      email: doctor.email || '',
      specialization: doctor.specialization,
      qualification: doctor.title,
      experience: doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : undefined,
      bio: doctor.bio,
      rating: doctor.rating,
      reviews: doctor.totalReviews,
      price: doctor.consultationFee ? String(doctor.consultationFee) : undefined,
      availability: doctor.availabilityStatus,
      profileImage: doctor.profilePictureThumbnailUrl,
    };
  },

  // Get all available doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get('/doctors/lobby', {
      params: {
        page: 0,
        size: 50,
        sortBy: 'rating',
        sortDirection: 'desc',
      },
    });
    const content = response.data?.content || [];
    return content.map((doctor: any) => doctorService.mapDoctor(doctor));
  },

  // Get doctor by ID
  getDoctor: async (doctorId: string): Promise<Doctor> => {
    const response = await apiClient.get(`/doctors/${doctorId}/profile`);
    return doctorService.mapDoctor(response.data);
  },

  // Search doctors by specialization
  searchDoctors: async (query: string): Promise<Doctor[]> => {
    const response = await apiClient.get('/doctors/search', {
      params: { q: query, page: 0, size: 50 }
    });
    const content = response.data?.content || [];
    return content.map((doctor: any) => doctorService.mapDoctor(doctor));
  },

  // Book a session with a doctor
  bookSession: async (booking: BookingRequest) => {
    void booking;
    throw new Error('Booking endpoints are not available in backend yet.');
  },

  // Get my bookings (patient)
  getMyBookings: async () => {
    throw new Error('Booking endpoints are not available in backend yet.');
  },

  // Get doctor's appointments (doctor)
  getDoctorAppointments: async () => {
    throw new Error('Booking endpoints are not available in backend yet.');
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string) => {
    void bookingId;
    void reason;
    throw new Error('Booking endpoints are not available in backend yet.');
  },
};

export default doctorService;
