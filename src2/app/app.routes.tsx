import ForbiddenRoute from 'pages/forbidden/forbidden.route';
import LoadingRoute from 'pages/loading/loading.route';
import LockedRoute from 'pages/locked/locked.route';
import LoginRoute from 'pages/log-in/log-in.route';
import NotFoundRoute from 'pages/not-found/not-found.route';
import Page1Route from 'pages/Page1';
import Page2Route from 'pages/Page2';
import QuotaRoute from 'pages/quota/quota.route';
import SubmissionsRoute from 'pages/Submissions';
import SubmitRoute from 'pages/Submit';
import ToSRoute from 'pages/terms-of-service/terms-of-service.route';

export const APP_ROUTES = [
  SubmitRoute,
  Page1Route,
  Page2Route,
  SubmissionsRoute,
  ForbiddenRoute,
  LoadingRoute,
  LockedRoute,
  LoginRoute,
  NotFoundRoute,
  QuotaRoute,
  ToSRoute
] as const;

export type AppRoute = (typeof APP_ROUTES)[number] | '/';
