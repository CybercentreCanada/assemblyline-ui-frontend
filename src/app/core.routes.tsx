import { CrashRoute } from 'core/error/error.route';
import { LockedRoute } from 'layout/auth/locked/locked.route';
import { QuotaRoute } from 'layout/auth/quota/quota.route';
import { ToSRoute } from 'layout/auth/terms-of-service/terms-of-service.route';
import { AdminActionsRoute } from 'routes/admin-actions/admin-actions.route';
import { AdminAPIKeyDetailRoute } from 'routes/admin-api-key-detail/admin-api-key-detail.route';
import { AdminAPIKeysRoute } from 'routes/admin-api-keys/admin-api-keys.route';
import { AdminErrorDetailRoute } from 'routes/admin-error-detail/admin-error-detail.route';
import { AdminErrorViewerRoute } from 'routes/admin-error-viewer/admin-error-viewer.route';
import { AdminIdentifyRoute } from 'routes/admin-identify/admin-identify.route';
import { AdminServiceDetailRoute } from 'routes/admin-service-detail/admin-service-detail.route';
import { AdminServiceReviewRoute } from 'routes/admin-service-review/admin-service-review.route';
import { AdminServicesRoute } from 'routes/admin-services/admin-services.route';
import { AdminSitemapRoute } from 'routes/admin-sitemap/admin-sitemap.route';
import { AdminTagSafelistRoute } from 'routes/admin-tag-safelist/admin-tag-safelist.route';
import { AdminUsersRoute } from 'routes/admin-users/admin-users.route';
import { AdminRoute } from 'routes/admin/admin.route';
import { AlertDetailRoute } from 'routes/alert-detail/alert-detail.route';
import { AlertRedirectRoute } from 'routes/alert-redirect/alert-redirect.route';
import { AlertsRoute } from 'routes/alerts/alerts.route';
import { ArchiveDetailRootRoute, ArchiveDetailRoute } from 'routes/archive-detail/archive-detail.route';
import { ArchivesRoute } from 'routes/archives/archives.route';
import { AuthorizeRoute } from 'routes/authorize/authorize.route';
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
import { HelpRoute } from 'routes/help/help.route';
import { ManageBadlistAddRoute } from 'routes/manage-badlist-add/manage-badlist-add.route';
import { ManageBadlistDetailRoute } from 'routes/manage-badlist-detail/manage-badlist-detail.route';
import { ManageBadlistsRoute } from 'routes/manage-badlists/manage-badlists.route';
import { ManageHeuristicDetailRoute } from 'routes/manage-heuristic-detail/manage-heuristic-detail.route';
import { ManageHeuristicsRoute } from 'routes/manage-heuristics/manage-heuristics.route';
import { ManageSafelistAddRoute } from 'routes/manage-safelist-add/manage-safelist-add.route';
import { ManageSafelistDetailRoute } from 'routes/manage-safelist-detail/manage-safelist-detail.route';
import { ManageSafelistsRoute } from 'routes/manage-safelists/manage-safelists.route';
import {
  ManageSignatureDetailRoute,
  ManageSignatureDetailRoute2
} from 'routes/manage-signature-detail/manage-signature-detail.route';
import { ManageSignatureSourceDetailRoute } from 'routes/manage-signature-source-detail/manage-signature-source-detail.route';
import { ManageSignatureSourcesRoute } from 'routes/manage-signature-sources/manage-signature-sources.route';
import { ManageSignaturesRoute } from 'routes/manage-signatures/manage-signatures.route';
import {
  ManageWorkflowCreateRootRoute,
  ManageWorkflowCreateRoute
} from 'routes/manage-workflow-create/manage-workflow-create.route';
import { ManageWorkflowDetailRoute } from 'routes/manage-workflow-detail/manage-workflow-detail.route';
import { ManageWorkflowsRoute } from 'routes/manage-workflows/manage-workflows.route';
import { ManageRoute } from 'routes/manage/manage.route';
import { MissingNodeRoute } from 'routes/missing-node/missing-node.route';
import { NotFoundRoute } from 'routes/not-found/not-found.route';
import { RetrohuntCreateRoute } from 'routes/retrohunt-create/retrohunt-create.route';
import { RetrohuntDetailRoute } from 'routes/retrohunt-detail/retrohunt-detail.route';
import { RetrohuntRoute } from 'routes/retrohunt/retrohunt.route';
import { SearchRootRoute, SearchRoute } from 'routes/search/search.route';
import { SettingsRootRoute, SettingsRoute } from 'routes/settings/settings.route';
import { StatisticsHeuristicsRoute } from 'routes/statistics-heuristics/statistics-heuristics.route';
import { StatisticsSignaturesRoute } from 'routes/statistics-signatures/statistics-signatures.route';
import { SubmissionDetailRoute } from 'routes/submission-detail/submission-detail.route';
import { SubmissionRedirectRoute } from 'routes/submission-redirect/submission-redirect.route';
import { SubmissionReportRoute } from 'routes/submission-report/submission-report.route';
import { SubmissionsRoute } from 'routes/submissions/submissions.route';
import { SubmitRoute } from 'routes/submit/submit.route';
import { AccountRoute, AdminUserDetailRoute } from 'routes/user/user.route';

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
  AdminActionsRoute,
  AdminAPIKeyDetailRoute,
  AdminAPIKeysRoute,
  AdminErrorDetailRoute,
  AdminErrorViewerRoute,
  AdminIdentifyRoute,
  AdminRoute,
  AdminServiceDetailRoute,
  AdminServiceReviewRoute,
  AdminServicesRoute,
  AdminSitemapRoute,
  AdminTagSafelistRoute,
  AdminUserDetailRoute,
  AdminUsersRoute,
  AlertDetailRoute,
  AlertRedirectRoute,
  AlertsRoute,
  ArchiveDetailRoute,
  ArchiveDetailRootRoute,
  ArchivesRoute,
  AuthorizeRoute,
  CrashRoute,
  DashboardRoute,
  DevelopmentAPIRoute,
  DevelopmentCustomizeRoute,
  DevelopmentLibraryRoute,
  DevelopmentThemeRoute,
  DisabledRoute,
  FileDetailRoute,
  FileViewerRootRoute,
  FileViewerRoute,
  ForbiddenRoute,
  HelpAPIRoute,
  HelpClassificationRoute,
  HelpConfigurationRoute,
  HelpRoute,
  HelpSearchRoute,
  HelpServicesRoute,
  LockedRoute,
  ManageBadlistAddRoute,
  ManageBadlistDetailRoute,
  ManageBadlistsRoute,
  ManageHeuristicDetailRoute,
  ManageHeuristicsRoute,
  ManageRoute,
  ManageSafelistAddRoute,
  ManageSafelistDetailRoute,
  ManageSafelistsRoute,
  ManageSignatureDetailRoute,
  ManageSignatureDetailRoute2,
  ManageSignatureSourceDetailRoute,
  ManageSignatureSourcesRoute,
  ManageSignaturesRoute,
  ManageWorkflowCreateRootRoute,
  ManageWorkflowCreateRoute,
  ManageWorkflowDetailRoute,
  ManageWorkflowsRoute,
  MissingNodeRoute,
  NotFoundRoute,
  QuotaRoute,
  RetrohuntCreateRoute,
  RetrohuntDetailRoute,
  RetrohuntRoute,
  SearchRootRoute,
  SearchRoute,
  SettingsRootRoute,
  SettingsRoute,
  StatisticsHeuristicsRoute,
  StatisticsSignaturesRoute,
  SubmissionDetailRoute,
  SubmissionRedirectRoute,
  SubmissionReportRoute,
  SubmissionsRoute,
  SubmitRoute,
  ToSRoute
] as const;

declare global {
  type AppRoutes = typeof APP_ROUTES;
  type AppRoute = AppRoutes[number];
}
