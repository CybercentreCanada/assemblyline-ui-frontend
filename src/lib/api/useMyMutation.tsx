import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { APIQueryKey, APIResponseProps } from './utils';
import { DEFAULT_INVALIDATE_DELAY, DEFAULT_RETRY_MS, getAPIResponse, useAPICall } from './utils';

interface Props<TData, TError, TVariables, TContext, Body extends object>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationKey' | 'mutationFn'> {
  url: string;
  contentType?: string;
  method?: string;
  body?: Body;
  reloadOnUnauthorize?: boolean;
  allowCache?: boolean;
  retryAfter?: number;
  enabled?: boolean;
  invalidateProps?: {
    delay?: number;
    filter: (key: APIQueryKey) => boolean;
  };
  queryDataProps?: {
    filter: (key: APIQueryKey) => boolean;
    update: (old: TData) => TData;
  };
}

export const useMyMutation = <Response, Body extends object = object>({
  url,
  contentType = 'application/json',
  method = 'GET',
  body = null,
  reloadOnUnauthorize = true,
  allowCache = false,
  retryAfter = DEFAULT_RETRY_MS,
  enabled = true,
  onSuccess = () => null,
  invalidateProps = { delay: null, filter: null },
  queryDataProps = { filter: null, update: () => null },
  ...options
}: Props<APIResponseProps<Response>, APIResponseProps<Error>, null, unknown, Body>) => {
  const queryClient = useQueryClient();
  const apiCall = useAPICall<Response, Body>();

  const mutation = useMutation<APIResponseProps<Response>, APIResponseProps<Error>, unknown>({
    ...options,
    mutationKey: [{ url, allowCache, method, contentType, body, reloadOnUnauthorize, retryAfter, enabled }],
    mutationFn: async () => apiCall({ url, contentType, method, body, reloadOnUnauthorize, retryAfter, enabled }),

    onSuccess: async (data, variable: null, context) => {
      onSuccess(data, variable, context);

      if (queryDataProps?.filter && queryDataProps?.update) {
        queryClient.setQueriesData(
          {
            predicate: q => queryDataProps?.filter((JSON.parse(q.queryHash) as [APIQueryKey])[0])
          },
          queryDataProps.update
        );
      }

      if (invalidateProps?.filter) {
        await new Promise(resolve => setTimeout(resolve, invalidateProps?.delay || DEFAULT_INVALIDATE_DELAY));
        await queryClient.invalidateQueries({
          predicate: q => invalidateProps.filter((JSON.parse(q.queryHash) as [APIQueryKey])[0])
        });
      }
    }
  });

  return { ...mutation, ...getAPIResponse(mutation?.data, mutation?.error, mutation?.failureReason) };
};
