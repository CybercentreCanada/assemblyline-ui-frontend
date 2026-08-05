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
import routerEN from 'core/router/router.i18n.en.json';
import routerFR from 'core/router/router.i18n.fr.json';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import assistantEN from 'layout/assistant/assistant.i18n.en.json';
import assistantFR from 'layout/assistant/assistant.i18n.fr.json';
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
import borealisEN from 'layout/borealis/borealis.i18n.en.json';
import borealisFR from 'layout/borealis/borealis.i18n.fr.json';
import carouselEN from 'layout/carousel/carousel.i18n.en.json';
import carouselFR from 'layout/carousel/carousel.i18n.fr.json';
import drawerEN from 'layout/drawer/drawer.i18n.en.json';
import drawerFR from 'layout/drawer/drawer.i18n.fr.json';
import externalLookupEN from 'layout/external-lookup/external-lookup.i18n.en.json';
import externalLookupFR from 'layout/external-lookup/external-lookup.i18n.fr.json';
import notificationsEN from 'layout/notifications/notifications.i18n.en.json';
import notificationsFR from 'layout/notifications/notifications.i18n.fr.json';
import { initReactI18next } from 'react-i18next';
import adminActionsEN from 'routes/admin-actions/admin-actions.i18n.en.json';
import adminActionsFR from 'routes/admin-actions/admin-actions.i18n.fr.json';
import adminAPIkeysEN from 'routes/admin-api-keys/admin-api-keys.i18n.en.json';
import adminAPIkeysFR from 'routes/admin-api-keys/admin-api-keys.i18n.fr.json';
import adminErrorViewerEN from 'routes/admin-error-viewer/admin-error-viewer.i18n.en.json';
import adminErrorViewerFR from 'routes/admin-error-viewer/admin-error-viewer.i18n.fr.json';
import adminIdentifyEN from 'routes/admin-identify/admin-identify.i18n.en.json';
import adminIdentifyFR from 'routes/admin-identify/admin-identify.i18n.fr.json';
import adminServiceReviewEN from 'routes/admin-service-review/admin-service-review.i18n.en.json';
import adminServiceReviewFR from 'routes/admin-service-review/admin-service-review.i18n.fr.json';
import adminServicesEN from 'routes/admin-services/admin-services.i18n.en.json';
import adminServicesFR from 'routes/admin-services/admin-services.i18n.fr.json';
import adminSiteMapEN from 'routes/admin-sitemap/admin-sitemap.i18n.en.json';
import adminSiteMapFR from 'routes/admin-sitemap/admin-sitemap.i18n.fr.json';
import adminTagSafelistEN from 'routes/admin-tag-safelist/admin-tag-safelist.i18n.en.json';
import adminTagSafelistFR from 'routes/admin-tag-safelist/admin-tag-safelist.i18n.fr.json';
import adminUsersEN from 'routes/admin-users/admin-users.i18n.en.json';
import adminUsersFR from 'routes/admin-users/admin-users.i18n.fr.json';
import alertsEN from 'routes/alerts/alerts.i18n.en.json';
import alertsFR from 'routes/alerts/alerts.i18n.fr.json';
import favoritesEN from 'routes/alerts/components/favorites.i18n.en.json';
import favoritesFR from 'routes/alerts/components/favorites.i18n.fr.json';
import archivesEN from 'routes/archives/archives.i18n.en.json';
import archivesFR from 'routes/archives/archives.i18n.fr.json';
import authorizeEN from 'routes/authorize/authorize.i18n.en.json';
import authorizeFR from 'routes/authorize/authorize.i18n.fr.json';
import dashboardEN from 'routes/dashboard/dashboard.i18n.en.json';
import dashboardFR from 'routes/dashboard/dashboard.i18n.fr.json';
import developmentAPIEN from 'routes/development-api/development-api.i18n.en.json';
import developmentAPIFR from 'routes/development-api/development-api.i18n.fr.json';
import fileDetailEN from 'routes/file-detail/file-detail.i18n.en.json';
import fileDetailFR from 'routes/file-detail/file-detail.i18n.fr.json';
import fileViewerEN from 'routes/file-viewer/file-viewer.i18n.en.json';
import fileViewerFR from 'routes/file-viewer/file-viewer.i18n.fr.json';
import forbiddenEN from 'routes/forbidden/forbidden.i18n.en.json';
import forbiddenFR from 'routes/forbidden/forbidden.i18n.fr.json';
import helpAPIEN from 'routes/help-api/help-api.i18n.en.json';
import helpAPIFR from 'routes/help-api/help-api.i18n.fr.json';
import helpClassificationEN from 'routes/help-classification/help-classification.i18n.en.json';
import helpClassificationFR from 'routes/help-classification/help-classification.i18n.fr.json';
import helpConfigurationEN from 'routes/help-configuration/help-configuration.i18n.en.json';
import helpConfigurationFR from 'routes/help-configuration/help-configuration.i18n.fr.json';
import helpSearchEN from 'routes/help-search/help-search.i18n.en.json';
import helpSearchFR from 'routes/help-search/help-search.i18n.fr.json';
import helpServicesEN from 'routes/help-services/help-services.i18n.en.json';
import helpServicesFR from 'routes/help-services/help-services.i18n.fr.json';
import manageBadlistAddEN from 'routes/manage-badlist-add/manage-badlist-add.i18n.en.json';
import manageBadlistAddFR from 'routes/manage-badlist-add/manage-badlist-add.i18n.fr.json';
import manageBadlistDetailEN from 'routes/manage-badlist-detail/manage-badlist-detail.i18n.en.json';
import manageBadlistDetailFR from 'routes/manage-badlist-detail/manage-badlist-detail.i18n.fr.json';
import manageBadlistsEN from 'routes/manage-badlists/manage-badlists.i18n.en.json';
import manageBadlistsFR from 'routes/manage-badlists/manage-badlists.i18n.fr.json';
import manageHeuristicDetailEN from 'routes/manage-heuristic-detail/manage-heuristic-detail.i18n.en.json';
import manageHeuristicDetailFR from 'routes/manage-heuristic-detail/manage-heuristic-detail.i18n.fr.json';
import manageHeuristicsEN from 'routes/manage-heuristics/manage-heuristics.i18n.en.json';
import manageHeuristicsFR from 'routes/manage-heuristics/manage-heuristics.i18n.fr.json';
import manageSafelistAddEN from 'routes/manage-safelist-add/manage-safelist-add.i18n.en.json';
import manageSafelistAddFR from 'routes/manage-safelist-add/manage-safelist-add.i18n.fr.json';
import manageSafelistDetailEN from 'routes/manage-safelist-detail/manage-safelist-detail.i18n.en.json';
import manageSafelistDetailFR from 'routes/manage-safelist-detail/manage-safelist-detail.i18n.fr.json';
import manageSafelistsEN from 'routes/manage-safelists/manage-safelists.i18n.en.json';
import manageSafelistsFR from 'routes/manage-safelists/manage-safelists.i18n.fr.json';
import manageSignatureDetailEN from 'routes/manage-signature-detail/manage-signature-detail.i18n.en.json';
import manageSignatureDetailFR from 'routes/manage-signature-detail/manage-signature-detail.i18n.fr.json';
import manageSignatureSourcesEN from 'routes/manage-signature-sources/manage-signature-sources.i18n.en.json';
import manageSignatureSourcesFR from 'routes/manage-signature-sources/manage-signature-sources.i18n.fr.json';
import manageSignaturesEN from 'routes/manage-signatures/manage-signatures.i18n.en.json';
import manageSignaturesFR from 'routes/manage-signatures/manage-signatures.i18n.fr.json';
import manageWorkflowDetailEN from 'routes/manage-workflow-detail/manage-workflow-detail.i18n.en.json';
import manageWorkflowDetailFR from 'routes/manage-workflow-detail/manage-workflow-detail.i18n.fr.json';
import manageWorkflowsEN from 'routes/manage-workflows/manage-workflows.i18n.en.json';
import manageWorkflowsFR from 'routes/manage-workflows/manage-workflows.i18n.fr.json';
import missingNodeEN from 'routes/missing-node/missing-node.i18n.en.json';
import missingNodeFR from 'routes/missing-node/missing-node.i18n.fr.json';
import notFoundEN from 'routes/not-found/not-found.i18n.en.json';
import notFoundFR from 'routes/not-found/not-found.i18n.fr.json';
import retrohuntEN from 'routes/retrohunt/retrohunt.i18n.en.json';
import retrohuntFR from 'routes/retrohunt/retrohunt.i18n.fr.json';
import searchEN from 'routes/search/search.i18n.en.json';
import searchFR from 'routes/search/search.i18n.fr.json';
import settingsEN from 'routes/settings/settings.i18n.en.json';
import settingsFR from 'routes/settings/settings.i18n.fr.json';
import statisticsHeuristicsEN from 'routes/statistics-heuristics/statistics-heuristics.i18n.en.json';
import statisticsHeuristicsFR from 'routes/statistics-heuristics/statistics-heuristics.i18n.fr.json';
import statisticsSignaturesEN from 'routes/statistics-signatures/statistics-signatures.i18n.en.json';
import statisticsSignaturesFR from 'routes/statistics-signatures/statistics-signatures.i18n.fr.json';
import submissionDetailEN from 'routes/submission-detail/submission-detail.i18n.en.json';
import submissionDetailFR from 'routes/submission-detail/submission-detail.i18n.fr.json';
import submissionReportEN from 'routes/submission-report/submission-report.i18n.en.json';
import submissionReportFR from 'routes/submission-report/submission-report.i18n.fr.json';
import submissionsEN from 'routes/submissions/submissions.i18n.en.json';
import submissionsFR from 'routes/submissions/submissions.i18n.fr.json';
import submitEN from 'routes/submit/submit.i18n.en.json';
import submitFR from 'routes/submit/submit.i18n.fr.json';
import userEN from 'routes/user/user.i18n.en.json';
import userFR from 'routes/user/user.i18n.fr.json';
import dateTimeEN from 'ui/DateTime/datetime.i18n.en.json';
import dateTimeFR from 'ui/DateTime/datetime.i18n.fr.json';
import hexViewerEN from 'ui/HexViewer/hex-viewer.i18n.en.json';
import hexViewerFR from 'ui/HexViewer/hex-viewer.i18n.fr.json';
import inputsEN from 'ui/inputs/i18n/inputs.i18n.en.json';
import inputsFR from 'ui/inputs/i18n/inputs.i18n.fr.json';
import sandboxEN from 'ui/ResultCard/Sandbox/sandbox.i18n.en.json';
import sandboxFR from 'ui/ResultCard/Sandbox/sandbox.i18n.fr.json';

