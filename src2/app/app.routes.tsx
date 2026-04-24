import { RouteParamsMap } from 'core/router';
import { HelpAPIRoute } from 'pages/help/api/help-api.route';
import Page1Route from 'pages/Page1';
import Page2Route from 'pages/Page2';
import { SubmissionsRoute } from 'pages/Submissions';
import SubmitRoute from 'pages/Submit';

export const APP_ROUTES = [
  // Old
  SubmitRoute,
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
  HelpAPIRoute
] as const;

export type AppRoute = (typeof APP_ROUTES)[number];

export type AppRouteLink = RouteParamsMap<AppRoute>;
