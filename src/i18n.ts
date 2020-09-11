import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import tosEN from 'locales/en/tos.json';
import translationEN from 'locales/en/translation.json';
import tosFR from 'locales/fr/tos.json';
import translationFR from 'locales/fr/translation.json';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: translationEN,
    tos: tosEN
  },
  fr: {
    translation: translationFR,
    tos: tosFR
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie']
    },
    resources
  });

export default i18n;
