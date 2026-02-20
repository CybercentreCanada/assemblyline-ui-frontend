import { createSearchParams } from 'core/search-params/createSearchParams';
import { PARAM_BLUEPRINTS } from 'core/search-params/lib/search_params.blueprint';
import type { SearchParamBlueprints } from 'core/search-params/lib/search_params.model';
import React, { createContext, useContext, useMemo } from 'react';
import type { ParamsBlueprintsForPath, ParamsParser, PathParamKeys } from '../models/router.models';
import { createParamsParser, PARAM_PARSERS } from '../utils/router.utils';

//*****************************************************************************************
// Context
//*****************************************************************************************

export type RouteContextProps<Path extends string, Search extends SearchParamBlueprints, Hash extends string> = {
  path?: string;
  params?: ParamsParser;
  search?: SearchParamBlueprints;
  hash?: string;
};

const RouteContext = createContext<RouteContextProps<string, {}, string> | null>(null);

//*****************************************************************************************
// Provider
//*****************************************************************************************

export type RouteParamsProp<Path extends string> = [PathParamKeys<Path>] extends [never]
  ? { params?: undefined }
  : { params?: (parsers: typeof PARAM_PARSERS) => ParamsBlueprintsForPath<Path> };

export type RouteProviderProps<Path extends string, Search extends SearchParamBlueprints, Hash extends string> = {
  children: React.ReactNode;
  path?: Path;
  search?: (blueprints: typeof PARAM_BLUEPRINTS) => Search;
  hash?: Hash;
} & RouteParamsProp<Path>;

export const RouteProvider = React.memo(
  <Path extends string, Search extends SearchParamBlueprints, Hash extends string>({
    children,
    path,
    params,
    search,
    hash
  }: RouteProviderProps<Path, Search, Hash>) => {
    const paramsParser = useMemo(() => (params ? createParamsParser(params) : undefined), [params]);

    const searchParser = useMemo(() => (search ? createSearchParams(search) : undefined), [search]);

    const value = useMemo<RouteContextProps<Path, Search, Hash>>(
      () => ({ path, params: paramsParser, search: searchParser, hash }),
      [path, paramsParser, searchParser, hash]
    );

    return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
  }
);

//*****************************************************************************************
// Hook
//*****************************************************************************************
export const useRoute = () => {
  const context = useContext(RouteContext);

  if (!context) {
    throw new Error('useRoute must be used inside RouteProvider');
  }

  return context;
};
