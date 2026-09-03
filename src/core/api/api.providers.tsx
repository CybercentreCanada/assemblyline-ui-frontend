import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { keepPreviousData, QueryClient } from '@tanstack/react-query';
import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ApiQueryKey } from 'core/api/api.models';
import { useAppPreferenceStore } from 'core/preference';
import { AppDebugLayout } from 'layout/debug';
import { compress, decompress } from 'lz-string';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useMemo } from 'react';

//*****************************************************************************************
// App API Debugger Layout
//*****************************************************************************************

export type AppApiLayoutProps = {
  /** Provider children. */
  children: PropsWithChildren['children'];
};

export const AppApiLayout = memo(({ children }: AppApiLayoutProps) => <AppDebugLayout>{children}</AppDebugLayout>);

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
