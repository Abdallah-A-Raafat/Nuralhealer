import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import * as RNLocalize from 'react-native-localize';

import en from './locales/en';
import ar from './locales/ar';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Get the device's preferred language
const getDeviceLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const languageCode = locales[0].languageCode;
    // Return 'ar' if Arabic, otherwise default to 'en'
    return languageCode === 'ar' ? 'ar' : 'en';
  }
  return 'en';
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Function to change language and handle RTL
export const changeLanguage = async (languageCode: 'en' | 'ar') => {
  const isRTL = languageCode === 'ar';
  
  // Update i18n language
  await i18n.changeLanguage(languageCode);
  
  // Handle RTL layout
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Note: App needs to restart for RTL changes to take full effect
    // You might want to show a message to the user about this
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Check if current language is RTL
export const isRTL = (): boolean => {
  return i18n.language === 'ar';
};

export default i18n;
