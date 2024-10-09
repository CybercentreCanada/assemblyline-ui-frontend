import type { Query, UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_INVALIDATE_DELAY, DEFAULT_RETRY_MS } from './constants';
import type { APIResponse } from './models';
import { ApiCallProps, getAPIResponse, useApiCallFn } from './utils';

type Input<Body> = {
  url: string;
  contentType?: string;
  method?: string;
  body?: Body;
};

const DEFAULT_INPUT: Input<null> = { url: null, contentType: 'application/json', method: 'GET', body: null };

type Types<TBody = any, TError = Error, TResponse = any, TVariables = any, TContext = unknown, TPrevious = any> = {
  body?: TBody;
  error?: TError;
  response?: TResponse;
  input?: TVariables;
  context?: TContext;
  previous?: TPrevious;
};

type Props<T extends Types> = Omit<
  UseMutationOptions<APIResponse<T['response']>, APIResponse<T['error']>, T['input'], T['context']>,
  'mutationKey' | 'mutationFn' | 'onSuccess'
> & {
  input: Input<T['body']> | ((input: T['input']) => Input<T['body']>);
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  invalidateDelay?: number;
  onInvalidate?: (key: ApiCallProps) => boolean;
  onSuccess?: (props?: { data?: APIResponse<T['response']>; input?: T['input']; context?: T['context'] }) => void;
};

export const useApiMutation = <T extends Types>({
  input = null,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  invalidateDelay = DEFAULT_INVALIDATE_DELAY,
  onInvalidate = null,
  onSuccess = () => null,
  ...options
}: Props<T>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useApiCallFn<APIResponse<T['response']>, T['body']>();

  const mutation = useMutation<APIResponse<T['response']>, APIResponse<T['error']>, T['input'], unknown>({
    ...options,
    mutationFn: async (variables: T['input']) =>
      apiCallFn({
        ...DEFAULT_INPUT,
        ...(typeof input === 'function' ? input(variables) : input),
        reloadOnUnauthorize,
        retryAfter
      }),
    onSuccess: async (data, variable, context) => {
      void new Promise(() => onSuccess({ data, input: variable, context }));

      if (typeof onInvalidate === 'function') {
        await new Promise(resolve => setTimeout(resolve, invalidateDelay));
        await queryClient.invalidateQueries({
          predicate: ({ queryKey }: Query<unknown, Error, unknown, [ApiCallProps]>) => {
            try {
              return typeof queryKey[0] === 'object' && queryKey[0] && onInvalidate(queryKey[0]);
            } catch (err) {
              return false;
            }
          }
        });
      }
    }
  });

  return { ...mutation, ...getAPIResponse(mutation?.data, mutation?.error, mutation?.failureReason) };
};
