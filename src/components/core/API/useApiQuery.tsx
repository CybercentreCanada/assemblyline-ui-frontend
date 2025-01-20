import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse } from './models';
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
  ...options
}: Props<T>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<T['response'], T['body']>();

  const query = useQuery<APIResponse<T['response']>, APIResponse<T['error']>, APIResponse<T['response']>, QueryKey>(
    {
      ...options,
      queryKey: [{ url, contentType, method, body, allowCache, enabled, reloadOnUnauthorize, retryAfter }],
      enabled: Boolean(enabled),
      queryFn: async ({ signal }) =>
        apiCallFn({ url, contentType, method, body, allowCache, enabled, reloadOnUnauthorize, retryAfter, signal }),
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000))
    },
    queryClient
  );

  return { ...query, ...getAPIResponse(query?.data, query?.error, query?.failureReason) };
};
