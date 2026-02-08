# Changelog - NeuralHealer Mobile App

All notable changes to the NeuralHealer mobile application will be documented in this file.

## [1.0.0] - 2026-02-08

### 🎉 Initial Release - Feature Parity with Web Application

#### Added - Patient Experience

##### Enhanced Home Screen
- **Real-time Statistics Dashboard**
  - Total sessions count from backend
  - Total minutes tracked
  - Voice sessions count
  - Text sessions count
- **Modern Quick Action Cards**
  - AI Chat with description and icon
  - Mental Health Assessments access
  - Find Doctor functionality
  - Profile management
- **Daily Wellness Tips**
  - Rotating mental health tips
  - Encouraging messages for users

##### Comprehensive Profile Screen
- **Tab-Based Navigation**
  - Overview tab with user info and stats
  - Sessions tab showing chat history
  - Engagements tab for doctor relationships
- **User Profile Card**
  - Avatar with initials
  - Name, email, and role display
  - Edit profile button
- **Statistics Grid**
  - 4 stat cards with color-coded icons
  - Real-time data from backend
- **Quick Actions Menu**
  - Edit Profile
  - Settings
  - Logout functionality
- **Session History**
  - Voice/text session indicators
  - Date and duration display
  - Empty state messaging
- **Engagement Management**
  - View pending, active, and ended engagements
  - Verify engagements with token input
  - Reject pending requests
  - Cancel active engagements
  - Status badges with color coding

##### Backend Integration
- Connected to `/users/me` endpoint
- Connected to `/users/stats` endpoint with fallback
- Connected to `/ai-chat/sessions` endpoint with fallback
- Connected to `/engagements/my-engagements` endpoint
- Connected to `/engagements/verify-start` endpoint
- Connected to `/engagements/{id}/cancel` endpoint

#### Added - Doctor Experience

##### Enhanced Doctor Dashboard
- **Real-time Statistics**
  - Total patients count from engagement API
  - Pending requests count
  - Active engagements count
- **Modern Stats Cards**
  - Color-coded icons (primary, warning, success)
  - Loading states with ActivityIndicator
- **Quick Action Cards**
  - My Patients with navigation
  - Schedule management
  - Descriptive text for each action
- **Professional Tips Section**
  - Practice improvement suggestions

##### Comprehensive Patient Management Screen
- **Search Functionality**
  - Search patients by email
  - User validation (patient role check)
  - Search modal with results
- **Engagement Initiation**
  - Send engagement requests to patients
  - Access level selection (Full/Limited/No Access)
  - Token generation and display
- **Token Management**
  - View current tokens
  - Copy to clipboard functionality
  - Token expiry display
  - Refresh token capability
- **Engagement Lists**
  - **Pending Engagements**
    - View token button
    - Delete request option
  - **Active Engagements**
    - View patient profile
    - Cancel engagement
    - Access level display
    - Start date display
- **Status Indicators**
  - Color-coded status badges
  - Pending (yellow), Active (green), Ended (gray), Cancelled (red)
- **Empty State**
  - Helpful messaging
  - Call-to-action button

##### Enhanced Doctor Profile
- **Real Statistics**
  - Total patients from engagement API
  - Active engagements count
  - Pending requests count
- **Profile Card**
  - Avatar with doctor initials
  - Dr. prefix with name
  - Role badge (Psychiatrist)
  - Edit profile button
- **Settings Menu**
  - Edit Profile
  - Settings
  - Notifications
  - Availability
  - Help
  - Privacy

##### Backend Integration
- Connected to `/engagements/my-engagements` endpoint
- Connected to `/engagements/initiate` endpoint
- Connected to `/engagements/{id}/token` endpoint
- Connected to `/engagements/{id}/refresh-token` endpoint
- Connected to `/engagements/{id}` DELETE endpoint
- Connected to `/engagements/{id}/cancel` endpoint
- Connected to `/users/search-by-email` endpoint

#### Internationalization (i18n)

