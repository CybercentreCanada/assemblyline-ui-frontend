import { useLocalStorage } from '@tui/core';

// A constant that will be used as prefix of all local storage keys.
export const MY_LOCAL_STORAGE_PREFIX = 'templateui';

export default function useMyLocalStorage() {
  return useLocalStorage(MY_LOCAL_STORAGE_PREFIX);
}
