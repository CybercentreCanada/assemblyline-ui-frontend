import type { UseMutationOptions } from '@tanstack/react-query';
import type { ApiResponse } from 'core/api/api.models';
import type { UseApiCallFnProps } from 'core/api/hooks/useApiCallFn';
import { useApiMutation } from 'core/api/hooks/useApiMutation';

export const useAppMutation = <Props extends unknown[], Request extends ApiRequests, Error extends string = string>(
  mutationFn: (...props: Props) => UseApiCallFnProps<ApiResponse<ApiResponses<Request>>, Request, ApiResponse<Error>>,
  mutationProps?: Omit<
    UseMutationOptions<ApiResponse<ApiResponses<Request>>, ApiResponse<Error>, Props, unknown>,
    'mutationFn'
  >
) => useApiMutation<Props, ApiResponses<Request>, Request, Error>(mutationFn, mutationProps);
