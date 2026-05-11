import type { APP_ROUTES } from 'app/app.routes';
import type { createAppRoute } from 'core/routes/routes.factories';
import type { PathParamKeyForPath } from 'features/path-params';
import type { SearchParamBlueprintMap, SearchParamEngine, SearchParamValueMap } from 'features/search-params';

//*****************************************************************************************
// Create Route Types
//*****************************************************************************************

/** Route path string pattern. */
export type RoutePath = string;

/** Route hash value. */
export type RouteHash = string | undefined;

/** Route metadata for breadcrumbs and page titles. */
export type RouteMeta = {
  /** Breadcrumb text or generator function. */
  breadcrumb?: string | ((params: unknown) => string);
  /** Page title. */
  title?: string;
};

//*****************************************************************************************
// App Routes
//*****************************************************************************************

/** Union of all registered application routes. */
export type AppRoute = (typeof APP_ROUTES)[number];

//*****************************************************************************************
// App Route Location
//*****************************************************************************************

/** Resolved route location for navigation. */
export type AppRouteLocation = {
  /** Full href string. */
  href: string;
  /** Navigation state payload. */
  state?: unknown;
};

//*****************************************************************************************
// Created Routes
//*****************************************************************************************

/** Return type of createAppRoute factory. */
export type CreatedAppRoute = ReturnType<typeof createAppRoute>;

/** Readonly array of created routes. */
export type CreatedAppRoutes = readonly CreatedAppRoute[];

type CreatedAppRouteSearchValuesMap<Route extends CreatedAppRoute = CreatedAppRoute> =
  NonNullable<Route['search']> extends SearchParamEngine<infer BlueprintMap extends SearchParamBlueprintMap>
    ? SearchParamBlueprintMap extends BlueprintMap
      ? never
      : SearchParamValueMap<BlueprintMap>
    : never;

// prettier-ignore
/** Maps route params, search, and hash to a typed navigation params object. */
export type CreatedAppRouteParamsMap<AppRoute extends CreatedAppRoute = CreatedAppRoute> =
  AppRoute extends infer Route
    ? Route extends AppRoute
      ? (
          & {
              path: Route['path']
              hash?: string
            }
          & (
              [PathParamKeyForPath<Route['path']>] extends [never]
                ? { params?: never }
                : { params: NonNullable<Route['params']>['type'] }
            )
          & (
              [CreatedAppRouteSearchValuesMap<Route>] extends [never]
                ? { search?: never }
                : { search?:  Partial<CreatedAppRouteSearchValuesMap<Route>> }
            )
          & (
              | { variant?: 'open'; panel?: never }
              | { variant?: 'replace'; panel?: never }
              | { variant?: 'to'; panel: number }
          )
        )
      : never
    : never;

//*****************************************************************************************
// Other
//*****************************************************************************************

/** Result of a route guard check. */
export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;
