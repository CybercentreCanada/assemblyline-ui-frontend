import type { AppRouterStore } from 'core/router/router.models';
import type { RouteHash, RoutePath } from 'core/routes/routes.models';
import type { InferPathParamCodecFromPath } from 'features/path-params';
import type { SearchParamBlueprintMap, SearchParamEngine, SearchParamSnapshot } from 'features/search-params';
import { createAppStore } from 'features/store/createAppStore';
import { createStoreContext } from 'features/store/createStoreContext';
import type { ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import type { Location } from 'react-router';
import { useLocation } from 'react-router';

//*****************************************************************************************
// Route Provider
//*****************************************************************************************

export type AppRouteStore<
  Path extends RoutePath = RoutePath,
  Params extends InferPathParamCodecFromPath<Path> = InferPathParamCodecFromPath<Path>,
  Search extends SearchParamSnapshot<SearchParamBlueprintMap> = SearchParamSnapshot<SearchParamBlueprintMap>,
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
  Params extends InferPathParamCodecFromPath<Path>,
  Search extends SearchParamSnapshot<SearchParamBlueprintMap>,
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
  Params extends InferPathParamCodecFromPath<Path>,
  Search extends SearchParamEngine<SearchParamBlueprintMap>,
  Hash extends RouteHash
> = {
  /** Provider children. */
  children: ReactNode;
  /** Path param codec. */
  params?: Params;
  /** Search param engine. */
  search?: Search;
  /** Hash codec function. */
  hash?: (hash: string) => Hash;
};

export const AppRouteProvider = memo(function AppRouteProvider<
  const Path extends RoutePath,
  const Params extends InferPathParamCodecFromPath<Path>,
  const Search extends SearchParamEngine<SearchParamBlueprintMap>,
  const Hash extends RouteHash
>({ children, params, search, hash }: AppRouteProviderProps<Path, Params, Search, Hash>) {
  const location = useLocation() as Location<unknown>;

  const locationKey = useMemo(
    () => `${location.pathname}${location.search}${location.hash}${JSON.stringify(location.state)}`,
    [location]
  );

  const reset = useCallback(
    () =>
      ({
        params: !params ? undefined : params.parse(location),
        search: !search ? undefined : search.fromLocation(location).omit(search.getIgnoredKeys()),
        hash: !hash ? undefined : hash(location.hash)
      }) as unknown as Partial<AppRouteStore>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hash, locationKey, params, search]
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
export const useAppRouteKey = () => useAppRouteKeyStore(s => s.routeKey)?.[0] ?? null;
