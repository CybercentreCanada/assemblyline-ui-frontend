import {
  getAppInterfaceStateFromApi,
  useAppInterfaceStore,
  useAppInterfaceStoreApi,
  useAppSetInterfaceStore
} from 'core/interface';
import type { HighlightMapProps } from 'layout/highlighter';
import { getHighlighterKey, hasHighlighterKey, hasHighlighterKeys, toggleHighlighterKey } from 'layout/highlighter';
import { useCallback } from 'react';

/** Manages highlight state for tree/list components with high fan-out (1000+ consumers). */
export type UseAppHighlighter = {
  /** Constructs a composite highlight key from type and value. */
  getKey: (type: string, value: string) => string;
  /** Checks if a key is directly or indirectly highlighted. */
  isHighlighted: (key: string) => boolean;
  /** Checks if any key in a list is highlighted. */
  hasKeys: (keyList: string[]) => boolean;
  /** Toggles highlight state for a single key and recomputes related keys. */
  trigger: (key: string) => void;
  /** Replaces the key relation map and triggers related key recomputation. */
  setMap: (map: HighlightMapProps) => void;
};

/**
 * @name useAppHighlighter
 * @description Manages highlight keys and related highlight keys persisted in the interface store.
 * Optimized for high fan-out scenarios (1000+ concurrent consumers).
 * @returns Highlight helpers with stable callbacks
 */
export const useAppHighlighter = (): UseAppHighlighter => {
  const setInterfaceStore = useAppSetInterfaceStore();
  const interfaceApi = useAppInterfaceStoreApi();

  const isHighlighted = useCallback(
    (key: string): boolean => hasHighlighterKey(key)(getAppInterfaceStateFromApi(interfaceApi)),
    [interfaceApi]
  );

  const hasKeys = useCallback(
    (keyList: string[]) => hasHighlighterKeys(keyList)(getAppInterfaceStateFromApi(interfaceApi)),
    [interfaceApi]
  );

  const trigger = useCallback((key: string) => setInterfaceStore(toggleHighlighterKey(key)), [setInterfaceStore]);

  const setMap = useCallback(
    (map: HighlightMapProps) =>
      setInterfaceStore(store => {
        store.highlighter.links = map;
        return store;
      }),
    [setInterfaceStore]
  );

  return {
    getKey: getHighlighterKey,
    hasKeys,
    isHighlighted,
    setMap,
    trigger
  };
};

export const useAppIsHighlighted = function (key: string | (() => string)) {
  return useAppInterfaceStore(s => hasHighlighterKey(typeof key === 'function' ? key() : key)(s));
};

export const useAppHasHighlightedKeys = function (keyList: string[] | (() => string[])) {
  return useAppInterfaceStore(s => hasHighlighterKeys(typeof keyList === 'function' ? keyList() : keyList)(s));
};
