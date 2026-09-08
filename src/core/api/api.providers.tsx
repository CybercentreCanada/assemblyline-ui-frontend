import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { OmitKeyof } from '@tanstack/react-query';
import { keepPreviousData, QueryClient } from '@tanstack/react-query';
import type { PersistedClient, PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ApiQueryKey } from 'core/api';
import { useAppPreferenceStore } from 'core/preference';
import { compress, decompress } from 'lz-string';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';

//*****************************************************************************************
// App API Provider
//*****************************************************************************************

export const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      gcTime: Infinity,
      placeholderData: keepPreviousData
    }
  }
});

export const QUERY_PERSISTER = createSyncStoragePersister({
  storage: window.sessionStorage,
  throttleTime: 1_000,
  serialize: data =>
    compress(
      JSON.stringify({
        ...data,
        clientState: {
          mutations: [],
          queries: data.clientState.queries.filter(q => (q.queryKey as ApiQueryKey)[3])
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
});

export const QUERY_PERSIST_OPTIONS: OmitKeyof<PersistQueryClientOptions, 'queryClient'> = {
  maxAge: Infinity,
  persister: QUERY_PERSISTER
};

export const AppApiProvider = memo(({ children }: PropsWithChildren) => {
  const gcTime = useAppPreferenceStore(s => s?.api?.gcTime);
  const staleTime = useAppPreferenceStore(s => s?.api?.staleTime);

  useEffect(() => {
    QUERY_CLIENT.setDefaultOptions({
      queries: {
        refetchOnWindowFocus: false,
        staleTime,
        gcTime,
        placeholderData: keepPreviousData
      }
    });
  }, [gcTime, staleTime]);

  return (
    <PersistQueryClientProvider client={QUERY_CLIENT} persistOptions={QUERY_PERSIST_OPTIONS}>
      {children}
    </PersistQueryClientProvider>
  );
});

AppApiProvider.displayName = 'AppApiProvider';
