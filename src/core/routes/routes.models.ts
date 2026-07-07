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
// App Route Definition
//*****************************************************************************************

export type AppRouteDefinition = ReturnType<typeof createAppRoute>;

export const DEFAULT_APP_ROUTE_DEFINITION: AppRouteDefinition = {
  path: null,
  params: createPathParamsCodec(null)(() => null),
  search: new SearchParamEngine<SearchParamBlueprintMap>(null),
  hash: s => s,
  element: null
};

/** Infers the registered app route definition that matches a specific path literal. */
export type InferAppRouteDefinitionFromPath<Path extends AppRoute['path']> = {
  [R in AppRoute as R['path']]: R;
}[Path];

//*****************************************************************************************
// App Route Snapshot
//*****************************************************************************************

/** Snapshot of pre-calculated route values resolved from the current location state. */
// prettier-ignore
export type InferAppRouteSnapshotFromPath<Path extends AppRoute['path']> = {
  /** Stable location signature built from href and state. */
  id: string ;

  path: Path;
  /** Parsed path params derived from the current location. */
  params: [InferPathParamKeyFromPath<Path>] extends [never]
            ? null
            : NonNullable<InferAppRouteDefinitionFromPath<Path>['params']>['type'];
  /** Parsed search snapshot derived from the current location. */
  search: [InferSearchParamKeysFromEngine<InferAppRouteDefinitionFromPath<Path>['search']>] extends [never]
            ? null
            : InferSearchParamSnapshotFromEngine<InferAppRouteDefinitionFromPath<Path>['search']>;
  /** Parsed hash value derived from the current location. */
  hash: string
};

/** Default empty location snapshot for a route entry. */
export const DEFAULT_APP_ROUTE_SNAPSHOT: InferAppRouteSnapshotFromPath<AppRoute['path']> = {
  id: '',
  path: null,
  params: null,
  search: null,
  hash: ''
};

//*****************************************************************************************
// App Route Values
//*****************************************************************************************

/** Infers the typed search-value object accepted by a route's search engine for a specific path. */
export type InferAppRouteSearchValuesFromPath<Path extends AppRoute['path']> = [
  InferSearchParamKeysFromEngine<InferAppRouteDefinitionFromPath<Path>['search']>
] extends [never]
  ? never
  : InferSearchParamValueMapFromEngine<InferAppRouteDefinitionFromPath<Path>['search']>;

/** Infers the full typed route-value payload for a specific path literal. */
// prettier-ignore
export type InferAppRouteValuesFromPath<Path extends AppRoute["path"]> =
  Path extends infer AppPath
    ? AppPath extends AppRoute["path"]
      ? (
        & {
            path: AppPath;

            // TODO: fix
            hash?: string
          }
        & (
            [InferPathParamKeyFromPath<Path>] extends [never]
              ? { params?: never }
              : { params: NonNullable<InferAppRouteDefinitionFromPath<Path>['params']>['type'] }
          )
        & (
            [InferSearchParamKeysFromEngine<InferAppRouteDefinitionFromPath<Path>["search"]>] extends [never]
              ? { search?: never }
              : { search?:  InferSearchParamValueMapFromEngine<InferAppRouteDefinitionFromPath<Path>["search"]> }
          )
        )
      : never
    : never

export const DEFAULT_APP_ROUTE_VALUES: InferAppRouteValuesFromPath<AppRoute['path']> = {
  path: null,
  params: null,
  search: null,
  hash: null
};

//*****************************************************************************************
// App Location Store
//*****************************************************************************************

/** Store containing route-keyed location snapshots for all open routes. */
export type AppLocationStore = {
  /** Full application route registry keyed by route path (canonical known routes, not only active ones). */
  definitions: Record<AppRoute['path'], AppRoute>;

  /** Parsed snapshots keyed by router route key for currently active routes (latest params/search/hash). */
  snapshots: Record<string, InferAppRouteSnapshotFromPath<AppRoute['path']>>;
};