##### English Translations
- Added 24+ patient home translations
- Added 36 profile translations (expanded from 18)
- Added 21 engagement system translations
- Added 60+ doctor-specific translations
- Clear and professional copy

##### Arabic Translations
- Full RTL support maintained
- Added matching Arabic translations for all new features
- Professional Arabic terminology
- Proper Unicode escaping

#### Technical Improvements

##### Services Enhanced
- **userService.ts**
  - `getCurrentUser()` method
  - `getUserStats()` with fallback to default values
  - `getSessionHistory()` with fallback to empty array
  
- **engagementService.ts** (Already existed, now fully integrated)
  - `getMyEngagements()`
  - `initiateEngagement(patientId, accessLevel)`
  - `verifyEngagement(token)`
  - `rejectEngagement(id, reason)`
  - `cancelEngagement(id, reason, accessRule)`
  - `deleteEngagement(id)`
  - `getCurrentToken(id)`
  - `refreshToken(id)`

##### UI Components
- Loading states with ActivityIndicator
- Empty states with helpful messaging
- Error handling with user-friendly alerts
- Modal implementations for complex workflows
- Status badges with semantic colors
- Avatar components with initials
- Card layouts with proper spacing

##### Code Quality
- TypeScript strict mode compliance
- React hooks best practices (useState, useEffect, useCallback)
- Proper dependency arrays in hooks
- ESLint compliance
- No unused variables
- Proper error handling with try-catch

#### SVG Logo Integration
- Replaced PNG logos with SVG
- Configured metro.config.js for SVG transformation
- Added react-native-svg and react-native-svg-transformer
- Created TypeScript declarations for SVG imports
- SVG logos in Login and Register screens

#### Project Structure
```
mobile/
├── src/
│   ├── screens/
│   │   ├── patient/
│   │   │   ├── HomeScreen.tsx (Enhanced)
│   │   │   └── ProfileScreen.tsx (Completely redesigned)
│   │   └── doctor/
│   │       ├── DoctorHomeScreen.tsx (Enhanced)
│   │       ├── PatientsScreen.tsx (Completely rebuilt)
│   │       └── DoctorProfileScreen.tsx (Enhanced)
│   ├── services/
│   │   ├── userService.ts (Enhanced)
│   │   └── engagementService.ts (Fully integrated)
│   └── i18n/
│       └── locales/
│           ├── en.ts (Expanded)
│           └── ar.ts (Expanded)
├── metro.config.js (SVG support)
└── README.md (Updated)
```

### Changed
- Mobile app now has feature parity with web application
- All dummy data replaced with real backend API calls
- Modern card-based UI throughout the app
- Improved user experience with loading and empty states

### Removed
- All hardcoded dummy patient data
- All hardcoded dummy doctor stats
- Splash screen implementation (kept simple for stability)

### Fixed
- Backend integration points
- Authentication flow
- Navigation between screens
- Theme adaptation for all new components
- Translation key references

### Technical Stack
- React Native 0.73.1
- TypeScript
- React Navigation
- Zustand for state management
- react-i18next for internationalization
- react-native-svg for vector graphics
- Android & iOS support

### API Endpoints Used
- `GET /users/me` - Get current user
- `GET /users/stats` - Get user statistics
- `GET /ai-chat/sessions` - Get session history
- `GET /engagements/my-engagements` - Get all engagements
- `POST /engagements/initiate` - Create engagement
- `POST /engagements/verify-start` - Verify engagement with token
- `POST /engagements/{id}/cancel` - Cancel engagement
- `DELETE /engagements/{id}` - Delete pending engagement
- `GET /engagements/{id}/token` - Get current token
- `POST /engagements/{id}/refresh-token` - Refresh token
- `GET /users/search-by-email` - Search users by email

---

## Future Enhancements
- Push notifications for engagement requests
- In-app messaging between doctors and patients
- Appointment scheduling
- Assessment integration
- Voice therapy sessions
- Biometric authentication
- Data export functionality
- Offline mode support

---

**Contributors:**
- Full-stack development and backend integration
- UI/UX design matching web application
- Comprehensive testing on Android platform

**Date:** February 8, 2026
