import type { AppNavigationStore } from 'core/router';
import {
  AppNavigationBlocker,
  useAppSyncNavigationStoreFromLocation,
  useAppSyncRouterStoreFromNavigation
} from 'core/router';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { generateRandomUUID } from 'shared/utils/app.utils';
import type { StoreApi } from 'zustand';

export const getDefaultNavigationStore = (store: Partial<AppNavigationStore> = null): AppNavigationStore => {
  return {
    id: generateRandomUUID(),
    panels: [],
    nodes: {},
    pages: {},
    blockedPages: {},
    options: {
      hashScrollIntoView: false,
      href: '',
      ignoreBlocker: false,
      reloadDocument: false,
      replace: false,
      resetScroll: false,
      viewTransition: false,
      ...store?.options
    },
    ...store
  };
};

export const {
  StoreProvider: AppNavigationStoreProvider,
  useStore: useAppNavigationStore,
  useSetStore: useAppSetNavigationStore,
  useStoreApi: useAppNavigationStoreApi
} = createAppStore<AppNavigationStore>(getDefaultNavigationStore());

export const getAppNavigationStateFromApi = (api: StoreApi<AppNavigationStore>): AppNavigationStore => {
  return api?.getState() || getDefaultNavigationStore();
};

AppNavigationStoreProvider.displayName = 'AppNavigationStoreProvider';

export const AppNavigationProvider = memo(({ children }: PropsWithChildren) => {
  useAppSyncNavigationStoreFromLocation();
  useAppSyncRouterStoreFromNavigation();

  return (
    <>
      <AppNavigationBlocker />
      {children}
    </>
  );
});

AppNavigationProvider.displayName = 'AppNavigationProvider';
