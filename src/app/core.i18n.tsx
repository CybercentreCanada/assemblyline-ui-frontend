import { addTranslations as addA11yTranslations } from '@tui/a11y';
import { addTranslations as addClassiTranslations } from '@tui/classi';
import { addTranslations as addCoreTranslations } from '@tui/core';
import { addTranslations as addDrawerTranslations } from '@tui/drawer';
import { addTranslations as addNotisTranslations } from '@tui/notis';
import appEN from 'app/core.i18n.en.json';
import appFR from 'app/core.i18n.fr.json';
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
import externalLookupEN from 'layout/external-lookup/external-lookup.i18n.en.json';
import externalLookupFR from 'layout/external-lookup/external-lookup.i18n.fr.json';
import notificationsEN from 'layout/notifications/notifications.i18n.en.json';
import notificationsFR from 'layout/notifications/notifications.i18n.fr.json';
import alertsEN from 'pages/alerts/alerts.i18n.en.json';
import alertsFR from 'pages/alerts/alerts.i18n.fr.json';
import dashboardEN from 'pages/dashboard/dashboard.i18n.en.json';
import dashboardFR from 'pages/dashboard/dashboard.i18n.fr.json';
import developmentAPIEN from 'pages/development-api/development-api.i18n.en.json';
import developmentAPIFR from 'pages/development-api/development-api.i18n.fr.json';
import fileDetailEN from 'pages/file-detail/file-detail.i18n.en.json';
import fileDetailFR from 'pages/file-detail/file-detail.i18n.fr.json';
import fileViewerEN from 'pages/file-viewer/file-viewer.i18n.en.json';
import fileViewerFR from 'pages/file-viewer/file-viewer.i18n.fr.json';
import forbiddenEN from 'pages/forbidden/forbidden.i18n.en.json';
import forbiddenFR from 'pages/forbidden/forbidden.i18n.fr.json';
import helpAPIEN from 'pages/help-api/help-api.i18n.en.json';
import helpAPIFR from 'pages/help-api/help-api.i18n.fr.json';
import helpClassificationEN from 'pages/help-classification/help-classification.i18n.en.json';
import helpClassificationFR from 'pages/help-classification/help-classification.i18n.fr.json';
import helpConfigurationEN from 'pages/help-configuration/help-configuration.i18n.en.json';
import helpConfigurationFR from 'pages/help-configuration/help-configuration.i18n.fr.json';
import helpSearchEN from 'pages/help-search/help-search.i18n.en.json';
import helpSearchFR from 'pages/help-search/help-search.i18n.fr.json';
import helpServicesEN from 'pages/help-services/help-services.i18n.en.json';
import helpServicesFR from 'pages/help-services/help-services.i18n.fr.json';
import missingNodeEN from 'pages/missing-node/missing-node.i18n.en.json';
import missingNodeFR from 'pages/missing-node/missing-node.i18n.fr.json';
import notFoundEN from 'pages/not-found/not-found.i18n.en.json';
import notFoundFR from 'pages/not-found/not-found.i18n.fr.json';
import searchEN from 'pages/search/search.i18n.en.json';
import searchFR from 'pages/search/search.i18n.fr.json';
import settingsEN from 'pages/settings/settings.i18n.en.json';
import settingsFR from 'pages/settings/settings.i18n.fr.json';
import submissionDetailEN from 'pages/submission-detail/submission-detail.i18n.en.json';
import submissionDetailFR from 'pages/submission-detail/submission-detail.i18n.fr.json';
import submissionReportEN from 'pages/submission-report/submission-report.i18n.en.json';
import submissionReportFR from 'pages/submission-report/submission-report.i18n.fr.json';
import submissionsEN from 'pages/submissions/submissions.i18n.en.json';
import submissionsFR from 'pages/submissions/submissions.i18n.fr.json';
import submitEN from 'pages/submit/submit.i18n.en.json';
import submitFR from 'pages/submit/submit.i18n.fr.json';
import userEN from 'pages/user/user.i18n.en.json';
import userFR from 'pages/user/user.i18n.fr.json';
import { initReactI18next } from 'react-i18next';
import inputsEN from 'ui/inputs/i18n/inputs.i18n.en.json';
import inputsFR from 'ui/inputs/i18n/inputs.i18n.fr.json';

export const I18N_RESSOURCES = {
  en: {
    alerts: alertsEN,
    api: apiEN,
    app: appEN,
    dashboard: dashboardEN,
    developmentAPI: developmentAPIEN,
    error: errorEN,
    error403: forbiddenEN,
    error404: notFoundEN,
    externalLookup: externalLookupEN,
    fileDetail: fileDetailEN,
    fileViewer: fileViewerEN,
    helpAPI: helpAPIEN,
    helpClassification: helpClassificationEN,
    helpConfiguration: helpConfigurationEN,
    helpSearch: helpSearchEN,
    helpServices: helpServicesEN,
    inputs: inputsEN,
    locked: lockedEN,
    login: loginEN,
    logout: logoutEN,
    missingNode: missingNodeEN,
    notifications: notificationsEN,
    quota: quotaEN,
    search: searchEN,
    settings: settingsEN,
    submissionDetail: submissionDetailEN,
    submissionReport: submissionReportEN,
    submissions: submissionsEN,
    submit: submitEN,
    tos: tosEN,
    user: userEN
  },
  fr: {
    alerts: alertsFR,
    api: apiFR,
    app: appFR,
    dashboard: dashboardFR,
    developmentAPI: developmentAPIFR,
    error: errorFR,
    error403: forbiddenFR,
    error404: notFoundFR,
    externalLookup: externalLookupFR,
    fileDetail: fileDetailFR,
    fileViewer: fileViewerFR,
    helpAPI: helpAPIFR,
    helpClassification: helpClassificationFR,
    helpConfiguration: helpConfigurationFR,
    helpSearch: helpSearchFR,
    helpServices: helpServicesFR,
    inputs: inputsFR,
    locked: lockedFR,
    login: loginFR,
    logout: logoutFR,
    missingNode: missingNodeFR,
    notifications: notificationsFR,
    quota: quotaFR,
    search: searchFR,
    settings: settingsFR,
    submissionDetail: submissionDetailFR,
    submissionReport: submissionReportFR,
    submissions: submissionsFR,
    submit: submitFR,
    tos: tosFR,
    user: userFR
  }
};

void i18n
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
