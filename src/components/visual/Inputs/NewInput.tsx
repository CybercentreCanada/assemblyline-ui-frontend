import React, { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

type Store = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const INITIAL_DATA: Store = {
  value: '',
  onChange: () => null
};

const InputContext = createContext<{
  get: () => Store;
  set: (value: Partial<Store>) => void;
  subscribe: (callback: () => void) => () => void;
} | null>(null);

const InputProvider = ({ children, props }: { children: React.ReactNode; props: Store }) => {
  const store = useRef<Store>(props);

  const get = useCallback(() => store.current, []);

  const subscribers = useRef<Set<() => void>>(new Set<() => void>());

  const set = useCallback((value: Partial<Store>) => {
    store.current = { ...store.current, ...value };
    subscribers.current.forEach(callback => callback());
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  useEffect(() => {
    set(props);
  }, [props, set]);

  return <InputContext.Provider value={{ get, set, subscribe }}>{children}</InputContext.Provider>;
};

const useInputStore = <SelectorOutput,>(
  selector: (store: Store) => SelectorOutput
): [SelectorOutput, (value: Partial<Store>) => void] => {
  const store = useContext(InputContext);
  if (!store) {
    throw new Error('Store not found');
  }

  const state = useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()) ?? selector(INITIAL_DATA),
    () => selector(INITIAL_DATA)
  );

  return [state, store.set];
};

const WrappedNewInput = () => {
  const [value] = useInputStore(s => s.value);
  const [onChange] = useInputStore(s => s.onChange);

  return <input value={value} onChange={e => onChange(e)} />;
};

export type Props = Store;

export const NewInput = (props: Props) => (
  <InputProvider props={props}>
    <WrappedNewInput />
  </InputProvider>
);
