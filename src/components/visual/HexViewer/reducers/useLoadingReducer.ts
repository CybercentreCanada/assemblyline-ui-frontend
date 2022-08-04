import { useCallback, useMemo } from 'react';
import { isAction, ReducerHandler, Reducers, Store, UseReducer } from '..';

export type LoadingState = {
  loading: {
    status: 'loading' | 'initialized' | 'error';
    message: string;
    progress: number;
    conditions: {
      hasAppLoaded: boolean;
      hasSettingsLoaded: boolean;
      hasLocationInit: boolean;
      hasBodyRefInit: boolean;
      hasBodyItemsRendered: boolean;
      hasResized: boolean;
      hasScrolled: boolean;
    };
    errors: {
      isDataInvalid: boolean;
      isWindowTooSmall: boolean;
    };
  };
};

export const useLoadingReducer: UseReducer<LoadingState> = () => {
  const initialState = useMemo<LoadingState>(
    () => ({
      loading: {
        status: 'loading',
        message: 'loading.initialization',
        progress: 0,
        conditions: {
          hasAppLoaded: false,
          hasSettingsLoaded: false,
          hasLocationInit: false,
          hasBodyRefInit: false,
          hasBodyItemsRendered: false,
          hasResized: false,
          hasScrolled: false
        },
        errors: {
          isDataInvalid: false,
          isWindowTooSmall: false
        }
      }
    }),
    []
  );

  const handleLoading = useCallback((store: Store): Store => {
    const progress: number =
      (100 / Object.keys(store.loading.conditions).length) *
      Object.values(store.loading.conditions).reduce((sum, next) => (next === true ? sum + 1 : sum), 0);

    const conditions: boolean = Object.values(store.loading.conditions).reduce((prev, next) => prev && next, true);
    const errors: boolean = Object.values(store.loading.errors).reduce((prev, next) => prev || next, false);
    const status: 'loading' | 'initialized' | 'error' = !conditions ? 'loading' : !errors ? 'initialized' : 'error';

    return { ...store, loading: { ...store.loading, progress, status } };
  }, []);

  const bodyInit: Reducers['bodyInit'] = useCallback(
    (store, { initialized }) => {
      store.loading.message = 'loading.bodyInit';
      return handleLoading(store);
    },
    [handleLoading]
  );

  const appLoad: Reducers['appLoad'] = useCallback(
    (store, { data }) => {
      store.loading.message = 'loading.appLoad';
      store.loading.conditions.hasAppLoaded = true;
      store.loading.errors.isDataInvalid = data === undefined || data === null || data === '';
      return handleLoading(store);
    },
    [handleLoading]
  );

  const appSave: Reducers['appSave'] = useCallback(
    (store, payload) => {
      store.loading.message = 'loading.appLoad';
      store.loading.conditions.hasAppLoaded = false;
      return handleLoading(store);
    },
    [handleLoading]
  );

  const settingLoad: Reducers['settingLoad'] = useCallback(
    (store, payload) => {
      store.loading.message = 'loading.settingLoad';
      store.loading.conditions.hasSettingsLoaded = true;
      return handleLoading(store);
    },
    [handleLoading]
  );

  const appLocationInit: Reducers['appLocationInit'] = useCallback(
    (store, payload) => {
      store.loading.message = 'loading.appLocationInit';
      store.loading.conditions.hasLocationInit = true;
      return handleLoading(store);
    },
    [handleLoading]
  );

  const bodyRefInit: Reducers['bodyRefInit'] = useCallback(
    (store, { ready }) => {
      store.loading.message = 'loading.bodyRefInit';
      store.loading.conditions.hasBodyRefInit = ready;
      return handleLoading(store);
    },
    [handleLoading]
  );

  const bodyResize: Reducers['bodyResize'] = useCallback(
    (store, { height, width }) => {
      store.loading.message = 'loading.bodyResize';
      store.loading.conditions.hasResized = true;
      store.loading.errors.isWindowTooSmall = height < 0 || width < 264;
      return handleLoading(store);
    },
    [handleLoading]
  );

  const bodyScrollInit: Reducers['bodyScrollInit'] = useCallback(
    (store, payload) => {
      store.loading.message = 'loading.bodyScrollInit';
      store.loading.conditions.hasScrolled = true;
      return handleLoading(store);
    },
    [handleLoading]
  );

  const bodyItemsRendered: Reducers['bodyItemsRendered'] = useCallback(
    (store, payload) => {
      store.loading.message = 'loading.bodyItemsRendered';
      store.loading.conditions.hasBodyItemsRendered = true;
      return handleLoading(store);
    },
    [handleLoading]
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return appLoad(store, payload);
      else if (isAction.appSave(type)) return appSave(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.appLocationInit(type)) return appLocationInit(store, payload);
      else if (isAction.bodyInit(type)) return bodyInit(store, payload);
      else if (isAction.bodyRefInit(type)) return bodyRefInit(store, payload);
      else if (isAction.bodyScrollInit(type)) return bodyScrollInit(store, payload);
      else if (isAction.bodyResize(type)) return bodyResize(store, payload);
      else if (isAction.bodyItemsRendered(type)) return bodyItemsRendered(store, payload);
      else return { ...store };
    },
    [
      appLoad,
      appSave,
      appLocationInit,
      bodyInit,
      bodyItemsRendered,
      bodyRefInit,
      bodyResize,
      bodyScrollInit,
      settingLoad
    ]
  );

  return { initialState, reducer };
};
