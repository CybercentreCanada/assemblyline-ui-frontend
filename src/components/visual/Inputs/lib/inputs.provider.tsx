import type { InputProps, InputStates } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_PROPS } from 'components/visual/Inputs/lib/inputs.model';
import { parseInputProps } from 'components/visual/Inputs/lib/inputs.utils';
import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => key in b && Object.is(a[key], b[key]));
}

export function deepReconcile<T extends Record<string, unknown>>(
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

export const createPropContext = <Props extends object>(
  initialProps: Props,
  parser: (data: unknown) => Props = v => v as Props
) => {
  const createPropStore = () => {
    const stateRef = { current: parser(initialProps) };
    const subscribers = new Set<() => void>();

    const get = <Data,>() => stateRef.current as Data & Props;

    const reset = <Data,>(incoming: Partial<Data & Props>) => {
      const nextState = parser(deepReconcile(incoming, stateRef.current, initialProps));
      if (shallowEqual(stateRef.current, nextState)) return;
      stateRef.current = nextState;
      subscribers.forEach(fn => fn());
    };

    const set = <Data,>(updater: Partial<Data & Props> | ((prev: Data & Props) => Partial<Data & Props>)) => {
      const nextPartial = typeof updater === 'function' ? updater(stateRef.current as Data & Props) : updater;
      const nextState = parser({ ...stateRef.current, ...nextPartial });

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

  const PropProvider = <Data,>({ children, data }: { children: React.ReactNode; data: Data & Props }) => {
    const storeRef = useRef<ReturnType<typeof createPropStore> | null>(null);

    if (!storeRef.current) {
      storeRef.current = createPropStore();
      storeRef.current.reset<Data>(data);
    }

    useEffect(() => {
      storeRef.current.reset<Data>(data);
    }, [data]);

    return <PropContext.Provider value={storeRef.current}>{children}</PropContext.Provider>;
  };

  const usePropStore = <Data,>() => {
    const store = useContext(PropContext);
    if (!store) throw new Error('Store not found');

    const useStore = <T,>(selector: (state: Data & Props) => T, isEqual: (a: T, b: T) => boolean = shallowEqual): T => {
      const store = useContext(PropContext);
      if (!store) throw new Error('Store not found');

      const lastValueRef = useRef<T>(selector(store.get<Data>()));

      return useSyncExternalStore(
        store.subscribe,
        () => {
          const newValue = selector(store.get<Data>());
          if (!isEqual(lastValueRef.current, newValue)) {
            lastValueRef.current = newValue;
          }
          return lastValueRef.current;
        },
        () => selector(initialProps as Data & Props)
      );
    };

    return [useStore, store.set<Data & Props>] as const;
  };

  return { PropProvider, usePropStore };
};

export const { PropProvider, usePropStore } = createPropContext<InputProps & InputStates>(
  DEFAULT_INPUT_PROPS,
  parseInputProps
);
