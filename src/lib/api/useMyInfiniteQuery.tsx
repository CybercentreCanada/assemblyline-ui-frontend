import type { DefinedInitialDataInfiniteOptions, InfiniteData, QueryKey } from '@tanstack/react-query';
import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { APIResponseProps } from './utils';
import { DEFAULT_GC_TIME, DEFAULT_RETRY_MS, DEFAULT_STALE_TIME, useDefaultQueryFn } from './utils';

// type DefinedInitialDataInfiniteOptions<TQueryFnData, TError = Error, TData = InfiniteData<TQueryFnData, unknown>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>

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
  ...options
}: Props<
  APIResponseProps<Response>,
  APIResponseProps<Error>,
  InfiniteData<APIResponseProps<Response>, unknown>,
  QueryKey,
  unknown,
  Body
>) => {
  const queryClient = useQueryClient();
  const queryFn = useDefaultQueryFn<Response, Body>();

  const query = useInfiniteQuery<
    APIResponseProps<Response>,
    APIResponseProps<Error>,
    InfiniteData<APIResponseProps<Response>, unknown>
  >(
    {
      ...options,
      placeholderData: keepPreviousData,
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000)),
      queryKey: [{ url, contentType, method, body, reloadOnUnauthorize, retryAfter }],
      staleTime,
      gcTime,

      queryFn: async ({ pageParam }) =>
        queryFn({ url, contentType, method, body: { ...body, offset: pageParam }, reloadOnUnauthorize, retryAfter })
    },
    queryClient
  );

  console.log(query);

  return { ...query };
  // return { ...query, ...getAPIResponse(query?.data, query?.error, query?.failureReason) };
};
