import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { APIRequest, APIResponse } from 'components/core/Query/components/api.models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import { useAPICallFn } from 'components/core/Query/components/useAPICallFn';
import { getAPIResponse } from 'components/core/Query/components/utils';

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

  const mutation = useMutation<APIResponse<Response>, APIResponse<Error>, Props>(
    {
      mutationFn: (props: Props) => apiCallFn(mutationFn(...props)),
      retry: false
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = getAPIResponse(
    mutation.data,
    mutation.error,
    mutation.failureReason
  );

  return {
    /** normalized API response */
    data,
    error,
    serverVersion,
    statusCode,

    /** mutation state */
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isPaused: mutation.isPaused,
    isSuccess: mutation.isSuccess,

    /** failure info */
    failureCount: mutation.failureCount,
    failureReason: mutation.failureReason,

    /** execution */
    mutate: (props: Props) => mutation.mutate(props),
    mutateAsync: (props: Props) => mutation.mutateAsync(props),

    /** misc */
    reset: mutation.reset,
    status: mutation.status,
    submittedAt: mutation.submittedAt,
    variables: mutation.variables
  };
};
