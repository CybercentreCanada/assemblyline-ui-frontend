import type { UndefinedInitialDataOptions } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_APP_CONFIG } from 'app/app.configs';
import type { APIQueryKey, APIRequest, APIResponse } from '../api.models';
import { getAPIResponse, stableStringify } from '../api.utils';
import type { UseAPICallFnProps } from './useAPICallFn';
import { useAPICallFn } from './useAPICallFn';
import { useIsDebouncing } from './useIsDebouncing';

export type UseAPIQueryProps<Response = unknown, Request extends APIRequest = APIRequest, Error = string> = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<APIResponse<Response>, APIResponse<Error>, APIResponse<Response>, APIQueryKey>,
    'queryKey' | 'queryFn'
  >;
  allowCache?: boolean;
  delay?: number;
  disabled?: boolean;
  retryAfter?: number;
} & Omit<UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>, 'signal' | 'disabled' | 'retryAfter'>;

export const useAPIQuery = <
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>({
  allowCache = false,
  body = null,
  delay = null,
  disabled = false,
  method,
  queryProps = null,
  retryAfter = DEFAULT_APP_CONFIG.api.retryTime,
  url,
  ...params
}: UseAPIQueryProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const isDebouncing = useIsDebouncing(delay, [url, method ?? 'GET', stableStringify(body), allowCache]);

  const query = useQuery<APIResponse<Response>, APIResponse<Error>, APIResponse<Response>, APIQueryKey>(
    {
      ...queryProps,
      enabled: !disabled && !isDebouncing,
      queryKey: [url, method ?? 'GET', stableStringify(body), allowCache],
      queryFn: async ({ signal }) => apiCallFn({ url, method, body, signal, enabled: !disabled, ...params }),
      retry: (failureCount, error) => failureCount < 3 && error?.api_status_code === 502,
      retryDelay: failureCount => Math.min(retryAfter * (failureCount + 1), 10000)
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = getAPIResponse(query.data, query.error, query.failureReason);

  return {
    ...query,
    isDebouncing,
    data,
    error,
    serverVersion,
    statusCode
  };
};
