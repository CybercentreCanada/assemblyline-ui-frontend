import type { DefinedInitialDataInfiniteOptions, InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { APIRequest, APIResponse } from 'components/core/Query/components/api.models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import { useAPICallFn } from 'components/core/Query/components/useAPICallFn';
import { useMemo } from 'react';

type Options = DefinedInitialDataInfiniteOptions<
  unknown,
  Error,
  InfiniteData<unknown, unknown>,
  readonly unknown[],
  unknown
>;

export type UseInfiniteAPIQueryProps<Response = unknown, Request extends APIRequest = APIRequest, Error = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>;
  getPreviousOffset?: Options['getPreviousPageParam'];
  getNextOffset?: Options['getNextPageParam'];
};

export const useInfiniteAPIQuery = <
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null
}: UseInfiniteAPIQueryProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const query = useInfiniteQuery<
    unknown,
    APIResponse<Error>,
    InfiniteData<APIResponse<Response>, unknown>,
    UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>[],
    unknown
  >(
    {
      queryKey: [{ ...getParams(initialOffset) }],
      queryFn: async ({ signal, pageParam }) => apiCallFn({ ...getParams(pageParam as number), signal }),
      initialPageParam: initialOffset,
      getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
        getPreviousOffset(firstPage, allPages, firstPageParam, allPageParams),
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
        getNextOffset(lastPage, allPages, lastPageParam, allPageParams)
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
