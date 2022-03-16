import { useCallback, useMemo } from 'react';
import { ReducerProps, Store } from '..';

export type SuggestionState = {
  suggestion: {
    open: boolean;
  };
};

export type SuggestionRef = {};

export type SuggestionPayload = {};

export const useSuggestionReducer = () => {
  const initialState = useMemo<SuggestionState>(
    () => ({
      suggestion: {
        open: false
      }
    }),
    []
  );

  const initialRef = useMemo<SuggestionRef>(() => ({}), []);

  const reducer = useCallback(({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
    return { ...nextStore };
  }, []);

  return { initialState, initialRef, reducer };
};
