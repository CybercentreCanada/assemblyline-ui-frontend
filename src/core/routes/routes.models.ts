import { type InferPathParamKeyFromPath } from 'features/path-params';
import type { InferSearchParamKeysFromEngine, InferSearchParamValueMapFromEngine } from 'features/search-params';

//*****************************************************************************************
// Create Route Types
//*****************************************************************************************

/** Result of a route guard check. */
export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;

//*****************************************************************************************
// App Route
//*****************************************************************************************

/** Infers the registered app route definition that matches a specific path literal. */
export type InferAppRouteFromPath<Origin extends AppRoute['path']> = {
  [R in AppRoute as R['path']]: R;
}[Origin];

/** Infers the typed search-value object accepted by a route's search engine for a specific path. */
export type InferAppRouteSearchValuesFromPath<Origin extends AppRoute['path']> = [
  InferSearchParamKeysFromEngine<InferAppRouteFromPath<Origin>['search']>
] extends [never]
  ? never
  : InferSearchParamValueMapFromEngine<InferAppRouteFromPath<Origin>['search']>;

export type InferAppRouteHashFromPath<Origin extends AppRoute['path']> =
  NonNullable<InferAppRouteFromPath<Origin>['hash']> extends { type: infer Hash } ? Hash | null : never;

//*****************************************************************************************
// App Route Param
//*****************************************************************************************

/** Snapshot of pre-calculated route values resolved from the current location state. */
// prettier-ignore
export type InferAppLocationFromPath<Origin extends AppRoute['path']> = {
  /** router route digest value */
  digest: string;
  /** Route path */
  route: Origin;
  /** Parsed path params derived from the current location. */
  path: [InferPathParamKeyFromPath<Origin>] extends [never]
            ? null
            : NonNullable<InferAppRouteFromPath<Origin>['params']>['type'];
  /** Parsed search params derived from the current location. */
  search: [InferSearchParamKeysFromEngine<InferAppRouteFromPath<Origin>['search']>] extends [never]
            ? null
            : InferSearchParamValueMapFromEngine<InferAppRouteFromPath<Origin>['search']>;
  /** Parsed hash value derived from the current location. */
  hash: InferAppRouteHashFromPath<Origin>;
};

//*****************************************************************************************
// App Route Values
//*****************************************************************************************

/** Infers the full typed route-value payload for a specific path literal. */
// prettier-ignore
export type InferAppRouteParamFromPath<Origin extends AppRoute['path']> =
  Origin extends infer AppOrigin
    ? AppOrigin extends AppRoute['path']
      ? (
        & {
            route: AppOrigin;
          }
        & (
            [InferPathParamKeyFromPath<Origin>] extends [never]
              ? { path?: never }
              : { path: NonNullable<InferAppRouteFromPath<Origin>['params']>['type'] }
          )
        & (
            [InferSearchParamKeysFromEngine<InferAppRouteFromPath<Origin>["search"]>] extends [never]
              ? { search?: never }
              : { search?:  InferSearchParamValueMapFromEngine<InferAppRouteFromPath<Origin>["search"]> }
          )
        & (
            [InferAppRouteHashFromPath<Origin>] extends [never]
              ? { hash?: never }
              : { hash?: InferAppRouteHashFromPath<Origin> }
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
  routes: Record<AppRoute['path'], AppRoute>;
  /** Parsed snapshots keyed by router page key for currently active pages (latest params/search/hash). */
  locations: Record<string, InferAppLocationFromPath<AppRoute['path']>>;
};
