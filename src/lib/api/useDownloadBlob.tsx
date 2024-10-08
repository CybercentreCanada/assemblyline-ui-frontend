import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_GC_TIME, DEFAULT_RETRY_MS, DEFAULT_STALE_TIME } from './constants';
import type { APIResponse, BlobResponse } from './models';
import { getBlobResponse, useDownloadBlobFn } from './utils';

interface Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey>
  extends Omit<
    DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'initialData' | 'enabled'
  > {
  initialData?: null | TData;
  url: string;
  contentType?: string;
  method?: string;
  body?: Body;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  disableClearData?: boolean;
  throttleTime?: number;
  enabled?: boolean;
  allowCache?: boolean;
}

export const useMyQuery = ({
  url,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  staleTime = DEFAULT_STALE_TIME,
  gcTime = DEFAULT_GC_TIME,
  allowCache = false,
  ...options
}: Props<BlobResponse, APIResponse<Error>, BlobResponse, QueryKey>) => {
  const queryClient = useQueryClient();
  const blobDownloadFn = useDownloadBlobFn();

  const query = useQuery<BlobResponse, APIResponse<Error>, BlobResponse>(
    {
      ...options,
      queryKey: [{ url, reloadOnUnauthorize, retryAfter, allowCache }],
      staleTime,
      gcTime,
      queryFn: async () => blobDownloadFn({ url, reloadOnUnauthorize, retryAfter }),
      placeholderData: keepPreviousData,
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000))
    },
    queryClient
  );

  return { ...query, ...getBlobResponse(query?.data, query?.error, query?.failureReason) };
};
