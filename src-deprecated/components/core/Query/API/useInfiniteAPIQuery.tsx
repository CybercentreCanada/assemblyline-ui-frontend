import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { APIQueryKey, APIRequest, APIResponse } from 'components/core/Query/components/api.models';
import { DEFAULT_RETRY_MS } from 'components/core/Query/components/constants';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import { useAPICallFn } from 'components/core/Query/components/useAPICallFn';
import { stableStringify } from 'components/core/Query/components/utils';
import { useMemo } from 'react';

export type UseInfiniteAPIQueryProps<Response = unknown, Request extends APIRequest = APIRequest, Error = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>;
  getPreviousOffset?: (
    firstPage: APIResponse<Response>,
    allPages: Array<APIResponse<Response>>,
    firstPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  getNextOffset?: (
    lastPage: APIResponse<Response>,
    allPages: Array<APIResponse<Response>>,
    lastPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  allowCache?: boolean;
  retryAfter?: number;
};

export const useInfiniteAPIQuery = <
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null,
  allowCache = false,
  retryAfter = DEFAULT_RETRY_MS
}: UseInfiniteAPIQueryProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const base = getParams(initialOffset);

  const query = useInfiniteQuery<
    APIResponse<Response>,
    APIResponse<Error>,
    InfiniteData<APIResponse<Response>, number>,
    APIQueryKey,
    number
  >(
    {
      queryKey: [base?.url, base?.method ?? 'GET', stableStringify(base?.body ?? null), allowCache],
      queryFn: async ({ signal, pageParam }) => apiCallFn({ ...getParams(pageParam as number), signal }),
      initialPageParam: initialOffset,
      getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
        getPreviousOffset(firstPage, allPages, firstPageParam, allPageParams),
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
        getNextOffset(lastPage, allPages, lastPageParam, allPageParams),
      retry: (failureCount, error) => failureCount < 3 && error?.api_status_code === 502,
      retryDelay: failureCount => Math.min(retryAfter * (failureCount + 1), 10000)
    },
    queryClient
  );

  return useMemo(
    () => ({
      data: query?.data.pages.map(page => page.api_response),
      error: query?.data.pages.map(page => page.api_error_message),
      pages: query?.data.pageParams,
      serverVersion: query?.data.pages.map(page => page.api_server_version),
      statusCode: query?.data.pages.map(page => page.api_status_code),
      fetchNextPage: query?.fetchNextPage,
      fetchPreviousPage: query?.fetchPreviousPage,
      hasNextPage: query?.hasNextPage,
      hasPreviousPage: query?.hasPreviousPage,
      isFetchingNextPage: query?.isFetchingNextPage,
      isFetchingPreviousPage: query?.isFetchingPreviousPage,
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
      query?.data.pages,
      query?.data.pageParams,
      query?.fetchNextPage,
      query?.fetchPreviousPage,
      query?.hasNextPage,
      query?.hasPreviousPage,
      query?.isFetchingNextPage,
      query?.isFetchingPreviousPage,
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
      query?.status
    ]
  );
};
