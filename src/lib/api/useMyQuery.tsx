import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DEFAULT_GC_TIME, DEFAULT_RETRY_MS, DEFAULT_STALE_TIME } from './constants';
import type { APIQueryKey, APIResponse } from './models';
import { useThrottledState } from './useThrottledState';
import { getAPIResponse, useApiCallFn } from './utils';

interface Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey, Body extends object>
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

export const useMyQuery = <Response, Body extends object = object>({
  url,
  contentType = 'application/json',
  method = 'GET',
  body = null,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  staleTime = DEFAULT_STALE_TIME,
  gcTime = DEFAULT_GC_TIME,
  throttleTime = null,
  enabled,
  allowCache = false,
  ...options
}: Props<APIResponse<Response>, APIResponse<Error>, APIResponse<Response>, QueryKey, Body>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<Response, Body>();

  const queryKey = useMemo<APIQueryKey>(
    () => ({ url, contentType, method, body, reloadOnUnauthorize, retryAfter, enabled, allowCache }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowCache, JSON.stringify(body), contentType, enabled, method, reloadOnUnauthorize, retryAfter, url]
  );

  const [throttledKey, isThrottling] = useThrottledState(queryKey, throttleTime);

  const query = useQuery<APIResponse<Response>, APIResponse<Error>, APIResponse<Response>>(
    {
      ...options,
      queryKey: [throttledKey],
      staleTime,
      gcTime,
      enabled: enabled && !!throttledKey && !isThrottling,
      queryFn: async ({ signal }) =>
        apiCallFn({ url, contentType, method, body, reloadOnUnauthorize, retryAfter, signal }),
      placeholderData: keepPreviousData,
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000))
    },
    queryClient
  );

  return { ...query, ...getAPIResponse(query?.data, query?.error, query?.failureReason), isThrottling };
};
