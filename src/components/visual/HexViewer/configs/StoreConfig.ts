import { Store } from '..';

// Action

export type ActionStruct = { type: string; payload: any; guard?: any; tracked?: boolean; repeat?: boolean };

export type ActionsConfig<AS extends ActionStruct> = {
  [A in AS as A['type']]: {
    type: `${Capitalize<A['type']>}_Action`;
    payload: A['payload'];
    guard: A['guard'];
    tracked: A['tracked'] & boolean;
    repeat: A['repeat'] & boolean;
  };
};

export type ActionTypesConfig<Actions extends ActionStruct> = {
  [A in Actions as A['type']]: `${Capitalize<A['type']>}_Action`;
};

export type ActionPayloadsConfig<Actions extends ActionStruct> = {
  [A in Actions as A['type']]: A['payload'];
};

export type ActionPropsConfig<Actions extends ActionStruct> = {
  [A in Actions as A['type']]: {
    type: `${Capitalize<A['type']>}_Action`;
    payload: A['payload'];
  };
}[keyof {
  [A in Actions as A['type']];
}];

export type IsActionsConfig<Actions extends ActionStruct> = {
  [A in Actions as A['type']]: (
    type: {
      [B in Actions as B['type']]: `${Capitalize<B['type']>}_Action`;
    }[keyof {
      [B in Actions as B['type']]: `${Capitalize<B['type']>}_Action`;
    }]
  ) => boolean;
};

export type ActionConfig<AS extends ActionStruct> = ActionsConfig<AS>[keyof ActionsConfig<AS>];
export type ActionTypeConfig<AS extends ActionStruct> = ActionTypesConfig<AS>[keyof ActionTypesConfig<AS>];
export type ActionPayloadConfig<AS extends ActionStruct> = ActionPayloadsConfig<AS>[keyof ActionPayloadsConfig<AS>];
export type ActionPropConfig<AS extends ActionStruct> = ActionPropsConfig<AS>[keyof ActionPropsConfig<AS>];
export type IsActionConfig<AS extends ActionStruct> = IsActionsConfig<AS>[keyof IsActionsConfig<AS>];

// Dispatch

export type DispatchersConfig<Actions extends ActionStruct> = {
  [A in Actions as `on${Capitalize<A['type']>}`]: A extends { guard: any }
    ? (payload: A['payload'], guard: A['guard']) => void
    : (payload: A['payload']) => void;
};

export type DispatchPropsConfig<Actions extends ActionStruct> = {
  [A in Actions as A['type']]: {
    type: `${Capitalize<A['type']>}_Action`;
    payload: A['payload'];
  } & (A extends { tracked: true } ? { tracked: true } : A extends { tracked: false } ? { tracked: false } : {}) &
    (A extends { repeat: true } ? { repeat: true } : A extends { repeat: false } ? { repeat: false } : {});
}[keyof {
  [A in Actions as A['type']];
}];

export type DispatcherConfig<AS extends ActionStruct> = DispatchersConfig<AS>[keyof DispatchersConfig<AS>];
export type DispatchPropConfig<AS extends ActionStruct> = DispatchPropsConfig<AS>[keyof DispatchPropsConfig<AS>];

// Reducer

export type ReducersConfig<Actions extends ActionStruct> = {
  [A in Actions as A['type']]: (store: Store, payload: A['payload'], prevStore?: Store) => Store;
};

export type ReducerActionsConfig<Actions extends ActionStruct> = {
  [A in Actions as A['type']]: {
    type: `${Capitalize<A['type']>}_Action`;
    payload: A['payload'];
  };
};

export type ReducerConfig<AS extends ActionStruct> = ReducersConfig<AS>[keyof ReducersConfig<AS>];
export type ReducerActionConfig<AS extends ActionStruct> = ReducerActionsConfig<AS>[keyof ReducerActionsConfig<AS>];

export type UseReducerConfig<State, Action extends ActionStruct> = () => {
  initialState: State;
  reducer: (props: { store: Store; action: ActionPropConfig<Action>; prevStore?: Store }) => Store;
  render?: (prevStore: Store, nextStore: Store) => void;
};
