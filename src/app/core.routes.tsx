import { CrashRoute } from 'core/error/error.route';
import { LockedRoute } from 'layout/auth/locked/locked.route';
import { QuotaRoute } from 'layout/auth/quota/quota.route';
import { ToSRoute } from 'layout/auth/terms-of-service/terms-of-service.route';
import { AccountRoute } from 'routes/account/account.route';
import { AdminAPIKeyDetailRoute } from 'routes/admin-api-key-detail/admin-api-key-detail.route';
import { AdminAPIKeysRoute } from 'routes/admin-api-keys/admin-api-keys.route';
import { AdminErrorDetailRoute } from 'routes/admin-error-detail/admin-error-detail.route';
import { AdminErrorViewerRoute } from 'routes/admin-error-viewer/admin-error-viewer.route';
import { AlertDetailRoute } from 'routes/alert-detail/alert-detail.route';
import { AlertRedirectRoute } from 'routes/alert-redirect/alert-redirect.route';
import { AlertsRoute } from 'routes/alerts/alerts.route';
import { DashboardRoute } from 'routes/dashboard/dashboard.route';
import { DevelopmentAPIRoute } from 'routes/development-api/development-api.route';
import { DevelopmentCustomizeRoute } from 'routes/development-customize/development-customize.route';
import { DevelopmentLibraryRoute } from 'routes/development-library/development-library.route';
import { DevelopmentThemeRoute } from 'routes/development-theme/development-theme.route';
import { FileDetailRoute } from 'routes/file-detail/file-detail.route';
import { FileViewerRootRoute, FileViewerRoute } from 'routes/file-viewer/file-viewer.route';
import { DisabledRoute, ForbiddenRoute } from 'routes/forbidden/forbidden.route';
import { HelpAPIRoute } from 'routes/help-api/help-api.route';
import { HelpClassificationRoute } from 'routes/help-classification/help-classification.route';
import { HelpConfigurationRoute } from 'routes/help-configuration/help-configuration.route';
import { HelpSearchRoute } from 'routes/help-search/help-search.route';
import { HelpServicesRoute } from 'routes/help-services/help-services.route';
import { MissingNodeRoute } from 'routes/missing-node/missing-node.route';
import { NotFoundRoute } from 'routes/not-found/not-found.route';
import { SearchRootRoute, SearchRoute } from 'routes/search/search.route';
import { SettingsRootRoute, SettingsRoute } from 'routes/settings/settings.route';
import { SubmissionDetailRoute } from 'routes/submission-detail/submission-detail.route';
import { SubmissionRedirectRoute } from 'routes/submission-redirect/submission-redirect.route';
import { SubmissionReportRoute } from 'routes/submission-report/submission-report.route';
import { SubmissionsRoute } from 'routes/submissions/submissions.route';
import { SubmitRoute } from 'routes/submit/submit.route';
import { UserRoute } from 'routes/user/user.route';

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
  AdminAPIKeyDetailRoute,
  AdminAPIKeysRoute,
  AdminErrorDetailRoute,
  AdminErrorViewerRoute,
  AlertDetailRoute,
  AlertRedirectRoute,
  AlertsRoute,
  DashboardRoute,
  DevelopmentAPIRoute,
  DevelopmentCustomizeRoute,
  DevelopmentLibraryRoute,
  DevelopmentThemeRoute,
  DisabledRoute,
  CrashRoute,
  FileDetailRoute,
  FileViewerRootRoute,
  FileViewerRoute,
  ForbiddenRoute,
  HelpAPIRoute,
  HelpClassificationRoute,
  HelpConfigurationRoute,
  HelpSearchRoute,
  HelpServicesRoute,
  LockedRoute,
  MissingNodeRoute,
  NotFoundRoute,
  QuotaRoute,
  SearchRootRoute,
  SearchRoute,
  SettingsRootRoute,
  SettingsRoute,
  SubmissionDetailRoute,
  SubmissionRedirectRoute,
  SubmissionReportRoute,
  SubmissionsRoute,
  SubmitRoute,
  ToSRoute,
  UserRoute
] as const;

declare global {
  type AppRoutes = typeof APP_ROUTES;
  type AppRoute = AppRoutes[number];
}
