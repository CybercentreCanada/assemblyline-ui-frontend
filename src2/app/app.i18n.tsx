import translationEN from 'app/app.i18n.en.json';
import translationFR from 'app/app.i18n.fr.json';
import apiEN from 'core/api/api.i18n.en.json';
import apiFR from 'core/api/api.i18n.fr.json';
import layoutEN from 'core/layout/layout.i18n.en.json';
import layoutFR from 'core/layout/layout.i18n.fr.json';
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

export const I18N_RESSOURCES = {
  en: {
    api: apiEN,
    error403: forbiddenEN,
    error404: notFoundEN,
    layout: layoutEN,
    locked: lockedEN,
    login: loginEN,
    logout: logoutEN,
    quota: quotaEN,
    tos: tosEN,
    translation: translationEN
  },
  fr: {
    api: apiFR,
    error403: forbiddenFR,
    error404: notFoundFR,
    layout: layoutFR,
    locked: lockedFR,
    login: loginFR,
    logout: logoutFR,
    quota: quotaFR,
    tos: tosFR,
    translation: translationFR
  }
};
