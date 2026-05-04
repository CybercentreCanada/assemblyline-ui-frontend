import type { ApiRequests, ApiResponses } from 'app/app.api';
import type { ApiResponse } from '../api.models';
import type { UseApiCallFnProps } from './useApiCallFn';
import { useInfiniteApiQuery } from './useInfiniteApiQuery';

export type UseInfiniteAppQueryProps<Request extends ApiRequests, Error extends string = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseApiCallFnProps<ApiResponse<ApiResponses<Request>>, Request, ApiResponse<Error>>;
  getPreviousOffset?: (
    firstPage: ApiResponse<ApiResponses<Request>>,
    allPages: Array<ApiResponse<ApiResponses<Request>>>,
    firstPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  getNextOffset?: (
    lastPage: ApiResponse<ApiResponses<Request>>,
    allPages: Array<ApiResponse<ApiResponses<Request>>>,
    lastPageParam: number,
    allPageParams: Array<number>
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
