import { AccountRoute } from 'pages/account/account.route';
import { AlertDetailRoute } from 'pages/alert-detail/alert-detail.route';
import { AlertsRedirectRoute } from 'pages/alerts-redirect/alerts-redirect.route';
import { AlertsRoute } from 'pages/alerts/alerts.route';
import { DevelopmentAPIRoute } from 'pages/development-api/development-api.route';
import { DevelopmentCustomizeRoute } from 'pages/development-customize/development-customize.route';
import { DevelopmentLibraryRoute } from 'pages/development-library/development-library.route';
import { DevelopmentThemeRoute } from 'pages/development-theme/development-theme.route';
import { FileDetailRoute } from 'pages/file-detail/file-detail.route';
import { FileViewerRootRoute, FileViewerRoute } from 'pages/file-viewer/file-viewer.route';
import { HelpAPIRoute } from 'pages/help-api/help-api.route';
import { HelpClassificationRoute } from 'pages/help-classification/help-classification.route';
import { HelpConfigurationRoute } from 'pages/help-configuration/help-configuration.route';
import { SearchRootRoute, SearchRoute } from 'pages/search/search.route';
import { SettingsRootRoute, SettingsRoute } from 'pages/settings/settings.route';
import { SubmissionDetailRoute } from 'pages/submission-detail/submission-detail.route';
import { SubmissionRedirectRoute } from 'pages/submission-redirect/submission-redirect.route';
import { SubmissionReportRoute } from 'pages/submission-report/submission-report.route';
import { SubmissionsRoute } from 'pages/submissions/submissions.route';
import { SubmitRoute } from 'pages/submit/submit.route';
import { UserRoute } from 'pages/user/user.route';

export const APP_ROUTES = [
  // Old

  // Page1Route,
  // Page2Route,
  // SubmissionsRoute,
  // ForbiddenRoute,
  // LoadingRoute,
  // LockedRoute,
  // LoginRoute,
  // NotFoundRoute,
  // QuotaRoute,
  // ToSRoute

  // New
  AccountRoute,
  AlertDetailRoute,
  AlertsRedirectRoute,
  AlertsRoute,
  DevelopmentAPIRoute,
  DevelopmentCustomizeRoute,
  DevelopmentLibraryRoute,
  DevelopmentThemeRoute,
  FileDetailRoute,
  FileViewerRootRoute,
  FileViewerRoute,
  HelpAPIRoute,
  HelpClassificationRoute,
  HelpConfigurationRoute,
  SearchRootRoute,
  SearchRoute,
  SettingsRootRoute,
  SettingsRoute,
  SubmissionDetailRoute,
  SubmissionRedirectRoute,
  SubmissionReportRoute,
  SubmissionsRoute,
  SubmitRoute,
  UserRoute
] as const;

declare global {
  type AppRoutes = typeof APP_ROUTES;
  type AppRoute = AppRoutes[number];
}
