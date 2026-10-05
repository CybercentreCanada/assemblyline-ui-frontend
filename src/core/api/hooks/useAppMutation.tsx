import type { UseMutationOptions } from '@tanstack/react-query';
import { useAPIMutation } from 'core/api/hooks/useApiMutation';
import type { ALRequests, ALResponses } from 'deprecated/legacy/components/core/Query/components/al.models.ts';
import type { APIResponse } from 'core/api/api.models.ts';
import type { UseAPICallFnProps } from 'core/api/hooks/useApiCallFn';

export const useALMutation = <Props extends unknown[], Request extends ALRequests, Error extends string = string>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>,
  mutationProps?: Omit<
    UseMutationOptions<APIResponse<ALResponses<Request>>, APIResponse<Error>, Props, unknown>,
    'mutationFn'
  >
) => useAPIMutation<Props, ALResponses<Request>, Request, Error>(mutationFn, mutationProps);
