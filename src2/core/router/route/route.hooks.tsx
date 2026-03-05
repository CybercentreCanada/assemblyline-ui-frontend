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
