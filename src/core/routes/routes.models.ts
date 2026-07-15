import type { createAppRoute } from 'core/routes';
import { type InferPathParamKeyFromPath } from 'features/path-params';
import type {
  InferSearchParamKeysFromEngine,
  InferSearchParamSnapshotFromEngine,
  InferSearchParamValueMapFromEngine
} from 'features/search-params';

//*****************************************************************************************
// Create Route Types
//*****************************************************************************************

/** Route hash value. */
export type RouteHash = string | undefined;

/** Result of a route guard check. */
export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;

//*****************************************************************************************
// App Route Spec
//*****************************************************************************************

export type AppRouteSpec = ReturnType<typeof createAppRoute>;

/** Infers the registered app route definition that matches a specific path literal. */
export type InferAppRouteSpecFromPath<Origin extends AppRoute['route']> = {
  [R in AppRoute as R['route']]: R;
}[Origin];

//*****************************************************************************************
// App Route Param
//*****************************************************************************************

/** Snapshot of pre-calculated route values resolved from the current location state. */
// prettier-ignore
export type InferAppRouteParamFromPath<Origin extends AppRoute['route']> = {
  /** Stable location signature built from href and state. */
  id: string;

  route: Origin;
  /** Parsed path params derived from the current location. */
  path: [InferPathParamKeyFromPath<Origin>] extends [never]
            ? null
            : NonNullable<InferAppRouteSpecFromPath<Origin>['path']>['type'];
  /** Parsed search snapshot derived from the current location. */
  search: [InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Origin>['search']>] extends [never]
            ? null
            : InferSearchParamSnapshotFromEngine<InferAppRouteSpecFromPath<Origin>['search']>;
  /** Parsed hash value derived from the current location. */
  hash: string
};

//*****************************************************************************************
// App Route Values
//*****************************************************************************************

/** Infers the typed search-value object accepted by a route's search engine for a specific path. */
export type InferAppRouteSearchValuesFromPath<Origin extends AppRoute['route']> = [
  InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Origin>['search']>
] extends [never]
  ? never
  : InferSearchParamValueMapFromEngine<InferAppRouteSpecFromPath<Origin>['search']>;

/** Infers the full typed route-value payload for a specific path literal. */
// prettier-ignore
export type InferAppRouteValuesFromPath<Origin extends AppRoute['route']> =
  Origin extends infer AppOrigin
    ? AppOrigin extends AppRoute['route']
      ? (
        & {
            route: AppOrigin;
          }
        & (
            [InferPathParamKeyFromPath<Origin>] extends [never]
              ? { path?: never }
              : { path: NonNullable<InferAppRouteSpecFromPath<Origin>['path']>['type'] }
          )
        & (
            [InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Origin>["search"]>] extends [never]
              ? { search?: never }
              : { search?:  InferSearchParamValueMapFromEngine<InferAppRouteSpecFromPath<Origin>["search"]> }
          )
        & (
            [InferAppRouteSpecFromPath<Origin>["hash"]] extends [never]
              ? { hash?: never }
              : { hash?: string }
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
  params: Record<string, InferAppRouteParamFromPath<AppRoute['route']>>;
};
