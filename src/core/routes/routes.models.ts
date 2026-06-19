import type { createAppRoute } from 'core/routes/routes.factories';
import type { InferPathParamKeyFromPath } from 'features/path-params';
import type {
  InferSearchParamKeysFromEngine,
  InferSearchParamValueMapFromBlueprintMap,
  InferSearchParamValueMapFromEngine,
  SearchParamBlueprintMap,
  SearchParamEngine
} from 'features/search-params';

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
// export type AppRoute = (typeof APP_ROUTES)[number];

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

//*****************************************************************************************
// App Route Values
//*****************************************************************************************

type RouteByPath<Path extends AppRoute['path']> = Extract<AppRoute, { path: Path }>;

export type InferAppRouteSearchValuesFromPath<Path extends AppRoute['path']> =
  NonNullable<RouteByPath<Path>['search']> extends SearchParamEngine<infer Blueprints extends SearchParamBlueprintMap>
    ? SearchParamBlueprintMap extends Blueprints
      ? never
      : InferSearchParamValueMapFromBlueprintMap<Blueprints>
    : never;

// prettier-ignore
export type InferAppRouteValuesFromRoute<R extends AppRoute> =
  R extends infer Route
    ? Route extends AppRoute
      ? (
        & {
            path: Route['path'];

            // TODO: fix
            hash?: string
          }
        & (
            [InferPathParamKeyFromPath<Route['path']>] extends [never]
              ? { params?: never }
              : { params: NonNullable<Route['params']>['type'] }
          )
        & (
            [InferSearchParamKeysFromEngine<Route["search"]>] extends [never]
              ? { search?: never }
              : { search?:  InferSearchParamValueMapFromEngine<Route["search"]> }
          )
        )
      : never
    : never

// prettier-ignore
export type InferAppRouteValuesFromPath<R extends AppRoute> =
  R extends infer Route
    ? Route extends AppRoute
      ? (
        & {
            path: Route['path'];

            // TODO: fix
            hash?: string
          }
        & (
            [InferPathParamKeyFromPath<Route['path']>] extends [never]
              ? { params?: never }
              : { params: NonNullable<Route['params']>['type'] }
          )
        & (
            [InferSearchParamKeysFromEngine<Route["search"]>] extends [never]
              ? { search?: never }
              : { search?:  InferSearchParamValueMapFromEngine<Route["search"]> }
          )
        )
      : never
    : never

/** Result of a route guard check. */
export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;
