import { shallowEqual, shallowReconcile } from 'features/prop-provider/prop-provider.utils';
import type { PropsWithChildren, ReactElement } from 'react';
import { createContext, memo, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

//*****************************************************************************************
// Prop Store
//*****************************************************************************************

type Subscriber = () => void;

const createPropStore = <Props extends object>(initialProps: Props) => {
  let state: Props = { ...initialProps };
  let prevProps: Props = initialProps;
  const subscribers = new Set<Subscriber>();

  const emit = (): void => {
    subscribers.forEach(fn => fn());
  };

  const get = <K extends keyof Props = keyof Props>(key: K): Props[K] => state[key] ?? initialProps[key];

  const reset = (incoming: Props | ((prev: Props, state: Props) => Props)): void => {
    const incomingProps = typeof incoming === 'function' ? incoming(prevProps, state) : incoming;
    if (shallowEqual(incomingProps, prevProps)) return;
    state = shallowReconcile(incomingProps, prevProps, state) as Props;
    prevProps = incomingProps;
    emit();
  };

  const set = (partial: Partial<Props> | ((prev: Props) => Partial<Props>)): void => {
    const nextPartial = typeof partial === 'function' ? partial(state) : partial;
    const nextState = { ...state, ...nextPartial };
    if (shallowEqual(state, nextState)) return;
    state = nextState;
    emit();
  };

  const subscribe = (fn: Subscriber): (() => boolean) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  return { get, set, reset, subscribe };
};

//*****************************************************************************************
// Prop Provider
//*****************************************************************************************

const PropContext = createContext<ReturnType<typeof createPropStore<object>> | null>(null);

export type PropProviderProps<Props extends object> = PropsWithChildren<{
  /** Values used to initialize the store. */
  initialProps: Props;
  /** Values or an updater synchronized into the store. */
  props: Props | ((prev: Props, state: Props) => Props);
}>;

export const PropProvider = memo(function <const Props extends object>({
  children,
  initialProps = {} as Props,
  props = {} as Props
}: PropProviderProps<Props>) {
  const storeRef = useRef<ReturnType<typeof createPropStore<Props>>>(null);

  if (!storeRef.current) {
    storeRef.current = createPropStore(initialProps);
    storeRef.current.reset(props);
  }

  useEffect(() => {
    storeRef.current.reset(props);
  }, [props]);

  return <PropContext.Provider value={storeRef.current}>{children}</PropContext.Provider>;
}) as <const Props extends object>(props: PropProviderProps<Props>) => ReactElement | null;

(PropProvider as unknown as { displayName: string }).displayName = 'PropProvider';

//*****************************************************************************************
// Use Prop Store
//*****************************************************************************************

export const usePropStore = function <const Props extends object>() {
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