export const I18N_RESSOURCES = {
  en: {
    adminActions: adminActionsEN,
    adminAPIkeys: adminAPIkeysEN,
    adminErrorViewer: adminErrorViewerEN,
    adminIdentify: adminIdentifyEN,
    adminServiceReview: adminServiceReviewEN,
    adminServices: adminServicesEN,
    adminSiteMap: adminSiteMapEN,
    adminTagSafelist: adminTagSafelistEN,
    adminUsers: adminUsersEN,
    alerts: alertsEN,
    api: apiEN,
    app: appEN,
    archive: archivesEN,
    assistant: assistantEN,
    authorize: authorizeEN,
    borealis: borealisEN,
    carousel: carouselEN,
    dashboard: dashboardEN,
    dateTime: dateTimeEN,
    developmentAPI: developmentAPIEN,
    drawer: drawerEN,
    error: errorEN,
    error403: forbiddenEN,
    error404: notFoundEN,
    externalLookup: externalLookupEN,
    favorites: favoritesEN,
    fileDetail: fileDetailEN,
    fileViewer: fileViewerEN,
    helpAPI: helpAPIEN,
    helpClassification: helpClassificationEN,
    helpConfiguration: helpConfigurationEN,
    helpSearch: helpSearchEN,
    helpServices: helpServicesEN,
    hexViewer: hexViewerEN,
    inputs: inputsEN,
    locked: lockedEN,
    login: loginEN,
    logout: logoutEN,
    manageBadlistAdd: manageBadlistAddEN,
    manageBadlistDetail: manageBadlistDetailEN,
    manageBadlists: manageBadlistsEN,
    manageHeuristicDetail: manageHeuristicDetailEN,
    manageHeuristics: manageHeuristicsEN,
    manageSafelistAdd: manageSafelistAddEN,
    manageSafelistDetail: manageSafelistDetailEN,
    manageSafelists: manageSafelistsEN,
    manageSignatureDetail: manageSignatureDetailEN,
    manageSignatures: manageSignaturesEN,
    manageSignatureSources: manageSignatureSourcesEN,
    manageWorkflowDetail: manageWorkflowDetailEN,
    manageWorkflows: manageWorkflowsEN,
    missingNode: missingNodeEN,
    notifications: notificationsEN,
    quota: quotaEN,
    retrohunt: retrohuntEN,
    router: routerEN,
    sandbox: sandboxEN,
    search: searchEN,
    settings: settingsEN,
    statisticsHeuristics: statisticsHeuristicsEN,
    statisticsSignatures: statisticsSignaturesEN,
    submissionDetail: submissionDetailEN,
    submissionReport: submissionReportEN,
    submissions: submissionsEN,
    submit: submitEN,
    tos: tosEN,
    user: userEN
  },
  fr: {
    adminActions: adminActionsFR,
    adminAPIkeys: adminAPIkeysFR,
    adminErrorViewer: adminErrorViewerFR,
    adminIdentify: adminIdentifyFR,
    adminServiceReview: adminServiceReviewFR,
    adminServices: adminServicesFR,
    adminSiteMap: adminSiteMapFR,
    adminTagSafelist: adminTagSafelistFR,
    adminUsers: adminUsersFR,
    alerts: alertsFR,
    api: apiFR,
    app: appFR,
    archive: archivesFR,
    assistant: assistantFR,
    authorize: authorizeFR,
    borealis: borealisFR,
    carousel: carouselFR,
    dashboard: dashboardFR,
    dateTime: dateTimeFR,
    developmentAPI: developmentAPIFR,
    drawer: drawerFR,
    error: errorFR,
    error403: forbiddenFR,
    error404: notFoundFR,
    externalLookup: externalLookupFR,
    favorites: favoritesFR,
    fileDetail: fileDetailFR,
    fileViewer: fileViewerFR,
    helpAPI: helpAPIFR,
    helpClassification: helpClassificationFR,
    helpConfiguration: helpConfigurationFR,
    helpSearch: helpSearchFR,
    helpServices: helpServicesFR,
    hexViewer: hexViewerFR,
    inputs: inputsFR,
    locked: lockedFR,
    login: loginFR,
    logout: logoutFR,
    manageBadlistAdd: manageBadlistAddFR,
    manageBadlistDetail: manageBadlistDetailFR,
    manageBadlists: manageBadlistsFR,
    manageHeuristicDetail: manageHeuristicDetailFR,
    manageHeuristics: manageHeuristicsFR,
    manageSafelistAdd: manageSafelistAddFR,
    manageSafelistDetail: manageSafelistDetailFR,
    manageSafelists: manageSafelistsFR,
    manageSignatureDetail: manageSignatureDetailFR,
    manageSignatures: manageSignaturesFR,
    manageSignatureSources: manageSignatureSourcesFR,
    manageWorkflowDetail: manageWorkflowDetailFR,
    manageWorkflows: manageWorkflowsFR,
    missingNode: missingNodeFR,
    notifications: notificationsFR,
    quota: quotaFR,
    retrohunt: retrohuntFR,
    router: routerFR,
    sandbox: sandboxFR,
    search: searchFR,
    settings: settingsFR,
    statisticsHeuristics: statisticsHeuristicsFR,
    statisticsSignatures: statisticsSignaturesFR,
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
