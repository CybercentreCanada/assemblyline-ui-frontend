export const APP_ROUTES = [
  // SubmitRoute,
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
] as const;

export type AppRoute = (typeof APP_ROUTES)[number] | '/';
