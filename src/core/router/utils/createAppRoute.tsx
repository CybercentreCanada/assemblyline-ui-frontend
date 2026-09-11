import { AppErrorProvider } from 'core/error';
import type { InferAppLocationFromParams, RouteName } from 'core/router';
import { DisabledBoundary } from 'core/router/components/DisabledBoundary';
import { ForbiddenBoundary } from 'core/router/components/ForbiddenBoundary';
import type { HASH_PARAM_BLUEPRINTS, HashParamValue, InferHashParamBlueprintFromValue } from 'features/hash-params';
import { createHashParamCodec } from 'features/hash-params';
import type { InferPathParamBlueprintMapFromPath, PATH_PARAM_BLUEPRINTS_MAP, RoutePath } from 'features/path-params';
import { createPathParamsCodec } from 'features/path-params';
import type { SearchParamBlueprintMap } from 'features/search-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import type { ComponentType, FC, MemoExoticComponent, ReactElement } from 'react';
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
  component: ReactElement | MemoExoticComponent<ComponentType<unknown>>;

  // Parameters
  path: Path;
  params?: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Params;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS_MAP) => Search;
  hash?: (blueprints: typeof HASH_PARAM_BLUEPRINTS) => InferHashParamBlueprintFromValue<Hash>;

  // Presentation
  ancestor?: RoutePath | null;
  shortname: (location: InferAppLocationFromParams<Path, Params, Search, Hash>, config: AppConfigStore) => RouteName;
  fullname: (location: InferAppLocationFromParams<Path, Params, Search, Hash>, config: AppConfigStore) => RouteName;
  shorticon: (location: InferAppLocationFromParams<Path, Params, Search, Hash>, config: AppConfigStore) => ReactElement;
  fullicon: (location: InferAppLocationFromParams<Path, Params, Search, Hash>, config: AppConfigStore) => ReactElement;

  // Guards and Fallbacks
  loader?: boolean | ((args: unknown) => void);
  disabled?: (location: InferAppLocationFromParams<Path, Params, Search, Hash>, config: AppConfigStore) => boolean;
  forbidden?: (location: InferAppLocationFromParams<Path, Params, Search, Hash>, config: AppConfigStore) => boolean;
};

/**
 * @name createAppRoute
 * @description Creates a typed application route with codecs, metadata, guards, and rendered boundaries.
 * @param props - Route path, parameter codecs, presentation metadata, and guard configuration.
 * @returns A registered application route definition.
 */
export const createAppRoute = <
  const Route extends RoutePath,
  const Path extends InferPathParamBlueprintMapFromPath<Route>,
  const Search extends SearchParamBlueprintMap,
  const Hash extends HashParamValue = never
>({
  component: Component,

  path,
  params,
  search,
  hash,

  ancestor,
  shortname,
  fullname,
  shorticon,
  fullicon,

  loader,
  disabled,
  forbidden
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
    path,
    params: pathCodec,
    search: searchEngine,
    hash: hashCodec,

    ancestor,
    shortname,
    fullname,
    shorticon,
    fullicon,

    loader,
    disabled,
    forbidden,

    element: (
      <AppErrorProvider>
        <DisabledBoundary disabled={disabled}>
          <ForbiddenBoundary forbidden={forbidden}>{toElement(Component)}</ForbiddenBoundary>
        </DisabledBoundary>
      </AppErrorProvider>
    )
  };
};
