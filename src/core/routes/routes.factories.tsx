import { AppErrorProvider } from 'core/error';
import type { DisabledBoundaryProps, ForbiddenBoundaryProps } from 'core/routes';
import { DisabledBoundary, ForbiddenBoundary } from 'core/routes';
import type { HASH_PARAM_BLUEPRINTS, HashParamValue, InferHashParamBlueprintFromValue } from 'features/hash-params';
import { createHashParamCodec } from 'features/hash-params';
import type { InferPathParamBlueprintMapFromPath, PATH_PARAM_BLUEPRINTS_MAP, RoutePath } from 'features/path-params';
import { createPathParamsCodec } from 'features/path-params';
import type { SearchParamBlueprintMap } from 'features/search-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import type {
  InferStateParamBlueprintFromValue,
  StateParamShape,
  createStateParamBlueprint
} from 'features/state-params';
import { createStateParamCodec } from 'features/state-params';
import type { ComponentType, FC, MemoExoticComponent, ReactNode } from 'react';
import { toElement } from 'shared/utils/app.utils';

//*****************************************************************************************
// Create Route
//*****************************************************************************************

export type CreateAppRouteProps<
  Route extends RoutePath,
  Path extends InferPathParamBlueprintMapFromPath<Route>,
  Search extends SearchParamBlueprintMap,
  Hash extends HashParamValue = never,
  State extends StateParamShape = never,
  Temp extends StateParamShape = never
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
  component: ReactNode | MemoExoticComponent<ComponentType<unknown>>;

  // Parameters
  route: Route;
  path?: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Path;
  search?: (blueprints: typeof SEARCH_PARAM_BLUEPRINTS_MAP) => Search;
  hash?: (blueprints: typeof HASH_PARAM_BLUEPRINTS) => InferHashParamBlueprintFromValue<Hash>;
  state?: (blueprint: typeof createStateParamBlueprint) => InferStateParamBlueprintFromValue<State>;
  transient?: (blueprint: typeof createStateParamBlueprint) => InferStateParamBlueprintFromValue<Temp>;

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
  const Hash extends HashParamValue = never,
  const State extends StateParamShape = never,
  const Temp extends StateParamShape = never
>({
  title,
  icon,
  component: Component,

  route,
  path,
  search,
  hash,
  state,
  transient,

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

  const hashCodec = !hash ? createHashParamCodec<never>()(() => null) : createHashParamCodec<Hash>()(hash);

  const stateCodec = !state ? (createStateParamCodec(() => null) as never) : createStateParamCodec(state);

  const transientCodec = !transient ? (createStateParamCodec(() => null) as never) : createStateParamCodec(transient);

  (Component as unknown as FC).displayName = route;

  return {
    title,
    icon,

    route,
    path: pathCodec,
    search: searchEngine,
    hash: hashCodec,
    state: stateCodec,
    transient: transientCodec,

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
