import {
  getAppConfigStateFromApi,
  loadSettingsFromLocalStorage,
  saveSettingsFromLocalStorage
} from 'core/config/config.utils';
import { describe, expect, it, vi } from 'vitest';
import type { StoreApi } from 'zustand';

const STORAGE_KEY = 'test.config';

//*****************************************************************************************
// getAppConfigStateFromApi
//*****************************************************************************************
describe('getAppConfigStateFromApi', () => {
  it('returns the state from the store api', () => {
    const state = { some: 'value' } as unknown as AppConfigStore;
    const api = { getState: () => state } as StoreApi<AppConfigStore>;
    expect(getAppConfigStateFromApi(api)).toBe(state);
  });

  it('falls back to an empty object when the api has no state', () => {
    const api = { getState: () => undefined } as unknown as StoreApi<AppConfigStore>;
    expect(getAppConfigStateFromApi(api)).toEqual({});
  });

  it('falls back to an empty object when the api is null', () => {
    expect(getAppConfigStateFromApi(null as unknown as StoreApi<AppConfigStore>)).toEqual({});
  });
});

//*****************************************************************************************
// saveSettingsFromLocalStorage
//*****************************************************************************************
describe('saveSettingsFromLocalStorage', () => {
  it('stores the serialized value, stripped to the schema shape', () => {
    const storage: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => {
      storage[k] = v;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(k => {
      delete storage[k];
    });

    saveSettingsFromLocalStorage(STORAGE_KEY, { a: 1 });

    expect(JSON.parse(storage[STORAGE_KEY])).toEqual({});

    vi.restoreAllMocks();
  });

  it('removes the key when the value is null', () => {
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    saveSettingsFromLocalStorage(STORAGE_KEY, null);

    expect(removeSpy).toHaveBeenCalledWith(STORAGE_KEY);

    vi.restoreAllMocks();
  });

  it('removes the key when the value is undefined', () => {
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    saveSettingsFromLocalStorage(STORAGE_KEY, undefined);

    expect(removeSpy).toHaveBeenCalledWith(STORAGE_KEY);

    vi.restoreAllMocks();
  });
});

//*****************************************************************************************
// loadSettingsFromLocalStorage
//*****************************************************************************************
describe('loadSettingsFromLocalStorage', () => {
  it('returns an empty object when localStorage is empty', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    expect(loadSettingsFromLocalStorage(STORAGE_KEY)).toEqual({});

    vi.restoreAllMocks();
  });

  it('returns the parsed value stripped to the schema shape when valid JSON is stored', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({ a: 1 }));

    expect(loadSettingsFromLocalStorage(STORAGE_KEY)).toEqual({});

    vi.restoreAllMocks();
  });

  it('throws when stored data is invalid JSON', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('not-json{{{');

    expect(() => loadSettingsFromLocalStorage(STORAGE_KEY)).toThrow();

    vi.restoreAllMocks();
  });
});
