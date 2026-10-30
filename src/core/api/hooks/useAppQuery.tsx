import type { ApiResponse } from 'core/api/api.models';
import type { UseApiCallFnProps } from 'core/api/hooks/useApiCallFn';
import type { UseApiQueryProps } from 'core/api/hooks/useApiQuery';
import { useApiQuery } from 'core/api/hooks/useApiQuery';

export type UseAppQueryProps<Request extends ApiRequests> = {
  queryProps?: UseApiQueryProps<ApiResponses<Request>, Request, string>['queryProps'];
  allowCache?: boolean;
  delay?: number;
  disabled?: boolean;
  retryAfter?: number;
} & UseApiCallFnProps<ApiResponse<ApiResponses<Request>>, Request>;

export const useAppQuery = <Request extends ApiRequests>({
  url,
  method = 'GET',
  body = null,
  allowCache = false,
  disabled = false,
  ...props
}: UseAppQueryProps<Request>) =>
  useApiQuery<ApiResponses<Request>, Request, string>({
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
  } as UseApiQueryProps<ApiResponses<Request>, Request, string>);
