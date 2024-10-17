import {
  getValueFromPath,
  setValueFromPath,
  type NestedTypeUsingTuplesAgain2,
  type ValidPathTuples
} from 'components/routes/submit2/utils/JSONPath';
import React, { createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

type UseStoreDataReturn<Store extends object> = {
  get: () => Store;
  set: <Path extends ValidPathTuples<Store>, Value extends NestedTypeUsingTuplesAgain2<Store, Path>>(
    path: Path
  ) => (input: Value | ((prev: Value) => Value)) => void;
  subscribe: (callback: () => void) => () => void;
};

type ProviderProps = {
  children: React.ReactNode;
};

export const createStoreContext = <Store extends object>(initialState: Store) => {
  const useStoreData = (): UseStoreDataReturn<Store> => {
    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const is = useCallback(
      <Path extends ValidPathTuples<Store>, Value extends NestedTypeUsingTuplesAgain2<Store, Path>>(
        input: Value | ((prev: Value) => Value)
      ): input is (prev: Value) => Value => typeof input === 'function',
      []
    );

    const set = useCallback(
      <Path extends ValidPathTuples<Store>, Value extends NestedTypeUsingTuplesAgain2<Store, Path>>(path: Path) =>
        (input: Value | ((prev: Value) => Value)) => {
          const prev = getValueFromPath(store.current, path) as Value;
          const next = is(input) ? input(prev) : input;
          store.current = setValueFromPath(store.current, path, next);
          subscribers.current.forEach(callback => callback());
        },
      []
    );

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe
    };
  };

  const StoreContext = createContext<UseStoreDataReturn<Store>>(null);

  const Provider = ({ children }: ProviderProps) => (
    <StoreContext.Provider value={useStoreData()}>{children}</StoreContext.Provider>
  );

  const useStore = <Path extends ValidPathTuples<Store>, Value extends NestedTypeUsingTuplesAgain2<Store, Path>>(
    path: Path
  ): [Value, (input: Value | ((prev: Value) => Value)) => void] => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('Store not found');
    }

    const state = useSyncExternalStore(
      store.subscribe,
      () => getValueFromPath(store.get(), path),
      () => getValueFromPath(initialState, path)
    );

    return [state, store.set(path)] as [Value, (input: Value | ((prev: Value) => Value)) => void];
  };

  return { Provider, useStore };
};

export default createStoreContext;
