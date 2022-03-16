import { useCallback, useMemo } from 'react';
import { ReducerProps, Store } from '..';

export type StyleState = {};

export type StyleRef = {};

export type StylePayload = {};

export const useStyleReducer = () => {
  const initialState = useMemo<StyleState>(() => ({}), []);

  const initialRef = useMemo<StyleRef>(() => ({}), []);

  const reducer = useCallback(({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
    return { ...nextStore };
  }, []);

  return { initialState, initialRef, reducer };
};
