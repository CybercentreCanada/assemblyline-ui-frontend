import type { DefinedInitialDataInfiniteOptions, InfiniteData } from '@tanstack/react-query';
import { useInfiniteAPIQuery } from 'components/core/Query/API/useInfiniteAPIQuery';
import type { ALRequests, ALResponses } from 'components/core/Query/components/al.models';
import type { APIResponse } from 'components/core/Query/components/api.models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';

type Options = DefinedInitialDataInfiniteOptions<
  unknown,
  Error,
  InfiniteData<unknown, unknown>,
  readonly unknown[],
  unknown
>;

export type UseInfiniteALQueryProps<Request extends ALRequests, Error extends string = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>;
  getPreviousOffset?: Options['getPreviousPageParam'];
  getNextOffset?: Options['getNextPageParam'];
};

export const useInfiniteALQuery = <Request extends ALRequests, Error extends string = string>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null
}: UseInfiniteALQueryProps<Request, Error>) =>
  useInfiniteAPIQuery<ALResponses<Request>, Request, Error>({
    initialOffset,
    getParams,
    getPreviousOffset,
    getNextOffset
  });
