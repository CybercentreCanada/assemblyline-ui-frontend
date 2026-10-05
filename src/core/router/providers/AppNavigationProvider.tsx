import type { AppNavigationStore } from 'core/router';
import { NavigationBlocker, useSyncNavigationStoreFromLocation, useSyncRouterStoreFromNavigation } from 'core/router';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { generateRandomUUID } from 'shared/utils/app.utils';
import type { StoreApi } from 'zustand/vanilla';

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

AppNavigationStoreProvider.displayName = 'AppNavigationStoreProvider';

export const getAppNavigationStateFromApi = (api: StoreApi<AppNavigationStore>): AppNavigationStore => {
  return api?.getState() || getDefaultNavigationStore();
};

export const AppNavigationProvider = memo(({ children }: PropsWithChildren) => {
  useSyncNavigationStoreFromLocation();
  useSyncRouterStoreFromNavigation();

  return (
    <>
      <NavigationBlocker />
      {children}
    </>
  );
});

AppNavigationProvider.displayName = 'AppNavigationProvider';
