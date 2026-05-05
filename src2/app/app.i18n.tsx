import { addTranslations as addA11yTranslations } from '@tui/a11y';
import { addTranslations as addClassiTranslations } from '@tui/classi';
import { addTranslations as addCoreTranslations } from '@tui/core';
import { addTranslations as addDrawerTranslations } from '@tui/drawer';
import { addTranslations as addNotisTranslations } from '@tui/notis';
import appEN from 'app/app.i18n.en.json';
import appFR from 'app/app.i18n.fr.json';
import apiEN from 'core/api/api.i18n.en.json';
import apiFR from 'core/api/api.i18n.fr.json';
import errorEN from 'core/error/error.i18n.en.json';
import errorFR from 'core/error/error.i18n.fr.json';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import lockedEN from 'layout/auth/locked/locked.i18n.en.json';
import lockedFR from 'layout/auth/locked/locked.i18n.fr.json';
import loginEN from 'layout/auth/log-in/log-in.i18n.en.json';
import loginFR from 'layout/auth/log-in/log-in.i18n.fr.json';
import logoutEN from 'layout/auth/log-out/log-out.i18n.en.json';
import logoutFR from 'layout/auth/log-out/log-out.i18n.fr.json';
import quotaEN from 'layout/auth/quota/quota.i18n.en.json';
import quotaFR from 'layout/auth/quota/quota.i18n.fr.json';
import tosEN from 'layout/auth/terms-of-service/terms-of-service.i18n.en.json';
import tosFR from 'layout/auth/terms-of-service/terms-of-service.i18n.fr.json';
import notificationsEN from 'layout/notifications/notifications.i18n.en.json';
import notificationsFR from 'layout/notifications/notifications.i18n.fr.json';
import forbiddenEN from 'pages/forbidden/forbidden.i18n.en.json';
import forbiddenFR from 'pages/forbidden/forbidden.i18n.fr.json';
import helpAPIEN from 'pages/help/api/help-api.i18n.en.json';
import helpAPIFR from 'pages/help/api/help-api.i18n.fr.json';
import notFoundEN from 'pages/not-found/not-found.i18n.en.json';
import notFoundFR from 'pages/not-found/not-found.i18n.fr.json';
import { initReactI18next } from 'react-i18next';

export const I18N_RESSOURCES = {
  en: {
    api: apiEN,
    app: appEN,
    error: errorEN,
    error403: forbiddenEN,
    error404: notFoundEN,
    helpAPI: helpAPIEN,
    locked: lockedEN,
    login: loginEN,
    logout: logoutEN,
    notifications: notificationsEN,
    quota: quotaEN,
    tos: tosEN
  },
  fr: {
    api: apiFR,
    app: appFR,
    error: errorFR,
    error403: forbiddenFR,
    error404: notFoundFR,
    helpAPI: helpAPIFR,
    locked: lockedFR,
    login: loginFR,
    logout: logoutFR,
    notifications: notificationsFR,
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

export { i18n };
