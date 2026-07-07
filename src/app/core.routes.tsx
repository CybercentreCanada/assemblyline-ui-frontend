import { AccountRoute } from 'pages/account/account.route';
import { FileDetailRoute } from 'pages/file-detail/file-detail.route';
import { HelpAPIRoute } from 'pages/help/api/help-api.route';
import { Page1Route } from 'pages/Page1';
import { Page2Route } from 'pages/Page2';
import { SearchRoute } from 'pages/search/search.route';
import { SettingsRootRoute, SettingsRoute } from 'pages/settings/settings.route';
import { SubmissionDetailRoute, SubmissionFileDetailRoute } from 'pages/submission-detail/submission-detail.route';
import { SubmissionRedirectRoute } from 'pages/submission-redirect/submission-redirect.route';
import { SubmissionReportRoute } from 'pages/submission-report/submission-report.route';
import { SubmissionsRoute } from 'pages/submissions/submissions.route';
import { SubmitRoute } from 'pages/submit/submit.route';
import { UserRoute } from 'pages/user/user.route';

export const APP_ROUTES = [
  // Old

  Page1Route,
  Page2Route,
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
  FileDetailRoute,
  HelpAPIRoute,
  SearchRoute,
  SettingsRootRoute,
  SettingsRoute,
  SubmissionDetailRoute,
  SubmissionFileDetailRoute,
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
