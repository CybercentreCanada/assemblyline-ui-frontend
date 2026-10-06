import type { UseMutationOptions } from '@tanstack/react-query';
import type { ALRequests, ALResponses } from 'app/core.api';
import type { APIResponse } from 'core/api/api.models.ts';
import type { UseAPICallFnProps } from 'core/api/hooks/useApiCallFn';
import { useAPIMutation } from 'core/api/hooks/useApiMutation';

export const useALMutation = <Props extends unknown[], Request extends ALRequests, Error extends string = string>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>,
  mutationProps?: Omit<
    UseMutationOptions<APIResponse<ALResponses<Request>>, APIResponse<Error>, Props, unknown>,
    'mutationFn'
  >
) => useAPIMutation<Props, ALResponses<Request>, Request, Error>(mutationFn, mutationProps);
