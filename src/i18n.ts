import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import error403EN from 'locales/en/403.json';
import error404EN from 'locales/en/404.json';
import adminActionsEN from 'locales/en/admin/actions.json';
import adminErrorViewerEN from 'locales/en/admin/error_viewer.json';
import adminIdentifyEN from 'locales/en/admin/identify.json';
import adminServicesEN from 'locales/en/admin/services.json';
import adminServiceReviewEN from 'locales/en/admin/service_review.json';
import adminSiteMapEN from 'locales/en/admin/site_map.json';
import adminTagSafelistEN from 'locales/en/admin/tag_safelist.json';
import archiveEN from 'locales/en/archive.json';

import adminUsersEN from 'locales/en/admin/users.json';
import alertsEN from 'locales/en/alerts.json';
import authorizeEN from 'locales/en/authorize.json';
import carouselEN from 'locales/en/carousel.json';
import archiveFR from 'locales/fr/archive.json';

import dashboardEN from 'locales/en/dashboard.json';
import favoritesEN from 'locales/en/favorites.json';
import fileDetailEN from 'locales/en/file/detail.json';
import hexViewerEN from 'locales/en/file/hex.json';
import fileViewerEN from 'locales/en/file/viewer.json';
import helpAPIEN from 'locales/en/help/api.json';
import helpClassificationEN from 'locales/en/help/classification.json';
import helpConfigurationEN from 'locales/en/help/configuration.json';
import helpSearchEN from 'locales/en/help/search.json';
import helpServicesEN from 'locales/en/help/services.json';
import lockedEN from 'locales/en/locked.json';
import loginEN from 'locales/en/login.json';
import logoutEN from 'locales/en/logout.json';
import manageHeuristicsEN from 'locales/en/manage/heuristics.json';
import manageHeuristicDetailEN from 'locales/en/manage/heuristic_detail.json';
import manageSafelistEN from 'locales/en/manage/safelist.json';
import manageSafelistDetailEN from 'locales/en/manage/safelist_detail.json';
import manageSignaturesEN from 'locales/en/manage/signatures.json';
import manageSignatureDetailEN from 'locales/en/manage/signature_detail.json';
import manageSignatureSourcesEN from 'locales/en/manage/signature_sources.json';
import manageWorkflowsEN from 'locales/en/manage/workflows.json';
import manageWorkflowDetailEN from 'locales/en/manage/workflow_detail.json';
import notificationEN from 'locales/en/notification.json';
import retrohuntEN from 'locales/en/retrohunt.json';
import searchEN from 'locales/en/search.json';
import settingsEN from 'locales/en/settings.json';
import statisticsHeuristicsEN from 'locales/en/statistics/heuristics.json';
import statisticsSignaturesEN from 'locales/en/statistics/signatures.json';
import submissionDetailEN from 'locales/en/submission/detail.json';
import submissionReportEN from 'locales/en/submission/report.json';
import submissionsEN from 'locales/en/submissions.json';
import submitEN from 'locales/en/submit.json';
import tosEN from 'locales/en/tos.json';
import translationEN from 'locales/en/translation.json';
import userEN from 'locales/en/user.json';
import error403FR from 'locales/fr/403.json';
import error404FR from 'locales/fr/404.json';
import adminActionsFR from 'locales/fr/admin/actions.json';
import adminErrorViewerFR from 'locales/fr/admin/error_viewer.json';
import adminIdentifyFR from 'locales/fr/admin/identify.json';
import adminServicesFR from 'locales/fr/admin/services.json';
import adminServiceReviewFR from 'locales/fr/admin/service_review.json';
import adminSiteMapFR from 'locales/fr/admin/site_map.json';
import adminTagSafelistFR from 'locales/fr/admin/tag_safelist.json';
import adminUsersFR from 'locales/fr/admin/users.json';
import alertsFR from 'locales/fr/alerts.json';
import authorizeFR from 'locales/fr/authorize.json';
import carouselFR from 'locales/fr/carousel.json';
import dashboardFR from 'locales/fr/dashboard.json';
import favoritesFR from 'locales/fr/favorites.json';
import fileDetailFR from 'locales/fr/file/detail.json';
import hexViewerFR from 'locales/fr/file/hex.json';
import fileViewerFR from 'locales/fr/file/viewer.json';
import helpAPIFR from 'locales/fr/help/api.json';
import helpClassificationFR from 'locales/fr/help/classification.json';
import helpConfigurationFR from 'locales/fr/help/configuration.json';
import helpSearchFR from 'locales/fr/help/search.json';
import helpServicesFR from 'locales/fr/help/services.json';
import lockedFR from 'locales/fr/locked.json';
import loginFR from 'locales/fr/login.json';
import logoutFR from 'locales/fr/logout.json';
import manageHeuristicsFR from 'locales/fr/manage/heuristics.json';
import manageHeuristicDetailFR from 'locales/fr/manage/heuristic_detail.json';
import manageSafelistFR from 'locales/fr/manage/safelist.json';
import manageSafelistDetailFR from 'locales/fr/manage/safelist_detail.json';
import manageSignaturesFR from 'locales/fr/manage/signatures.json';
import manageSignatureDetailFR from 'locales/fr/manage/signature_detail.json';
import manageSignatureSourcesFR from 'locales/fr/manage/signature_sources.json';
import manageWorkflowsFR from 'locales/fr/manage/workflows.json';
import manageWorkflowDetailFR from 'locales/fr/manage/workflow_detail.json';
import notificationFR from 'locales/fr/notification.json';
import retrohuntFR from 'locales/fr/retrohunt.json';
import searchFR from 'locales/fr/search.json';
import settingsFR from 'locales/fr/settings.json';
import statisticsHeuristicsFR from 'locales/fr/statistics/heuristics.json';
import statisticsSignaturesFR from 'locales/fr/statistics/signatures.json';
import submissionDetailFR from 'locales/fr/submission/detail.json';
import submissionReportFR from 'locales/fr/submission/report.json';
import submissionsFR from 'locales/fr/submissions.json';
import submitFR from 'locales/fr/submit.json';
import tosFR from 'locales/fr/tos.json';
import translationFR from 'locales/fr/translation.json';
import userFR from 'locales/fr/user.json';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    adminActions: adminActionsEN,
    adminErrorViewer: adminErrorViewerEN,
    adminIdentify: adminIdentifyEN,
    adminServiceReview: adminServiceReviewEN,
    adminServices: adminServicesEN,
    adminSiteMap: adminSiteMapEN,
    adminTagSafelist: adminTagSafelistEN,
    adminUsers: adminUsersEN,
    alerts: alertsEN,
    archive: archiveEN,
    authorize: authorizeEN,
    carousel: carouselEN,
    dashboard: dashboardEN,
    error403: error403EN,
    error404: error404EN,
    favorites: favoritesEN,
    fileDetail: fileDetailEN,
    fileViewer: fileViewerEN,
    helpAPI: helpAPIEN,
    helpClassification: helpClassificationEN,
    helpConfiguration: helpConfigurationEN,
    helpSearch: helpSearchEN,
    helpServices: helpServicesEN,
    hexViewer: hexViewerEN,
    locked: lockedEN,
    login: loginEN,
    logout: logoutEN,
    manageHeuristicDetail: manageHeuristicDetailEN,
    manageHeuristics: manageHeuristicsEN,
    manageSafelist: manageSafelistEN,
    manageSafelistDetail: manageSafelistDetailEN,
    manageSignatureDetail: manageSignatureDetailEN,
    manageSignatures: manageSignaturesEN,
    manageSignatureSources: manageSignatureSourcesEN,
    manageWorkflowDetail: manageWorkflowDetailEN,
    manageWorkflows: manageWorkflowsEN,
    notification: notificationEN,
    retrohunt: retrohuntEN,
    search: searchEN,
    settings: settingsEN,
    statisticsHeuristics: statisticsHeuristicsEN,
    statisticsSignatures: statisticsSignaturesEN,
    submissionDetail: submissionDetailEN,
    submissionReport: submissionReportEN,
    submissions: submissionsEN,
    submit: submitEN,
    tos: tosEN,
    translation: translationEN,
    user: userEN
  },
  fr: {
    adminActions: adminActionsFR,
    adminErrorViewer: adminErrorViewerFR,
    adminIdentify: adminIdentifyFR,
    adminServiceReview: adminServiceReviewFR,
    adminServices: adminServicesFR,
    adminSiteMap: adminSiteMapFR,
    adminTagSafelist: adminTagSafelistFR,
    adminUsers: adminUsersFR,
    alerts: alertsFR,
    archive: archiveFR,
    authorize: authorizeFR,
    carousel: carouselFR,
    dashboard: dashboardFR,
    error403: error403FR,
    error404: error404FR,
    favorites: favoritesFR,
    fileDetail: fileDetailFR,
    fileViewer: fileViewerFR,
    helpAPI: helpAPIFR,
    helpClassification: helpClassificationFR,
    helpConfiguration: helpConfigurationFR,
    helpSearch: helpSearchFR,
    helpServices: helpServicesFR,
    hexViewer: hexViewerFR,
    locked: lockedFR,
    login: loginFR,
    logout: logoutFR,
    manageHeuristicDetail: manageHeuristicDetailFR,
    manageHeuristics: manageHeuristicsFR,
    manageSafelist: manageSafelistFR,
    manageSafelistDetail: manageSafelistDetailFR,
    manageSignatureDetail: manageSignatureDetailFR,
    manageSignatures: manageSignaturesFR,
    manageSignatureSources: manageSignatureSourcesFR,
    manageWorkflowDetail: manageWorkflowDetailFR,
    manageWorkflows: manageWorkflowsFR,
    notification: notificationFR,
    retrohunt: retrohuntFR,
    search: searchFR,
    settings: settingsFR,
    statisticsHeuristics: statisticsHeuristicsFR,
    statisticsSignatures: statisticsSignaturesFR,
    submissionDetail: submissionDetailFR,
    submissionReport: submissionReportFR,
    submissions: submissionsFR,
    submit: submitFR,
    tos: tosFR,
    translation: translationFR,
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
