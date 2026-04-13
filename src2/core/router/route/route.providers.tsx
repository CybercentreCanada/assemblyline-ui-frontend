import React, { useCallback } from 'react';
import { Location, useLocation } from 'react-router';
import { PathParamBlueprintMap, PathParamCodec } from '../path-params/path-params.models';
import { AppRouterStore } from '../router/router.models';
import { SearchParamEngine } from '../search-params/lib/search-params.engine';
import { SearchParamSnapshot } from '../search-params/lib/search-params.snapshot';
import { RouteHash, RoutePath } from './route.models';
import { createAppStore } from 'features/store/createAppStore';

//*****************************************************************************************
// Route Provider
//*****************************************************************************************

export type AppRouteStore<
  Path extends RoutePath = RoutePath,
  Params extends PathParamCodec = any,
  Search extends SearchParamSnapshot<any> = SearchParamSnapshot<any>,
  Hash extends RouteHash = any
> = {
  params: Params;
  search: Search;
  hash: Hash;
};

const createDefaultAppRouteStore = <
  Path extends RoutePath,
  Params extends PathParamCodec,
  Search extends SearchParamSnapshot<any>,
  Hash extends RouteHash
>(): AppRouteStore<Path, Params, Search, Hash> => ({
  params: null,
  search: null,
  hash: null
});

export const {
  StoreProvider: AppRouteStoreProvider,
  useStore: useAppRouteStore,
  useSetStore: useAppRouteSetStore
} = createAppStore<AppRouteStore>(createDefaultAppRouteStore());

export type AppRouteProviderProps<
  Path extends RoutePath,
  Params extends PathParamBlueprintMap<Path>,
  Search extends SearchParamEngine<any>,
  Hash extends RouteHash
> = {
  children: React.ReactNode;
  params?: PathParamCodec<Params>;
  search?: Search;
  hash?: (hash: Location) => Hash;
};

export const AppRouteProvider = React.memo(function <
  const Path extends RoutePath,
  const Params extends PathParamBlueprintMap<Path>,
  const Search extends SearchParamEngine<any>,
  const Hash extends RouteHash
>({ children, params, search, hash }: AppRouteProviderProps<Path, Params, Search, Hash>) {
  const location = useLocation() as Location<any>;

  const reset = useCallback(
    () => ({
      params: !params ? undefined : params.parse(location),
      search: !search ? undefined : search.fromLocation(location).omit(search.getIgnoredKeys()),
      hash: !hash ? undefined : hash(location)
    }),
    [location]
  );

  return <AppRouteStoreProvider data={reset}>{children}</AppRouteStoreProvider>;
});

AppRouteProvider.displayName = 'AppRouteProvider';

//*****************************************************************************************
// Route Key Provider
//*****************************************************************************************

export type AppRouteKeyStore = {
  routeKey: keyof AppRouterStore['routes'];
};

const createDefaultAppRouteKeyStore = (): AppRouteKeyStore => ({
  routeKey: null
});

export const {
  StoreProvider: AppRouteKeyStoreProvider,
  useStore: useAppRouteKeyStore,
  useSetStore: useAppRouteKeySetStore
} = createAppStore<AppRouteKeyStore>(createDefaultAppRouteKeyStore());

AppRouteKeyStoreProvider.displayName = 'AppRouteKeyStoreProvider';

export type AppRouteKeyStoreProviderProps = {
  children: React.ReactNode;
  routeKey: keyof AppRouterStore['routes'];
};

export const AppRouteKeyProvider = React.memo(({ children, routeKey }: AppRouteKeyStoreProviderProps) => (
  <AppRouteKeyStoreProvider data={{ routeKey }}>{children}</AppRouteKeyStoreProvider>
));

AppRouteKeyProvider.displayName = 'AppRouteKeyProvider';

export const useAppRouteKey = () => {
  const context = useAppRouteKeyStore(s => s.routeKey);
  return !context ? null : context;
};
