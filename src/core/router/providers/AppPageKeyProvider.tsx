import type { AppRouterStore } from 'core/router';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import type { StoreApi } from 'zustand/vanilla';

export type AppPageKeyStore = {
  /** Route key for this route context, or null when no route context is available. */
  pageKey: keyof AppRouterStore['pages'] | null;
};

export const {
  StoreProvider: AppPageKeyStoreProvider,
  useStore: useAppPageKeyStore,
  useStoreApi: useAppPageKeyStoreApi
} = createAppStore<AppPageKeyStore>({ pageKey: null });

AppPageKeyStoreProvider.displayName = 'AppPageKeyStoreProvider';

export const getAppPageKeyStateFromApi = (api: StoreApi<AppPageKeyStore>): AppPageKeyStore => {
  return api?.getState() || { pageKey: null };
};

export type AppPageKeyStoreProviderProps = PropsWithChildren<{
  /** Route key to provide. */
  pageKey: keyof AppRouterStore['pages'];
}>;

export const AppPageKeyProvider = memo(({ children, pageKey }: AppPageKeyStoreProviderProps) => (
  <AppPageKeyStoreProvider data={{ pageKey }}>{children}</AppPageKeyStoreProvider>
));

AppPageKeyProvider.displayName = 'AppPageKeyProvider';
