import { useCallback } from 'react';
import { isAction, ReducerHandler, Reducers, setStore, Store, UseReducer } from '..';

export const useLoadingReducer: UseReducer = () => {
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
    (store, { initialized }) => handleLoading(setStore.store.loading.Message(store, 'loading.bodyInit')),
    [handleLoading]
  );

  const appLoad: Reducers['appLoad'] = useCallback(
    (store, { data }) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.appLoad',
          conditions: { hasAppLoaded: true },
          errors: { isDataInvalid: data === undefined || data === null || data === '' }
        }))
      ),
    [handleLoading]
  );

  const appSave: Reducers['appSave'] = useCallback(
    (store, payload) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.appLoad',
          conditions: { hasAppLoaded: false }
        }))
      ),
    [handleLoading]
  );

  const settingFetch: Reducers['settingFetch'] = useCallback(
    (store, payload) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.settingFetch',
          conditions: { hasSettingsFetched: true }
        }))
      ),
    [handleLoading]
  );

  const settingLoad: Reducers['settingLoad'] = useCallback(
    (store, payload) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.settingLoad',
          conditions: { hasSettingsLoaded: true }
        }))
      ),
    [handleLoading]
  );

  const locationLoad: Reducers['locationLoad'] = useCallback(
    (store, payload) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.appLocationInit',
          conditions: { hasLocationInit: true }
        }))
      ),
    [handleLoading]
  );

  const bodyRefInit: Reducers['bodyRefInit'] = useCallback(
    (store, { ready }) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.bodyRefInit',
          conditions: { hasBodyRefInit: ready }
        }))
      ),
    [handleLoading]
  );

  const bodyResize: Reducers['bodyResize'] = useCallback(
    (store, { height, width }) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.bodyResize',
          conditions: { hasResized: true },
          errors: { isWidthTooSmall: width < 264 }
        }))
      ),
    [handleLoading]
  );

  const bodyScrollInit: Reducers['bodyScrollInit'] = useCallback(
    (store, payload) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.bodyScrollInit',
          conditions: { hasScrolled: true }
        }))
      ),
    [handleLoading]
  );

  const bodyItemsRendered: Reducers['bodyItemsRendered'] = useCallback(
    (store, payload) =>
      handleLoading(
        setStore.store.Loading(store, store.loading, () => ({
          message: 'loading.bodyItemsRendered',
          conditions: { hasBodyItemsRendered: true }
        }))
      ),
    [handleLoading]
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return appLoad(store, payload);
      else if (isAction.appSave(type)) return appSave(store, payload);
      else if (isAction.settingFetch(type)) return settingFetch(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.locationLoad(type)) return locationLoad(store, payload);
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
      settingFetch,
      settingLoad,
      locationLoad,
      bodyInit,
      bodyRefInit,
      bodyScrollInit,
      bodyResize,
      bodyItemsRendered
    ]
  );

  return { reducer };
};
