import { AppErrorProvider } from 'core/error';
import type { DisabledBoundaryProps, ForbiddenBoundaryProps, RouteHash } from 'core/routes';
import { DisabledBoundary, ForbiddenBoundary } from 'core/routes';
import type { InferPathParamBlueprintMapFromPath, PATH_PARAM_BLUEPRINTS_MAP, RoutePath } from 'features/path-params';
import { createPathParamsCodec } from 'features/path-params';
import type { SearchParamBlueprintMap } from 'features/search-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import type { Location } from 'react-router';
import { toElement } from 'shared/utils/app.utils';

//*****************************************************************************************
// Create Route
//*****************************************************************************************

export type CreateAppRouteProps<
  Route extends RoutePath,
  Path extends InferPathParamBlueprintMapFromPath<Route>,
  Search extends SearchParamBlueprintMap,
  Hash extends RouteHash,
  State extends object,
  Temp extends object
> = {
  // Descriptions
  title?: string;
  icon?: ReactNode;
  component: ReactNode | MemoExoticComponent<ComponentType<unknown>>;

  // Parameters
  route: Route;
  path?: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Path;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS_MAP) => Search;
  hash?: (hash: Location['hash']) => Hash;
  state?: State;
  temporary?: Temp;

  // Guards and Fallbacks
  disabled?: DisabledBoundaryProps['disabled'];
  forbidden?: ForbiddenBoundaryProps['forbidden'];
  loader?: boolean | ((args: unknown) => void);
  disabledComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  errorComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  forbiddenComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  pendingComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  quotaExceededComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
};

export const createAppRoute = <
  const Route extends RoutePath,
  const Path extends InferPathParamBlueprintMapFromPath<Route>,
  const Search extends SearchParamBlueprintMap,
  const Hash extends RouteHash,
  const State extends object,
  const Temp extends object
>({
  title,
  icon,
  component: Component,

  route,
  path,
  search,
  hash,
  state,
  temporary,

  loader,
  disabled,
  forbidden,

  forbiddenComponent,
  disabledComponent
}: CreateAppRouteProps<Route, Path, Search, Hash, State, Temp>) => {
  void loader;

  const pathCodec = !path
    ? (createPathParamsCodec<Route>(route)(() => null) as never)
    : createPathParamsCodec<Route>(route)(path);

  const searchEngine = !search
    ? (new SearchParamEngine(null) as never)
    : new SearchParamEngine(search(SEARCH_PARAM_BLUEPRINTS_MAP)).setDefaultValues(null);

  const hashCodec = hash ?? ((h: Location['hash']) => h as Hash);

  (Component as never).displayName = route;

  return {
    title,
    icon,
    component: Component,

    route,
    path: pathCodec,
    search: searchEngine,
    hash: hashCodec,
    state,
    temporary,

    loader,

    element: (
      <AppErrorProvider>
        <DisabledBoundary disabled={disabled} FallbackComponent={disabledComponent}>
          <ForbiddenBoundary forbidden={forbidden} FallbackComponent={forbiddenComponent}>
            {/* <AppRouteProvider params={paramCodec} search={searchEngine} hash={hashCodec}> */}
            {toElement(Component)}
            {/* </AppRouteProvider> */}
          </ForbiddenBoundary>
        </DisabledBoundary>
      </AppErrorProvider>
    )
  };
};
