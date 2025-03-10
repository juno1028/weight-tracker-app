// src/localization/i18n.js
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {I18nManager, NativeModules, Platform} from 'react-native';

// Import language resources
import translationEN from './translations/en.json';
import translationKO from './translations/ko.json';

// Language codes
export const languageCodes = {
  ENGLISH: 'en',
  KOREAN: 'ko',
};

// Flag emoji and language names in their native scripts
export const languageDetails = {
  en: {name: 'English', flag: '🇺🇸'},
  ko: {name: '한국어', flag: '🇰🇷'},
};

const resources = {
  [languageCodes.ENGLISH]: {
    translation: translationEN,
  },
  [languageCodes.KOREAN]: {
    translation: translationKO,
  },
};

// Get the device language
const getDeviceLanguage = () => {
  // iOS
  if (Platform.OS === 'ios') {
    const localeIdentifier =
      NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0];
    return localeIdentifier ? localeIdentifier.split('_')[0] : 'ko';
  }

  // Android
  if (Platform.OS === 'android') {
    return NativeModules.I18nManager.localeIdentifier
      ? NativeModules.I18nManager.localeIdentifier.split('_')[0]
      : 'ko';
  }

  return 'ko'; // Default to Korean
};

// Load saved language from AsyncStorage
const loadStoredLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('appLanguage');
    // If no saved language, use device language if supported, otherwise Korean
    if (!savedLanguage) {
      const deviceLang = getDeviceLanguage();
      return Object.values(languageCodes).includes(deviceLang)
        ? deviceLang
        : languageCodes.KOREAN;
    }
    return savedLanguage;
  } catch (e) {
    console.error('Failed to load language setting:', e);
    return languageCodes.KOREAN;
  }
};

// Setup and export the i18n instance
const setupI18n = async () => {
  const language = await loadStoredLanguage();

  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: languageCodes.KOREAN,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

// Save language setting to AsyncStorage
export const changeLanguage = async language => {
  try {
    await AsyncStorage.setItem('appLanguage', language);
    i18n.changeLanguage(language);
    return true;
  } catch (e) {
    console.error('Failed to save language setting:', e);
    return false;
  }
};

export default setupI18n;
