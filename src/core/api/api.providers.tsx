import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { keepPreviousData, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ApiQueryKey } from 'core/api/api.models';
import { useAppInterfaceStore } from 'core/interface';
import { useAppPreferenceStore } from 'core/preference';
import { compress, decompress } from 'lz-string';
import type { PropsWithChildren } from 'react';
import { Activity, memo, useEffect, useMemo } from 'react';

//*****************************************************************************************
// App API Debugger Layout
//*****************************************************************************************

export type AppApiLayoutProps = {
  /** Provider children. */
  children: PropsWithChildren['children'];
};

export const AppApiLayout = memo(({ children }: AppApiLayoutProps) => {
  const showDevtools = useAppInterfaceStore(s => s.api.showDevtools);

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

export const AppApiProvider = memo(({ children }: PropsWithChildren) => {
  const gcTime = useAppPreferenceStore(s => s?.api?.gcTime);
  const staleTime = useAppPreferenceStore(s => s?.api?.staleTime);

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

AppApiProvider.displayName = 'AppApiProvider';
