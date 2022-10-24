// Actions
export type ActionStruct = { type: string; payload: any };

export type ActionConfig<Action extends ActionStruct> = {
  [A in Action as A['type']]: {
    type: `${A['type']}`;
    payload: A['payload'];
  };
}[keyof {
  [A in Action as A['type']];
}];

export type ActionsConfig<Action extends ActionStruct> = {
  [A in Action as A['type']]: {};
};

// Dispatcher
export type DispatchConfig<Action extends ActionStruct> = {
  [A in Action as A['type']]: (payload: A['payload']) => void;
};

export type DispatchAsyncConfig<Store extends object, Action extends ActionStruct> = {
  [A in Action as A['type']]: (store: Store, payload: A['payload']) => Promise<Store>;
};

export type DispatchContextPropsConfig<
  Store extends object,
  Action extends ActionStruct,
  ActionAsync extends ActionStruct
> = {
  dispatch: DispatchConfig<Action>;
  dispatchAsync: DispatchAsyncConfig<Store, ActionAsync>;
  setStoreRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<Store>>>;
};

export type DispatchContextConfig<
  Store extends object,
  Action extends ActionStruct,
  ActionAsync extends ActionStruct
> = React.Context<DispatchContextPropsConfig<Store, Action, ActionAsync>>;

// Reducer
export type ReducerConfig<Store extends object, Action extends ActionStruct> = (arg: {
  store: Store;
  action: Action;
  prevStore?: Store;
}) => Store;

export type ReducerAsyncConfig<Store extends object, ActionAsync extends ActionStruct> = (arg: {
  store: Store;
  action: ActionAsync;
  prevStore?: Store;
}) => Promise<Store>;

export type ReducersConfig<Store extends object, Action extends ActionStruct> = {
  [A in Action as A['type']]: (store: Store, payload: A['payload'], prevStore?: Store) => Store;
};

export type ReducersAsyncConfig<Store extends object, Action extends ActionStruct> = {
  [A in Action as A['type']]: (store: Store, payload: A['payload'], prevStore?: Store) => Promise<Store>;
};

// Store
export type StoreContextPropsConfig<Store extends object> = {
  store: Store;
  setStore: React.Dispatch<React.SetStateAction<Store>>;
};

export type StoreContextConfig<Store extends object> = React.Context<StoreContextPropsConfig<Store>>;
