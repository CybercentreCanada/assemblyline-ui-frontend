import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { APIRequest, APIResponse } from 'components/core/API/utils/models';
import { getAPIResponse } from 'components/core/API/utils/utils';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import { useAPICallFn } from 'components/core/Query/components/useAPICallFn';
import { useMemo } from 'react';

type Options<Response, Request extends APIRequest, Error = string> = UseMutationOptions<
  APIResponse<Response>,
  APIResponse<Error>,
  UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>,
  unknown
>;

export type UseAPIMutationOldProps<Response, Request extends APIRequest, Error = string> = Omit<
  UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>,
  'onSuccess' | 'onFailure' | 'onEnter' | 'onExit'
> & {
  mutationProps?: Options<Response, Request, Error>;
  onSuccess?: Options<Response, Request, Error>['onSuccess'];
  onFailure?: Options<Response, Request, Error>['onError'];
  onEnter?: () => void;
  onExit?: Options<Response, Request, Error>['onSettled'];
};

export const useAPIMutationOld = <
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>({
  mutationProps = null,
  onSuccess = () => null,
  onFailure = () => null,
  onEnter = () => null,
  onExit = () => null,
  ...props
}: UseAPIMutationOldProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const mutation = useMutation<
    APIResponse<Response>,
    APIResponse<Error>,
    Partial<UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>>,
    unknown
  >(
    {
      ...mutationProps,
      mutationKey: [{ ...props }],
      mutationFn: async data => apiCallFn({ ...props, ...data, enabled: true, onEnter }) as Promise<never>,
      onSuccess: onSuccess,
      onError: onFailure,
      onSettled: onExit
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = useMemo(
    () => getAPIResponse(mutation.data, mutation.error, mutation.failureReason),
    [mutation.data, mutation.error, mutation.failureReason]
  );

  return useMemo(
    () => ({
      data: data,
      error: error,
      serverVersion: serverVersion,
      statusCode: statusCode,
      isError: mutation?.isError,
      isIdle: mutation?.isIdle,
      isPending: mutation?.isPending,
      isPaused: mutation?.isPaused,
      isSuccess: mutation?.isSuccess,
      failureCount: mutation?.failureCount,
      failureReason: mutation?.failureReason,
      mutate: mutation?.mutate,
      mutateAsync: mutation?.mutateAsync,
      reset: mutation?.reset,
      status: mutation?.status,
      submittedAt: mutation?.submittedAt,
      variables: mutation?.variables
    }),
    [
      data,
      error,
      mutation?.failureCount,
      mutation?.failureReason,
      mutation?.isError,
      mutation?.isIdle,
      mutation?.isPaused,
      mutation?.isPending,
      mutation?.isSuccess,
      mutation?.mutate,
      mutation?.mutateAsync,
      mutation?.reset,
      mutation?.status,
      mutation?.submittedAt,
      mutation?.variables,
      serverVersion,
      statusCode
    ]
  );
};
