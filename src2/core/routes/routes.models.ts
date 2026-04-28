import { APP_ROUTES } from 'app/app.routes';
import { PathParamKeyForPath } from 'features/path-params';
import { SearchParamBlueprintMap, SearchParamEngine, SearchParamValueMap } from 'features/search-params';
import { createAppRoute } from './routes.factories';

//*****************************************************************************************
// Create Route Types
//*****************************************************************************************

export type RoutePath = string;

export type RouteHash = string | undefined;

export type RouteMeta = {
  title?: string;
  breadcrumb?: string | ((params: any) => string);
};

//*****************************************************************************************
// App Routes
//*****************************************************************************************

export type AppRoute = (typeof APP_ROUTES)[number];

//*****************************************************************************************
// App Route Location
//*****************************************************************************************
export type AppRouteLocation = {
  href: string;
  state?: any;
};

//*****************************************************************************************
// Created Routes
//*****************************************************************************************

export type CreatedAppRoute = ReturnType<typeof createAppRoute>;

export type CreatedAppRoutes = readonly CreatedAppRoute[];

type CreatedAppRouteSearchValuesMap<Route extends CreatedAppRoute = CreatedAppRoute> =
  NonNullable<Route['search']> extends SearchParamEngine<infer BlueprintMap extends SearchParamBlueprintMap>
    ? SearchParamBlueprintMap extends BlueprintMap
      ? never
      : SearchParamValueMap<BlueprintMap>
    : never;

// prettier-ignore
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

export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;
