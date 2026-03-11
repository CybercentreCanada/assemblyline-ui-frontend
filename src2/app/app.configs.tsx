import type { AppConfig } from 'core/config/config.models';

export const APP_CONFIG_LOCAL_STORAGE_KEY = 'al.settings';

export const DEFAULT_APP_CONFIG: AppConfig = {
  api: {
    staleTime: 0,
    gcTime: 0,
    showDevtools: false
  },
  // config: {
  //   storageKey: 'al.storage'
  // },
  quota: {
    api: null,
    submission: null
  },
  router: {
    maxPanels: 3,
    maxNodes: 3
  },
  theme: {
    mode: 'system',
    variant: 'default'
  }
};
