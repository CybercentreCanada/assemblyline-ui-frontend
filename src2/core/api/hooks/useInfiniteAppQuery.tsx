import type { APIRequests, APIResponses } from 'app/app.api';
import type { APIResponse } from '../api.models';
import type { UseAPICallFnProps } from './useAPICallFn';
import { useInfiniteAPIQuery } from './useInfiniteAPIQuery';

export type UseInfiniteAppQueryProps<Request extends APIRequests, Error extends string = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseAPICallFnProps<APIResponse<APIResponses<Request>>, Request, APIResponse<Error>>;
  getPreviousOffset?: (
    firstPage: APIResponse<APIResponses<Request>>,
    allPages: Array<APIResponse<APIResponses<Request>>>,
    firstPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  getNextOffset?: (
    lastPage: APIResponse<APIResponses<Request>>,
    allPages: Array<APIResponse<APIResponses<Request>>>,
    lastPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  allowCache?: boolean;
  retryAfter?: number;
};

export const useInfiniteAppQuery = <Request extends APIRequests, Error extends string = string>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null,
  allowCache = false,
  retryAfter
}: UseInfiniteAppQueryProps<Request, Error>) =>
  useInfiniteAPIQuery<APIResponses<Request>, Request, Error>({
    initialOffset,
    getParams,
    getPreviousOffset,
    getNextOffset,
    allowCache,
    retryAfter
  });
