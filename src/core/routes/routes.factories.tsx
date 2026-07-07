import { AppErrorProvider } from 'core/error';
import type { RouteHash, RouteMeta } from 'core/routes';
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

// TODO: add a resize observer similar to useMediaQuery

export type CreateAppRouteProps<
  Path extends RoutePath,
  Params extends InferPathParamBlueprintMapFromPath<Path>,
  Search extends SearchParamBlueprintMap,
  Hash extends RouteHash
> = {
  path: Path;
  params?: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Params;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS_MAP) => Search;
  hash?: (hash: Location['hash']) => Hash;

  disabled?: boolean | (() => boolean);
  forbidden?: boolean | (() => boolean);
  loading?: boolean | ((args: unknown) => boolean);

  component: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  disabledComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  errorComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  forbiddenComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  pendingComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  quotaExceededComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;

  meta?: RouteMeta;
};

export const createAppRoute = <
  const Path extends RoutePath,
  const Params extends InferPathParamBlueprintMapFromPath<Path>,
  const Search extends SearchParamBlueprintMap,
  const Hash extends RouteHash
>({
  path,
  params,
  search,
  hash,

  loading,
  disabled,
  forbidden,

  component,
  forbiddenComponent,
  disabledComponent
}: CreateAppRouteProps<Path, Params, Search, Hash>) => {
  void loading;

  const paramCodec = !params
    ? (createPathParamsCodec<Path>(path)(() => null) as never)
    : createPathParamsCodec<Path>(path)(params);

  const searchEngine = !search
    ? (new SearchParamEngine(null) as never)
    : new SearchParamEngine(search(SEARCH_PARAM_BLUEPRINTS_MAP)).setDefaultValues(null);

  const hashCodec = hash ?? ((h: Location['hash']) => h as Hash);

  return {
    path,
    params: paramCodec,
    search: searchEngine,
    // search: !search ? undefined : searchEngine.fromLocation({ search: null } as any),
    hash: hashCodec,
    element: (
      <AppErrorProvider>
        <DisabledBoundary disabled={disabled} FallbackComponent={disabledComponent}>
          <ForbiddenBoundary forbidden={forbidden} FallbackComponent={forbiddenComponent}>
            {/* <AppRouteProvider params={paramCodec} search={searchEngine} hash={hashCodec}> */}
            {toElement(component)}
            {/* </AppRouteProvider> */}
          </ForbiddenBoundary>
        </DisabledBoundary>
      </AppErrorProvider>
    )
  };
};
