import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import error403EN from 'locales/en/403.json';
import error404EN from 'locales/en/404.json';
import helpAPIEN from 'locales/en/help/api.json';
import helpConfigurationEN from 'locales/en/help/configuration.json';
import helpServicesEN from 'locales/en/help/services.json';
import lockedEN from 'locales/en/locked.json';
import loginEN from 'locales/en/login.json';
import settingsEN from 'locales/en/settings.json';
import submissionEN from 'locales/en/submission.json';
import tosEN from 'locales/en/tos.json';
import translationEN from 'locales/en/translation.json';
import userEN from 'locales/en/user.json';
import error403FR from 'locales/fr/403.json';
import error404FR from 'locales/fr/404.json';
import helpAPIFR from 'locales/fr/help/api.json';
import helpConfigurationFR from 'locales/fr/help/configuration.json';
import helpServicesFR from 'locales/fr/help/services.json';
import lockedFR from 'locales/fr/locked.json';
import loginFR from 'locales/fr/login.json';
import settingsFR from 'locales/fr/settings.json';
import submissionFR from 'locales/fr/submission.json';
import tosFR from 'locales/fr/tos.json';
import translationFR from 'locales/fr/translation.json';
import userFR from 'locales/fr/user.json';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    error403: error403EN,
    error404: error404EN,
    helpAPI: helpAPIEN,
    helpConfiguration: helpConfigurationEN,
    helpServices: helpServicesEN,
    locked: lockedEN,
    login: loginEN,
    settings: settingsEN,
    submission: submissionEN,
    translation: translationEN,
    tos: tosEN,
    user: userEN
  },
  fr: {
    error403: error403FR,
    error404: error404FR,
    helpAPI: helpAPIFR,
    helpConfiguration: helpConfigurationFR,
    helpServices: helpServicesFR,
    locked: lockedFR,
    login: loginFR,
    settings: settingsFR,
    submission: submissionFR,
    translation: translationFR,
    tos: tosFR,
    user: userFR
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
