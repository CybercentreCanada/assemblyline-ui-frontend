import { ReactNode } from 'react';
import type { LinkProps } from 'react-router';
import { PathParamKeyForPath } from '../path-params/path-params.models';
import { createAppRoute } from '../route/route.utils';
import { SearchParamEngine } from '../search-params/lib/search-params.engine';
import type { SearchParamBlueprintMap, SearchParamValueMap } from '../search-params/lib/search-params.model';

export type AppRouteLink2 = {
  children?: ReactNode;
  hash?: string;
  onClick?: LinkProps['onClick'];
  params?: Record<string, string | number | boolean>;
  path: string;
  search?: string;
} & ({ variant?: 'open'; panel?: never } | { variant?: 'replace'; panel?: never } | { variant?: 'to'; panel: number });

type RouteSearchValueMap2<Route extends ReturnType<typeof createAppRoute>> =
  NonNullable<Route['search']> extends SearchParamEngine<infer BlueprintMap extends SearchParamBlueprintMap>
    ? SearchParamValueMap<BlueprintMap>
    : never;

type RouteSearchProps2<Route extends ReturnType<typeof createAppRoute>> = [RouteSearchValueMap2<Route>] extends [never]
  ? { search?: never }
  : { search?: Partial<RouteSearchValueMap2<Route>> };

// prettier-ignore
export type AppRouteLink =
  ReturnType<typeof createAppRoute> extends infer Route
    ? Route extends ReturnType<typeof createAppRoute>
      ? (
          & {
              children?: ReactNode;
              hash?: string;
              onClick?: LinkProps['onClick'];
            }
          & { path: Route['path'] }
          & (
              [PathParamKeyForPath<Route['path']>] extends [never]
                ? { params?: never }
                : { params: NonNullable<Route['params']>['type'] }
            )
          & (
              RouteSearchProps2<Route>
            )
          // & (
          //     [PathParamKeyForPath<Route['path']>] extends [never]
          //       ? { search?: never }
          //       : { search: NonNullable<Route['search']> }
          //   )`
          // & (
          //     [PathParamKeyForPath<Route['path']>] extends [never]
          //       ? { hash?: never }
          //       : { hash: NonNullable<Route['hash']>}
          //   )
          & (
              | { variant?: 'open', panel?: never }
              | { variant?: 'replace', panel?: never }
              | { variant?: 'to', panel: number }
            )
        )
      : never
    : never;

type RouteSearchValueMap<Route extends ReturnType<typeof createAppRoute> = ReturnType<typeof createAppRoute>> =
  NonNullable<Route['search']> extends SearchParamEngine<infer BlueprintMap extends SearchParamBlueprintMap>
    ? SearchParamBlueprintMap extends BlueprintMap
      ? never
      : SearchParamValueMap<BlueprintMap>
    : never;

// prettier-ignore
export type RouteParamsMap<AppRoute extends ReturnType<typeof createAppRoute> = ReturnType<typeof createAppRoute>> =
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
              [RouteSearchValueMap<Route>] extends [never]
                ? { search?: never }
                : { search?:  Partial<RouteSearchValueMap<Route>> }
            )
          &
            (
              | { variant?: 'open'; panel?: never }
              | { variant?: 'replace'; panel?: never }
              | { variant?: 'to'; panel: number }
            )
        )
      : never
    : never;

export type AppRouteTo = Omit<AppRouteLink, 'children' | 'onClick' | 'variant' | 'panel'>;
export type AppNavigateToValue = LinkProps['to'] | AppRouteTo | AppRouteLink2;
export type AppNavigateToInput = AppNavigateToValue | (() => AppNavigateToValue) | null | undefined;

export type NavigateTo2<AppRoute extends ReturnType<typeof createAppRoute>> =
  | RouteParamsMap<AppRoute>
  | (() => RouteParamsMap<AppRoute>);
