import type { InferAppRouteFromPath } from 'core/router';
import { findAppRouteFromKey, getRouteParamFromKey, useAppLocationParamStore, useAppPageKey } from 'core/router';
import type {
  InferSearchParamSnapshotFromEngine,
  SearchParamBlueprintMap,
  SearchParamEngine,
  SearchParamValueMap
} from 'features/search-params';
import { useMemo } from 'react';

/**
 * @name useAppSearchSnapshot
 * @description Returns a search snapshot resolved from the current route search values.
 * Uses the matched route search engine to reconstruct snapshot values from `param.search`.
 * @returns Current route search snapshot, or null when unavailable
 */
export function useAppSearchSnapshot<const Origin extends AppRoute['path']>(): InferSearchParamSnapshotFromEngine<
  InferAppRouteFromPath<Origin>['search']
> | null {
  const pageKey = useAppPageKey();

  const searchParam = useAppLocationParamStore(s =>
    !pageKey ? null : getRouteParamFromKey<Origin>(s, pageKey)?.search
  );
  const searchEngine = useAppLocationParamStore(s =>
    !pageKey ? null : findAppRouteFromKey<Origin>(s, pageKey)?.search
  );

  return useMemo(() => {
    if (!searchEngine)
      return null as unknown as InferSearchParamSnapshotFromEngine<InferAppRouteFromPath<Origin>['search']>;

    const engine = searchEngine as SearchParamEngine<SearchParamBlueprintMap>;
    return engine.full(searchParam as SearchParamValueMap) as unknown as InferSearchParamSnapshotFromEngine<
      InferAppRouteFromPath<Origin>['search']
    >;
  }, [searchEngine, searchParam]);
}
