import type { UseMutationOptions } from '@tanstack/react-query';
import { useAPIMutation } from '../API/useAPIMutation';
import type { ALRequests, ALResponses } from '../components/al.models';
import type { APIResponse } from '../components/api.models';
import type { UseAPICallFnProps } from '../components/useAPICallFn';

export const useALMutation = <Props extends unknown[], Request extends ALRequests, Error extends string = string>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>,
  mutationProps?: Omit<
    UseMutationOptions<APIResponse<ALResponses<Request>>, APIResponse<Error>, Props, unknown>,
    'mutationFn'
  >
) => useAPIMutation<Props, ALResponses<Request>, Request, Error>(mutationFn, mutationProps);
