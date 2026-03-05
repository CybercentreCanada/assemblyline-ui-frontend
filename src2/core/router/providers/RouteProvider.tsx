import { createStoreContext } from 'core/store/createStoreContext';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router';
import { PathParamBlueprintMap, PathParamCodec, RoutePath } from '../models/params.models';
import { CreateRouteHash, CreateRouteSearch } from '../models/route.models';

const SEARCH_PARAM_BLUEPRINTS = null;

//*****************************************************************************************
// Context
//*****************************************************************************************

export type RouteStore<
  Path extends RoutePath = RoutePath,
  Params extends PathParamCodec = any,
  Search extends CreateRouteSearch = any,
  Hash extends CreateRouteHash = any
> = {
  params: Params;
  // search: Route['search'];
  // hash: Route['hash'];
};

const createDefaultRouteStore = <
  Path extends RoutePath,
  Params extends PathParamCodec,
  Search extends CreateRouteSearch,
  Hash extends CreateRouteHash
>(): RouteStore<Path, Params, Search, Hash> => ({
  params: null
  // search: {},
  // hash: null
});

export const { StoreProvider: RouteStoreProvider, useStore: useRouteStore } =
  createStoreContext<RouteStore>(createDefaultRouteStore());

export type RouteProviderProps<
  Path extends RoutePath,
  Params extends PathParamBlueprintMap<Path>,
  Search extends CreateRouteSearch,
  Hash extends CreateRouteHash
> = {
  children: React.ReactNode;
  params?: PathParamCodec<Params>;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS) => Search;
  hash?: (hash: Location['hash']) => Hash;
};

export const RouteProvider = React.memo(
  <
    const Path extends RoutePath,
    const Params extends PathParamBlueprintMap<Path>,
    const Search extends CreateRouteSearch,
    const Hash extends CreateRouteHash
  >({
    children,
    params,
    search,
    hash
  }: RouteProviderProps<Path, Params, Search, Hash>) => {
    const location = useLocation();

    const reset = useCallback(
      () => ({
        params: params ? params.parse(location) : undefined
        // search: search.parse(location),
        // hash: hashParser(location)
      }),
      [location]
    );

    return <RouteStoreProvider data={reset}>{children}</RouteStoreProvider>;
  }
);

RouteProvider.displayName = 'RouteProvider';

// //*****************************************************************************************
// // Context
// //*****************************************************************************************

// export type RouteContextProps<Path extends string, Search extends SearchParamBlueprints, Hash extends string> = {
//   path?: string;
//   params?: PathParamParser;
//   search?: SearchParamBlueprints;
//   hash?: string;
// };

// const RouteContext = createContext<RouteContextProps<string, {}, string> | null>(null);

// RouteContext.displayName = 'RouteContext';

// //*****************************************************************************************
// // Provider
// //*****************************************************************************************

// export type RouteParamsProp<Path extends string> = [PathParamKeys<Path>] extends [never]
//   ? { params?: undefined }
//   : { params?: (blueprints: typeof PATH_PARAM_BLUEPRINTS) => PathParamBlueprintsForPath<Path> };

// export type RouteProviderProps<Path extends string, Search extends SearchParamBlueprints, Hash extends string> = {
//   children: React.ReactNode;
//   path?: Path;
//   search?: (blueprints: typeof PARAM_BLUEPRINTS) => Search;
//   hash?: Hash;
// } & RouteParamsProp<Path>;

// export const RouteProvider = React.memo(
//   <Path extends string, Search extends SearchParamBlueprints, Hash extends string>({
//     children,
//     path,
//     params,
//     search,
//     hash
//   }: RouteProviderProps<Path, Search, Hash>) => {
//     const paramsParser = useMemo(() => (params ? createPathParams(params) : undefined), [params]);

//     const searchParser = useMemo(() => (search ? createSearchParams(search) : undefined), [search]);

//     const value = useMemo<RouteContextProps<Path, Search, Hash>>(
//       () => ({ path, params: paramsParser, search: searchParser, hash }),
//       [path, paramsParser, searchParser, hash]
//     );

//     return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
//   }
// );

// RouteProvider.displayName = 'RouteProvider';

// //*****************************************************************************************
// // Hook
// //*****************************************************************************************
// export const useRoute = () => {
//   const context = useContext(RouteContext);

//   if (!context) {
//     throw new Error('useRoute must be used inside RouteProvider');
//   }

//   return context;
// };
