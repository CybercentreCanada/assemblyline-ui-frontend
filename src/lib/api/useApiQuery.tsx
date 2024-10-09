import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse } from './models';
import { useThrottledState } from './useThrottledState';
import type { ApiCallProps } from './utils';
import { getAPIResponse, useApiCallFn } from './utils';

type Types<TBody = any, TError = Error, TResponse = any> = {
  body?: TBody;
  error?: TError;
  response?: TResponse;
};

type Props<T extends Types, TQueryKey extends QueryKey = QueryKey> = Omit<
  DefinedInitialDataOptions<APIResponse<T['response']>, APIResponse<T['error']>, APIResponse<T['response']>, TQueryKey>,
  'queryKey' | 'initialData' | 'enabled'
> &
  ApiCallProps<T['body']>;

export const useApiQuery = <T extends Types>({
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
}: Props<T>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<T['response'], T['body']>();

  const queryKey = useMemo<ApiCallProps<Body>>(
    () => ({ url, contentType, method, body, allowCache, enabled, reloadOnUnauthorize, retryAfter, throttleTime }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowCache, JSON.stringify(body), contentType, enabled, method, reloadOnUnauthorize, retryAfter, throttleTime, url]
  );

  const [throttledKey, isThrottling] = useThrottledState(queryKey, throttleTime);

  const query = useQuery<APIResponse<T['response']>, APIResponse<T['error']>, APIResponse<T['response']>, QueryKey>(
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
