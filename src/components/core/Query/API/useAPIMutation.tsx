import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { APIRequest, APIResponse } from 'components/core/Query/components/api.models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import { useAPICallFn } from 'components/core/Query/components/useAPICallFn';
import { getAPIResponse } from 'components/core/Query/components/utils';
import { useMemo } from 'react';

export const useAPIMutation = <
  Props extends unknown[],
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>
) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const mutation = useMutation<APIResponse<Response>, APIResponse<Error>, Props, unknown>(
    {
      mutationFn: async (props: Props) => apiCallFn(mutationFn(...props)) as Promise<never>
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
      mutate: (...props: Props) => mutation?.mutate(props),
      mutateAsync: async (...props: Props) => mutation?.mutateAsync(props),
      reset: mutation?.reset,
      status: mutation?.status,
      submittedAt: mutation?.submittedAt,
      variables: mutation?.variables
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
