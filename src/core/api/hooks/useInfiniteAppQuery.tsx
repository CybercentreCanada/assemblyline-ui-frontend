import type { ApiResponse } from 'core/api/api.models';
import type { UseApiCallFnProps } from 'core/api/hooks/useApiCallFn';
import { useInfiniteApiQuery } from 'core/api/hooks/useInfiniteApiQuery';

export type UseInfiniteAppQueryProps<Request extends ApiRequests, Error extends string = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseApiCallFnProps<ApiResponse<ApiResponses<Request>>, Request, ApiResponse<Error>>;
  getPreviousOffset?: (
    firstPage: ApiResponse<ApiResponses<Request>>,
    allPages: ApiResponse<ApiResponses<Request>>[],
    firstPageParam: number,
    allPageParams: number[]
  ) => number | undefined;
  getNextOffset?: (
    lastPage: ApiResponse<ApiResponses<Request>>,
    allPages: ApiResponse<ApiResponses<Request>>[],
    lastPageParam: number,
    allPageParams: number[]
  ) => number | undefined;
  allowCache?: boolean;
  retryAfter?: number;
};

export const useInfiniteAppQuery = <Request extends ApiRequests, Error extends string = string>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null,
  allowCache = false,
  retryAfter
}: UseInfiniteAppQueryProps<Request, Error>) =>
  useInfiniteApiQuery<ApiResponses<Request>, Request, Error>({
    initialOffset,
    getParams,
    getPreviousOffset,
    getNextOffset,
    allowCache,
    retryAfter
  });
