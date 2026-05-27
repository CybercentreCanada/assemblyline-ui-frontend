import { useAppRouteStore } from 'core/routes/routes.providers';
import type { SearchParamBlueprintMap, SearchParamEngine, SearchParamSnapshot } from 'features/search-params';

type RouteByPath<Path extends AppRoute['path']> = Extract<AppRoute, { path: Path }>;

//*****************************************************************************************
// useAppPathParams
//*****************************************************************************************

type ParamsShape<Path extends AppRoute['path']> = RouteByPath<Path>['params'] extends { type: infer Params }
  ? { params: Params }
  : { params?: never };

// prettier-ignore
export type PathParamSelector<Path extends AppRoute['path'], SelectorOutput> =
  Extract<AppRoute, { path: Path }>['params'] extends { type: infer Params }
    ? (
        store: Extract<AppRoute, { path: Path }>['params'] extends { type: infer Params }
          ? Params
          : never
      ) => SelectorOutput
    : never;

export function useAppPathParams<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: PathParamSelector<Path, SelectorOutput>
): SelectorOutput {
  const context = useAppRouteStore<SelectorOutput>(s => selector(s.params as never));
  if (!context) return null;
  return context;
}

//*****************************************************************************************
// useAppSearchParams
//*****************************************************************************************

type SearchShape<Path extends AppRoute['path']> =
  Exclude<RouteByPath<Path>['search'], undefined> extends never
    ? { search?: never }
    : { search: SearchParamValue<Path> };

export type SearchParamValue<Path extends AppRoute['path']> =
  Exclude<RouteByPath<Path>['search'], undefined> extends SearchParamEngine<
    infer Blueprints extends SearchParamBlueprintMap
  >
    ? SearchParamSnapshot<Blueprints>
    : never;

// prettier-ignore
export type SearchParamSelector<Path extends AppRoute['path'], SelectorOutput> =
  (store: SearchParamValue<Path>) => SelectorOutput;

export function useAppSearchParams<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: SearchParamSelector<Path, SelectorOutput>
): SelectorOutput {
  const context = useAppRouteStore<SelectorOutput>(s => selector(s.search as SearchParamValue<Path>));
  if (!context) return null;
  return context;
}

//*****************************************************************************************
// useAppHashParams
//*****************************************************************************************

type HashShape<Path extends AppRoute['path']> =
  Exclude<RouteByPath<Path>['hash'], undefined> extends never
    ? { hash?: never }
    : { hash: Exclude<RouteByPath<Path>['hash'], undefined> };

type HashParamValue<Path extends AppRoute['path']> = Exclude<RouteByPath<Path>['hash'], undefined>;

// prettier-ignore
export type HashParamSelector<Path extends AppRoute['path'], SelectorOutput> =
  (store: HashParamValue<Path>) => SelectorOutput;

export function useAppHashParams<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: HashParamSelector<Path, SelectorOutput>
): SelectorOutput {
  const context = useAppRouteStore<SelectorOutput>(s => selector(s.hash as unknown as HashParamValue<Path>));
  if (!context) return null;
  return context;
}

//*****************************************************************************************
// useAppRoute
//*****************************************************************************************

type AppRouteShape<Path extends AppRoute['path']> = ParamsShape<Path> & SearchShape<Path> & HashShape<Path>;

export function useAppRoute<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: (store: AppRouteShape<Path>) => SelectorOutput
) {
  const context = useAppRouteStore<SelectorOutput>(selector as any);
  if (!context) return null;
  return context;
}
