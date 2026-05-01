import type { APIRequests, APIResponses } from 'app/app.api';
import type { APIResponse } from '../api.models';
import type { UseAPICallFnProps } from './useAPICallFn';
import type { UseAPIQueryProps } from './useAPIQuery';
import { useAPIQuery } from './useAPIQuery';

export type UseAppQueryProps<Request extends APIRequests> = {
  queryProps?: UseAPIQueryProps<APIResponses<Request>, Request, string>['queryProps'];
  allowCache?: boolean;
  delay?: number;
  disabled?: boolean;
  retryAfter?: number;
} & UseAPICallFnProps<APIResponse<APIResponses<Request>>, Request>;

export const useAppQuery = <Request extends APIRequests>({
  url,
  method = 'GET',
  body = null,
  allowCache = false,
  disabled = false,
  ...props
}: UseAppQueryProps<Request>) =>
  useAPIQuery<APIResponses<Request>, Request, string>({
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
  } as UseAPIQueryProps<APIResponses<Request>, Request, string>);
