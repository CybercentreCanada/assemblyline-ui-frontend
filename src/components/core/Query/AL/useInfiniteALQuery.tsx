import { useInfiniteAPIQuery } from 'components/core/Query/API/useInfiniteAPIQuery';
import type { ALRequests, ALResponses } from 'components/core/Query/components/al.models';
import type { APIResponse } from 'components/core/Query/components/api.models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';

export type UseInfiniteALQueryProps<Request extends ALRequests, Error extends string = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>;
  getPreviousOffset?: (
    firstPage: APIResponse<ALResponses<Request>>,
    allPages: Array<APIResponse<ALResponses<Request>>>,
    firstPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  getNextOffset?: (
    lastPage: APIResponse<ALResponses<Request>>,
    allPages: Array<APIResponse<ALResponses<Request>>>,
    lastPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  allowCache?: boolean;
  retryAfter?: number;
};

export const useInfiniteALQuery = <Request extends ALRequests, Error extends string = string>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null,
  allowCache = false,
  retryAfter
}: UseInfiniteALQueryProps<Request, Error>) =>
  useInfiniteAPIQuery<ALResponses<Request>, Request, Error>({
    initialOffset,
    getParams,
    getPreviousOffset,
    getNextOffset,
    allowCache,
    retryAfter
  });
