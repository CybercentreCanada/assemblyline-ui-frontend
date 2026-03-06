import type { UndefinedInitialDataOptions } from '@tanstack/react-query';
import type { UseAPIQueryProps } from '../API/useAPIQuery';
import { useAPIQuery } from '../API/useAPIQuery';
import type { ALRequests, ALResponses } from '../components/al.models';
import type { APIQueryKey, APIResponse } from '../components/api.models';
import type { UseAPICallFnProps } from '../components/useAPICallFn';

export type UseALQueryProps<Request extends ALRequests> = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<
      APIResponse<ALResponses<Request>>,
      APIResponse<string>,
      APIResponse<ALResponses<Request>>,
      APIQueryKey
    >,
    'queryKey' | 'queryFn'
  >;
  allowCache?: boolean;
  delay?: number;
  disabled?: boolean;
  retryAfter?: number;
} & UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request>;

export const useALQuery = <Request extends ALRequests>({
  url,
  method = 'GET',
  body = null,
  allowCache = false,
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
    allowCache,
    ...props
  } as UseAPIQueryProps<ALResponses<Request>, Request, string>);
