import React from 'react';
import { ActionConfig, ActionsConfig, ReducerConfig, ReducersConfig } from '../commons/stores/config';

export type Action = ActionConfig<
  | { type: 'setValue'; payload: number }
  | { type: 'increase'; payload: number }
  | { type: 'decrease'; payload: number }
  | { type: 'reset'; payload: void }
>;

export type Store = {
  value: number;
};

export type Reducer = ReducerConfig<Store, Action>;
export type Reducers = ReducersConfig<Store, Action>;

export const useTestStore = () => {
  const actions: ActionsConfig<Action> = {
    setValue: {},
    increase: {},
    decrease: {},
    reset: {}
  };

  const initialState: Store = {
    value: 0
  };

  const setValue: Reducers['setValue'] = React.useCallback((store, payload) => {
    return { ...store, value: payload };
  }, []);

  const increase: Reducers['increase'] = React.useCallback((store, payload) => {
    return { ...store, value: store.value + payload };
  }, []);

  const decrease: Reducers['decrease'] = React.useCallback((store, payload) => {
    return { ...store, value: store.value - payload };
  }, []);

  const reducer: Reducer = React.useCallback(
    ({ store, action, prevStore }) => {
      if (action.type === 'setValue') return setValue(store, action.payload);
      else if (action.type === 'increase') return increase(store, action.payload);
      else if (action.type === 'decrease') return decrease(store, action.payload);
      else if (action.type === 'reset') return { ...store, value: 0 };
      else return store;
    },
    [decrease, increase, setValue]
  );

  return { initialState, actions, reducer };
};
