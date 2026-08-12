import { DEFAULT_APP_INTERFACE_STORE } from 'app/core.interface';
import { getAppInterfaceStateFromApi } from 'core/interface/interface.utils';
import { describe, expect, it } from 'vitest';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// getAppInterfaceStateFromApi
//*****************************************************************************************
describe('getAppInterfaceStateFromApi', () => {
  it('returns the state from the store api', () => {
    const state = { some: 'value' } as unknown as AppInterfaceStore;
    const api = { getState: () => state } as StoreApi<AppInterfaceStore>;
    expect(getAppInterfaceStateFromApi(api)).toBe(state);
  });

  it('falls back to defaults when the api has no state', () => {
    const api = { getState: () => undefined } as unknown as StoreApi<AppInterfaceStore>;
    expect(getAppInterfaceStateFromApi(api)).toBe(DEFAULT_APP_INTERFACE_STORE);
  });

  it('falls back to defaults when the api is null', () => {
    expect(getAppInterfaceStateFromApi(null as unknown as StoreApi<AppInterfaceStore>)).toBe(
      DEFAULT_APP_INTERFACE_STORE
    );
  });
});
