import type { UndefinedInitialDataOptions } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_APP_PREFERENCE } from 'app/core.preference';
import type { ApiQueryKey, ApiRequest, ApiResponse } from 'core/api/api.models';
import { getApiResponse, stableStringify } from 'core/api/api.utils';
import type { UseApiCallFnProps } from 'core/api/hooks/useApiCallFn';
import { useApiCallFn } from 'core/api/hooks/useApiCallFn';
import { useIsDebouncing } from 'core/api/hooks/useIsDebouncing';

export type UseApiQueryProps<Response = unknown, Request extends ApiRequest = ApiRequest, Error = string> = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<ApiResponse<Response>, ApiResponse<Error>, ApiResponse<Response>, ApiQueryKey>,
    'queryKey' | 'queryFn'
  >;
  allowCache?: boolean;
  delay?: number;
  disabled?: boolean;
  retryAfter?: number;
} & Omit<UseApiCallFnProps<ApiResponse<Response>, Request, ApiResponse<Error>>, 'signal' | 'disabled' | 'retryAfter'>;

export const useApiQuery = <
  Response = unknown,
  Request extends ApiRequest = ApiRequest,
  Error extends string = string
>({
  allowCache = false,
  body = null,
  delay = null,
  disabled = false,
  method,
  queryProps = null,
  retryAfter = DEFAULT_APP_PREFERENCE.api.retryTime,
  url,
  ...params
}: UseApiQueryProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<ApiResponse<Response>>();

  const isDebouncing = useIsDebouncing(delay, [url, method ?? 'GET', stableStringify(body), allowCache]);

  const query = useQuery<ApiResponse<Response>, ApiResponse<Error>, ApiResponse<Response>, ApiQueryKey>(
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

  const { data, error, serverVersion, statusCode } = getApiResponse(query.data, query.error, query.failureReason);

  return {
    ...query,
    isDebouncing,
    data,
    error,
    serverVersion,
    statusCode
  };
};
