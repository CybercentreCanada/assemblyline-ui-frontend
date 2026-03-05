import { toElement } from 'core/app/utils/app.utils';
import { createSearchParams } from 'core/search-params/createSearchParams';
import { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { DisabledBoundary } from '../components/DisabledBoundary';
import { ForbiddenBoundary } from '../components/ForbiddenBoundary';
import { PathParamBlueprintMap, RoutePath } from '../models/params.models';
import { CreateRouteHash, CreateRouteSearch } from '../models/route.models';
import { RouteProvider } from '../providers/RouteProvider';
import { createPathParamsCodec, PATH_PARAM_BLUEPRINTS_MAP } from './param.utils';

// export type RoutePath = string;
// export type RouteSearch = undefined | SearchParamBlueprints;
// export type RouteHash = undefined | string;

const SEARCH_PARAM_BLUEPRINTS = null;

export type CreateRouteProps<
  Path extends RoutePath,
  Params extends PathParamBlueprintMap<Path>,
  Search extends CreateRouteSearch,
  Hash extends CreateRouteHash
> = {
  path: Path;
  params?: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Params;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS) => Search;
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

  meta?: {
    title?: string;
    breadcrumb?: string | ((params: any) => string);
  };
};

export const createRoute = <
  const Path extends RoutePath,
  const Params extends PathParamBlueprintMap<Path>,
  const Search extends CreateRouteSearch,
  const Hash extends CreateRouteHash
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
}: CreateRouteProps<Path, Params, Search, Hash>) => {
  void loading;

  const content = toElement(component);

  const paramCodec = params ? createPathParamsCodec<Path>(path)(params) : undefined;

  const searchCodec = search ? createSearchParams(search) : undefined;

  const hashCodec = hash ?? (h => h);

  const element = (
    <ErrorBoundary
      FallbackComponent={props => <div>{JSON.stringify(props)}</div>}
      onReset={() => {
        window.location.reload();
      }}
    >
      <DisabledBoundary disabled={disabled} FallbackComponent={disabledComponent}>
        <ForbiddenBoundary forbidden={forbidden} FallbackComponent={forbiddenComponent}>
          <RouteProvider params={paramCodec}>{content}</RouteProvider>
        </ForbiddenBoundary>
      </DisabledBoundary>
    </ErrorBoundary>
  );

  return {
    element,
    path,
    params: paramCodec,
    search: searchCodec,
    hash: hashCodec
  };
};
