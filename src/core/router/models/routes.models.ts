import type { InferPathParamKeyFromPath } from 'features/path-params';
import type { InferSearchParamKeysFromEngine, InferSearchParamValueMapFromEngine } from 'features/search-params';
import type { TOptions } from 'i18next';

//*****************************************************************************************
// App Name
//*****************************************************************************************

/** Arguments accepted by i18next's `t` function when resolving a route label. */
export type RouteName = readonly [
  /** Translation key or fallback keys. */
  key: string | string[],
  /** Optional i18next interpolation, namespace, and display options. */
  options?: TOptions
];

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
