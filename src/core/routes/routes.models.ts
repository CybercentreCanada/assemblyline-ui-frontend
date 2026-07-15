import type { createAppRoute } from 'core/routes';
import { createPathParamsCodec, type InferPathParamKeyFromPath } from 'features/path-params';
import type {
  InferSearchParamKeysFromEngine,
  InferSearchParamSnapshotFromEngine,
  InferSearchParamValueMapFromEngine,
  SearchParamBlueprintMap
} from 'features/search-params';
import { SearchParamEngine } from 'features/search-params';

//*****************************************************************************************
// Create Route Types
//*****************************************************************************************

/** Route hash value. */
export type RouteHash = string | undefined;

/** Route metadata for breadcrumbs and page titles. */
export type RouteMeta = {
  /** Page title. */
  title?: string;
  /** Breadcrumb text or generator function. */
  breadcrumb?: string | ((params: unknown) => string);
};

/** Result of a route guard check. */
export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;

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

export const DEFAULT_APP_ROUTE_LOCATION: AppRouteLocation = { href: '', state: null };

//*****************************************************************************************
// App Route Spec
//*****************************************************************************************

export type AppRouteSpec = ReturnType<typeof createAppRoute>;

export const DEFAULT_APP_ROUTE_SPEC: AppRouteSpec = {
  route: null,
  path: createPathParamsCodec(null)(() => null),
  search: new SearchParamEngine<SearchParamBlueprintMap>(null),
  hash: s => s,
  element: null
};

/** Infers the registered app route definition that matches a specific path literal. */
export type InferAppRouteSpecFromPath<Path extends AppRoute['route']> = {
  [R in AppRoute as R['route']]: R;
}[Path];

//*****************************************************************************************
// App Route Location
//*****************************************************************************************

/** Snapshot of pre-calculated route values resolved from the current location state. */
// prettier-ignore
export type InferAppLocationParamFromPath<Path extends AppRoute['route']> = {
  /** Stable location signature built from href and state. */
  id: string ;

  route: Path;
  /** Parsed path params derived from the current location. */
  path: [InferPathParamKeyFromPath<Path>] extends [never]
            ? null
            : NonNullable<InferAppRouteSpecFromPath<Path>['path']>['type'];
  /** Parsed search snapshot derived from the current location. */
  search: [InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Path>['search']>] extends [never]
            ? null
            : InferSearchParamSnapshotFromEngine<InferAppRouteSpecFromPath<Path>['search']>;
  /** Parsed hash value derived from the current location. */
  hash: string
};

/** Default empty location snapshot for a route entry. */
export const DEFAULT_APP_ROUTE_SNAPSHOT: InferAppLocationParamFromPath<AppRoute['route']> = {
  id: '',
  route: null,
  path: null,
  search: null,
  hash: ''
};

//*****************************************************************************************
// App Route Values
//*****************************************************************************************

/** Infers the typed search-value object accepted by a route's search engine for a specific path. */
export type InferAppRouteSearchValuesFromPath<Path extends AppRoute['route']> = [
  InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Path>['search']>
] extends [never]
  ? never
  : InferSearchParamValueMapFromEngine<InferAppRouteSpecFromPath<Path>['search']>;

/** Infers the full typed route-value payload for a specific path literal. */
// prettier-ignore
export type InferAppRouteValuesFromPath<Path extends AppRoute['route']> =
  Path extends infer AppPath
    ? AppPath extends AppRoute['route']
      ? (
        & {
            route: AppPath;

            // TODO: fix
            hash?: string
          }
        & (
            [InferPathParamKeyFromPath<Path>] extends [never]
              ? { path?: never }
              : { path: NonNullable<InferAppRouteSpecFromPath<Path>['path']>['type'] }
          )
        & (
            [InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Path>["search"]>] extends [never]
              ? { search?: never }
              : { search?:  InferSearchParamValueMapFromEngine<InferAppRouteSpecFromPath<Path>["search"]> }
          )
        )
      : never
    : never

//*****************************************************************************************
// App Route Locations
//*****************************************************************************************

/** Store containing route-keyed location snapshots for all open routes. */
export type AppLocationParamStore = {
  /** Full application route registry keyed by route path (canonical known routes, not only active ones). */
  specs: Record<AppRoute['route'], AppRoute>;
  /** Parsed snapshots keyed by router route key for currently active routes (latest params/search/hash). */
  locations: Record<string, InferAppLocationParamFromPath<AppRoute['route']>>;
};
