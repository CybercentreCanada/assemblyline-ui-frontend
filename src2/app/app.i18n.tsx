import { addTranslations as addA11yTranslations } from '@tui/a11y';
import { addTranslations as addClassiTranslations } from '@tui/classi';
import { addTranslations as addCoreTranslations } from '@tui/core';
import { addTranslations as addDrawerTranslations } from '@tui/drawer';
import { addTranslations as addNotisTranslations } from '@tui/notis';
import appEN from 'app/app.i18n.en.json';
import appFR from 'app/app.i18n.fr.json';
import apiEN from 'core/api/api.i18n.en.json';
import apiFR from 'core/api/api.i18n.fr.json';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import forbiddenEN from 'pages/forbidden/forbidden.i18n.en.json';
import forbiddenFR from 'pages/forbidden/forbidden.i18n.fr.json';
import lockedEN from 'pages/locked/locked.i18n.en.json';
import lockedFR from 'pages/locked/locked.i18n.fr.json';
import loginEN from 'pages/log-in/log-in.i18n.en.json';
import loginFR from 'pages/log-in/log-in.i18n.fr.json';
import logoutEN from 'pages/log-out/log-out.i18n.en.json';
import logoutFR from 'pages/log-out/log-out.i18n.fr.json';
import notFoundEN from 'pages/not-found/not-found.i18n.en.json';
import notFoundFR from 'pages/not-found/not-found.i18n.fr.json';
import quotaEN from 'pages/quota/quota.i18n.en.json';
import quotaFR from 'pages/quota/quota.i18n.fr.json';
import tosEN from 'pages/terms-of-service/terms-of-service.i18n.en.json';
import tosFR from 'pages/terms-of-service/terms-of-service.i18n.fr.json';
import { initReactI18next } from 'react-i18next';

export const I18N_RESSOURCES = {
  en: {
    api: apiEN,
    app: appEN,
    error403: forbiddenEN,
    error404: notFoundEN,
    locked: lockedEN,
    login: loginEN,
    logout: logoutEN,
    quota: quotaEN,
    tos: tosEN
  },
  fr: {
    api: apiFR,
    app: appFR,
    error403: forbiddenFR,
    error404: notFoundFR,
    locked: lockedFR,
    login: loginFR,
    logout: logoutFR,
    quota: quotaFR,
    tos: tosFR
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'app',
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie']
    },
    resources: I18N_RESSOURCES
  });

addCoreTranslations(i18n);
addA11yTranslations(i18n);
addNotisTranslations(i18n);
addClassiTranslations(i18n);
addClassiTranslations(i18n);
addDrawerTranslations(i18n);

export default i18n;
