import { shallowEqual, shallowReconcile } from 'components/core/PropProvider/props.utils';
import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

//**************************************************************
//  createPropStore
//**************************************************************
type Subscriber = () => void;

function createPropStore<Props extends object>(initialProps: Props) {
  let state: Props = { ...initialProps };
  let prevProps: Props = initialProps;
  const subscribers = new Set<Subscriber>();

  const emit = () => {
    subscribers.forEach(fn => fn());
  };

  const get = <K extends keyof Props = keyof Props>(key: K): Props[K] => state[key] ?? initialProps[key];

  const reset = (incoming: Props) => {
    if (shallowEqual(incoming, prevProps)) return;
    state = shallowReconcile(incoming, prevProps, state) as Props;
    prevProps = incoming;
    emit();
  };

  const set = (partial: Partial<Props> | ((prev: Props) => Partial<Props>)) => {
    const nextPartial = typeof partial === 'function' ? partial(state) : partial;
    const nextState = { ...state, ...nextPartial };
    if (shallowEqual(state, nextState)) return;
    state = nextState;
    emit();
  };

  const subscribe = (fn: Subscriber) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  const getState = () => state;

  return { get, set, reset, subscribe, getState };
}

//**************************************************************
//  PropProvider
//**************************************************************
const PropContext = createContext<ReturnType<typeof createPropStore<object>> | null>(null);

type PropProviderProps<Props extends object> = {
  children: React.ReactNode;
  initialProps: Props;
  props: Props;
};

const WrappedPropProvider = <Props extends object>({
  children,
  initialProps = {} as Props,
  props = {} as Props
}: PropProviderProps<Props>) => {
  const storeRef = useRef<ReturnType<typeof createPropStore<Props>>>(null);

  if (!storeRef.current) {
    storeRef.current = createPropStore(initialProps);
    storeRef.current.reset(props);
  }

  useEffect(() => {
    storeRef.current.reset(props);
  }, [props]);

  return <PropContext.Provider value={storeRef.current}>{children}</PropContext.Provider>;
};

export const PropProvider = React.memo(WrappedPropProvider) as typeof WrappedPropProvider;

//**************************************************************
//  usePropStore
//**************************************************************
export const usePropStore = <Props extends object>() => {
  const store = useContext(PropContext) as ReturnType<typeof createPropStore<Props>> | null;

  if (!store) throw new Error('PropStore not found');

  const useStore = <K extends keyof Props, V extends Props[K]>(
    key: K,
    isEqual: (a: V, b: V) => boolean = shallowEqual
  ): V => {
    const lastValueRef = useRef<V>(store.get(key) as V);

    return useSyncExternalStore(
      store.subscribe,
      () => {
        const next = store.get(key) as V;
        if (!isEqual(lastValueRef.current, next)) {
          lastValueRef.current = next;
        }
        return lastValueRef.current;
      },
      () => store.get(key) as V
    );
  };

  return [useStore, store.set] as const;
};
