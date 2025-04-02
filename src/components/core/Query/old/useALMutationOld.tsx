import type { UseMutationOptions } from '@tanstack/react-query';
import type { APIResponse } from 'components/core/API/utils/models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';
import type { ALRequests, ALResponses } from 'components/core/Query/models/models';
import type { UseAPIMutationOldProps } from 'components/core/Query/old/useAPIMutationOld';
import { useAPIMutationOld } from 'components/core/Query/old/useAPIMutationOld';

type Options<Response, Request extends ALRequests, Error = string> = UseMutationOptions<
  APIResponse<Response>,
  APIResponse<Error>,
  UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>,
  unknown
>;

export type UseALMutationOldProps<Request extends ALRequests> = UseAPICallFnProps<
  APIResponse<ALResponses<Request>>,
  Request
> & {
  onSuccess?: Options<ALResponses<Request>, Request, Error>['onSuccess'];
  onFailure?: Options<ALResponses<Request>, Request, Error>['onError'];
  onEnter?: () => void;
  onExit?: Options<ALResponses<Request>, Request, Error>['onSettled'];
};

export const useALMutationOld = <Request extends ALRequests>({
  url,
  method = 'GET',
  body = null,
  ...props
}: UseALMutationOldProps<Request>) =>
  useAPIMutationOld({
    url:
      method !== 'GET'
        ? url
        : `${url}?${Object.entries(!body ? {} : body)
            .map(([k, v]: [string, string]) => (Array.isArray(v) ? v.map(i => `${k}=${i}`).join('&') : `${k}=${v}`))
            .join('&')}`,
    method,
    body: method !== 'GET' ? body : null,
    ...props
  } as UseAPIMutationOldProps<ALResponses<Request>, Request, string>);
