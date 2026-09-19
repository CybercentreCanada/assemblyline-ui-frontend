import type { AppPageKeyStore } from 'core/router';
import { useAppPageKeyStore } from 'core/router';

/**
 * @name useAppPageKey
 * @description Returns the current route key from the route-key store.
 * @returns Current route key, or null when no route context is available
 */
export function useAppPageKey(): AppPageKeyStore['pageKey'] {
  const context = useAppPageKeyStore(s => s.pageKey, true);
  if (context == null) return null;
  return context;
}
