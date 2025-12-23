# Backend Integration Checklist

**Project**: NeuralHealer  
**Start Date**: December 23, 2025  
**Status**: Pre-Integration Phase

---

## 📋 Pre-Integration Requirements

### Backend Team Deliverables

- [ ] Base URL provided (dev environment)
- [ ] API documentation shared (Swagger/Postman)
- [ ] CORS configured for frontend domain
- [ ] Test credentials provided
- [ ] Agreed on API contract format
- [ ] Agreed on error response format
- [ ] Agreed on date/time format (ISO 8601)

### Frontend Preparation (Current)

- [x] Environment files created
- [x] API client configured
- [x] Service layer architecture ready
- [x] State management setup (Zustand)
- [x] Protected routes implemented
- [x] Form validation ready
- [ ] API testing utilities created
- [ ] Toast notifications installed
- [ ] Mock flag added to services

---

## 🚀 Phase 1: Authentication Module (Week 1)

### Endpoints to Test

- [ ] **POST /api/auth/register**

  - [ ] Test with patient account
  - [ ] Test with doctor account
  - [ ] Verify response format matches contract
  - [ ] Test validation errors (duplicate email, weak password)
  - [ ] Confirm user object structure
  - [ ] Verify JWT token received

- [ ] **POST /api/auth/login**

  - [ ] Test with patient credentials
  - [ ] Test with doctor credentials
  - [ ] Test invalid credentials error
  - [ ] Verify token format
  - [ ] Verify refresh token received
  - [ ] Check accountType in response

- [ ] **GET /api/auth/me**

  - [ ] Test with valid token
  - [ ] Test with expired token (401 expected)
  - [ ] Test with invalid token
  - [ ] Verify user data completeness

- [ ] **POST /api/auth/refresh**

  - [ ] Test token refresh flow
  - [ ] Verify new access token received
  - [ ] Test with expired refresh token

- [ ] **POST /api/auth/logout**

  - [ ] Test logout functionality
  - [ ] Verify token blacklisting works

- [ ] **PUT /api/auth/me**
  - [ ] Test profile update
  - [ ] Test with invalid data
  - [ ] Verify updated data returned

### Frontend Integration Tasks

- [ ] Update `authService.js` - remove mock data
- [ ] Test login flow in app
- [ ] Test registration flow in app
- [ ] Test protected routes redirect on 401
- [ ] Test token refresh in interceptor
- [ ] Update error messages display
- [ ] Test logout functionality
- [ ] Test "remember me" functionality

### Testing Checklist

- [ ] Login as patient → redirects to /chat
- [ ] Login as doctor → redirects to /doctor-dashboard
- [ ] Invalid credentials show error message
- [ ] Token stored in localStorage/sessionStorage
- [ ] Refresh page maintains auth state
- [ ] Logout clears auth state
- [ ] 401 errors trigger logout

---

## 🏥 Phase 2: Doctors Module (Week 2)

### Endpoints to Test

- [ ] **GET /api/doctors**

  - [ ] Test without filters
  - [ ] Test with specialization filter
  - [ ] Test with pagination (?page=1&limit=10)
  - [ ] Test sorting (by rating, price, experience)
  - [ ] Verify doctor data structure
  - [ ] Check profile images load correctly

- [ ] **GET /api/doctors/:id**

  - [ ] Test with valid doctor ID
  - [ ] Test with invalid ID (404 expected)
  - [ ] Verify all fields present (reviews, availability, etc.)
  - [ ] Check languages array format

- [ ] **GET /api/doctors/:doctorId/slots**
  - [ ] Test for specific date
  - [ ] Test for multiple dates
  - [ ] Verify available/unavailable slots marked correctly
  - [ ] Check time format

### Frontend Integration Tasks

- [ ] Update `bookingService.js`
- [ ] Display doctors list on /booking page
- [ ] Implement filters (specialization, rating)
- [ ] Implement pagination
- [ ] Test doctor detail modal
- [ ] Load profile images with fallback
- [ ] Display ratings and reviews

### Testing Checklist

- [ ] Doctors list loads correctly
- [ ] Filters work as expected
- [ ] Pagination navigates properly
- [ ] Click on doctor shows details
- [ ] Loading states display correctly
- [ ] Error states handle gracefully

---

## 💬 Phase 3: Chat/Therapy Module (Week 3)

### Endpoints to Test

- [ ] **POST /api/chat/start**

  - [ ] Test session creation
  - [ ] Verify sessionId received
  - [ ] Check welcome message format
  - [ ] Test multiple sessions don't conflict

