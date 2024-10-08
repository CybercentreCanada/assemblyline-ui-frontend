import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { compress, decompress } from 'lz-string';
import React from 'react';
import type { APIQueryKey } from './models';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
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

export const APIProvider = ({ children }: Props) => (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
    {children}
    <ReactQueryDevtools initialIsOpen={true} />
  </PersistQueryClientProvider>
);
