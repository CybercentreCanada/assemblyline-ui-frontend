import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse } from './models';
import { useThrottledState } from './useThrottledState';
import type { ApiCallProps } from './utils';
import { getAPIResponse, useApiCallFn } from './utils';

type Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey, Body extends object> = Omit<
  DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  'queryKey' | 'initialData' | 'enabled'
> &
  ApiCallProps<Body>;

export const useApiQuery = <Response, Body extends object = object>({
  url,
  contentType = 'application/json',
  method = 'GET',
  body = null,
  allowCache = false,
  enabled = true,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  throttleTime = null,
  ...options
}: Props<APIResponse<Response>, APIResponse<Error>, APIResponse<Response>, QueryKey, Body>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<Response, Body>();

  const queryKey = useMemo<ApiCallProps<Body>>(
    () => ({ url, contentType, method, body, allowCache, enabled, reloadOnUnauthorize, retryAfter, throttleTime }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowCache, JSON.stringify(body), contentType, enabled, method, reloadOnUnauthorize, retryAfter, throttleTime, url]
  );

  const [throttledKey, isThrottling] = useThrottledState(queryKey, throttleTime);

  const query = useQuery<APIResponse<Response>, APIResponse<Error>, APIResponse<Response>>(
    {
      ...options,
      queryKey: [throttledKey],
      enabled: Boolean(enabled) && !!throttledKey && !isThrottling,
      queryFn: async ({ signal }) => apiCallFn({ signal, ...throttledKey }),
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000))
    },
    queryClient
  );

  return { ...query, ...getAPIResponse(query?.data, query?.error, query?.failureReason), isThrottling };
};
