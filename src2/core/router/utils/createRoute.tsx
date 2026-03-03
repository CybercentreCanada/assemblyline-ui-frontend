import { toElement } from 'core/app/utils/app.utils';
import { createSearchParams, SearchParamsProvider } from 'core/search-params/createSearchParams';
import { PARAM_BLUEPRINTS } from 'core/search-params/lib/search_params.blueprint';
import { SearchParamBlueprints, SearchParamValues } from 'core/search-params/lib/search_params.model';
import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams as useRouterParams } from 'react-router';
import { DisabledBoundary } from '../components/DisabledBoundary';
import { ForbiddenBoundary } from '../components/ForbiddenBoundary';
import type {
  ParamsBlueprints,
  ParamsBlueprintsForPath,
  ParamsParser,
  ParamsValues,
  PathParams
} from '../models/router.models';
import { RouteProvider } from '../providers/RouteProvider';
import { createParamsParser, PARAM_PARSERS } from './param.utils';

export type RoutePath = string;
export type RouteSearch = undefined | SearchParamBlueprints;
export type RouteHash = undefined | string;

export type CreateRouteProps<
  Path extends RoutePath = RoutePath,
  Search extends RouteSearch = undefined,
  Hash extends RouteHash = undefined,
  Params extends ParamsBlueprintsForPath<Path> = ParamsBlueprintsForPath<Path>
> = {
  path: Path;
  params?: (parsers: typeof PARAM_PARSERS) => Params;
  search?: (blueprints: typeof PARAM_BLUEPRINTS) => Search;
  hash?: Hash;

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

export type CreateRouteReturn<
  Path extends RoutePath = RoutePath,
  Search extends RouteSearch = undefined,
  Hash extends RouteHash = undefined,
  Params extends ParamsBlueprints = ParamsBlueprints
> = {
  path: Path;
  params: ParamsValues<Params>;
  paramsParser: undefined | ParamsParser<Params>;
  search: SearchParamValues<Search>;
  searchParser: undefined | Search;
  hash: Hash;
  element: React.ReactNode;
};

export const createRoute = <
  Path extends RoutePath = RoutePath,
  Search extends RouteSearch = undefined,
  Hash extends RouteHash = undefined,
  Params extends ParamsBlueprintsForPath<Path> = ParamsBlueprintsForPath<Path>
>({
  path,
  params,
  search,
  hash,

  loading,
  disabled,
  component,
  forbidden,
  forbiddenComponent,
  disabledComponent
}: CreateRouteProps<Path, Search, Hash, Params>): CreateRouteReturn<Path, Search, Hash, Params> => {
  void loading;

  const paramsParser = params ? createParamsParser(params) : undefined;
  const searchParser = search ? createSearchParams(search) : undefined;
  const content = toElement(component);

  const withSearch = searchParser ? (
    <SearchParamsProvider params={searchParser}>{content}</SearchParamsProvider>
  ) : (
    content
  );

  const element = (
    <ErrorBoundary
      FallbackComponent={props => <div>{JSON.stringify(props)}</div>}
      onReset={() => {
        window.location.reload();
      }}
    >
      <DisabledBoundary disabled={disabled} FallbackComponent={disabledComponent}>
        <ForbiddenBoundary forbidden={forbidden} FallbackComponent={forbiddenComponent}>
          <RouteProvider path={path} params={params} search={search} hash={hash}>
            {withSearch}
          </RouteProvider>
        </ForbiddenBoundary>
      </DisabledBoundary>
    </ErrorBoundary>
  );

  const useParams = () => {
    const rawParams = useRouterParams() as Record<string, string | undefined>;
    return (paramsParser ? paramsParser.parse(rawParams) : rawParams) as PathParams<Path> | Record<string, string>;
  };

  return {
    path,
    params: {} as ParamsValues<Params>,
    paramsParser,
    search: {} as SearchParamValues<Search>,
    searchParser,
    hash: hash ?? undefined,
    element
  };
};
