import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from './APIProvider';
import type { APIResponseProps } from './utils';
import { DEFAULT_RETRY_MS, useQueryFn } from './utils';

interface Props<TData = unknown, TError = Error, TVariables = void, TContext = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationKey' | 'mutationFn'> {
  url: string;
  contentType?: string;
  method?: string;
  body?: TVariables;
  reloadOnUnauthorize?: boolean;
  allowCache?: boolean;
  retryAfter?: number;
  enabled?: boolean;
  invalidateFn?: () => void;
}

export const useMyMutation = <Response extends unknown, Params extends object = object>({
  url,
  contentType = 'application/json',
  method = 'GET',
  body = null,
  reloadOnUnauthorize = true,
  allowCache = false,
  retryAfter = DEFAULT_RETRY_MS,
  enabled = true,
  onSuccess = () => null,
  invalidateFn = () => null,
  ...options
}: Props<APIResponseProps<Response>, APIResponseProps<Error>, Params>) => {
  const queryFn = useQueryFn<Response, Params>();

  const mutation = useMutation<APIResponseProps<Response>, APIResponseProps<Error>, Params>({
    ...options,
    mutationKey: [{ url, allowCache, method, contentType, body, reloadOnUnauthorize, retryAfter, enabled }],
    mutationFn: async () =>
      queryFn({ url, contentType, method, body, allowCache, reloadOnUnauthorize, retryAfter, enabled }),

    onSuccess: async (data, variable, context) => {
      onSuccess(data, variable, context);

      await queryClient.invalidateQueries({
        predicate: q => {
          const d = JSON.parse(q.queryHash);
          console.log(q);
          console.log(JSON.parse(q.queryHash));
          return d[0] === q.queryKey[0];
        }
      });
    }
  });

  return {
    ...mutation,
    statusCode: mutation?.data?.api_status_code || mutation?.error?.api_status_code || null,
    serverVersion: mutation?.data?.api_server_version || mutation?.error?.api_server_version || null,
    data: mutation?.data?.api_response || null,
    error: mutation?.data?.api_error_message || null
  };
};
