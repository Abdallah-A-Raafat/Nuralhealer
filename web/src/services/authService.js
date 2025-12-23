import apiClient from './apiClient';

// MOCK MODE CONTROL
// Set to false when backend is ready and you want to use real API
// Set to true to use mock data for development without backend
const USE_MOCK_DATA = true;

// Mock data for development (remove when backend is ready)
const MOCK_USERS = {
  patient: {
    email: 'patient@test.com',
    password: 'Patient123',
    response: {
      user: {
        id: 'patient-user-001',
        firstName: 'Sarah',
        lastName: 'Patient',
        email: 'patient@test.com',
        accountType: 'patient',
        profileImage: null,
      },
      token: 'fake-jwt-token-patient-' + Date.now(),
      refreshToken: 'fake-refresh-token-patient',
      accountType: 'patient',
    },
  },
  doctor: {
    email: 'doctor@test.com',
    password: 'Doctor123',
    response: {
      user: {
        id: 'doctor-user-001',
        firstName: 'John',
        lastName: 'Doctor',
        email: 'doctor@test.com',
        accountType: 'doctor',
        profileImage: null,
      },
      token: 'fake-jwt-token-doctor-' + Date.now(),
      refreshToken: 'fake-refresh-token-doctor',
      accountType: 'doctor',
    },
  },
};

export const authService = {
  login: async (credentials) => {
    // MOCK MODE - Remove when backend is ready
    if (USE_MOCK_DATA) {
      console.log('🔧 [MOCK MODE] Using mock authentication data');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check patient credentials
      if (
        credentials.email === MOCK_USERS.patient.email &&
        credentials.password === MOCK_USERS.patient.password
      ) {
        console.log('✅ [MOCK] Patient login successful');
        return MOCK_USERS.patient.response;
      }
      
      // Check doctor credentials
      if (
        credentials.email === MOCK_USERS.doctor.email &&
        credentials.password === MOCK_USERS.doctor.password
      ) {
        console.log('✅ [MOCK] Doctor login successful');
        return MOCK_USERS.doctor.response;
      }
      
      // Invalid credentials
      throw new Error('Invalid credentials');
    }

    // REAL API MODE - Use when backend is ready
    console.log('🌐 [REAL API] Calling backend login endpoint');
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    // MOCK MODE
    if (USE_MOCK_DATA) {
      console.log('🔧 [MOCK MODE] Using mock registration');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (
        userData.email === MOCK_USERS.patient.email ||
        userData.email === MOCK_USERS.doctor.email
      ) {
        throw new Error('Email already registered');
      }
      
      // Return mock registration success
      const newUser = {
        user: {
          id: 'user-' + Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          accountType: userData.accountType,
          profileImage: null,
        },
        token: 'fake-jwt-token-' + Date.now(),
        refreshToken: 'fake-refresh-token-' + Date.now(),
        accountType: userData.accountType,
      };
      
      console.log('✅ [MOCK] Registration successful');
      return newUser;
    }

    // REAL API MODE
    console.log('🌐 [REAL API] Calling backend register endpoint');
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
