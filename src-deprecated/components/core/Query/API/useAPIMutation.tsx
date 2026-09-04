import type { UseMutationOptions } from '@tanstack/react-query';
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
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>,
  mutationProps?: Omit<UseMutationOptions<APIResponse<Response>, APIResponse<Error>, Props, unknown>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const mutation = useMutation<APIResponse<Response>, APIResponse<Error>, Props>(
    {
      ...mutationProps,
      mutationFn: (props: Props) => apiCallFn(mutationFn(...props)),
      retry: mutationProps?.retry ?? false
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = getAPIResponse(
    mutation.data,
    mutation.error,
    mutation.failureReason
  );

  return {
    ...mutation,

    /** normalized API response */
    data,
    error,
    serverVersion,
    statusCode,

    /** execution */
    mutate: (...props: Props) => mutation.mutate(props),
    mutateAsync: (...props: Props) => mutation.mutateAsync(props)
  };
};
