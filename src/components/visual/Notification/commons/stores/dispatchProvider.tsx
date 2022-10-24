import React, { useCallback, useRef } from 'react';
import {
  ActionsConfig,
  ActionStruct,
  DispatchAsyncConfig,
  DispatchConfig,
  DispatchContextConfig,
  ReducerAsyncConfig,
  ReducerConfig
} from './config';

type Props<Store extends object, Action extends ActionStruct, ActionAsync extends ActionStruct> = {
  children: ({ setStoreRef }: { setStoreRef: React.MutableRefObject<any> }) => React.ReactNode;
  props: {
    dispatchContext: DispatchContextConfig<Store, Action, ActionAsync>;
    actions: ActionsConfig<Action>;
    actionsAsync: ActionsConfig<ActionAsync>;
    reducer: ReducerConfig<Store, Action>;
    reducerAsync: ReducerAsyncConfig<Store, ActionAsync>;
  };
};

export const WrappedDispatchProvider = <
  Store extends object,
  Action extends ActionStruct,
  ActionAsync extends ActionStruct
>({
  children,
  props: { dispatchContext, actions, actionsAsync, reducer, reducerAsync }
}: Props<Store, Action, ActionAsync>) => {
  const setStoreRef = useRef<React.Dispatch<React.SetStateAction<Store>>>(null);

  const dispatcher = useCallback(
    (action: Action) => {
      setStoreRef.current(store => reducer({ store, action, prevStore: store }));
    },
    [reducer]
  );

  const dispatcherAsync = useCallback(
    (store: Store, action: ActionAsync) =>
      new Promise(async (resolve, reject) => {
        const newStore = (await reducerAsync({ store, action, prevStore: store }).catch(err => reject(err))) as Store;
        if (newStore !== null) setStoreRef.current(newStore);
        resolve(newStore);
      }),
    [reducerAsync]
  );

  const dispatcherConfig = useCallback(
    obj =>
      Object.fromEntries(Object.keys(obj).map(key => [key, payload => dispatcher({ type: key, payload } as Action)])),
    [dispatcher]
  );

  const dispatcherAsyncConfig = useCallback(
    obj =>
      Object.fromEntries(
        Object.keys(obj).map(key => [
          key,
          (store, payload) => dispatcherAsync(store, { type: key, payload: { store, payload } } as ActionAsync)
        ])
      ),
    [dispatcherAsync]
  );

  const dispatch: DispatchConfig<Action> = dispatcherConfig(actions) as DispatchConfig<Action>;
  const dispatchAsync: DispatchAsyncConfig<Store, ActionAsync> = dispatcherAsyncConfig(
    actionsAsync
  ) as DispatchAsyncConfig<Store, ActionAsync>;

  return (
    <dispatchContext.Provider value={{ dispatch, dispatchAsync, setStoreRef }}>
      {children({ setStoreRef })}
    </dispatchContext.Provider>
  );
};

export const DispatchProvider = React.memo(WrappedDispatchProvider);
export default DispatchProvider;
