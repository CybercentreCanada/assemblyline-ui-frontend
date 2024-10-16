import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse } from './models';
import { getAPIResponse, useApiCallFn } from './utils';

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
  'mutationKey' | 'mutationFn' | 'onSuccess' | 'onMutate' | 'onSettled'
> & {
  input: Input<T['body']> | ((input: T['input']) => Input<T['body']>);
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  onSuccess?: (props?: {
    data: APIResponse<T['response']>;
    input: T['input'];
    context: T['context'];
  }) => Promise<unknown> | unknown;
  onFailure?: (props?: {
    error: APIResponse<T['error']>;
    input: T['input'];
    context: T['context'];
  }) => Promise<unknown> | unknown;
  onEnter?: (props?: { input: T['input'] }) => unknown;
  onExit?: (props?: {
    data: APIResponse<T['response']>;
    error: APIResponse<T['error']>;
    input: T['input'];
    context: T['context'];
  }) => Promise<unknown> | unknown;
};

export const useApiMutation = <T extends Types>({
  input = null,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  onSuccess = () => null,
  onFailure = () => null,
  onEnter = () => null,
  onExit = () => null,
  ...options
}: Props<T>) => {
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
    onSuccess: (data, variables, context) => onSuccess({ data, input: variables, context }),
    onError: (error, variables, context) => onFailure({ error, input: variables, context }),
    onMutate: variables => onEnter({ input: variables }),
    onSettled: (data, error, variables, context) => onExit({ data, error, input: variables, context })
  });

  return { ...mutation, ...getAPIResponse(mutation?.data, mutation?.error, mutation?.failureReason) };
};
