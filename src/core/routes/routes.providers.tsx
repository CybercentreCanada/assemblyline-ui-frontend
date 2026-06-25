import { useAppPreferenceStore } from 'core/preference';
import { findNextPanelKey, getRouteFromKey, getRouteFromPanelKey, useAppRouterStore } from 'core/router';
import type { AppRouterStore } from 'core/router/router.models';
import type { InferAppRouteValuesFromRoute, RouteHash, RoutePath } from 'core/routes';
import { findAppRouteFromLocation, getAppRouteValuesFromLocation } from 'core/routes';
import type { InferPathParamCodecFromPath } from 'features/path-params';
import type { SearchParamBlueprintMap, SearchParamEngine, SearchParamSnapshot } from 'features/search-params';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo } from 'react';
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
// Route Values Provider
//*****************************************************************************************

export type AppRouteValuesStore = {
  /** Route key for this route context. */
  routeKey: keyof AppRouterStore['routes'];

  /** Current route location snapshot from router store. */
  currentRoute: AppRouterStore['routes'][string];
  /** Current route definition resolved from APP_ROUTES. */
  currentAppRoute: AppRoute;
  /** Current typed route values derived from current route and location. */
  currentValues: InferAppRouteValuesFromRoute<AppRoute>;

  /** Next route location snapshot based on navigation style. */
  nextRoute: AppRouterStore['routes'][string];
  /** Next route definition resolved from APP_ROUTES. */
  nextAppRoute: AppRoute;
  /** Next typed route values derived from next route and location. */
  nextValues: InferAppRouteValuesFromRoute<AppRoute>;
};

const createDefaultAppRouteValuesStore = (): AppRouteValuesStore => ({
  routeKey: null,
  currentRoute: null,
  currentAppRoute: null,
  currentValues: null,
  nextRoute: null,
  nextAppRoute: null,
  nextValues: null
});

export const {
  StoreProvider: AppRouteValuesStoreProvider,
  useStore: useAppRouteValuesStore,
  useSetStore: useAppRouteValuesSetStore
} = createAppStore<AppRouteValuesStore>(createDefaultAppRouteValuesStore());

AppRouteValuesStoreProvider.displayName = 'AppRouteValuesStoreProvider';

export type AppRouteValuesStoreProviderProps = {
  /** Provider children. */
  children: ReactNode;

  appRoutes: AppRoutes;

  /** Route key to provide. */
  routeKey: keyof AppRouterStore['routes'];
};

const AppRouteValuesSync = memo(({ appRoutes, routeKey }: Omit<AppRouteValuesStoreProviderProps, 'children'>) => {
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const currentRoute = useAppRouterStore(store => getRouteFromKey(store, routeKey));
  const nextRoute = useAppRouterStore(store => {
    const nextPanelKey = findNextPanelKey(store, routeKey, navigationStyle);
    return getRouteFromPanelKey(store, nextPanelKey);
  });

  const setAppRouteValuesStore = useAppRouteValuesSetStore();

  useEffect(() => {
    setAppRouteValuesStore(s => {
      s.currentAppRoute = findAppRouteFromLocation(appRoutes, currentRoute);
      s.currentValues = getAppRouteValuesFromLocation(s.currentAppRoute, currentRoute);
      s.nextRoute = nextRoute;
      s.nextAppRoute = findAppRouteFromLocation(appRoutes, nextRoute);
      s.nextValues = getAppRouteValuesFromLocation(s.nextAppRoute, nextRoute);
      return s;
    });
  }, [appRoutes, currentRoute, navigationStyle, nextRoute, routeKey, setAppRouteValuesStore]);

  return null;
});

export const AppRouteValuesProvider = memo(({ children, appRoutes, routeKey }: AppRouteValuesStoreProviderProps) => (
  <AppRouteValuesStoreProvider data={null}>
    <AppRouteValuesSync appRoutes={appRoutes} routeKey={routeKey} />
    {children}
  </AppRouteValuesStoreProvider>
));

AppRouteValuesProvider.displayName = 'AppRouteValuesProvider';
