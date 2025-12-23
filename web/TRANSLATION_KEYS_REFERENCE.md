# Translation Keys Reference Guide

## Complete Mapping of Translation Keys by Page

### Home Page (src/pages/Home.jsx)

```
HOME PAGE SECTIONS:
├── Hero Section
│   ├── t.home.welcomeToNeuralHealer (Welcome to NeuralHealer)
│   ├── t.home.subtitle (Full description text)
│   ├── t.common.getStarted (Get Started button)
│   └── t.common.signIn (Sign In button)
├── Features Section
│   ├── t.home.howNeuralHealerHelps (Section heading)
│   ├── Feature 1 (Voice Interaction)
│   │   ├── t.home.voiceInteraction
│   │   └── t.home.voiceInteractionDesc
│   ├── Feature 2 (Emotion Detection)
│   │   ├── t.home.emotionDetection
│   │   └── t.home.emotionDetectionDesc
│   └── Feature 3 (Professional Connection)
│       ├── t.home.professionalConnection
│       └── t.home.professionalConnectionDesc
├── Stats Section
│   ├── t.home.sessionsCompleted (10k+ stat)
│   ├── t.home.userSatisfaction (4.9/5 stat)
│   └── t.home.alwaysOnSupport (24/7 stat)
└── CTA Section
    ├── t.home.readyToStart (Call-to-action heading)
    ├── t.home.takeFirstStep (Call-to-action subtitle)
    └── t.common.createAccount (Button)

TOTAL KEYS: 13 home-specific + 3 common = 16
```

### About Page (src/pages/About.jsx)

```
ABOUT PAGE SECTIONS:
├── Hero Section
│   ├── t.about.aboutNeuralHealer (Page title)
│   └── t.about.empoweringMentalHealth (Tagline)
├── Mission Section
│   ├── t.about.ourMission (Section heading)
│   └── t.about.missionText (Full mission statement)
├── Features Section (What Makes Us Different)
│   ├── Feature 1 (AI-Powered Support)
│   │   ├── t.about.aiPoweredSupport
│   │   └── t.about.aiPoweredSupportDesc
│   ├── Feature 2 (Privacy First)
│   │   ├── t.about.privacyFirst
│   │   └── t.about.privacyFirstDesc
│   └── Feature 3 (Professional Network)
│       ├── t.about.professionalNetwork
│       └── t.about.professionalNetworkDesc
├── Team Section
│   └── t.about.ourTeam (Section heading)
└── CTA Section
    ├── t.home.readyToStart (Heading)
    ├── t.home.takeFirstStep (Subtitle)
    └── t.common.getStarted (Button)

TOTAL KEYS: 11 about-specific + 3 common/home = 14
```

### Contact Page (src/pages/Contact.jsx)

```
CONTACT PAGE SECTIONS:
├── Hero Section
│   ├── t.contact.contactUs (Page title)
│   └── t.contact.hereToHelp (Tagline)
├── Contact Information
│   ├── t.contact.getInTouch (Section heading)
│   ├── t.contact.haveQuestions (Description)
│   ├── t.contact.emailSupport (Email label)
│   ├── t.contact.officeLocation (Location label)
│   └── t.contact.responseTime (Response time text)
└── Contact Form
    ├── t.contact.contactForm (Form heading)
    ├── Form Fields
    │   ├── t.contact.name (Name field)
    │   ├── t.common.email (Email field)
    │   ├── t.contact.subject (Subject field)
    │   └── t.contact.message (Message field)
    ├── t.contact.successMessage (Success confirmation)
    └── t.common.submit (Submit button)

TOTAL KEYS: 11 contact-specific + 2 common = 13
```

### Login Page (src/pages/Login.jsx)

```
LOGIN PAGE SECTIONS:
├── Header
│   ├── t.auth.login (Page heading)
│   └── t.auth.loginSubtitle (Tagline)
├── Form Fields
│   ├── t.common.email (Email label)
│   ├── t.common.password (Password label)
│   ├── t.common.rememberMe (Checkbox label)
│   └── t.common.forgotPassword (Link)
└── Buttons & Links
    ├── t.common.signIn (Submit button)
    ├── t.common.noAccount (Divider text)
    └── t.common.createAccount (Register link)

TOTAL KEYS: 2 auth-specific + 8 common = 10
```

### Register Page (src/pages/Register.jsx)

