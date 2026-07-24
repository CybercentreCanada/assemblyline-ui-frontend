import { AppErrorProvider } from 'core/error';
import type { DisabledBoundaryProps, ForbiddenBoundaryProps } from 'core/routes';
import { DisabledBoundary, ForbiddenBoundary } from 'core/routes';
import type { HASH_PARAM_BLUEPRINTS, HashParamValue, InferHashParamBlueprintFromValue } from 'features/hash-params';
import { createHashParamCodec } from 'features/hash-params';
import type { InferPathParamBlueprintMapFromPath, PATH_PARAM_BLUEPRINTS_MAP, RoutePath } from 'features/path-params';
import { createPathParamsCodec } from 'features/path-params';
import type { SearchParamBlueprintMap } from 'features/search-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import type { ComponentType, FC, MemoExoticComponent, ReactNode } from 'react';
import { toElement } from 'shared/utils/app.utils';

//*****************************************************************************************
// Create Route
//*****************************************************************************************

export type CreateAppRouteProps<
  Path extends RoutePath,
  Params extends InferPathParamBlueprintMapFromPath<Path>,
  Search extends SearchParamBlueprintMap,
  Hash extends HashParamValue = never
> = {
  // Descriptions
  title?: {
    ns: string;
    key: string;
  };

  icon?: {
    primary: ReactNode;
    secondary?: ReactNode;
  };
  ancestor?: RoutePath | null;
  component: ReactNode | MemoExoticComponent<ComponentType<unknown>>;

  // Parameters
  path: Path;
  params?: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Params;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS_MAP) => Search;
  hash?: (blueprints: typeof HASH_PARAM_BLUEPRINTS) => InferHashParamBlueprintFromValue<Hash>;

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
  const Hash extends HashParamValue = never
>({
  title,
  icon,
  ancestor,
  component: Component,

  path,
  params,
  search,
  hash,

  loader,
  disabled,
  forbidden,

  forbiddenComponent,
  disabledComponent
}: CreateAppRouteProps<Route, Path, Search, Hash>) => {
  void loader;

  const pathCodec = !params
    ? (createPathParamsCodec<Route>(path)(() => null) as never)
    : createPathParamsCodec<Route>(path)(params);

  const searchEngine = !search
    ? (new SearchParamEngine(null) as never)
    : new SearchParamEngine(search(SEARCH_PARAM_BLUEPRINTS_MAP)).setDefaultValues(null);

  const hashCodec = !hash ? createHashParamCodec<never>()(() => null) : createHashParamCodec<Hash>()(hash);

  (Component as unknown as FC).displayName = path;

  return {
    title,
    icon,
    ancestor,

    path,
    params: pathCodec,
    search: searchEngine,
    hash: hashCodec,

    loader,
    disabled,
    forbidden,

    element: (
      <AppErrorProvider>
        <DisabledBoundary disabled={disabled} FallbackComponent={disabledComponent}>
          <ForbiddenBoundary forbidden={forbidden} FallbackComponent={forbiddenComponent}>
            {toElement(Component)}
          </ForbiddenBoundary>
        </DisabledBoundary>
      </AppErrorProvider>
    )
  };
};
