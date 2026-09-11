import type { UseMutationOptions } from '@tanstack/react-query';
import { useAPIMutation } from 'components/core/Query/API/useAPIMutation';
import type { ALRequests, ALResponses } from 'components/core/Query/components/al.models';
import type { APIResponse } from 'components/core/Query/components/api.models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';

export const useALMutation = <Props extends unknown[], Request extends ALRequests, Error extends string = string>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>,
  mutationProps?: Omit<
    UseMutationOptions<APIResponse<ALResponses<Request>>, APIResponse<Error>, Props, unknown>,
    'mutationFn'
  >
) => useAPIMutation<Props, ALResponses<Request>, Request, Error>(mutationFn, mutationProps);
