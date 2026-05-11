import { useAppPreferenceStore, useAppSetPreferenceStore } from 'core/preference';
import { useCallback } from 'react';

/** Toggles and retrieves safe results visibility preference. */
export type UseAppSafeResults = {
  /** Whether to show safe results in query results. */
  showSafeResults: boolean;
  /** Callback to toggle safe results visibility. */
  toggleShowSafeResults: () => void;
};

/**
 * @name useAppSafeResults
 * @description Retrieves safe results visibility preference from app settings and provides toggle callback.
 * @returns Object containing showSafeResults flag and toggleShowSafeResults callback
 */
export const useAppSafeResults = (): UseAppSafeResults => {
  const setAppPreferences = useAppSetPreferenceStore();

  const showSafeResults = useAppPreferenceStore(s => s.safeResults.show || true);

  const toggleShowSafeResults = useCallback(() => {
    setAppPreferences(s => {
      s.safeResults.show = !s.safeResults.show;
      return s;
    });
  }, [setAppPreferences]);

  return { showSafeResults, toggleShowSafeResults };
};
