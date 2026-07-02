import type { createAppRoute } from 'core/routes/routes.factories';
import type {
  InferPathParamBlueprintMapFromPath,
  InferPathParamKeyFromPath,
  InferPathParamValuesFromBlueprintMap
} from 'features/path-params';
import type {
  InferSearchParamKeysFromEngine,
  InferSearchParamSnapshotFromEngine,
  InferSearchParamValueMapFromBlueprintMap,
  InferSearchParamValueMapFromEngine,
  SearchParamBlueprintMap,
  SearchParamEngine
} from 'features/search-params';
import type { SetStateAction } from 'react';

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

/** Result of a route guard check. */
export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;

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

/** Infers the registered app route definition that matches a specific path literal. */
export type InferAppRouteFromPath<Path extends AppRoute['path']> = Extract<AppRoute, { path: Path }>;

/** Infers the typed search-value object accepted by a route's search engine for a specific path. */
export type InferAppRouteSearchValuesFromPath<Path extends AppRoute['path']> =
  NonNullable<InferAppRouteFromPath<Path>['search']> extends SearchParamEngine<
    infer Blueprints extends SearchParamBlueprintMap
  >
    ? SearchParamBlueprintMap extends Blueprints
      ? never
      : InferSearchParamValueMapFromBlueprintMap<Blueprints>
    : never;

/** Infers the full typed route-value payload for a specific registered app route. */
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

/** Infers the full typed route-value payload for a specific path literal. */
// prettier-ignore
export type InferAppRouteValuesFromPath<Path extends AppRoute["path"]> =
  Path extends infer AppPath
    ? AppPath extends AppRoute["path"]
      ? (
        & {
            path: Path;

            // TODO: fix
            hash?: string
          }
        & (
            [InferPathParamKeyFromPath<Path>] extends [never]
              ? { params?: never }
              : { params: NonNullable<InferAppRouteFromPath<Path>['params']>['type'] }
          )
        & (
            [InferSearchParamKeysFromEngine<InferAppRouteFromPath<Path>["search"]>] extends [never]
              ? { search?: never }
              : { search?:  InferSearchParamValueMapFromEngine<InferAppRouteFromPath<Path>["search"]> }
          )
        )
      : never
    : never

/** Infers the parsed path-param value shape exposed for a specific path literal. */
export type InferPathParamValueFromPath<Path extends AppRoute['path'] = AppRoute['path']> =
  InferAppRouteFromPath<Path>['params'] extends {
    blueprints: infer Blueprints;
  }
    ? Blueprints extends InferPathParamBlueprintMapFromPath<Path>
      ? InferPathParamValuesFromBlueprintMap<Blueprints>
      : InferLocationSnapshotFromPath<Path>['params']
    : InferLocationSnapshotFromPath<Path>['params'];

/** Infers the parsed search-param snapshot shape exposed for a specific path literal. */
export type InferSearchParamValueFromPath<Path extends AppRoute['path'] = AppRoute['path']> =
  Exclude<InferAppRouteFromPath<Path>['search'], undefined> extends never
    ? InferLocationSnapshotFromPath<Path>['search']
    : InferSearchParamSnapshotFromEngine<Exclude<InferAppRouteFromPath<Path>['search'], undefined>>;

/** Infers the parsed hash value exposed for a specific path literal. */
export type InferHashParamValueFromPath<Path extends AppRoute['path'] = AppRoute['path']> =
  Exclude<InferAppRouteFromPath<Path>['hash'], undefined> extends never
    ? InferLocationSnapshotFromPath<Path>['hash']
    : Exclude<InferAppRouteFromPath<Path>['hash'], undefined>;

//*****************************************************************************************
// Navigation Intent
//*****************************************************************************************

/** Route transition intents accepted by router link helpers. */
export type InferNavigationMapFromPath<Path extends AppRoute['path']> = {
  /** Opens a route, typically in the next panel. */
  openRoute: SetStateAction<InferAppRouteValuesFromPath<Path>>;
  /** Replaces the current route values. */
  replaceRoute: SetStateAction<InferAppRouteValuesFromPath<Path>>;
  /** Replaces only route search values using typed objects. */
  replaceSearchObject: SetStateAction<InferAppRouteSearchValuesFromPath<Path>>;
  /** Replaces only route search values using URLSearchParams. */
  replaceURLSearchParams: SetStateAction<URLSearchParams>;
  /** Closes the selected panel */
  closePanel: number;
};

/** Single-key object form for AppLinkTo transitions. */
export type InferNavigationValueFromPath<Path extends AppRoute['path']> = {
  [K in keyof InferNavigationMapFromPath<Path>]: Record<K, InferNavigationMapFromPath<Path>[K]>;
}[keyof InferNavigationMapFromPath<Path>];

/** Tuple form `[key, value]` of the AppLinkTo transition union. */
export type InferNavigationTupleFromPath<Path extends AppRoute['path']> =
  InferNavigationMapFromPath<Path> extends infer T
    ? T extends Record<PropertyKey, unknown>
      ? { [K in keyof T]-?: [K, T[K]] }[keyof T]
      : never
    : never;

//*****************************************************************************************
// App Location Store
//*****************************************************************************************

/** Snapshot of pre-calculated route values resolved from the current location state. */
// prettier-ignore
export type InferLocationSnapshotFromPath<Path extends AppRoute['path']> = {
  /** Stable location signature built from href and state. */
  id: string;
  /** Matched app route definition for this snapshot. */
  appRoute: InferAppRouteFromPath<Path> ;
  /** Parsed path params derived from the current location. */
  params: [InferPathParamKeyFromPath<Path>] extends [never]
            ? null
            : NonNullable<InferAppRouteFromPath<Path>['params']>['type'];
  /** Parsed search snapshot derived from the current location. */
  search: [InferSearchParamKeysFromEngine<InferAppRouteFromPath<Path>['search']>] extends [never]
            ? null
            : InferSearchParamSnapshotFromEngine<InferAppRouteFromPath<Path>['search']>;
  /** Parsed hash value derived from the current location. */
  hash: string
};

/** Default empty location snapshot for a route entry. */
export const DEFAULT_APP_LOCATION_SNAPSHOT: InferLocationSnapshotFromPath<AppRoute['path']> = {
  id: '',
  appRoute: null,
  params: null,
  search: null,
  hash: null
};

/** Store containing route-keyed location snapshots for all open routes. */
export type AppLocationStore = Record<string, InferLocationSnapshotFromPath<AppRoute['path']>>;
