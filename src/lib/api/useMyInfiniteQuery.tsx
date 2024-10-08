import type { DefinedInitialDataInfiniteOptions, InfiniteData, QueryKey } from '@tanstack/react-query';
import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Throttler from 'commons/addons/utils/throttler';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_GC_TIME, DEFAULT_RETRY_MS, DEFAULT_STALE_TIME } from './constants';
import type { APIQueryKey, APIResponse } from './models';
import { useApiCallFn } from './utils';

interface Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey, TPageParam, Body extends object>
  extends Omit<
    DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
    'queryKey' | 'initialData'
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

export const useMyInfiniteQuery = <Response, Body extends object = object>({
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
}: Props<
  APIResponse<Response>,
  APIResponse<Error>,
  InfiniteData<APIResponse<Response>, unknown>,
  QueryKey,
  unknown,
  Body
>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<Response, Body>();

  const [queryKey, setQueryKey] = useState<APIQueryKey>(null);
  const [isThrottling, setIsThrottling] = useState<boolean>(!!throttleTime);

  const throttler = useMemo(() => (!throttleTime ? null : new Throttler(throttleTime)), [throttleTime]);

  const query = useInfiniteQuery<
    APIResponse<Response>,
    APIResponse<Error>,
    InfiniteData<APIResponse<Response>, unknown>
  >(
    {
      ...options,
      queryKey: [queryKey],
      staleTime,
      gcTime,
      enabled: enabled && !!queryKey && !isThrottling,
      queryFn: async ({ pageParam }) =>
        apiCallFn({ url, contentType, method, body: { ...body, offset: pageParam }, reloadOnUnauthorize, retryAfter }),
      placeholderData: keepPreviousData,
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000))
    },
    queryClient
  );

  useEffect(() => {
    if (!throttler) {
      setQueryKey({ url, contentType, method, body, reloadOnUnauthorize, retryAfter, enabled, allowCache });
    } else {
      setIsThrottling(true);
      throttler.delay(() => {
        setIsThrottling(false);
        setQueryKey({ url, contentType, method, body, reloadOnUnauthorize, retryAfter, enabled, allowCache });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(body), contentType, enabled, method, reloadOnUnauthorize, retryAfter, throttler, url, allowCache]);

  return { ...query };
  // return { ...query, ...getAPIResponse(query?.data, query?.error, query?.failureReason) };
};
