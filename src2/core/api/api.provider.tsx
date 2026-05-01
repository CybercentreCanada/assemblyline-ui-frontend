import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { keepPreviousData, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useAppPreference } from 'core/preference';
import { createAppStore } from 'features/store/createAppStore';
import { compress, decompress } from 'lz-string';
import type { PropsWithChildren } from 'react';
import { Activity, memo, useEffect, useMemo } from 'react';
import type { APIQueryKey } from './api.models';

//*****************************************************************************************
// App API Store
//*****************************************************************************************

export type AppApiStore = {
  showDevtools: boolean;
};

export const DEFAULT_APP_API_STORE: AppApiStore = {
  showDevtools: false
};

export const {
  StoreProvider: AppApiStoreProvider,
  useStore: useAppAPIStore,
  useSetStore: useAppSetAPIStore
} = createAppStore<AppApiStore>(DEFAULT_APP_API_STORE);

AppApiStoreProvider.displayName = 'AppApiStoreProvider';

//*****************************************************************************************
// App API Debugger Layout
//*****************************************************************************************

export type AppApiLayoutProps = {
  /** Provider children. */
  children: PropsWithChildren['children'];
};

export const AppApiLayout = memo(({ children }: AppApiLayoutProps) => {
  const showDevtools = useAppAPIStore(s => s.showDevtools);

  return (
    <>
      {children}

      <Activity mode={showDevtools ? 'visible' : 'hidden'}>
        <div
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            width: 420,
            height: 560,
            zIndex: 9999,
            background: '#fff'
          }}
        >
          <ReactQueryDevtoolsPanel client={queryClient} />
        </div>
      </Activity>
    </>
  );
});

AppApiLayout.displayName = 'AppApiLayout';

//*****************************************************************************************
// App API Provider
//*****************************************************************************************

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData
    }
  }
});

export const AppAPIProvider = memo(({ children }: PropsWithChildren) => {
  const gcTime = useAppPreference(s => s.api.gcTime);
  const staleTime = useAppPreference(s => s.api.staleTime);

  const persister = useMemo(
    () =>
      createSyncStoragePersister({
        storage: window.sessionStorage,
        serialize: data =>
          compress(
            JSON.stringify({
              ...data,
              clientState: {
                mutations: [],
                queries: data.clientState.queries.filter(q => (q.queryKey as APIQueryKey)[3])
              }
            })
          ),
        deserialize: data => {
          const decompressed = decompress(data);
          if (!decompressed) {
            return {
              buster: '',
              timestamp: 0,
              clientState: { mutations: [], queries: [] }
            } satisfies PersistedClient;
          }

          return JSON.parse(decompressed) as PersistedClient;
        }
      }),
    []
  );

  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        refetchOnWindowFocus: false,
        staleTime,
        gcTime,
        placeholderData: keepPreviousData
      }
    });
  }, [gcTime, queryClient, staleTime]);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
    </PersistQueryClientProvider>
  );
});

AppAPIProvider.displayName = 'AppAPIProvider';
