import type { InputProps, InputStates } from 'components/visual/Inputs/lib/inputs.model';
import {
  DEFAULT_INPUT_PROPS,
  DEFAULT_INPUT_STATES,
  DEFAULT_INPUT_VALUES
} from 'components/visual/Inputs/lib/inputs.model';
import { shallowEqual, shallowReconcile } from 'components/visual/Inputs/lib/inputs.utils';
import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

export const createPropContext = <Props extends object>(initialProps: Props) => {
  const createPropStore = () => {
    const prevPropsRef = { current: {} };
    const stateRef = { current: {} };
    const subscribers = new Set<() => void>();

    const get = <Data extends object, K extends keyof (Data & Props) = keyof (Data & Props)>(key: K) =>
      (stateRef.current as Data & Props)?.[key] ?? (initialProps as Data & Props)?.[key];

    const reset = <Data extends object>(current: Data & Props) => {
      if (shallowEqual(current, prevPropsRef.current)) return;
      stateRef.current = shallowReconcile(current, prevPropsRef.current, stateRef.current) as Data & Props;
      prevPropsRef.current = current;
      subscribers.forEach(fn => fn());
    };

    const set = <Data extends object>(
      updater: Partial<Data & Props> | ((prev: Data & Props) => Partial<Data & Props>)
    ) => {
      const nextPartial =
        typeof updater === 'function' ? updater({ ...initialProps, ...stateRef.current } as Data & Props) : updater;
      const nextState = { ...stateRef.current, ...nextPartial };
      if (shallowEqual(stateRef.current, nextState)) return;
      stateRef.current = nextState;
      subscribers.forEach(fn => fn());
    };

    const subscribe = (callback: () => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    };

    return { get, reset, set, subscribe };
  };

  const PropContext = createContext<ReturnType<typeof createPropStore> | null>(null);

  const PropProvider = React.memo(
    <Data extends object>({ children, props }: { children: React.ReactNode; props: Data & Props }) => {
      const storeRef = useRef<ReturnType<typeof createPropStore> | null>(null);

      if (!storeRef.current) {
        storeRef.current = createPropStore();
        storeRef.current.reset<Data>(props);
      }

      useEffect(() => {
        storeRef.current.reset<Data>(props);
      }, [props]);

      return <PropContext.Provider value={storeRef.current}>{children}</PropContext.Provider>;
    }
  ) as <Data extends object>(props: { children: React.ReactNode; props: Data & Props }) => React.ReactNode;

  const usePropStore = <Data extends object>() => {
    const store = useContext(PropContext);
    if (!store) throw new Error('Store not found');

    const useStore = <K extends keyof (Data & Props), V extends (Data & Props)[K]>(
      key: K,
      isEqual: (a: V, b: V) => boolean = shallowEqual
    ): V => {
      const store = useContext(PropContext);
      if (!store) throw new Error('Store not found');

      const lastValueRef = useRef<V>(store.get<Data & Props>(key) as V);

      return useSyncExternalStore(
        store.subscribe,
        () => {
          const newValue = store.get<Data & Props>(key) as V;
          if (!isEqual(lastValueRef.current, newValue)) {
            lastValueRef.current = newValue;
          }
          return lastValueRef.current;
        },
        () => (initialProps as Data & Props)?.[key] as V
      );
    };

    return [useStore, store.set<Data & Props>] as const;
  };

  return { PropProvider, usePropStore };
};

export const { PropProvider, usePropStore } = createPropContext<InputProps & InputStates>({
  ...DEFAULT_INPUT_VALUES,
  ...DEFAULT_INPUT_PROPS,
  ...DEFAULT_INPUT_STATES
});
