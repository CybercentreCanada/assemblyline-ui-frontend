import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { keepPreviousData, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useAppConfig } from 'core/config';
import { compress, decompress } from 'lz-string';
import React, { Activity, PropsWithChildren, useEffect, useMemo } from 'react';
import type { APIQueryKey } from './api.models';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // staleTime: API_STALE_TIME,
      // gcTime: API_GARBAGE_COLLECTION_TIME,
      placeholderData: keepPreviousData
    }
  }
});

export const AppAPIProvider = React.memo(({ children }: PropsWithChildren) => {
  const staleTime = useAppConfig(s => s.api.staleTime);
  const gcTime = useAppConfig(s => s.api.gcTime);
  const showDevtools = useAppConfig(s => s.api.showDevtools);

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
    </PersistQueryClientProvider>
  );
});
