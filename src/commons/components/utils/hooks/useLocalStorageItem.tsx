import useLocalStorage from 'commons/components/utils/hooks/useLocalStorage';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * This hooks backs the typical 'useState' hook with local storage.
 *
 * This means that it will initialize with the value stored in local storage.
 *
 * State changes are also persisted to local storage.
 *
 * All this ensures the state is preserved across inializations.
 *
 * @param key - local storage key under which to store the state.
 * @param initialValue - local storage initialization value.
 * @returns a stateful value, a function to update it, and a function to remove it.
 */
export default function useLocalStorageItem<T>(
  key: string,
  initialValue?: T
): [T, (newValue: T | ((prev: T) => T), save?: boolean) => void, () => void] {
  const { get, set, has, remove } = useLocalStorage();
  const [value, setValue] = useState<T>(get(key) ?? initialValue);

  useEffect(() => {
    if (initialValue !== null && initialValue !== undefined && !has(key)) {
      set(key, initialValue);
    }
  }, [key, initialValue, has, set]);

  const setter = useCallback(
    (newValue: T | ((prev: T) => T), save: boolean = true) => {
      const computedValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(value) : newValue;

      if (save) {
        if (computedValue !== undefined) {
          set(key, computedValue);
        } else {
          remove(key);
        }
      }

      setValue(computedValue);
    },
    [key, remove, set, value]
  );

  const remover = useCallback(() => remove(key), [key, remove]);

  return useMemo(() => [value, setter, remover], [remover, setter, value]);
}
