import type { UndefinedInitialDataOptions } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { APIRequest, APIResponse } from 'components/core/Query/components/api.models';
import { DEFAULT_RETRY_MS } from 'components/core/Query/components/constants';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import { useAPICallFn } from 'components/core/Query/components/useAPICallFn';
import { getAPIResponse } from 'components/core/Query/components/utils';
import { useEffect, useMemo, useState } from 'react';

export type UseAPIQueryProps<Response = unknown, Request extends APIRequest = APIRequest, Error = string> = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<Promise<unknown>, APIResponse<Error>, APIResponse<Response>, [unknown]>,
    'queryKey' | 'queryFn'
  >;
  enabled?: boolean;
  retryAfter?: number;
  delay?: number;
} & Omit<UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>, 'signal' | 'enabled' | 'retryAfter'>;

export const useAPIQuery = <
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>({
  enabled = true,
  queryProps = null,
  retryAfter = DEFAULT_RETRY_MS,
  delay = null,
  ...params
}: UseAPIQueryProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const [debouncedParams, setDebouncedParams] = useState<unknown>(null);

  const debouncing = useMemo<boolean>(
    () => (delay === null ? false : JSON.stringify(params) !== JSON.stringify(debouncedParams)),
    [debouncedParams, delay, params]
  );

  useEffect(() => {
    if (delay === null) return;
    const handler = setTimeout(() => setDebouncedParams(params), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, JSON.stringify(params)]);

  const query = useQuery<unknown, APIResponse<Error>, APIResponse<Response>, [unknown]>(
    {
      ...queryProps,
      enabled: !!enabled && !debouncing,
      queryKey: [{ ...params, enabled }],
      queryFn: async ({ signal }) => apiCallFn({ signal, enabled, ...params }),
      retry: (failureCount, error) => failureCount < 0 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 0 ? 1000 : Math.min(retryAfter, 10000))
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = useMemo(
    () => getAPIResponse(query.data, query.error, query.failureReason),
    [query.data, query.error, query.failureReason]
  );

  return useMemo(
    () => ({
      data: data,
      error: error,
      serverVersion: serverVersion,
      statusCode: statusCode,
      dataUpdatedAt: query?.dataUpdatedAt,
      errorUpdatedAt: query?.errorUpdatedAt,
      failureCount: query?.failureCount,
      failureReason: query?.failureReason,
      fetchStatus: query?.fetchStatus,
      isError: query?.isError,
      isFetched: query?.isFetched,
      isFetchedAfterMount: query?.isFetchedAfterMount,
      isFetching: query?.isFetching,
      isInitialLoading: query?.isInitialLoading,
      isLoading: query?.isLoading,
      isLoadingError: query?.isLoadingError,
      isPaused: query?.isPaused,
      isPending: query?.isPending,
      isPlaceholderData: query?.isPlaceholderData,
      isRefetchError: query?.isRefetchError,
      isRefetching: query?.isRefetching,
      isStale: query?.isStale,
      isSuccess: query?.isSuccess,
      promise: query?.promise,
      refetch: query?.refetch,
      status: query?.status
    }),
    [
      data,
      error,
      query?.dataUpdatedAt,
      query?.errorUpdatedAt,
      query?.failureCount,
      query?.failureReason,
      query?.fetchStatus,
      query?.isError,
      query?.isFetched,
      query?.isFetchedAfterMount,
      query?.isFetching,
      query?.isInitialLoading,
      query?.isLoading,
      query?.isLoadingError,
      query?.isPaused,
      query?.isPending,
      query?.isPlaceholderData,
      query?.isRefetchError,
      query?.isRefetching,
      query?.isStale,
      query?.isSuccess,
      query?.promise,
      query?.refetch,
      query?.status,
      serverVersion,
      statusCode
    ]
  );
};
