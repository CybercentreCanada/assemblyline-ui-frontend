import { HelpAPIRoute } from 'pages/help/api/help-api.route';
import { Page1Route } from 'pages/Page1';
import { Page2Route } from 'pages/Page2';
import { SettingsRoute } from 'pages/settings/settings.route';
import { SubmissionsRoute } from 'pages/Submissions';
import { SubmissionsSearchRoute } from 'pages/submissions/submissions.route';
import { SubmitRoute } from 'pages/submit/submit.route';

export const APP_ROUTES = [
  // Old

  Page1Route,
  Page2Route,
  SubmissionsRoute,
  // ForbiddenRoute,
  // LoadingRoute,
  // LockedRoute,
  // LoginRoute,
  // NotFoundRoute,
  // QuotaRoute,
  // ToSRoute

  // New
  HelpAPIRoute,
  SubmitRoute,
  SettingsRoute,
  SubmissionsSearchRoute
] as const;
