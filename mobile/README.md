# 📱 Mobile Application

React Native mobile app for NeuralHealer - available on iOS and Android.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
npm install

# iOS only
cd ios && pod install && cd ..
```

### Environment Setup

```bash
cp .env.example .env
```

Configure your `.env`:
```env
API_BASE_URL=http://localhost:5000/api
AI_SERVICE_URL=http://localhost:8000
ENVIRONMENT=development
```

### Run on Android

```bash
npx react-native run-android
```

### Run on iOS

```bash
npx react-native run-ios
```

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── screens/            # App screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── patient/
│   │   │   ├── ChatScreen.js
│   │   │   ├── DoctorsScreen.js
│   │   │   └── ProfileScreen.js
│   │   └── doctor/
│   │       ├── DoctorDashboardScreen.js
│   │       └── PatientsScreen.js
│   ├── components/         # Reusable components
│   │   ├── common/
│   │   ├── chat/
│   │   └── doctors/
│   ├── navigation/         # Navigation setup
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   └── bookingService.js
│   ├── store/              # State management
│   │   ├── authStore.js
│   │   └── chatStore.js
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilities
│   ├── i18n/               # Translations
│   └── assets/             # Images, fonts
├── android/                # Android native code
├── ios/                    # iOS native code
├── .env.example
├── app.json
├── package.json
└── README.md
```

---

## 🔧 Tech Stack

- **React Native** 0.73+
- **React Navigation** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **React Native Paper** - UI components
- **React Native Vector Icons** - Icons
- **React Native Voice** - Voice recording
- **React Native Push Notifications** - Notifications

---

## 📱 Features

### For Patients
- ✅ User authentication
- ✅ AI chat therapy (text & voice)
- ✅ Browse doctors
- ✅ Book appointments
- ✅ View session history
- ✅ Profile management
- ✅ Push notifications
- ✅ Offline mode support

### For Doctors
- ✅ Doctor dashboard
- ✅ Patient management
- ✅ Appointment scheduling
- ✅ View patient history
- ✅ Session notes

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (Detox)
npm run test:e2e:android
npm run test:e2e:ios
```

---

## 📦 Build

### Android APK

```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### iOS IPA

```bash
# Open Xcode
open ios/NeuralHealer.xcworkspace

# Archive and export from Xcode
```

---

## 🚀 Deployment

### Android - Google Play Store

1. Generate signed APK/AAB
2. Create Google Play Console account
3. Upload to Play Store
4. Submit for review

### iOS - Apple App Store

1. Archive in Xcode
2. Create App Store Connect account
3. Upload to App Store Connect
4. Submit for review

**See**: [Mobile Deployment Guide](../docs/deployment/MOBILE_DEPLOYMENT.md)

---

## 🔔 Push Notifications

### Setup Firebase (Android & iOS)

1. Create Firebase project
2. Add `google-services.json` (Android)
3. Add `GoogleService-Info.plist` (iOS)
4. Configure in `app.json`

---

## 🎨 Theming

The app supports light and dark themes:

```javascript
import { useTheme } from './hooks/useTheme';

const MyComponent = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
};
```

---

## 🌍 Internationalization

Supports Arabic and English:

```javascript
import { useTranslation } from './i18n';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <Text>{t('common.welcome')}</Text>;
};
```

---

## 🐛 Debugging

```bash
# React Native Debugger
npm run debugger

# View logs
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

---

## 📝 Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests
- `npm run lint` - Run linter

---

## 🔗 Related

- [API Documentation](../docs/api/API_CONTRACT.md)
- [Backend Setup](../backend/README.md)
- [Mobile Setup Guide](../docs/setup/MOBILE_SETUP.md)

---

## 📞 Support

For mobile app issues, contact the mobile team or open an issue on GitHub.
