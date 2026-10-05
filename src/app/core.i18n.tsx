import clueEN from '@cccsaurora/clue-ui/en/translation.json';
import clueFR from '@cccsaurora/clue-ui/fr/translation.json';
import developmentAPIEN from 'routes/development-api/development-api.i18n.en.json';
import developmentAPIFR from 'routes/development-api/development-api.i18n.fr.json';
import settingsEN from 'routes/settings/settings.i18n.en.json';
import settingsFR from 'routes/settings/settings.i18n.fr.json';
import submitEN from 'routes/submit/submit.i18n.en.json';
import submitFR from 'routes/submit/submit.i18n.fr.json';
import dateTimeEN from 'ui/DateTime/datetime.i18n.en.json';
import dateTimeFR from 'ui/DateTime/datetime.i18n.fr.json';
import inputsEN from 'ui/inputs/i18n/inputs.i18n.en.json';
import inputsFR from 'ui/inputs/i18n/inputs.i18n.fr.json';
import sandboxResultEN from 'ui/ResultCard/Sandbox/sandbox.i18n.en.json';
import sandboxResultFR from 'ui/ResultCard/Sandbox/sandbox.i18n.fr.json';
import { default as i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import error403EN from 'deprecated/legacy/locales/en/403.json';
import error404EN from 'deprecated/legacy/locales/en/404.json';
import adminActionsEN from 'routes/admin-actions/admin-actions.i18n.en.json';
import adminAPIkeysEN from 'routes/admin-api-keys/admin-api-keys.i18n.en.json';
import adminCommunityServicesEN from 'deprecated/legacy/locales/en/admin/community_services.json';
import adminErrorViewerEN from 'routes/admin-error-viewer/admin-error-viewer.i18n.en.json';
import adminIdentifyEN from 'routes/admin-identify/admin-identify.i18n.en.json';
import adminServiceReviewEN from 'routes/admin-service-review/admin-service-review.i18n.en.json';
import adminServicesEN from 'routes/admin-services/admin-services.i18n.en.json';
import adminSiteMapEN from 'routes/admin-sitemap/admin-sitemap.i18n.en.json';
import adminTagSafelistEN from 'routes/admin-tag-safelist/admin-tag-safelist.i18n.en.json';
import adminUsersEN from 'routes/admin-users/admin-users.i18n.en.json';
import alertsEN from 'routes/alerts/alerts.i18n.en.json';
import archiveEN from 'routes/archives/archives.i18n.en.json';
import assistantEN from 'layout/assistant/assistant.i18n.en.json';
import authorizeEN from 'routes/authorize/authorize.i18n.en.json';
import carouselEN from 'layout/carousel/carousel.i18n.en.json';
import dashboardEN from 'routes/dashboard/dashboard.i18n.en.json';
import favoritesEN from 'routes/alerts/components/favorites.i18n.en.json';
import fileDetailEN from 'routes/file-detail/file-detail.i18n.en.json';
import hexViewerEN from 'ui/HexViewer/hex-viewer.i18n.en.json';
import fileViewerEN from 'routes/file-viewer/file-viewer.i18n.en.json';
import helpAPIEN from 'routes/help-api/help-api.i18n.en.json';
import helpClassificationEN from 'routes/help-classification/help-classification.i18n.en.json';
import helpConfigurationEN from 'routes/help-configuration/help-configuration.i18n.en.json';
import helpSearchEN from 'routes/help-search/help-search.i18n.en.json';
import helpServicesEN from 'routes/help-services/help-services.i18n.en.json';
import lockedEN from 'layout/auth/locked/locked.i18n.en.json';
import loginEN from 'layout/auth/log-in/log-in.i18n.en.json';
import logoutEN from 'layout/auth/log-out/log-out.i18n.en.json';
import manageBadlistEN from 'routes/manage-badlists/manage-badlists.i18n.en.json';
import manageBadlistAddEN from 'routes/manage-badlist-add/manage-badlist-add.i18n.en.json';
import manageBadlistDetailEN from 'routes/manage-badlist-detail/manage-badlist-detail.i18n.en.json';
import manageHeuristicDetailEN from 'routes/manage-heuristic-detail/manage-heuristic-detail.i18n.en.json';
import manageHeuristicsEN from 'routes/manage-heuristics/manage-heuristics.i18n.en.json';
import manageSafelistEN from 'routes/manage-safelists/manage-safelists.i18n.en.json';
import manageSafelistAddEN from 'routes/manage-safelist-add/manage-safelist-add.i18n.en.json';
import manageSafelistDetailEN from 'routes/manage-safelist-detail/manage-safelist-detail.i18n.en.json';
import manageSignatureDetailEN from 'routes/manage-signature-detail/manage-signature-detail.i18n.en.json';
import manageSignatureSourcesEN from 'routes/manage-signature-sources/manage-signature-sources.i18n.en.json';
import manageSignaturesEN from 'routes/manage-signatures/manage-signatures.i18n.en.json';
import manageWorkflowDetailEN from 'routes/manage-workflow-detail/manage-workflow-detail.i18n.en.json';
import manageWorkflowsEN from 'routes/manage-workflows/manage-workflows.i18n.en.json';
import notificationEN from 'layout/notifications/notifications.i18n.en.json';
import retrohuntEN from 'routes/retrohunt/retrohunt.i18n.en.json';
import searchEN from 'routes/search/search.i18n.en.json';
import statisticsHeuristicsEN from 'routes/statistics-heuristics/statistics-heuristics.i18n.en.json';
import statisticsSignaturesEN from 'routes/statistics-signatures/statistics-signatures.i18n.en.json';
import submissionDetailEN from 'routes/submission-detail/submission-detail.i18n.en.json';
import submissionReportEN from 'routes/submission-report/submission-report.i18n.en.json';
import submissionsEN from 'routes/submissions/submissions.i18n.en.json';
import tosEN from 'layout/auth/terms-of-service/terms-of-service.i18n.en.json';
import translationEN from 'app/core.i18n.en.json';
import userEN from 'routes/user/user.i18n.en.json';
import error403FR from 'deprecated/legacy/locales/fr/403.json';
import error404FR from 'deprecated/legacy/locales/fr/404.json';
import adminActionsFR from 'routes/admin-actions/admin-actions.i18n.fr.json';
import adminAPIkeysFR from 'routes/admin-api-keys/admin-api-keys.i18n.fr.json';
import adminCommunityServicesFR from 'deprecated/legacy/locales/fr/admin/community_services.json';
import adminErrorViewerFR from 'routes/admin-error-viewer/admin-error-viewer.i18n.fr.json';
import adminIdentifyFR from 'routes/admin-identify/admin-identify.i18n.fr.json';
import adminServiceReviewFR from 'routes/admin-service-review/admin-service-review.i18n.fr.json';
import adminServicesFR from 'routes/admin-services/admin-services.i18n.fr.json';
import adminSiteMapFR from 'routes/admin-sitemap/admin-sitemap.i18n.fr.json';
import adminTagSafelistFR from 'routes/admin-tag-safelist/admin-tag-safelist.i18n.fr.json';
import adminUsersFR from 'routes/admin-users/admin-users.i18n.fr.json';
import alertsFR from 'routes/alerts/alerts.i18n.fr.json';
import archiveFR from 'routes/archives/archives.i18n.fr.json';
import assistantFR from 'layout/assistant/assistant.i18n.fr.json';
import authorizeFR from 'routes/authorize/authorize.i18n.fr.json';
import carouselFR from 'layout/carousel/carousel.i18n.fr.json';
import dashboardFR from 'routes/dashboard/dashboard.i18n.fr.json';
import favoritesFR from 'routes/alerts/components/favorites.i18n.fr.json';
import fileDetailFR from 'routes/file-detail/file-detail.i18n.fr.json';
import hexViewerFR from 'ui/HexViewer/hex-viewer.i18n.fr.json';
import fileViewerFR from 'routes/file-viewer/file-viewer.i18n.fr.json';
import helpAPIFR from 'routes/help-api/help-api.i18n.fr.json';
import helpClassificationFR from 'routes/help-classification/help-classification.i18n.fr.json';
import helpConfigurationFR from 'routes/help-configuration/help-configuration.i18n.fr.json';
import helpSearchFR from 'routes/help-search/help-search.i18n.fr.json';
import helpServicesFR from 'routes/help-services/help-services.i18n.fr.json';
import lockedFR from 'layout/auth/locked/locked.i18n.fr.json';
import loginFR from 'layout/auth/log-in/log-in.i18n.fr.json';
import logoutFR from 'layout/auth/log-out/log-out.i18n.fr.json';
import manageBadlistFR from 'routes/manage-badlists/manage-badlists.i18n.fr.json';
import manageBadlistAddFR from 'routes/manage-badlist-add/manage-badlist-add.i18n.fr.json';
import manageBadlistDetailFR from 'routes/manage-badlist-detail/manage-badlist-detail.i18n.fr.json';
import manageHeuristicDetailFR from 'routes/manage-heuristic-detail/manage-heuristic-detail.i18n.fr.json';
import manageHeuristicsFR from 'routes/manage-heuristics/manage-heuristics.i18n.fr.json';
import manageSafelistFR from 'routes/manage-safelists/manage-safelists.i18n.fr.json';
import manageSafelistAddFR from 'routes/manage-safelist-add/manage-safelist-add.i18n.fr.json';
import manageSafelistDetailFR from 'routes/manage-safelist-detail/manage-safelist-detail.i18n.fr.json';
import manageSignatureDetailFR from 'routes/manage-signature-detail/manage-signature-detail.i18n.fr.json';
import manageSignatureSourcesFR from 'routes/manage-signature-sources/manage-signature-sources.i18n.fr.json';
import manageSignaturesFR from 'routes/manage-signatures/manage-signatures.i18n.fr.json';
import manageWorkflowDetailFR from 'routes/manage-workflow-detail/manage-workflow-detail.i18n.fr.json';
import manageWorkflowsFR from 'routes/manage-workflows/manage-workflows.i18n.fr.json';
import notificationFR from 'layout/notifications/notifications.i18n.fr.json';
import retrohuntFR from 'routes/retrohunt/retrohunt.i18n.fr.json';
import searchFR from 'routes/search/search.i18n.fr.json';
import statisticsHeuristicsFR from 'routes/statistics-heuristics/statistics-heuristics.i18n.fr.json';
import statisticsSignaturesFR from 'routes/statistics-signatures/statistics-signatures.i18n.fr.json';
import submissionDetailFR from 'routes/submission-detail/submission-detail.i18n.fr.json';
import submissionReportFR from 'routes/submission-report/submission-report.i18n.fr.json';
import submissionsFR from 'routes/submissions/submissions.i18n.fr.json';
import tosFR from 'layout/auth/terms-of-service/terms-of-service.i18n.fr.json';
import translationFR from 'app/core.i18n.fr.json';
import userFR from 'routes/user/user.i18n.fr.json';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    adminActions: adminActionsEN,
    adminAPIkeys: adminAPIkeysEN,
    adminCommunityServices: adminCommunityServicesEN,
    adminErrorViewer: adminErrorViewerEN,
    adminIdentify: adminIdentifyEN,
    adminServiceReview: adminServiceReviewEN,
    adminServices: adminServicesEN,
    adminSiteMap: adminSiteMapEN,
    adminTagSafelist: adminTagSafelistEN,
    adminUsers: adminUsersEN,
    alerts: alertsEN,
    archive: archiveEN,
    assistant: assistantEN,
    authorize: authorizeEN,
    carousel: carouselEN,
    clue: clueEN,
    dashboard: dashboardEN,
    dateTime: dateTimeEN,
    developmentAPI: developmentAPIEN,
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
    inputs: inputsEN,
    locked: lockedEN,
    login: loginEN,
    logout: logoutEN,
    manageBadlist: manageBadlistEN,
    manageBadlistAdd: manageBadlistAddEN,
    manageBadlistDetail: manageBadlistDetailEN,
    manageHeuristicDetail: manageHeuristicDetailEN,
    manageHeuristics: manageHeuristicsEN,
    manageSafelist: manageSafelistEN,
    manageSafelistAdd: manageSafelistAddEN,
    manageSafelistDetail: manageSafelistDetailEN,
    manageSignatureDetail: manageSignatureDetailEN,
    manageSignatures: manageSignaturesEN,
    manageSignatureSources: manageSignatureSourcesEN,
    manageWorkflowDetail: manageWorkflowDetailEN,
    manageWorkflows: manageWorkflowsEN,
    notification: notificationEN,
    retrohunt: retrohuntEN,
    sandboxResult: sandboxResultEN,
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
    adminAPIkeys: adminAPIkeysFR,
    adminCommunityServices: adminCommunityServicesFR,
    adminErrorViewer: adminErrorViewerFR,
    adminIdentify: adminIdentifyFR,
    adminServiceReview: adminServiceReviewFR,
    adminServices: adminServicesFR,
    adminSiteMap: adminSiteMapFR,
    adminTagSafelist: adminTagSafelistFR,
    adminUsers: adminUsersFR,
    alerts: alertsFR,
    archive: archiveFR,
    assistant: assistantFR,
    authorize: authorizeFR,
    carousel: carouselFR,
    clue: clueFR,
    dashboard: dashboardFR,
    dateTime: dateTimeFR,
    developmentAPI: developmentAPIFR,
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
    inputs: inputsFR,
    locked: lockedFR,
    login: loginFR,
    logout: logoutFR,
    manageBadlist: manageBadlistFR,
    manageBadlistAdd: manageBadlistAddFR,
    manageBadlistDetail: manageBadlistDetailFR,
    manageHeuristicDetail: manageHeuristicDetailFR,
    manageHeuristics: manageHeuristicsFR,
    manageSafelist: manageSafelistFR,
    manageSafelistAdd: manageSafelistAddFR,
    manageSafelistDetail: manageSafelistDetailFR,
    manageSignatureDetail: manageSignatureDetailFR,
    manageSignatures: manageSignaturesFR,
    manageSignatureSources: manageSignatureSourcesFR,
    manageWorkflowDetail: manageWorkflowDetailFR,
    manageWorkflows: manageWorkflowsFR,
    notification: notificationFR,
    retrohunt: retrohuntFR,
    sandboxResult: sandboxResultFR,
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

void i18n
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
