import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { keepPreviousData, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { compress, decompress } from 'lz-string';
import React from 'react';
import type { APIQueryKey } from './api.models';
import { DEFAULT_GC_TIME, DEFAULT_STALE_TIME } from './constants';

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
          queries: data.clientState.queries.filter(q => (q.queryKey[0] as APIQueryKey).allowCache)
        }
      })
    ),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  deserialize: data => JSON.parse(decompress(data))
});

export const APIProvider: React.FC<Props> = React.memo(({ children }: Props) => (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
    {children}
    {false && <ReactQueryDevtools initialIsOpen={true} />}
  </PersistQueryClientProvider>
));
