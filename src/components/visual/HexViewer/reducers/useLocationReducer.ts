import useClipboard from 'commons_deprecated/components/hooks/useClipboard';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback } from 'react';
import {
  DEFAULT_STORE,
  getValueFromPath,
  isAction,
  LocationParam,
  LocationQuery,
  LOCATION_PARAMS,
  ReducerHandler,
  Reducers,
  setStoreWithPath,
  Store,
  UseReducer
} from '..';

export const useLocationReducer: UseReducer = () => {
  const { copy } = useClipboard();

  const query = React.useRef<SimpleSearchQuery>(new SimpleSearchQuery(window.location.search, ''));

  const handleLocationShare = useCallback((store: Store, param: LocationParam): void => {
    const value = getValueFromPath(store, param.path);
    const origin = getValueFromPath(DEFAULT_STORE, param.path);
    if (origin === value) return;
    query.current.set(param.key, value);
    return;
  }, []);

  const handleScrollLocationShare = useCallback((store: Store): void => {
    if (store.layout.folding.active) {
      if (store.mode.body === 'table') query.current.set('z', store.cellsRendered.visibleStartIndex);
      else if (store.mode.body === 'window') query.current.set('z', store.cellsRendered.visibleStartIndex);
    } else {
      if (store.mode.body === 'table') query.current.set('z', store.scroll.index);
      else if (store.mode.body === 'window') query.current.set('z', store.cellsRendered.visibleStartIndex);
    }
  }, []);

  const locationShare: Reducers['locationShare'] = useCallback(
    store => {
      query.current.deleteAll();
      LOCATION_PARAMS.forEach(param => handleLocationShare(store, param));
      handleScrollLocationShare(store);
      copy(`${window.location.origin}${window.location.pathname}?${query.current.toString()}${window.location.hash}`);
      return store;
    },
    [copy, handleLocationShare, handleScrollLocationShare]
  );

  const handleLocationLoad = useCallback((store: Store, param: LocationParam, value: string): Store => {
    if (param.type === 'number') {
      const num = parseInt(value);
      if (isNaN(num) || num === getValueFromPath(DEFAULT_STORE, param.path)) return store;
      let newStore = setStoreWithPath.Store(store, num, param.path);
      return setStoreWithPath.Store(store, getValueFromPath(newStore, param.path), ['location', ...param.path]);
    } else if (param.type === 'string') {
      if (value === getValueFromPath(DEFAULT_STORE, param.path)) return store;
      let newStore = setStoreWithPath.Store(store, value, param.path);
      return setStoreWithPath.Store(store, getValueFromPath(newStore, param.path), ['location', ...param.path]);
    } else return store;
  }, []);

  const locationLoad: Reducers['locationLoad'] = useCallback(
    store => {
      query.current = new SimpleSearchQuery(window.location.search, '');
      const params: LocationQuery = query.current.getParams();

      let newStore = { ...store };
      Object.keys(params).forEach(key => {
        for (let i = 0; i < LOCATION_PARAMS.length; i++) {
          if (key === LOCATION_PARAMS[i].key) newStore = handleLocationLoad(newStore, LOCATION_PARAMS[i], params[key]);
          else if (key === 'z')
            newStore = handleLocationLoad(
              newStore,
              { key: 'z', type: 'number', path: ['scroll', 'index'] },
              params[key]
            );
        }
      });
      return newStore;
    },
    [handleLocationLoad]
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.locationLoad(type)) return locationLoad(store, payload);
      else if (isAction.locationShare(type)) return locationShare(store, payload);
      else return { ...store };
    },
    [locationLoad, locationShare]
  );

  return { reducer };
};
