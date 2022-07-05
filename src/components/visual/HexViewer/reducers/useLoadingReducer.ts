import { useCallback, useMemo } from 'react';
import { isAction, ReducerHandler, Reducers, UseReducer } from '..';

export type LoadingState = {
  loading: {
    refsReady: boolean;
    hasResized: boolean;
    hasScrolled: boolean;
    initialized: boolean;
    error: boolean;
    message: string;
  };
};

export const useLoadingReducer: UseReducer<LoadingState> = () => {
  const initialState = useMemo<LoadingState>(
    () => ({
      loading: {
        refsReady: false,
        hasResized: false,
        hasScrolled: false,
        initialized: false,
        error: false,
        message: ''
      }
    }),
    []
  );

  const bodyInit: Reducers['bodyInit'] = useCallback((store, { initialized }) => {
    if (initialized)
      return {
        ...store,
        loading: {
          ...store.loading,
          refsReady: true,
          hasResized: true,
          hasScrolled: true,
          initialized: true,
          error: false,
          message: ''
        }
      };
    else
      return {
        ...store,
        loading: {
          ...store.loading,
          refsReady: false,
          hasResized: false,
          hasScrolled: false,
          initialized: false,
          error: false,
          message: 'loading.bodyInit'
        }
      };
  }, []);

  const appLoad: Reducers['appLoad'] = useCallback((store, { data }) => {
    return { ...store, loading: { ...store.loading, message: 'loading.appLoad' } };
  }, []);

  const appLocationInit: Reducers['appLocationInit'] = useCallback((store, payload) => {
    return { ...store, loading: { ...store.loading, message: 'loading.appLocationInit' } };
  }, []);

  const bodyRefInit: Reducers['bodyRefInit'] = useCallback((store, { ready }) => {
    return { ...store, loading: { ...store.loading, refsReady: ready, message: 'loading.bodyRefInit' } };
  }, []);

  const bodyResize: Reducers['bodyResize'] = useCallback((store, payload) => {
    return { ...store, loading: { ...store.loading, hasResized: true, message: 'loading.bodyResize' } };
  }, []);

  const bodyScrollInit: Reducers['bodyScrollInit'] = useCallback((store, payload) => {
    return {
      ...store,
      loading: { ...store.loading, initialized: true, hasScrolled: true, message: 'loading.bodyScrollInit' }
    };
  }, []);

  const bodyItemsRendered: Reducers['bodyItemsRendered'] = useCallback((store, payload) => {
    if (!store.loading.hasScrolled) return { ...store, message: 'loading.bodyItemsRendered' };
    else return { ...store, loading: { ...store.loading, message: 'loading.initialized' } };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return appLoad(store, payload);
      else if (isAction.appLocationInit(type)) return appLocationInit(store, payload);
      else if (isAction.bodyInit(type)) return bodyInit(store, payload);
      else if (isAction.bodyRefInit(type)) return bodyRefInit(store, payload);
      else if (isAction.bodyScrollInit(type)) return bodyScrollInit(store, payload);
      else if (isAction.bodyResize(type)) return bodyResize(store, payload);
      else if (isAction.bodyItemsRendered(type)) return bodyItemsRendered(store, payload);
      else return { ...store };
    },
    [appLoad, appLocationInit, bodyInit, bodyItemsRendered, bodyRefInit, bodyResize, bodyScrollInit]
  );

  return { initialState, reducer };
};
