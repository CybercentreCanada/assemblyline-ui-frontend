// import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

// export const createInputContext = <Store,>(initialState: Store) => {
//   const useStoreData = (
//     props: Store
//   ): {
//     get: () => Store;
//     set: (value: Partial<Store>) => void;
//     subscribe: (callback: () => void) => () => void;
//   } => {
//     const store = useRef<Store>({ ...initialState, ...props });

//     const get = useCallback(() => store.current, []);

//     const subscribers = useRef<Set<() => void>>(new Set<() => void>());

//     const set = useCallback((dispatch: Partial<Store> | ((value: Partial<Store>) => Partial<Store>)) => {
//       store.current =
//         typeof dispatch === 'function'
//           ? { ...store.current, ...dispatch(store.current) }
//           : { ...store.current, ...dispatch };
//       subscribers.current.forEach(callback => callback());
//     }, []);

//     const subscribe = useCallback((callback: () => void) => {
//       subscribers.current.add(callback);
//       return () => subscribers.current.delete(callback);
//     }, []);

//     useEffect(() => {
//       set(props);
//     }, [props, set]);

//     return useMemo(() => ({ get, set, subscribe }), [get, set, subscribe]);
//   };

//   type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

//   const StoreContext = createContext<UseStoreDataReturnType | null>(null);

//   type InputProviderProps = {
//     children: React.ReactNode;
//     props: Store;
//   };

//   const InputProvider = ({ children, props }: InputProviderProps) => {
//     return <StoreContext.Provider value={useStoreData(props)}>{children}</StoreContext.Provider>;
//   };

//   const useInputStore = <SelectorOutput,>(
//     selector: (store: Store) => SelectorOutput
//   ): [SelectorOutput, (value: Partial<Store>) => void] => {
//     const store = useContext(StoreContext);
//     if (!store) {
//       throw new Error('Store not found');
//     }

//     const state = useSyncExternalStore(
//       store.subscribe,
//       () => selector(store.get()) ?? selector(initialState),
//       () => selector(initialState)
//     );

//     return [state, store.set];
//   };

//   return {
//     InputProvider,
//     useInputStore
//   };
// };
