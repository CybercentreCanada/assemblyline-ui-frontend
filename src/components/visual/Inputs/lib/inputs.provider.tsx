import type { InputProps, InputStates } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_PROPS, DEFAULT_INPUT_STATES } from 'components/visual/Inputs/lib/inputs.model';
import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

function shallowEqual<T>(a: T, b: T, func: boolean = true): boolean {
  if (typeof a === 'function' || typeof b === 'function') return func;
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  return (
    keysA.length === keysB.length &&
    keysA.every(
      key =>
        key in b &&
        ((typeof a[key] === 'function' || typeof b[key] === 'function' ? func : false) || Object.is(a[key], b[key]))
    )
  );
}

function deepReconcile<T extends Record<string, unknown>>(
  incoming: Partial<T>,
  existing: Partial<T>,
  initial: Partial<T>
): T {
  const result: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(initial), ...Object.keys(existing), ...Object.keys(incoming)])) {
    if (key in incoming) {
      result[key] = incoming[key];
    } else if (key in existing && key in initial) {
      result[key] = initial[key];
    } else {
      result[key] = existing[key] ?? initial[key];
    }
  }

  return result as T;
}

function shallowReconcile<T extends Record<string, unknown>>(
  current: Partial<T>,
  previous: Partial<T>,
  result: Partial<T>
): T {
  const output: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(result), ...Object.keys(current), ...Object.keys(previous)])) {
    if (key in current) {
      output[key] = current[key];
    } else if (key in result && key in previous) {
      continue;
    } else if (key in result) {
      output[key] = result[key];
    }
  }

  return output as T;
}

export const createPropContext = <Props extends object>(initialProps: Props) => {
  const createPropStore = () => {
    const prevPropsRef = { current: {} };
    const stateRef = { current: {} };
    const subscribers = new Set<() => void>();

    const get = <Data extends object, K extends keyof (Data & Props) = keyof (Data & Props)>(key: K) =>
      (stateRef.current as Data & Props)?.[key] ?? (initialProps as Data & Props)?.[key];

    const reset = <Data extends object>(current: Data & Props) => {
      if (shallowEqual(current, prevPropsRef.current, true)) return;
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

  const PropProvider = <Data extends object>({
    children,
    props
  }: {
    children: React.ReactNode;
    props: Data & Props;
  }) => {
    const storeRef = useRef<ReturnType<typeof createPropStore> | null>(null);

    if (!storeRef.current) {
      storeRef.current = createPropStore();
      storeRef.current.reset<Data>(props);
    }

    useEffect(() => {
      storeRef.current.reset<Data>(props);
    }, [props]);

    return <PropContext.Provider value={storeRef.current}>{children}</PropContext.Provider>;
  };

  const usePropStore = <Data extends object>() => {
    const store = useContext(PropContext);
    if (!store) throw new Error('Store not found');

    const useStore = <K extends keyof (Data & Props), V extends (Data & Props)[K]>(
      key: K,
      isEqual: (a: V, b: V, func: boolean) => boolean = shallowEqual
    ): V => {
      const store = useContext(PropContext);
      if (!store) throw new Error('Store not found');

      const lastValueRef = useRef<V>(store.get<Data & Props>(key) as V);

      return useSyncExternalStore(
        store.subscribe,
        () => {
          const newValue = store.get<Data & Props>(key) as V;
          if (!isEqual(lastValueRef.current, newValue, false)) {
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
  ...DEFAULT_INPUT_PROPS,
  ...DEFAULT_INPUT_STATES
});
