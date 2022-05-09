import { useCallback, useMemo } from 'react';
import { ReducerProps, Store } from '..';

export type TranslationState = {};

export type TranslationRef = {};

export type TranslationPayload = {};

export const useTranslationReducer = () => {
  const initialState = useMemo<TranslationState>(() => ({}), []);

  const initialRef = useMemo<TranslationRef>(() => ({}), []);

  const reducer = useCallback(({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
    return { ...nextStore };
  }, []);

  return { initialState, initialRef, reducer };
};
