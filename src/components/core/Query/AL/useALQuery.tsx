import type { UndefinedInitialDataOptions } from '@tanstack/react-query';
import type { UseAPIQueryProps } from 'components/core/Query/API/useAPIQuery';
import { useAPIQuery } from 'components/core/Query/API/useAPIQuery';
import type { ALRequests, ALResponses } from 'components/core/Query/components/al.models';
import type { APIResponse } from 'components/core/Query/components/api.models';
import type { UseAPICallFnProps } from 'components/core/Query/components/useAPICallFn';

export type UseALQueryProps<Request extends ALRequests> = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<Promise<undefined>, APIResponse<string>, APIResponse<ALResponses<Request>>, [unknown]>,
    'queryKey' | 'queryFn'
  >;
  delay?: number;
  disabled?: boolean;
  retryAfter?: number;
} & UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request>;

export const useALQuery = <Request extends ALRequests>({
  url,
  method = 'GET',
  body = null,
  disabled = false,
  ...props
}: UseALQueryProps<Request>) =>
  useAPIQuery<ALResponses<Request>, Request, string>({
    url:
      method !== 'GET'
        ? url
        : `${url}?${Object.entries(!body ? {} : body)
            .map(([k, v]: [string, string]) => (Array.isArray(v) ? v.map(i => `${k}=${i}`).join('&') : `${k}=${v}`))
            .join('&')}`,
    method,
    body: method !== 'GET' ? body : null,
    disabled,
    ...props
  } as UseAPIQueryProps<ALResponses<Request>, Request, string>);
