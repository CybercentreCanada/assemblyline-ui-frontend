import type { AppRouteStore } from 'core/routes/routes.providers';
import { useAppRouteStore } from 'core/routes/routes.providers';
import type { InferPathParamBlueprintMapFromPath, InferPathParamValuesFromBlueprintMap } from 'features/path-params';
import type { InferSearchParamSnapshotFromEngine } from 'features/search-params';

type RouteByPath<Path extends AppRoute['path']> = Extract<AppRoute, { path: Path }>;

//*****************************************************************************************
// useAppPathParams
//*****************************************************************************************

export type PathParamValue<Path extends AppRoute['path'] = AppRoute['path']> = RouteByPath<Path>['params'] extends {
  blueprints: infer Blueprints;
}
  ? Blueprints extends InferPathParamBlueprintMapFromPath<Path>
    ? InferPathParamValuesFromBlueprintMap<Blueprints>
    : AppRouteStore['params']
  : AppRouteStore['params'];

export function useAppPathParams<const Path extends AppRoute['path'] = AppRoute['path']>(): PathParamValue<Path> {
  const context = useAppRouteStore(s => s.params as PathParamValue<Path>);
  if (!context) return null;
  return context;
}

//*****************************************************************************************
// useAppSearchParams
//*****************************************************************************************

export type SearchParamValue<Path extends AppRoute['path'] = AppRoute['path']> =
  Exclude<RouteByPath<Path>['search'], undefined> extends never
    ? AppRouteStore['search']
    : InferSearchParamSnapshotFromEngine<Exclude<RouteByPath<Path>['search'], undefined>>;

export function useAppSearchParams<const Path extends AppRoute['path'] = AppRoute['path']>(): SearchParamValue<Path> {
  const context = useAppRouteStore(s => s.search as SearchParamValue<Path>);
  if (!context) return null;
  return context;
}

//*****************************************************************************************
// useAppHashParams
//*****************************************************************************************

export type HashParamValue<Path extends AppRoute['path'] = AppRoute['path']> =
  Exclude<RouteByPath<Path>['hash'], undefined> extends never
    ? AppRouteStore['hash']
    : Exclude<RouteByPath<Path>['hash'], undefined>;

export function useAppHashParams<const Path extends AppRoute['path'] = AppRoute['path']>(): HashParamValue<Path> {
  const context = useAppRouteStore(s => s.hash as HashParamValue<Path>);
  if (!context) return null;
  return context;
}

//*****************************************************************************************
// useAppRoute
//*****************************************************************************************

export function useAppRoute<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: (store: AppRouteStore) => SelectorOutput
) {
  void path;
  const context = useAppRouteStore<SelectorOutput>(selector);
  if (!context) return null;
  return context;
}
