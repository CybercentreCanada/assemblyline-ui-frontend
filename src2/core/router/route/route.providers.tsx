import { createStoreContext } from 'core/store/createStoreContext';
import React, { useCallback } from 'react';
import { Location, useLocation } from 'react-router';
import { PathParamBlueprintMap, PathParamCodec } from '../path-params/path-params.models';
import { RouterStore } from '../router/router.models';
import { SearchParamEngine } from '../search-params/lib/search_params.engine';
import { SearchParamSnapshot } from '../search-params/lib/search_params.snapshot';
import { CreateRouteHash, RoutePath } from './route.models';

//*****************************************************************************************
// Route Provider
//*****************************************************************************************

export type RouteStore<
  Path extends RoutePath = RoutePath,
  Params extends PathParamCodec = any,
  Search extends SearchParamSnapshot<any> = SearchParamSnapshot<any>,
  Hash extends CreateRouteHash = any
> = {
  params: Params;
  search: Search;
  hash: Hash;
};

const createDefaultRouteStore = <
  Path extends RoutePath,
  Params extends PathParamCodec,
  Search extends SearchParamSnapshot<any>,
  Hash extends CreateRouteHash
>(): RouteStore<Path, Params, Search, Hash> => ({
  params: null,
  search: null,
  hash: null
});

export const { StoreProvider: RouteStoreProvider, useStore: useRouteStore } =
  createStoreContext<RouteStore>(createDefaultRouteStore());

export type RouteProviderProps<
  Path extends RoutePath,
  Params extends PathParamBlueprintMap<Path>,
  Search extends SearchParamEngine<any>,
  Hash extends CreateRouteHash
> = {
  children: React.ReactNode;
  params?: PathParamCodec<Params>;
  search?: Search;
  hash?: (hash: Location) => Hash;
};

export const RouteProvider = React.memo(function <
  const Path extends RoutePath,
  const Params extends PathParamBlueprintMap<Path>,
  const Search extends SearchParamEngine<any>,
  const Hash extends CreateRouteHash
>({ children, params, search, hash }: RouteProviderProps<Path, Params, Search, Hash>) {
  const location = useLocation() as Location<any>;

  const reset = useCallback(
    () => ({
      params: !params ? undefined : params.parse(location),
      search: !search ? undefined : search.fromLocation(location).omit(search.getIgnoredKeys()),
      hash: !hash ? undefined : hash(location)
    }),
    [location]
  );

  return <RouteStoreProvider data={reset}>{children}</RouteStoreProvider>;
});

RouteProvider.displayName = 'RouteProvider';

//*****************************************************************************************
// Route Key Provider
//*****************************************************************************************

export type RouteKeyStore = {
  routeKey: keyof RouterStore['routes'];
};

const createDefaultRouteKeyStore = (): RouteKeyStore => ({
  routeKey: null
});

const { StoreProvider: RouteKeyStoreProvider, useStore: useRouteKeyStore } =
  createStoreContext<RouteKeyStore>(createDefaultRouteKeyStore());

RouteKeyStoreProvider.displayName = 'RouteKeyStoreProvider';

export type RouteKeyStoreProviderProps = {
  children: React.ReactNode;
  routeKey: keyof RouterStore['routes'];
};

export const RouteKeyProvider = React.memo(({ children, routeKey }: RouteKeyStoreProviderProps) => (
  <RouteKeyStoreProvider data={{ routeKey }}>{children}</RouteKeyStoreProvider>
));

RouteKeyProvider.displayName = 'RouteKeyProvider';

export const useRouteKey = () => {
  const context = useRouteKeyStore(s => s.routeKey);
  if (!context) return null;
  return context[0];
};

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
