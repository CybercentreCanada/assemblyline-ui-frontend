import { AppRoute } from '../route/route.components';
import type { SearchParamEngine } from '../search-params/lib/search-params.engine';
import type { SearchParamBlueprintMap } from '../search-params/lib/search-params.model';
import type { SearchParamSnapshot } from '../search-params/lib/search-params.snapshot';
import { useAppRouteStore } from './route.providers';

type RouteByPath<Path extends AppRoute['path']> = Extract<AppRoute, { path: Path }>;

//*****************************************************************************************
// usePathParam
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
) {
  const context = useAppRouteStore<SelectorOutput>(s => selector(s.params));
  if (!context) return null;
  return context[0];
}

//*****************************************************************************************
// useSearchParam
//*****************************************************************************************

type SearchShape<Path extends AppRoute['path']> =
  Exclude<RouteByPath<Path>['search'], undefined> extends never
    ? { search?: never }
    : { search: SearchParamValue<Path> };

type SearchParamValue<Path extends AppRoute['path']> =
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
) {
  const context = useAppRouteStore<SelectorOutput>(s => selector(s.search as SearchParamValue<Path>));
  if (!context) return null;
  return context[0];
}

//*****************************************************************************************
// useHashParams
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
) {
  const context = useAppRouteStore<SelectorOutput>(s => selector(s.hash as HashParamValue<Path>));
  if (!context) return null;
  return context[0];
}

//*****************************************************************************************
// useRoute
//*****************************************************************************************

export type AppRouteStore<Path extends AppRoute['path']> = ParamsShape<Path> & SearchShape<Path> & HashShape<Path>;

export function useAppRoute<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: (store: AppRouteStore<Path>) => SelectorOutput
) {
  const context = useAppRouteStore<SelectorOutput>(selector as any);
  if (!context) return null;
  return context[0];
}
