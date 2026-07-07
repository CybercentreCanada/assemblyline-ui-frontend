import { DEFAULT_APP_INTERFACE_STORE } from 'app/core.interface';
import type { StoreApi } from 'zustand';

export const getAppInterfaceStateFromApi = (api: StoreApi<AppInterfaceStore>): AppInterfaceStore => {
  return api?.getState() || DEFAULT_APP_INTERFACE_STORE;
};
