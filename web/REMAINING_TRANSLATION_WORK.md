# Remaining Pages Requiring Translation

## Overview

This document identifies pages and components that require translation work beyond the completed 5 public pages.

---

## Completed Pages ✅

1. ✅ `src/pages/Home.jsx` - Public landing page
2. ✅ `src/pages/About.jsx` - Public about page
3. ✅ `src/pages/Contact.jsx` - Public contact page
4. ✅ `src/pages/Login.jsx` - Authentication page
5. ✅ `src/pages/Register.jsx` - Authentication page

---

## Pages Requiring Translation 📋

### Patient Pages (3 pages)

#### 1. **src/pages/patient/Chat.jsx**

- **Purpose**: Patient AI therapy chat interface
- **Content to Translate**:
  - Chat headers and titles
  - Input placeholder: "Type your message..."
  - Send button text
  - Chat interface labels
  - Empty state messages
  - Error messages
  - Loading states
- **Recommended Translation Keys**:
  ```javascript
  patient: {
    chat: {
      title: 'AI Therapy Session',
      placeholder: 'Type your message here...',
      send: 'Send',
      startNewSession: 'Start New Session',
      endSession: 'End Session',
      sessionActive: 'Session in progress',
      sessionEnded: 'Session ended',
      typingIndicator: 'Therapist is typing...',
      noMessages: 'No messages yet. Start by saying hello!',
    }
  }
  ```

#### 2. **src/pages/patient/Doctors.jsx**

- **Purpose**: Browse and connect with doctors
- **Content to Translate**:

  - Page title and description
  - Doctor cards (name, specialty, rating)
  - Filter options (specialty, availability)
  - Book session buttons
  - View profile buttons
  - Search placeholder
  - Sorting options

- **Recommended Translation Keys**:
  ```javascript
  patient: {
    doctors: {
      title: 'Find a Doctor',
      description: 'Connect with licensed psychologists',
      search: 'Search doctors...',
      filter: 'Filter',
      specialty: 'Specialty',
      availability: 'Availability',
      rating: 'Rating',
      bookNow: 'Book Session',
      viewProfile: 'View Profile',
      noResults: 'No doctors found',
      loadingDoctors: 'Loading doctors...',
    }
  }
  ```

#### 3. **src/pages/patient/Profile.jsx**

- **Purpose**: Patient profile and settings
- **Content to Translate**:

  - Profile sections (personal info, preferences)
  - Form labels
  - Edit buttons
  - Settings options
  - Health data display
  - Session history
  - Preference toggles

- **Recommended Translation Keys**:
  ```javascript
  patient: {
    profile: {
      title: 'My Profile',
      personalInfo: 'Personal Information',
      preferences: 'Preferences',
      healthData: 'Health Data',
      sessionHistory: 'Session History',
      editProfile: 'Edit Profile',
      editPreferences: 'Edit Preferences',
      notificationSettings: 'Notifications',
      privacySettings: 'Privacy Settings',
      deleteAccount: 'Delete Account',
      accountDeleted: 'Your account has been deleted',
    }
  }
  ```

---

### Doctor Pages (3 pages)

#### 1. **src/pages/doctor/DoctorDashboard.jsx**

- **Purpose**: Doctor's main dashboard
- **Content to Translate**:

  - Dashboard widgets
  - Statistics cards
  - Appointment schedule
  - Patient list
  - Quick actions
  - Notifications
  - Charts and graphs labels

- **Recommended Translation Keys**:
  ```javascript
  doctor: {
    dashboard: {
      title: 'Dashboard',
      upcomingAppointments: 'Upcoming Appointments',
      activePatients: 'Active Patients',
      totalSessions: 'Total Sessions',
      rating: 'Your Rating',
      scheduleAppointment: 'Schedule Appointment',
      viewPatients: 'View All Patients',
      viewAppointments: 'View All Appointments',
      noAppointments: 'No upcoming appointments',
    }
  }
  ```

#### 2. **src/pages/doctor/DoctorAppointments.jsx**

- **Purpose**: Manage doctor's appointments
- **Content to Translate**:

  - Appointment list headers
  - Status indicators (pending, confirmed, completed)
  - Filter options
  - Sort options
  - Action buttons (confirm, cancel, reschedule)
  - Calendar view
  - Appointment details

- **Recommended Translation Keys**:
  ```javascript
  doctor: {
    appointments: {
      title: 'Appointments',
      upcoming: 'Upcoming',
      past: 'Past',
      cancelled: 'Cancelled',
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      confirm: 'Confirm',
      cancel: 'Cancel',
      reschedule: 'Reschedule',
      patientName: 'Patient Name',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      notes: 'Notes',
    }
  }
  ```

#### 3. **src/pages/doctor/DoctorPatients.jsx**

- **Purpose**: View and manage doctor's patients
- **Content to Translate**:

  - Patient list headers
  - Patient search/filter
  - Patient cards (name, status, last visit)
  - View details button
  - Start consultation button
  - Patient status indicators
  - Notes section

