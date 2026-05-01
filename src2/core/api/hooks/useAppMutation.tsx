import type { UseMutationOptions } from '@tanstack/react-query';
import type { APIRequests, APIResponses } from 'app/app.api';
import type { APIResponse } from '../api.models';
import type { UseAPICallFnProps } from './useAPICallFn';
import { useAPIMutation } from './useAPIMutation';

export const useAppMutation = <Props extends unknown[], Request extends APIRequests, Error extends string = string>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<APIResponses<Request>>, Request, APIResponse<Error>>,
  mutationProps?: Omit<
    UseMutationOptions<APIResponse<APIResponses<Request>>, APIResponse<Error>, Props, unknown>,
    'mutationFn'
  >
) => useAPIMutation<Props, APIResponses<Request>, Request, Error>(mutationFn, mutationProps);