- [ ] **POST /api/chat/message**

  - [ ] Test text message send
  - [ ] Test with audio file (if voice enabled)
  - [ ] Verify AI response format
  - [ ] Check emotion detection works
  - [ ] Test message timestamps
  - [ ] Verify suggestions array

- [ ] **POST /api/chat/end/:sessionId**

  - [ ] Test session end
  - [ ] Verify summary generated
  - [ ] Check duration calculation
  - [ ] Test emotion summary format

- [ ] **GET /api/chat/sessions**

  - [ ] Test session history retrieval
  - [ ] Test pagination
  - [ ] Verify session data completeness
  - [ ] Check sorting (most recent first)

- [ ] **GET /api/chat/sessions/:sessionId**

  - [ ] Test detailed session retrieval
  - [ ] Verify all messages included
  - [ ] Check emotion analysis data
  - [ ] Test AI summary

- [ ] **GET /api/chat/sessions/:sessionId/suggestions**
  - [ ] Test suggestions retrieval
  - [ ] Verify suggestion format
  - [ ] Check next steps array

### Frontend Integration Tasks

- [ ] Update `chatService.js`
- [ ] Implement session start on Chat page
- [ ] Connect message sending
- [ ] Display AI responses
- [ ] Show emotion indicators
- [ ] Implement session end flow
- [ ] Display session history in Profile
- [ ] Add loading states for AI responses
- [ ] Handle WebSocket if implemented
- [ ] Test voice-to-text (if applicable)

### Testing Checklist

- [ ] Can start text session
- [ ] Can send messages
- [ ] AI responses appear correctly
- [ ] Emotion detection displays
- [ ] Can end session
- [ ] Session appears in history
- [ ] Can view past session details
- [ ] Loading indicators work
- [ ] Error handling for AI failures

---

## 📅 Phase 4: Booking Module (Week 4)

### Endpoints to Test

- [ ] **POST /api/booking/create**

  - [ ] Test appointment creation
  - [ ] Verify booking confirmation
  - [ ] Check meeting link generation (online appointments)
  - [ ] Test slot conflict handling
  - [ ] Verify email notification sent

- [ ] **GET /api/booking/user**

  - [ ] Test patient bookings retrieval
  - [ ] Filter by status (upcoming/past/cancelled)
  - [ ] Verify booking data completeness
  - [ ] Check sorting

- [ ] **GET /api/booking/doctor** (Doctor only)

  - [ ] Test doctor appointments retrieval
  - [ ] Filter by date
  - [ ] Filter by status
  - [ ] Verify patient data included

- [ ] **PUT /api/booking/:bookingId**

  - [ ] Test reschedule functionality
  - [ ] Test status update
  - [ ] Verify notifications sent
  - [ ] Check validation

- [ ] **DELETE /api/booking/:bookingId**

  - [ ] Test cancellation
  - [ ] Verify cancellation confirmation
  - [ ] Check refund policy applied (if any)
  - [ ] Test notification sent

- [ ] **GET /api/doctors/:doctorId/slots**
  - [ ] Integrated with booking flow
  - [ ] Real-time availability check

### Frontend Integration Tasks

- [ ] Update `bookingService.js`
- [ ] Implement booking modal in Doctors page
- [ ] Show available slots calendar
- [ ] Handle booking confirmation
- [ ] Display user bookings in Profile
- [ ] Implement cancel booking
- [ ] Display meeting links for online appointments
- [ ] Add booking reminders

### Testing Checklist

- [ ] Can select doctor
- [ ] Can view available slots
- [ ] Can book appointment
- [ ] Booking confirmation shows correctly
- [ ] Bookings appear in profile
- [ ] Can cancel booking
- [ ] Meeting link accessible (online appointments)
- [ ] Error handling for booking conflicts

---

## 👨‍⚕️ Phase 5: Doctor Dashboard (Week 5)

### Endpoints to Test

- [ ] **GET /api/doctor/stats**

  - [ ] Test statistics retrieval
  - [ ] Verify all metrics present
  - [ ] Check calculation accuracy

- [ ] **GET /api/doctor/patients**

  - [ ] Test patient list retrieval
  - [ ] Filter by status
  - [ ] Pagination works
  - [ ] Verify patient data

- [ ] **POST /api/doctor/patients**

  - [ ] Test manual patient addition
  - [ ] Verify validation
  - [ ] Check duplicate prevention

- [ ] **GET /api/doctor/patients/:patientId**

  - [ ] Test patient detail retrieval
  - [ ] Verify appointment history
  - [ ] Check session history
  - [ ] View doctor notes

