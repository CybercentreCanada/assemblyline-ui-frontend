import type { AppRoute } from 'app/app.routes';
import { useRouteStore } from './route.providers';

//*****************************************************************************************
// useRoute
//*****************************************************************************************

// prettier-ignore
export type AppRouteStore<Path extends AppRoute['path']> =
  & Extract<AppRoute, { path: Path }>['params'] extends { type: infer Params }
    ? { params: Params }
    : { params?: never }
  & Extract<AppRoute, { path: Path }>['search'] extends infer Search
    ? { search: Search }
    : { search?: never }
  & Extract<AppRoute, { path: Path }>['hash'] extends infer Hash
    ? { hash: Hash }
    : { hash?: never }

export function useRoute<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: (store: AppRouteStore<Path>) => SelectorOutput
) {
  const context = useRouteStore<SelectorOutput>(selector as any);
  if (!context) return null;
  return context[0];
}

//*****************************************************************************************
// usePathParam
//*****************************************************************************************

// prettier-ignore
export type PathParamSelector<Path extends AppRoute['path'], SelectorOutput> =
  Extract<AppRoute, { path: Path }>['params'] extends { type: infer Params }
    ? (
        store: Extract<AppRoute, { path: Path }>['params'] extends { type: infer Params }
          ? Params
          : never
      ) => SelectorOutput
    : never;

export function usePathParam<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: PathParamSelector<Path, SelectorOutput>
) {
  const context = useRouteStore<SelectorOutput>(selector as any);
  if (!context) return null;
  return context[0];
}

//*****************************************************************************************
// useSearchParam
//*****************************************************************************************

// prettier-ignore
export type SearchParamSelector<Path extends AppRoute['path'], SelectorOutput> =
  Extract<AppRoute, { path: Path }>['params'] extends infer Params
    ? (
        store: Extract<AppRoute, { path: Path }>['search'] extends infer Params
          ? Params
          : never
      ) => SelectorOutput
    : never;

export function useSearchParam<const Path extends AppRoute['path'], const SelectorOutput>(
  path: Path,
  selector: SearchParamSelector<Path, SelectorOutput>
) {
  const context = useRouteStore<SelectorOutput>(selector as any);
  if (!context) return null;
  return context[0];
}
