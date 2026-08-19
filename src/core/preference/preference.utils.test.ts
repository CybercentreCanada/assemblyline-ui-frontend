import { APP_PREFERENCE_SCHEMA, DEFAULT_APP_PREFERENCE_STORE } from 'app/core.preference';
import { getAppPreferenceStateFromApi } from 'core/preference/preference.providers';
import { loadPreferenceFromLocalStorage, savePreferenceToLocalStorage } from 'core/preference/preference.utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { StoreApi } from 'zustand';

const TestSchema = z.object({
  api: z
    .object({
      gcTime: z.number().catch(1_000),
      staleTime: z.number().catch(500)
    })
    .catch({ gcTime: 1_000, staleTime: 500 }),
  layout: z
    .object({
      lang: z.string().catch('en'),
      mode: z.enum(['system', 'light', 'dark']).catch('system')
    })
    .catch({ lang: 'en', mode: 'system' })
});
const STORAGE_KEY = 'test.preference';
const createTestPreference = () => TestSchema.parse({});

afterEach(() => {
  vi.restoreAllMocks();
});

//*****************************************************************************************
// getAppPreferenceStateFromApi
//*****************************************************************************************
describe('getAppPreferenceStateFromApi', () => {
  it('returns the state from the store api', () => {
    const state = { api: { gcTime: 1 } } as unknown as AppPreferenceStore;
    const api = { getState: () => state } as StoreApi<AppPreferenceStore>;
    expect(getAppPreferenceStateFromApi(api)).toBe(state);
  });

  it('falls back to defaults when the api has no state', () => {
    const api = { getState: () => undefined } as unknown as StoreApi<AppPreferenceStore>;
    expect(getAppPreferenceStateFromApi(api)).toBe(DEFAULT_APP_PREFERENCE_STORE);
  });

  it('falls back to defaults when the api is null', () => {
    expect(getAppPreferenceStateFromApi(null as unknown as StoreApi<AppPreferenceStore>)).toBe(
      DEFAULT_APP_PREFERENCE_STORE
    );
  });
});

describe('APP_PREFERENCE_SCHEMA defaults', () => {
  it('creates fresh nested defaults for each parse', () => {
    const first = APP_PREFERENCE_SCHEMA.parse({});
    first.router.maxPanels = 99;

    expect(APP_PREFERENCE_SCHEMA.parse({}).router.maxPanels).toBe(DEFAULT_APP_PREFERENCE_STORE.router.maxPanels);
  });
});

//*****************************************************************************************
// savePreferenceToLocalStorage
//*****************************************************************************************
describe('savePreferenceToLocalStorage', () => {
  it('stores only fields that differ from defaults', () => {
    const storage: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => {
      storage[k] = v;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(k => {
      delete storage[k];
    });

    const preference = { api: { gcTime: 2_000, staleTime: 500 }, layout: { lang: 'en', mode: 'system' } };
    savePreferenceToLocalStorage(TestSchema, preference, STORAGE_KEY);

    const stored: unknown = JSON.parse(storage[STORAGE_KEY]);
    expect(stored).toEqual({ api: { gcTime: 2_000 } });
  });

  it('removes the key when preference match defaults exactly', () => {
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(vi.fn());
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(vi.fn());

    const defaults = TestSchema.parse({});
    savePreferenceToLocalStorage(TestSchema, defaults, STORAGE_KEY);

    expect(removeSpy).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('stores multiple nested diffs across different keys', () => {
    const storage: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => {
      storage[k] = v;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(vi.fn());

    const preference = { api: { gcTime: 5_000, staleTime: 999 }, layout: { lang: 'fr', mode: 'dark' } };
    savePreferenceToLocalStorage(TestSchema, preference, STORAGE_KEY);

    const stored: unknown = JSON.parse(storage[STORAGE_KEY]);
    expect(stored).toEqual({ api: { gcTime: 5_000, staleTime: 999 }, layout: { lang: 'fr', mode: 'dark' } });
  });
});

//*****************************************************************************************
// loadPreferenceFromLocalStorage
//*****************************************************************************************
describe('loadPreferenceFromLocalStorage', () => {
  it('returns full defaults when localStorage is empty', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    const result = loadPreferenceFromLocalStorage(TestSchema, createTestPreference(), STORAGE_KEY);
    expect(result).toEqual(createTestPreference());
  });

  it('merges stored overrides with the current store values', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({ api: { gcTime: 3_000 } }));

    const result = loadPreferenceFromLocalStorage(
      TestSchema,
      {
        api: { gcTime: 1_000, staleTime: 9_999 },
        layout: { lang: 'fr', mode: 'light' }
      } as unknown as AppPreferenceStore,
      STORAGE_KEY
    );
    expect(result).toEqual({
      api: { gcTime: 3_000, staleTime: 9_999 },
      layout: { lang: 'fr', mode: 'light' }
    });
  });

  it('returns current store values when stored data is invalid JSON', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('not-json{{{');

    const current = { api: { gcTime: 2_500, staleTime: 500 }, layout: { lang: 'en', mode: 'dark' } };
    const result = loadPreferenceFromLocalStorage(TestSchema, current as unknown as AppPreferenceStore, STORAGE_KEY);
    expect(result).toEqual(current);
  });

  it('falls back to defaults for invalid field values', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({ layout: { mode: 'banana', lang: 123 } }));

    const result = loadPreferenceFromLocalStorage(TestSchema, createTestPreference(), STORAGE_KEY);
    expect(result).toEqual({
      api: { gcTime: 1_000, staleTime: 500 },
      layout: { lang: 'en', mode: 'system' }
    });
  });

  it('preserves valid fields alongside invalid ones', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({ layout: { mode: 'dark', lang: 999 } }));

    const result = loadPreferenceFromLocalStorage(TestSchema, createTestPreference(), STORAGE_KEY);
    expect(result).toEqual({
      api: { gcTime: 1_000, staleTime: 500 },
      layout: { lang: 'en', mode: 'dark' }
    });
  });
});
