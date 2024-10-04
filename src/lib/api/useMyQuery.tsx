import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import type { APIResponseProps } from './utils';
import { DEFAULT_GC_TIME, DEFAULT_RETRY_MS, DEFAULT_STALE_TIME, getAPIResponse, useAPICall } from './utils';

interface Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey, Body extends object>
  extends Omit<DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'initialData'> {
  initialData?: null | TData;
  url: string;
  contentType?: string;
  method?: string;
  body?: Body;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  disableClearData?: boolean;
}

export const useMyQuery = <Response, Body extends object = object>({
  url,
  contentType = 'application/json',
  method = 'GET',
  body = null,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  staleTime = DEFAULT_STALE_TIME,
  gcTime = DEFAULT_GC_TIME,
  ...options
}: Props<APIResponseProps<Response>, APIResponseProps<Error>, APIResponseProps<Response>, QueryKey, Body>) => {
  const queryClient = useQueryClient();
  const apiCall = useAPICall<Response, Body>();

  // const key = useMemo(() => [url, allowCache, method, contentType, reloadOnUnauthorize, retryAfter, body], []);

  const query = useQuery<APIResponseProps<Response>, APIResponseProps<Error>, APIResponseProps<Response>>(
    {
      ...options,
      placeholderData: keepPreviousData,
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000)),
      queryKey: [{ url, contentType, method, body, reloadOnUnauthorize, retryAfter }],
      staleTime,
      gcTime,
      queryFn: async () => apiCall({ url, contentType, method, body, reloadOnUnauthorize, retryAfter })
    },
    queryClient
  );

  return { ...query, ...getAPIResponse(query?.data, query?.error, query?.failureReason) };
};
