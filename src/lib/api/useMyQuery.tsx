import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryClient } from './APIProvider';
import type { APIResponseProps } from './utils';
import { DEFAULT_GC_TIME, DEFAULT_RETRY_MS, DEFAULT_STALE_TIME, useQueryFn } from './utils';

interface Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey, Body extends object>
  extends Omit<DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'initialData'> {
  initialData?: null | TData;
  url: string;
  contentType?: string;
  method?: string;
  body?: Body;
  reloadOnUnauthorize?: boolean;
  allowCache?: boolean;
  retryAfter?: number;
  disableClearData?: boolean;
}

export const useMyQuery = <Response extends unknown, Body extends object = object>({
  url,
  contentType = 'application/json',
  method = 'GET',
  body = null,
  reloadOnUnauthorize = true,
  allowCache = false,
  retryAfter = DEFAULT_RETRY_MS,
  staleTime = DEFAULT_STALE_TIME,
  gcTime = DEFAULT_GC_TIME,
  ...options
}: Props<APIResponseProps<Response>, APIResponseProps<Error>, APIResponseProps<Response>, QueryKey, Body>) => {
  const queryFn = useQueryFn<Response, Body>();

  // const key = useMemo(() => [url, allowCache, method, contentType, reloadOnUnauthorize, retryAfter, body], []);

  const query = useQuery<APIResponseProps<Response>, APIResponseProps<Error>, APIResponseProps<Response>>(
    {
      ...options,
      placeholderData: keepPreviousData,
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000)),

      queryKey: [{ url, contentType, method, body, allowCache, reloadOnUnauthorize, retryAfter }],
      // queryKey: [{ url, allowCache, method, contentType, body, reloadOnUnauthorize, retryAfter }],
      // queryKey: [url, allowCache, method, contentType, body, reloadOnUnauthorize, retryAfter],
      // initialData,
      // staleTime: allowCache ? 1000 * 60 * 60 * 24 * 365 : 0,
      staleTime,
      gcTime,
      queryFn: async () => queryFn({ url, contentType, method, body, allowCache, reloadOnUnauthorize, retryAfter })
    },
    queryClient
  );

  return {
    ...query,
    statusCode: query?.data?.api_status_code || query?.error?.api_status_code || null,
    serverVersion: query?.data?.api_server_version || query?.error?.api_server_version || null,
    data: query?.data?.api_response || null,
    error: query?.data?.api_error_message || null
  };
};
