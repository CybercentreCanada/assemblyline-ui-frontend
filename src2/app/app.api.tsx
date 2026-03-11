import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { keepPreviousData, QueryClientConfig } from '@tanstack/react-query';
import { APIQueryKey } from 'core/api';
import { compress, decompress } from 'lz-string';

const API_STALE_TIME = 1000;

const API_GARBAGE_COLLECTION_TIME = 1000;

export const APP_API_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: API_STALE_TIME,
      gcTime: API_GARBAGE_COLLECTION_TIME,
      placeholderData: keepPreviousData
    }
  }
};

export const APP_API_PERSISTER = createSyncStoragePersister({
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
