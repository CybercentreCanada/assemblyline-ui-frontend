import type { AppRouterStore } from 'core/router';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { BrowserRouter } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';
import type { StoreApi } from 'zustand';

export const getDefaultRouterStore = function (store: Partial<AppRouterStore> = null): AppRouterStore {
  return { id: generateRandomUUID(), panels: [], nodes: {}, pages: {}, ...store };
};

export const {
  StoreProvider: AppRouterStoreProvider,
  useStore: useAppRouterStore,
  useSetStore: useAppSetRouterStore,
  useStoreApi: useAppRouterStoreApi
} = createAppStore<AppRouterStore>(getDefaultRouterStore());

export const getAppRouterStateFromApi = (api: StoreApi<AppRouterStore>): AppRouterStore => {
  return api?.getState() || getDefaultRouterStore();
};

AppRouterStoreProvider.displayName = 'AppRouterStoreProvider';

export const AppRouterProvider = memo(({ children }: PropsWithChildren) => (
  <BrowserRouter basename="/">{children}</BrowserRouter>
));

AppRouterProvider.displayName = 'AppRouterProvider';
