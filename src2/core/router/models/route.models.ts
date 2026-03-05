import { AppRoute } from 'app/app.routes';
import { SearchParamBlueprints } from 'core/search-params/lib/search_params.model';
import { PathParamBlueprintMap } from './params.models';

//**************************************************************
// Create Route Types
//**************************************************************

export type CreateRoutePath = string;

export type CreateRouteParams<Path extends CreateRoutePath> = PathParamBlueprintMap<Path> | undefined;

export type CreateRouteSearch = SearchParamBlueprints | undefined;

export type CreateRouteHash = string | undefined;

export type CreateRouteMeta = {
  title?: string;
  breadcrumb?: string | ((params: any) => string);
};

//**************************************************************
// Created Routes Routes
//**************************************************************

export type RoutePath = AppRoute['path'];

export type RouteParams<Path extends RoutePath> = Extract<AppRoute, { path: Path }>['params'];

export type RouteSearch<Path extends RoutePath> = Extract<AppRoute, { path: Path }>['search'];

export type RouteHash<Path extends RoutePath> = Extract<AppRoute, { path: Path }>['hash'];

export type RouteStore = {};

//*****************************************************************************************
// Other
//*****************************************************************************************

export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;
