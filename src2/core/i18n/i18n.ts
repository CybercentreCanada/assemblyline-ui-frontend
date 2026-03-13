import { default as i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import forbiddenEN from 'pages/forbidden/forbidden.i18n.en.json';
import forbiddenFR from 'pages/forbidden/forbidden.i18n.fr.json';
import lockedEN from 'pages/locked/locked.i18n.en.json';
import lockedFR from 'pages/locked/locked.i18n.fr.json';
import loginEN from 'pages/log-in/log-in.i18n.en.json';
import loginFR from 'pages/log-in/log-in.i18n.fr.json';
import notFoundEN from 'pages/not-found/not-found.i18n.en.json';
import notFoundFR from 'pages/not-found/not-found.i18n.fr.json';
import quotaEN from 'pages/quota/quota.i18n.en.json';
import quotaFR from 'pages/quota/quota.i18n.fr.json';
import tosEN from 'pages/terms-of-service/terms-of-service.i18n.en.json';
import tosFR from 'pages/terms-of-service/terms-of-service.i18n.fr.json';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    error403: forbiddenEN,
    error404: notFoundEN,
    locked: lockedEN,
    quota: quotaEN,
    login: loginEN,
    tos: tosEN,
    translation: {}
  },
  fr: {
    error403: forbiddenFR,
    error404: notFoundFR,
    locked: lockedFR,
    quota: quotaFR,
    tos: tosFR,
    login: loginFR,
    translation: {}
  }
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'translation',
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