```
REGISTER PAGE SECTIONS:
├── Header
│   ├── t.auth.register (Page heading)
│   └── t.auth.registerSubtitle (Tagline)
├── Account Type Selection
│   ├── t.auth.selectAccountType (Label)
│   ├── t.common.patient (Patient option)
│   └── t.common.doctor (Doctor option)
├── Form Fields
│   ├── t.common.firstName (First name label)
│   ├── t.common.lastName (Last name label)
│   ├── t.common.email (Email label)
│   ├── t.common.password (Password label)
│   ├── t.common.confirmPassword (Confirm password label)
│   └── t.common.agreeToTerms (Terms checkbox)
└── Buttons & Links
    ├── t.auth.register (Submit button)
    ├── t.common.haveAccount (Divider text)
    └── t.common.signIn (Sign in link)

TOTAL KEYS: 3 auth-specific + 8 common = 11
```

### Navigation (Navbar - src/components/common/Navbar.jsx)

```
NAVBAR ELEMENTS:
├── Logo/Brand: NeuralHealer (not translated)
├── Navigation Links
│   ├── t.common.home
│   ├── t.common.about
│   ├── t.common.contact
│   ├── t.navigation.chat
│   ├── t.navigation.doctors
│   ├── t.navigation.profile
│   ├── t.navigation.dashboard
│   ├── t.navigation.appointments
│   └── t.navigation.myPatients
├── User Menu
│   ├── t.common.welcome (with user name)
│   ├── Account type: t.common.doctor / t.common.patient
│   └── t.common.logout
├── Auth Buttons
│   ├── t.common.signIn
│   ├── t.common.signUp
│   └── t.common.getStarted
└── Language Toggle
    └── Shows: "العربية" (Arabic) / "English"

TOTAL KEYS: 18 navigation + common
```

## Key Organization by Section

### `common` Section Keys (35 total)

```javascript
// Navigation
home, about, contact,
// Authentication
signIn, getStarted, logout,
// User info
welcome, patient, doctor, loading,
// Common actions
cancel, submit, save, edit, delete,
// View actions
viewProfile, bookSession, startSession,
// Form fields
email, password, firstName, lastName, confirmPassword,
// Form options
agreeToTerms, rememberMe, forgotPassword, noAccount, haveAccount,
// Buttons
createAccount, signUp
```

### `auth` Section Keys (4 total)

```javascript
register, registerSubtitle, selectAccountType, login, loginSubtitle
```

### `navigation` Section Keys (6 total)

```javascript
chat, doctors, profile, dashboard, appointments, myPatients
```

### `home` Section Keys (13 total)

```javascript
welcomeToNeuralHealer,
  subtitle,
  startTherapySession,
  howNeuralHealerHelps,
  voiceInteraction,
  voiceInteractionDesc,
  emotionDetection,
  emotionDetectionDesc,
  professionalConnection,
  professionalConnectionDesc,
  sessionsCompleted,
  userSatisfaction,
  alwaysOnSupport,
  readyToStart,
  takeFirstStep,
  createYourAccount
```

### `about` Section Keys (11 total)

```javascript
aboutNeuralHealer,
  empoweringMentalHealth,
  ourMission,
  missionText,
  whatMakesUsDifferent,
  aiPoweredSupport,
  aiPoweredSupportDesc,
  privacyFirst,
  privacyFirstDesc,
  professionalNetwork,
  professionalNetworkDesc,
  ourTeam
```

### `contact` Section Keys (11 total)

```javascript
contactUs,
  hereToHelp,
  getInTouch,
  haveQuestions,
  emailSupport,
  officeLocation,
  responseTime,
  contactForm,
  name,
  subject,
  message,
  successMessage
```

## Translation Statistics

| Metric                 | Count      |
| ---------------------- | ---------- |
| Total Translation Keys | 100+       |
| Pages Translated       | 5          |
| Common Keys            | 35         |
| Section-Specific Keys  | 65+        |
| Languages Supported    | 2 (EN, AR) |
| Key-Value Pairs        | 200+       |

## Language Support

### English (en)

- Default language
- Full UTF-8 support
- Natural English phrasing
- Proper punctuation and formatting

### Arabic (ar-SA)

- Right-to-Left (RTL) layout
- Modern Standard Arabic
- Professional terminology
- Culturally appropriate

## Best Practices for Future Updates

### Adding New Keys

1. Add to both `en` and `ar` objects in `translations.js`
2. Use descriptive key names (e.g., `t.section.descriptiveName`)
3. Keep keys organized by section
4. Follow existing formatting

### Using Translations

```javascript
import { useLanguage } from '../hooks/useLanguage.jsx'

const MyComponent = () => {
  const { t } = useLanguage()
  return <h1>{t.section.key}</h1>
}
```

### RTL Styling

- RTL CSS automatically applied when language = 'ar'
- Use Tailwind's RTL-aware utilities
- Test spacing and alignment in both directions

---

**Note**: All pages and components use the same pattern for accessing translations via the `useLanguage()` hook, ensuring consistency throughout the application.