- **Recommended Translation Keys**:
  ```javascript
  doctor: {
    patients: {
      title: 'My Patients',
      search: 'Search patients...',
      filter: 'Filter',
      status: 'Status',
      lastVisit: 'Last Visit',
      nextAppointment: 'Next Appointment',
      active: 'Active',
      inactive: 'Inactive',
      viewDetails: 'View Details',
      startConsultation: 'Start Consultation',
      addNotes: 'Add Notes',
      noPatients: 'No patients found',
    }
  }
  ```

---

## Common Dashboard Components

### Components Used in Multiple Pages

- Patient/Doctor profile cards
- Appointment scheduling widget
- Chart/graph components
- Status badges
- Filter and sort options
- Modal dialogs
- Form inputs

**Recommended Common Dashboard Keys**:

```javascript
dashboard: {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    noData: 'No data available',
    filter: 'Filter',
    sort: 'Sort',
    search: 'Search',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
  }
}
```

---

## Internal Components Needing Translation

### 1. **Error Messages**

- Network errors
- Validation errors
- Authentication errors
- Authorization errors
- Server errors
- File upload errors

### 2. **Notifications**

- Session reminders
- Appointment confirmations
- Messages from doctors
- System notifications
- Success messages
- Warning messages

### 3. **Modal Dialogs**

- Confirmation dialogs
- Error dialogs
- Information dialogs
- Form dialogs
- Warning dialogs

### 4. **Status Indicators**

- Appointment statuses
- Session statuses
- User online/offline status
- Notification badges
- Loading indicators

### 5. **Empty States**

- No appointments
- No patients
- No messages
- No search results
- No data available

---

## Implementation Plan

### Phase 1: Dashboard Infrastructure

1. Create `doctor` section in translations.js
2. Create `patient` section in translations.js
3. Add common dashboard keys
4. Set up initial structure

### Phase 2: Patient Pages

1. Translate Chat.jsx
2. Translate Doctors.jsx
3. Translate Profile.jsx
4. Test RTL layout

### Phase 3: Doctor Pages

1. Translate DoctorDashboard.jsx
2. Translate DoctorAppointments.jsx
3. Translate DoctorPatients.jsx
4. Test RTL layout

### Phase 4: Error & System Messages

1. Translate error messages
2. Translate notifications
3. Translate status indicators
4. Translate empty states

### Phase 5: Quality Assurance

1. Full regression testing
2. RTL layout verification
3. Language switching testing
4. Performance testing

---

## Translation Key Recommendations

### Total Estimated Keys Needed

- Patient pages: ~30-40 keys
- Doctor pages: ~40-50 keys
- Dashboard common: ~20 keys
- Error/System messages: ~30-40 keys
- **Estimated Total**: 120-150 additional keys

### Estimated Work

- **Timeline**: 2-3 days for experienced translator
- **Files to Create/Modify**: 6 page files
- **Documentation**: 3-4 guides
- **Testing**: 1-2 days

---

## Quick Reference for Future Updates

When translating remaining pages:

1. **Import useLanguage hook**:

   ```javascript
   import { useLanguage } from '../hooks/useLanguage.jsx'
   ```

2. **Get translations in component**:

   ```javascript
   const { t } = useLanguage()
   ```

3. **Use in JSX**:

   ```javascript
   <h1>{t.section.key}</h1>
   ```

4. **Add keys to translations.js**:

   ```javascript
   patient: {
     chat: {
       title: 'English text',
       // ... more keys
     }
   },
   // Arabic counterpart
   ar: {
     patient: {
       chat: {
         title: 'النص العربي',
         // ... more keys
       }
     }
   }
   ```

5. **Test**:
   - Toggle language
   - Verify translations appear
   - Check RTL layout
   - No console errors

---

## Additional Considerations

### Performance

- Consider lazy loading large translation objects
- Use React.memo for components with heavy i18n usage
- Monitor bundle size impact

### Maintenance

- Keep similar keys grouped together
- Use consistent naming conventions
- Document key purposes with comments
- Regular audit of unused keys

### Accessibility

- Ensure translations preserve semantic meaning
- Consider RTL-specific accessibility
- Test with screen readers
- Verify color contrast in RTL mode

### Quality Assurance

- Professional Arabic translator review
- Native speaker testing
- RTL edge case testing
- Performance benchmarking

---

## Current Project Status

| Category        | Status           |
| --------------- | ---------------- |
| Public Pages    | ✅ 100% Complete |
| Patient Pages   | ⏳ Pending (0%)  |
| Doctor Pages    | ⏳ Pending (0%)  |
| Error Messages  | ⏳ Pending (0%)  |
| System Messages | ⏳ Pending (0%)  |
| Overall         | ⏳ 50% Complete  |

---

**Last Updated**: 2024
**Next Priority**: Patient dashboard pages
**Estimated Completion**: After public pages QA passed
