import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiRequest, ApiResponse } from '../api.models';
import { getApiResponse } from '../api.utils';
import type { UseApiCallFnProps } from './useApiCallFn';
import { useApiCallFn } from './useApiCallFn';

export const useApiMutation = <
  Props extends unknown[],
  Response = unknown,
  Request extends ApiRequest = ApiRequest,
  Error extends string = string
>(
  mutationFn: (...props: Props) => UseApiCallFnProps<ApiResponse<Response>, Request, ApiResponse<Error>>,
  mutationProps?: Omit<UseMutationOptions<ApiResponse<Response>, ApiResponse<Error>, Props, unknown>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<ApiResponse<Response>>();

  const mutation = useMutation<ApiResponse<Response>, ApiResponse<Error>, Props>(
    {
      ...mutationProps,
      mutationFn: (props: Props) => apiCallFn(mutationFn(...props)),
      retry: mutationProps?.retry ?? false
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = getApiResponse(
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
