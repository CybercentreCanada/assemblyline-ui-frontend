import type { InfiniteData, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { APIRequest, APIResponse } from 'components/core/Query/components/api.models';
import { DEFAULT_RETRY_MS } from 'components/core/Query/components/constants';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import { useAPICallFn } from 'components/core/Query/components/useAPICallFn';

export type UseInfiniteAPIQueryProps<Response = unknown, Request extends APIRequest = APIRequest, Error = string> = {
  queryProps?: UseInfiniteQueryOptions<
    APIResponse,
    Error,
    InfiniteData<APIResponse, unknown>,
    APIResponse,
    string[],
    any
  >;
  enabled?: boolean;
  retryAfter?: number;
  delay?: number;
} & Omit<UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>, 'signal' | 'enabled' | 'retryAfter'>;

export const useInfiniteAPIQuery = <
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>({
  enabled = true,
  queryProps = null,
  retryAfter = DEFAULT_RETRY_MS,
  delay = null,
  ...params
}: UseInfiniteAPIQueryProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  return useInfiniteQuery(
    {
      ...queryProps,
      enabled: !!enabled,
      queryKey: [{ ...params }],
      queryFn: async ({ signal }) => apiCallFn({ signal, ...params }),
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000)),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) => lastPage.api_response
    },
    queryClient
  );
};
