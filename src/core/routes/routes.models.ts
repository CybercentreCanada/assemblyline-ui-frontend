import type { createAppRoute } from 'core/routes';
import { type InferPathParamKeyFromPath } from 'features/path-params';
import type { InferSearchParamKeysFromEngine, InferSearchParamValueMapFromEngine } from 'features/search-params';

//*****************************************************************************************
// Create Route Types
//*****************************************************************************************

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

/** Infers the typed search-value object accepted by a route's search engine for a specific path. */
export type InferAppRouteSearchValuesFromPath<Origin extends AppRoute['route']> = [
  InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Origin>['search']>
] extends [never]
  ? never
  : InferSearchParamValueMapFromEngine<InferAppRouteSpecFromPath<Origin>['search']>;

export type InferAppRouteHashFromPath<Origin extends AppRoute['route']> =
  NonNullable<InferAppRouteSpecFromPath<Origin>['hash']> extends { type: infer Hash } ? Hash | null : never;

export type InferAppRouteStateFromPath<Origin extends AppRoute['route']> =
  NonNullable<InferAppRouteSpecFromPath<Origin>['state']> extends { type: infer State } ? State : never;

export type InferAppRouteTransientFromPath<Origin extends AppRoute['route']> =
  NonNullable<InferAppRouteSpecFromPath<Origin>['transient']> extends { type: infer Temp } ? Temp : never;

//*****************************************************************************************
// App Route Param
//*****************************************************************************************

/** Snapshot of pre-calculated route values resolved from the current location state. */
// prettier-ignore
export type InferAppRouteParamFromPath<Origin extends AppRoute['route']> = {
  /** router route digest value */
  digest: string;
  /** Route path */
  route: Origin;
  /** Parsed path params derived from the current location. */
  path: [InferPathParamKeyFromPath<Origin>] extends [never]
            ? null
            : NonNullable<InferAppRouteSpecFromPath<Origin>['path']>['type'];
  /** Parsed search params derived from the current location. */
  search: [InferSearchParamKeysFromEngine<InferAppRouteSpecFromPath<Origin>['search']>] extends [never]
            ? null
            : InferSearchParamValueMapFromEngine<InferAppRouteSpecFromPath<Origin>['search']>;
  /** Parsed hash value derived from the current location. */
  hash: InferAppRouteHashFromPath<Origin>;
  /** Parsed route state derived from the current location state and route defaults. */
  state: InferAppRouteStateFromPath<Origin>;
  /** Parsed transient data derived from route defaults and in-memory navigation values. */
  transient: InferAppRouteTransientFromPath<Origin>;

};

//*****************************************************************************************
// App Route Values
//*****************************************************************************************

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
            [InferAppRouteHashFromPath<Origin>] extends [never]
              ? { hash?: never }
              : { hash?: InferAppRouteHashFromPath<Origin> }
          )
        & (
            [InferAppRouteStateFromPath<Origin>] extends [never]
              ? { state?: never }
              : { state?: Partial<InferAppRouteStateFromPath<Origin>> }
          )
        & (
            [InferAppRouteTransientFromPath<Origin>] extends [never]
              ? { transient?: never }
              : { transient?: Partial<InferAppRouteTransientFromPath<Origin>> }
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
