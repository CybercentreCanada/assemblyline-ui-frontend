import { useAppPathParams, useAppSearchSnapshot } from 'core/routes';
import useClipboard from 'deprecated/hooks/useClipboard';
import { useCallback } from 'react';
import type { LocationParam, ReducerHandler, Reducers, Store, UseReducer } from '..';
import { DEFAULT_STORE, getValueFromPath, isAction, LOCATION_PARAMS, setStoreWithPath } from '..';

export const useLocationReducer: UseReducer = () => {
  const path = useAppPathParams<'/file/viewer/:id/:tab'>();
  const search = useAppSearchSnapshot<'/file/viewer/:id/:tab'>();

  const { copy } = useClipboard();

  const locationShare: Reducers['locationShare'] = useCallback(
    store => {
      let scrollIndex: number | null = null;
      if (store.layout.folding.active || store.mode.body === 'window') {
        scrollIndex = store.cellsRendered.visibleStartIndex ?? null;
      } else if (store.mode.body === 'table') {
        scrollIndex = store.scroll.index ?? null;
      }

      const next = search.set(() => ({
        cursor: store.cursor.index ?? null,
        startIndex: store.select.startIndex !== DEFAULT_STORE.select.startIndex ? store.select.startIndex : null,
        endIndex: store.select.endIndex !== DEFAULT_STORE.select.endIndex ? store.select.endIndex : null,
        mode: store.search.mode.type ?? null,
        query: store.search.inputValue ?? '',
        selectedResult: store.search.selectedResult ?? null,
        scroll: scrollIndex !== DEFAULT_STORE.scroll.index ? scrollIndex : null
      }));

      void copy(
        `${window.location.origin}${window.location.pathname}#/file/viewer/${path?.id}/${path?.tab}?${next.toLocationSearch()}`
      );
      return store;
    },
    [copy, path, search]
  );

  const handleLocationLoad = useCallback((store: Store, param: LocationParam, value: string): Store => {
    if (param.type === 'number') {
      const num = parseInt(value);
      if (isNaN(num) || num === getValueFromPath(DEFAULT_STORE, param.path)) return store;
      const newStore = setStoreWithPath.Store(store, num, param.path);
      return setStoreWithPath.Store(store, getValueFromPath(newStore, param.path), ['location', ...param.path]);
    } else if (param.type === 'string') {
      if (value === getValueFromPath(DEFAULT_STORE, param.path)) return store;
      const newStore = setStoreWithPath.Store(store, value, param.path);
      return setStoreWithPath.Store(store, getValueFromPath(newStore, param.path), ['location', ...param.path]);
    } else return store;
  }, []);

  const locationLoad: Reducers['locationLoad'] = useCallback(
    store => {
      let newStore = { ...store };
      const v = search?.values;
      if (!v) return newStore;

      LOCATION_PARAMS.forEach(param => {
        const value = (v as Record<string, unknown>)[param.key];
        if (typeof value === 'string' || typeof value === 'number') {
          newStore = handleLocationLoad(newStore, param, String(value));
        }
      });

      if (v.scroll != null) {
        newStore = handleLocationLoad(
          newStore,
          { key: 'scroll', type: 'number', path: ['scroll', 'index'] },
          String(v.scroll)
        );
      }

      return newStore;
    },
    [search, handleLocationLoad]
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type } }) => {
      if (isAction.locationLoad(type)) return locationLoad(store);
      else if (isAction.locationShare(type)) return locationShare(store);
      else return { ...store };
    },
    [locationLoad, locationShare]
  );

  return { reducer };
};
