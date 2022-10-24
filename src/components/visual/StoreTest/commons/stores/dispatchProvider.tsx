import React, { useCallback, useRef } from 'react';
import { ActionsConfig, ActionStruct, DispatchConfig, DispatchContextConfig, ReducerConfig } from './config';

type Props<Store extends object, Action extends ActionStruct> = {
  children: ({ dispatchRef }: { dispatchRef: React.MutableRefObject<any> }) => React.ReactNode;
  props: {
    DispatchContext: DispatchContextConfig<Store, Action>;
    actions: ActionsConfig<Action>;
    reducer: ReducerConfig<Store, Action>;
  };
};

export const WrappedDispatchProvider = <Store extends object, Action extends ActionStruct>({
  children,
  props: { actions, reducer, DispatchContext }
}: Props<Store, Action>) => {
  const dispatchRef = useRef<React.Dispatch<React.SetStateAction<Store>>>(null);

  const dispatcher = useCallback(
    (action: Action) => {
      dispatchRef.current(store => reducer({ store, action, prevStore: store }));
    },
    [reducer]
  );

  const dispatchConfig = useCallback(
    a => Object.fromEntries(Object.keys(a).map(key => [key, payload => dispatcher({ type: key, payload } as Action)])),
    [dispatcher]
  );

  const dispatch: DispatchConfig<Action> = dispatchConfig(actions) as DispatchConfig<Action>;

  return (
    <DispatchContext.Provider value={{ dispatch, setStore: dispatchRef.current }}>
      {children({ dispatchRef })}
    </DispatchContext.Provider>
  );
};

export const DispatchProvider = React.memo(WrappedDispatchProvider);
export default DispatchProvider;
