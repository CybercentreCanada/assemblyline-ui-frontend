import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { keepPreviousData, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DEFAULT_GC_TIME, DEFAULT_STALE_TIME } from 'app/core.preference';
import type { APIQueryKey } from 'core/api/api.models.ts';
import { createStoreContext } from 'features/store/factories/createStoreContext';
import { compress, decompress } from 'lz-string';
import React from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      placeholderData: keepPreviousData
    }
  }
});

type Props = {
  children: React.ReactNode;
};

const persister = createSyncStoragePersister({
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  deserialize: data => JSON.parse(decompress(data))
});

const API_STORE_INITIAL_STATE = { disabledWhoAmI: false };

export const { StoreProvider: APIStoreProvider, useStore: useAPIStore } = createStoreContext(API_STORE_INITIAL_STATE);

export const APIProvider: React.FC<Props> = React.memo(({ children }: Props) => (
  <APIStoreProvider data={API_STORE_INITIAL_STATE}>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={true} /> */}
    </PersistQueryClientProvider>
  </APIStoreProvider>
));
