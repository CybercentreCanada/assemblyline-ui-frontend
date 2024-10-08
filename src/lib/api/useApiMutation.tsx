import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_INVALIDATE_DELAY, DEFAULT_RETRY_MS } from './constants';
import type { APIQueryKey, APIResponse } from './models';
import { getAPIResponse, useApiCallFn } from './utils';

type Props<TData, TError, TVariables, TContext, Body extends object> = Omit<
  UseMutationOptions<APIResponse<TData>, APIResponse<TError>, TVariables, TContext>,
  'mutationKey' | 'mutationFn'
> & {
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
    update: (old: TData, response: TData) => TData;
  };
};

// export const test = (({}) => void, ...options) => {

//   return null
// }

export const useApiMutation = <Response, Body extends object = object>({
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
  queryDataProps = { filter: null, update: null },
  ...options
}: Props<Response, Error, void, unknown, Body>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<Response, Body>();

  const mutation = useMutation<APIResponse<Response>, APIResponse<Error>, void, unknown>({
    ...options,
    mutationKey: [{ url, allowCache, method, contentType, body, reloadOnUnauthorize, retryAfter, enabled }],
    mutationFn: async () => apiCallFn({ url, contentType, method, body, reloadOnUnauthorize, retryAfter, enabled }),
    onSuccess: async (data, variable, context) => {
      onSuccess(data, variable, context);

      if (queryDataProps?.filter && queryDataProps?.update) {
        queryClient.setQueriesData<APIResponse<Response>>(
          { predicate: q => queryDataProps?.filter((JSON.parse(q.queryHash) as [APIQueryKey])[0]) },
          prev =>
            !queryDataProps.update ? prev : { ...prev, api_response: queryDataProps.update(prev?.api_response, data) }
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
