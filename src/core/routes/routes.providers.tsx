import type { AppRouterStore } from 'core/router/router.models';
import type { RouteHash, RoutePath } from 'core/routes/routes.models';
import type { PathParamBlueprintMap, PathParamCodec } from 'features/path-params';
import type { SearchParamEngine, SearchParamSnapshot } from 'features/search-params';
import { createAppStore } from 'features/store/createAppStore';
import { createStoreContext } from 'features/store/createStoreContext';
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import type { Location } from 'react-router';
import { useLocation } from 'react-router';

//*****************************************************************************************
// Route Provider
//*****************************************************************************************

export type AppRouteStore<
  Path extends RoutePath = RoutePath,
  Params extends PathParamCodec = PathParamCodec,
  Search extends SearchParamSnapshot<unknown> = SearchParamSnapshot<unknown>,
  Hash extends RouteHash = RouteHash
> = {
  /** Parsed hash value. */
  hash: Hash;
  /** Parsed path params. */
  params: Params;
  /** Parsed search params. */
  search: Search;
};

const createDefaultAppRouteStore = <
  Path extends RoutePath,
  Params extends PathParamCodec,
  Search extends SearchParamSnapshot<unknown>,
  Hash extends RouteHash
>(): AppRouteStore<Path, Params, Search, Hash> => ({
  hash: null,
  params: null,
  search: null
});

export const {
  StoreProvider: AppRouteStoreProvider,
  useStore: useAppRouteStore,
  useSetStore: useAppRouteSetStore
} = createAppStore<AppRouteStore>(createDefaultAppRouteStore());

export type AppRouteProviderProps<
  Path extends RoutePath,
  Params extends PathParamBlueprintMap<Path>,
  Search extends SearchParamEngine<unknown>,
  Hash extends RouteHash
> = {
  /** Provider children. */
  children: ReactNode;
  /** Hash codec function. */
  hash?: (hash: Location) => Hash;
  /** Path param codec. */
  params?: PathParamCodec<Params>;
  /** Search param engine. */
  search?: Search;
};

export const AppRouteProvider = memo(function AppRouteProvider<
  const Path extends RoutePath,
  const Params extends PathParamBlueprintMap<Path>,
  const Search extends SearchParamEngine<unknown>,
  const Hash extends RouteHash
>({ children, params, search, hash }: AppRouteProviderProps<Path, Params, Search, Hash>) {
  const location = useLocation() as Location<unknown>;

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
  /** Route key for this route context. */
  routeKey: keyof AppRouterStore['routes'];
};

const createDefaultAppRouteKeyStore = (): AppRouteKeyStore => ({
  routeKey: null
});

export const { StoreProvider: AppRouteKeyStoreProvider, useStore: useAppRouteKeyStore } =
  createStoreContext<AppRouteKeyStore>(createDefaultAppRouteKeyStore());

AppRouteKeyStoreProvider.displayName = 'AppRouteKeyStoreProvider';

export type AppRouteKeyStoreProviderProps = {
  /** Provider children. */
  children: ReactNode;
  /** Route key to provide. */
  routeKey: keyof AppRouterStore['routes'];
};

export const AppRouteKeyProvider = memo(({ children, routeKey }: AppRouteKeyStoreProviderProps) => (
  <AppRouteKeyStoreProvider data={{ routeKey }}>{children}</AppRouteKeyStoreProvider>
));

AppRouteKeyProvider.displayName = 'AppRouteKeyProvider';

/**
 * @name useAppRouteKey
 * @description Returns the current route key from the nearest AppRouteKeyProvider.
 * @returns The current route key or null
 */
export const useAppRouteKey = () => {
  const context = useAppRouteKeyStore(s => s.routeKey);
  return !context ? null : context;
};
