import { toElement } from 'lib/utils/app.utils';
import { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PathParamBlueprintMap } from '../path-params/path-params.models';
import { PATH_PARAM_BLUEPRINTS_MAP, createPathParamsCodec } from '../path-params/path-params.utils';
import { SEARCH_PARAM_BLUEPRINTS_MAP } from '../search-params/lib/search_params.blueprint';
import { SearchParamEngine } from '../search-params/lib/search_params.engine';
import { SearchParamBlueprintMap } from '../search-params/lib/search_params.model';
import { DisabledBoundary, ForbiddenBoundary } from './route.components';
import { RouteHash, RouteMeta, RoutePath } from './route.models';
import { AppRouteProvider } from './route.providers';

//*****************************************************************************************
// Create Route
//*****************************************************************************************

export type CreateAppRouteProps<
  Path extends RoutePath,
  Params extends PathParamBlueprintMap<Path>,
  Search extends SearchParamBlueprintMap,
  Hash extends RouteHash
> = {
  path: Path;
  params?: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Params;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS_MAP) => Search;
  hash?: (hash: Location['hash']) => Hash;

  disabled?: boolean | (() => boolean);
  forbidden?: boolean | (() => boolean);
  loading?: boolean | ((args: any) => boolean);

  component: ReactNode | MemoExoticComponent<ComponentType<any>>;
  disabledComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  errorComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  forbiddenComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  pendingComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  quotaExceededComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;

  meta?: RouteMeta;
};

export const createAppRoute = <
  const Path extends RoutePath,
  const Params extends PathParamBlueprintMap<Path>,
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

  const paramCodec = !params ? undefined : createPathParamsCodec<Path>(path)(params);

  const searchEngine = !search
    ? undefined
    : new SearchParamEngine(search(SEARCH_PARAM_BLUEPRINTS_MAP)).setDefaultValues(null);

  const hashCodec = hash ?? (h => h);

  return {
    path,
    params: paramCodec,
    search: searchEngine,
    // search: !search ? undefined : searchEngine.fromLocation({ search: null } as any),
    hash: hashCodec,
    element: (
      <ErrorBoundary
        FallbackComponent={props => <div>{JSON.stringify(props)}</div>}
        onReset={() => {
          window.location.reload();
        }}
      >
        <DisabledBoundary disabled={disabled} FallbackComponent={disabledComponent}>
          <ForbiddenBoundary forbidden={forbidden} FallbackComponent={forbiddenComponent}>
            <AppRouteProvider params={paramCodec} search={searchEngine}>
              {toElement(component)}
            </AppRouteProvider>
          </ForbiddenBoundary>
        </DisabledBoundary>
      </ErrorBoundary>
    )
  };
};
