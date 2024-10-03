import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { compress, decompress } from 'lz-string';
import React from 'react';

export const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
};

const persister = createSyncStoragePersister({
  storage: window.sessionStorage,
  serialize: data => compress(JSON.stringify(data)),
  deserialize: data => JSON.parse(decompress(data))
});

export const APIProvider = ({ children }: Props) => (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
    {children}
    <ReactQueryDevtools initialIsOpen={true} />
  </PersistQueryClientProvider>
);
