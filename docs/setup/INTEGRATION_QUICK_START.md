# 🚀 Backend Integration Quick Start Guide

This guide helps you integrate the frontend with the backend API smoothly.

## 📁 Files Created for Integration

1. **Environment Files** (`.env.development`, `.env.production`)

   - Store API URLs and configuration
   - Already configured for local development

2. **API_CONTRACT.md**

   - Detailed specification of expected API format
   - **SHARE THIS WITH YOUR BACKEND DEVELOPER**

3. **BACKEND_INTEGRATION_CHECKLIST.md**

   - Step-by-step checklist for testing each endpoint
   - Track progress as you integrate

4. **src/utils/apiTester.js**

   - Testing utilities to verify backend endpoints
   - Use in browser console during development

5. **src/utils/toast.js**
   - Notification utilities for user feedback
   - Already integrated in App.jsx

## 🎯 Current Status

✅ **Frontend is Ready!**

- Mock data mode enabled (can work without backend)
- All UI components built
- Protected routes configured
- Form validation ready
- Toast notifications installed

⏳ **Waiting for Backend**

- Auth endpoints needed first
- Then doctors, chat, booking modules

## 🔧 How to Switch from Mock to Real API

### Step 1: When Backend is Ready

Update `.env.development` with real backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api  # or your backend URL
```

### Step 2: Test Backend Connection

Open browser console and run:

```javascript
window.apiTest.testConnection()
```

### Step 3: Test Specific Endpoints

```javascript
// Test login
window.apiTest.testAuth.login('patient@test.com', 'Patient123')

// Test doctors list
window.apiTest.testDoctors.list()

// Run full test suite
window.apiTest.runTestSuite()
```

### Step 4: Disable Mock Mode

In `src/services/authService.js`, change:

```javascript
const USE_MOCK_DATA = false // Change from true to false
```

### Step 5: Restart Dev Server

```bash
npm run dev
```

## 📋 Integration Phases

### Phase 1: Authentication (Week 1)

**Backend needs to provide:**

- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/me`

**Your tasks:**

1. Test endpoints with apiTester
2. Set `USE_MOCK_DATA = false` in authService.js
3. Test login/register in app
4. Verify protected routes work

### Phase 2: Doctors Module (Week 2)

**Backend needs to provide:**

- GET `/api/doctors`
- GET `/api/doctors/:id`

**Your tasks:**

1. Update bookingService.js if needed
2. Test doctors list page
3. Verify data displays correctly

### Phase 3: Chat Module (Week 3)

**Backend needs to provide:**

- POST `/api/chat/start`
- POST `/api/chat/message`
- GET `/api/chat/sessions`

**Your tasks:**

1. Update chatService.js
2. Test chat functionality
3. Verify AI responses work

### Phase 4: Booking Module (Week 4)

**Backend needs to provide:**

- POST `/api/booking/create`
- GET `/api/booking/user`
- DELETE `/api/booking/:id`

**Your tasks:**

1. Update bookingService.js
2. Test booking flow
3. Verify appointments display

## 🐛 Troubleshooting

### Can't Connect to Backend

```javascript
// Check connection
window.apiTest.testConnection()

// Check environment variable
console.log(import.meta.env.VITE_API_BASE_URL)
```

**Solutions:**

1. Verify backend server is running
2. Check URL in `.env.development`
3. Verify CORS is enabled on backend
4. Check browser console for errors

### CORS Errors

Backend must allow your frontend origin:

- Development: `http://localhost:5173`
- Production: `https://yourdomain.com`

Tell backend dev to add these headers:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 401 Errors (Unauthorized)

- Token might be expired
- Token might not be sent correctly
- Check Authorization header format: `Bearer <token>`

### Data Format Mismatch

- Check API_CONTRACT.md
- Compare backend response with expected format
- Update service files if needed

## 📞 Communication with Backend Developer

### What to Share:

1. **API_CONTRACT.md** - So they know what format you expect
2. **BACKEND_REQUIREMENTS.md** - Full specification of all endpoints
3. **This Quick Start** - So they understand integration process

### What to Ask:

1. "When will auth endpoints be ready?"
2. "What's the dev environment URL?"
3. "Is CORS configured for localhost:5173?"
4. "What are the test credentials?"
5. "Do you have Swagger/Postman documentation?"

### Regular Check-ins:

- Daily status updates during integration
- Report any format mismatches immediately
- Test each endpoint as soon as it's ready

## 🧪 Testing Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📚 Useful Console Commands

```javascript
// Test utilities available globally
window.apiTest

// Test backend connection
window.apiTest.testConnection()

// Test auth endpoints
window.apiTest.testAuth.login('email', 'password')
window.apiTest.testAuth.register({ ...userData })

// Test doctors
window.apiTest.testDoctors.list()
window.apiTest.testDoctors.getById('doctor-id')

// Run full test suite
window.apiTest.runTestSuite()

// Check environment
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('Environment:', import.meta.env.MODE)
```

## 🎓 Learning Resources

- **React Query** (recommended for API state): https://tanstack.com/query/latest
- **Axios Documentation**: https://axios-http.com/docs/intro
- **JWT Basics**: https://jwt.io/introduction
- **CORS Explained**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

## ✅ Pre-Deployment Checklist

Before going to production:

- [ ] All endpoints tested and working
- [ ] Mock data disabled (`USE_MOCK_DATA = false`)
- [ ] Environment variables set for production
- [ ] Error handling tested
- [ ] Loading states working
- [ ] Token refresh mechanism working
- [ ] 401 errors trigger logout
- [ ] All forms validated
- [ ] Toast notifications working
- [ ] No console errors
- [ ] Performance optimized
- [ ] Security reviewed

## 🆘 Need Help?

1. Check browser console for errors
2. Use `window.apiTest` to debug API calls
3. Review API_CONTRACT.md for expected formats
4. Check BACKEND_INTEGRATION_CHECKLIST.md for progress
5. Review error messages in toast notifications

---

**Last Updated**: December 23, 2025  
**Status**: Ready for Backend Integration 🚀
