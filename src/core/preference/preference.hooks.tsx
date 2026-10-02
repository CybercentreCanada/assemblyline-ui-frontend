import { APP_PREFERENCE_SCHEMA, APP_PREFERENCE_STORAGE_KEY } from 'app/core.preference';
import {
  getAppPreferenceStateFromApi,
  loadPreferenceFromLocalStorage,
  savePreferenceToLocalStorage,
  useAppPreferenceStoreApi,
  useAppSetPreferenceStore
} from 'core/preference';
import { useCallback } from 'react';

/**
 * @name useAppSavePreference
 * @description Persists the current preference state from the app store to localStorage.
 * @returns A callback that saves the current preference state.
 */
export const useAppSavePreference = () => {
  const preferenceStoreApi = useAppPreferenceStoreApi();

  return useCallback(() => {
    try {
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      savePreferenceToLocalStorage(APP_PREFERENCE_SCHEMA, preferenceState, APP_PREFERENCE_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to save preferences to localStorage', err);
    }
  }, [preferenceStoreApi]);
};

/**
 * @name useAppLoadPreference
 * @description Loads persisted preferences from localStorage and merges them into the app store.
 * @returns A callback that restores the stored preference state.
 */
export const useAppLoadPreference = () => {
  const setPreferenceStore = useAppSetPreferenceStore();

  return useCallback(() => {
    try {
      setPreferenceStore(store =>
        loadPreferenceFromLocalStorage(APP_PREFERENCE_SCHEMA, store, APP_PREFERENCE_STORAGE_KEY)
      );
    } catch (err) {
      console.warn('Failed to load preferences from localStorage', err);
    }
  }, [setPreferenceStore]);
};