- [ ] **PUT /api/doctor/patients/:patientId/notes**

  - [ ] Test notes update
  - [ ] Verify save confirmation
  - [ ] Check notes appear in patient detail

- [ ] **GET /api/doctor/schedule**

  - [ ] Test schedule retrieval
  - [ ] Verify weekly view
  - [ ] Check booked slots marked

- [ ] **PUT /api/doctor/schedule**
  - [ ] Test schedule update
  - [ ] Verify changes saved
  - [ ] Check conflicts handled

### Frontend Integration Tasks

- [ ] Update doctor service (create if needed)
- [ ] Display stats on DoctorDashboard
- [ ] Implement patient list in DoctorPatients
- [ ] Add patient detail view
- [ ] Implement add patient form
- [ ] Display appointments in DoctorAppointments
- [ ] Add notes editing functionality
- [ ] Implement schedule management

### Testing Checklist

- [ ] Doctor dashboard loads stats correctly
- [ ] Patient list displays properly
- [ ] Can add new patient
- [ ] Can view patient details
- [ ] Can update patient notes
- [ ] Appointments list shows correctly
- [ ] Can manage schedule
- [ ] All doctor features work for doctor account only

---

## 👤 Phase 6: Profile & Settings (Week 6)

### Endpoints to Test

- [ ] **GET /api/profile/:userId**

  - [ ] Test public profile view
  - [ ] Verify data privacy

- [ ] **PUT /api/profile/settings**

  - [ ] Test settings update
  - [ ] Language preference saved
  - [ ] Notification preferences work

- [ ] **GET /api/profile/sessions/history**
  - [ ] Test complete history retrieval
  - [ ] Verify statistics calculation
  - [ ] Check pagination

### Frontend Integration Tasks

- [ ] Display profile information
- [ ] Implement edit profile
- [ ] Add settings management
- [ ] Show complete session history
- [ ] Display progress statistics
- [ ] Add profile image upload

### Testing Checklist

- [ ] Profile page loads correctly
- [ ] Can edit profile information
- [ ] Settings save properly
- [ ] Session history displays
- [ ] Statistics are accurate
- [ ] Profile image uploads work

---

## 🔔 Phase 7: Notifications (Optional - Week 7)

### Endpoints to Test

- [ ] **GET /api/notifications**
- [ ] **PUT /api/notifications/:id/read**

### Frontend Integration Tasks

- [ ] Add notification bell icon
- [ ] Display notification dropdown
- [ ] Mark as read functionality
- [ ] Real-time notifications (WebSocket)

---

## 🐛 Post-Integration Testing

### End-to-End Flows

- [ ] Complete patient journey: Register → Login → Chat → Book Appointment → View Profile
- [ ] Complete doctor journey: Register → Login → Dashboard → View Patients → Manage Appointments
- [ ] Cross-device testing (mobile, tablet, desktop)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Network failure handling
- [ ] Slow connection simulation

### Performance Testing

- [ ] Page load times < 3 seconds
- [ ] API response times < 2 seconds
- [ ] Image optimization
- [ ] Bundle size < 500KB (gzipped)

### Security Testing

- [ ] XSS prevention verified
- [ ] CSRF protection working
- [ ] SQL injection not possible
- [ ] Token security validated
- [ ] Data encryption confirmed

---

## 📝 Notes & Issues Log

### Known Issues

_(Track issues found during integration)_

**Example:**

- Date: 2025-12-23
- Issue: Doctor list not filtering by specialization
- Status: Reported to backend
- Resolution: Pending

### Backend Communication Log

_(Track important communications)_

**Example:**

- Date: 2025-12-23
- Topic: API contract shared
- Decision: Agreed on ISO 8601 date format

---

## ✅ Sign-Off

### Phase Completion

- [ ] Phase 1 - Authentication: **\_** (Date)
- [ ] Phase 2 - Doctors Module: **\_** (Date)
- [ ] Phase 3 - Chat Module: **\_** (Date)
- [ ] Phase 4 - Booking Module: **\_** (Date)
- [ ] Phase 5 - Doctor Dashboard: **\_** (Date)
- [ ] Phase 6 - Profile & Settings: **\_** (Date)
- [ ] Phase 7 - Notifications: **\_** (Date)

### Final Integration Complete

- [ ] All endpoints tested
- [ ] All features working
- [ ] Performance optimized
- [ ] Security validated
- [ ] Ready for production

**Completed By**: ******\_******  
**Date**: ******\_******

---

**Last Updated**: December 23, 2025
