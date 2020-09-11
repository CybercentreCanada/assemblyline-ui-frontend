import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import error403EN from 'locales/en/403.json';
import error404EN from 'locales/en/404.json';
import helpAPIEN from 'locales/en/help/api.json';
import helpServicesEN from 'locales/en/help/services.json';
import tosEN from 'locales/en/tos.json';
import translationEN from 'locales/en/translation.json';
import error403FR from 'locales/fr/403.json';
import error404FR from 'locales/fr/404.json';
import helpAPIFR from 'locales/fr/help/api.json';
import helpServicesFR from 'locales/fr/help/services.json';
import tosFR from 'locales/fr/tos.json';
import translationFR from 'locales/fr/translation.json';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    error403: error403EN,
    error404: error404EN,
    helpServices: helpServicesEN,
    helpAPI: helpAPIEN,
    translation: translationEN,
    tos: tosEN
  },
  fr: {
    error403: error403FR,
    error404: error404FR,
    helpAPI: helpAPIFR,
    helpServices: helpServicesFR,
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
