import { SearchParamBlueprints } from 'core/search-params/lib/search_params.model';
import { PathParamBlueprintMap } from '../path-params/path-params.models';

//*****************************************************************************************
// Create Route Types
//*****************************************************************************************

export type CreateRoutePath = string;

export type CreateRouteParams<Path extends CreateRoutePath> = PathParamBlueprintMap<Path> | undefined;

export type CreateRouteSearch = SearchParamBlueprints | undefined;

export type CreateRouteHash = string | undefined;

export type CreateRouteMeta = {
  title?: string;
  breadcrumb?: string | ((params: any) => string);
};

//*****************************************************************************************
// Created Routes Routes
//*****************************************************************************************

export type RoutePath = string;

export type RouteParams<Path extends RoutePath> = CreateRouteParams<Path>;

export type RouteSearch<Path extends RoutePath> = CreateRouteSearch;

export type RouteHash<Path extends RoutePath> = CreateRouteHash;

export type RouteStore = {};

//*****************************************************************************************
// Other
//*****************************************************************************************

export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;
