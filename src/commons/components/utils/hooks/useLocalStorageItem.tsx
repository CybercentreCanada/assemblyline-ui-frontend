import { useEffect, useMemo, useState } from 'react';
import useLocalStorage from './useLocalStorage';

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
export default function useLocalStorageItem<T>(key: string, initialValue?: T): [T, (value: T) => void, () => void] {
  const { get, set, has, remove } = useLocalStorage();
  const [value, setValue] = useState<T>(get(key) ?? initialValue);

  useEffect(() => {
    if (initialValue !== null && initialValue !== undefined && !has(key)) {
      set(key, initialValue);
    }
  }, [key, initialValue, has, set]);

  return useMemo(
    () => [
      value,
      newValue => {
        set(key, newValue);
        setValue(newValue);
      },
      () => remove(key)
    ],
    [key, value, set, remove]
  );
}
