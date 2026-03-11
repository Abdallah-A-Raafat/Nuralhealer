/**
 * API Testing Utilities
 * Use these functions to test backend endpoints during integration
 */

// Relative path - Vite proxy routes to correct backend based on VITE_BACKEND_MODE
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Test any endpoint with detailed logging
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|null} data - Request body data
 * @param {object} headers - Additional headers
 * @returns {Promise<object>} - Test result
 */
export const testEndpoint = async (endpoint, method = 'GET', data = null, headers = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  console.group(`🔍 Testing: ${method} ${endpoint}`);
  console.log('Full URL:', url);
  console.log('Request Data:', data);
  console.log('Headers:', headers);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const startTime = performance.now();
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    
    console.log('✅ Status:', response.status, response.statusText);
    console.log('⏱️ Duration:', duration, 'ms');
    console.log('📦 Response:', result);
    console.groupEnd();
    
    return {
      success: response.ok,
      status: response.status,
      data: result,
      duration,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.groupEnd();
    
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  }
};

/**
 * Test authentication endpoint
 */
export const testAuth = {
  login: (email, password) => 
    testEndpoint('/auth/login', 'POST', { email, password }),
  
  register: (userData) => 
    testEndpoint('/auth/register', 'POST', userData),
  
  me: (token) => 
    testEndpoint('/auth/me', 'GET', null, { Authorization: `Bearer ${token}` }),
  
  refresh: (refreshToken) => 
    testEndpoint('/auth/refresh', 'POST', { refreshToken }),
  
  logout: (token) => 
    testEndpoint('/auth/logout', 'POST', null, { Authorization: `Bearer ${token}` }),
};

/**
 * Test doctors endpoints
 */
export const testDoctors = {
  list: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/doctors?${queryString}` : '/doctors';
    return testEndpoint(endpoint, 'GET');
  },
  
  getById: (doctorId) => 
    testEndpoint(`/doctors/${doctorId}`, 'GET'),
  
  getSlots: (doctorId, date) => 
    testEndpoint(`/doctors/${doctorId}/slots?date=${date}`, 'GET'),
};

/**
 * Test chat endpoints
 */
export const testChat = {
  start: (token) => 
    testEndpoint('/chat/start', 'POST', {}, { Authorization: `Bearer ${token}` }),
  
  sendMessage: (token, sessionId, message) => 
    testEndpoint('/chat/message', 'POST', {
      sessionId,
      message,
      messageType: 'text',
      timestamp: new Date().toISOString(),
    }, { Authorization: `Bearer ${token}` }),
  
  endSession: (token, sessionId) => 
    testEndpoint(`/chat/end/${sessionId}`, 'POST', {}, { Authorization: `Bearer ${token}` }),
  
  getSessions: (token, page = 1) => 
    testEndpoint(`/chat/sessions?page=${page}`, 'GET', null, { Authorization: `Bearer ${token}` }),
  
  getSessionDetail: (token, sessionId) => 
    testEndpoint(`/chat/sessions/${sessionId}`, 'GET', null, { Authorization: `Bearer ${token}` }),
};

/**
 * Test booking endpoints
 */
export const testBooking = {
  create: (token, bookingData) => 
    testEndpoint('/booking/create', 'POST', bookingData, { Authorization: `Bearer ${token}` }),
  
  getUserBookings: (token) => 
    testEndpoint('/booking/user', 'GET', null, { Authorization: `Bearer ${token}` }),
  
  getDoctorBookings: (token) => 
    testEndpoint('/booking/doctor', 'GET', null, { Authorization: `Bearer ${token}` }),
  
  update: (token, bookingId, updateData) => 
    testEndpoint(`/booking/${bookingId}`, 'PUT', updateData, { Authorization: `Bearer ${token}` }),
  
  cancel: (token, bookingId) => 
    testEndpoint(`/booking/${bookingId}`, 'DELETE', null, { Authorization: `Bearer ${token}` }),
};

/**
 * Run a complete test suite
 */
export const runTestSuite = async () => {
  console.log('🚀 Starting API Test Suite...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };
  
  // Test 1: Health check (if available)
  try {
    const healthCheck = await testEndpoint('/health', 'GET');
    results.tests.push({
      name: 'Health Check',
      passed: healthCheck.success,
    });
    healthCheck.success ? results.passed++ : results.failed++;
  } catch (error) {
    results.tests.push({
      name: 'Health Check',
      passed: false,
      error: error.message,
    });
    results.failed++;
  }
  
  // Test 2: Login with test credentials
  try {
    const login = await testAuth.login('patient@test.com', 'Patient123');
    results.tests.push({
      name: 'Patient Login',
      passed: login.success,
    });
    login.success ? results.passed++ : results.failed++;
    
    // If login successful, test authenticated endpoint
    if (login.success && login.data.token) {
      const me = await testAuth.me(login.data.token);
      results.tests.push({
        name: 'Get Current User',
        passed: me.success,
      });
      me.success ? results.passed++ : results.failed++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Patient Login',
      passed: false,
      error: error.message,
    });
    results.failed++;
  }
  
  // Test 3: Get doctors list
  try {
    const doctors = await testDoctors.list();
    results.tests.push({
      name: 'Get Doctors List',
      passed: doctors.success,
    });
    doctors.success ? results.passed++ : results.failed++;
  } catch (error) {
    results.tests.push({
      name: 'Get Doctors List',
      passed: false,
      error: error.message,
    });
    results.failed++;
  }
  
  console.log('\n📊 Test Suite Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.tests.length}`);
  console.table(results.tests);
  
  return results;
};

/**
 * Quick connection test
 */
export const testConnection = async () => {
  console.log('🔌 Testing backend connection...');
  console.log('Base URL:', BASE_URL);
  
  try {
    const response = await fetch(BASE_URL.replace('/api', '/health') || BASE_URL);
    console.log('✅ Backend is reachable!');
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Cannot reach backend!');
    console.error('Error:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('  1. Backend server is not running');
    console.log('  2. Wrong URL in .env.development');
    console.log('  3. CORS not configured');
    console.log('  4. Network/firewall blocking connection');
    return false;
  }
};

// Export for use in browser console during development
if (typeof window !== 'undefined') {
  window.apiTest = {
    testEndpoint,
    testAuth,
    testDoctors,
    testChat,
    testBooking,
    runTestSuite,
    testConnection,
  };
  
  console.log('🔧 API Testing utilities available!');
  console.log('Run: window.apiTest.testConnection()');
  console.log('Run: window.apiTest.runTestSuite()');
}
