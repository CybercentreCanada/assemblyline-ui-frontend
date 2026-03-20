import type { InfiniteData, UndefinedInitialDataOptions, UseMutationOptions } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import useALContext from 'components/hooks/useALContext';
// import type { LoginParamsProps } from 'components/hooks/useMyAPI';
// import useMySnackbar from 'components/hooks/useMySnackbar';
// import useQuota from 'components/hooks/useQuota';
import { useAppConfigSetStore, useAppConfigStore } from 'core/config/config.providers';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { getFileName } from 'lib/utils/utils';
import { getXSRFCookie } from 'lib/utils/xsrf.utils';
import type { Configuration } from 'models/base/config';
import type { CustomUser, WhoAmIProps } from 'models/ui/user';
import { DEFAULT_RETRY_MS } from './api.constants';
import type { ALRequests, ALResponses, APIQueryKey, APIRequest, APIResponse, BlobResponse } from './api.models';
import { getAPIResponse, getBlobResponse, isAPIData, stableStringify } from './api.utils';

export type UseAPICallFnProps<
  Response extends APIResponse,
  Request extends APIRequest = APIRequest,
  Error extends APIResponse = APIResponse<string>
> = Request &
  Omit<RequestInit, 'url' | 'method' | 'body'> & {
    contentType?: string;
    disabled?: boolean;
    reloadOnUnauthorize?: boolean;
    retryAfter?: number;
    signal?: AbortSignal;
    onSuccess?: (data: Response) => void;
    onFailure?: (error: Error) => void;
    onEnter?: () => void;
    onExit?: () => void;
  };

export const useAPICallFn = <
  Response extends APIResponse,
  Request extends APIRequest = APIRequest,
  Error extends APIResponse = APIResponse<string>
>() => {
  const { t } = useTranslation(['api']);
  const { showErrorMessage, closeSnackbar } = useAppSnackbar();
  const systemConfig = useAppConfigStore(s => s.configuration);
  // const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();
  const setStore = useAppConfigSetStore();

  return useCallback(
    async ({
      body = null,
      contentType = 'application/json',
      credentials = 'same-origin',
      disabled = false,
      headers,
      method = 'GET',
      reloadOnUnauthorize = true,
      retryAfter = DEFAULT_RETRY_MS,
      signal,
      url,
      onSuccess,
      onFailure,
      onEnter,
      onExit
    }: UseAPICallFnProps<Response, Request, Error>) => {
      onEnter?.();

      if (disabled) {
        onExit?.();
        return Promise.reject(null);
      }

      const rejectWith = (err: APIResponse, fallbackMsg?: string) => {
        if (onFailure) onFailure(err as Error);
        else if (fallbackMsg) showErrorMessage(fallbackMsg);
        return Promise.reject(err);
      };

      try {
        const res = await fetch(url, {
          body: body == null ? null : contentType === 'application/json' ? JSON.stringify(body) : (body as BodyInit),
          credentials,
          headers: { ...headers, 'Content-Type': contentType, 'X-XSRF-TOKEN': getXSRFCookie() },
          method,
          signal
        });

        // Setting the API quota
        const apiQuota = res.headers.get('X-Remaining-Quota-Api');
        if (apiQuota) {
          setStore(s => {
            s.quota.api = parseInt(apiQuota);
            return s;
          });
        }

        // Setting the Submission quota
        const submissionQuota = res.headers.get('X-Remaining-Quota-Submission');
        if (submissionQuota) {
          setStore(s => {
            s.quota.submission = parseInt(submissionQuota);
            return s;
          });
        }

        const json = (await res.json()) as APIResponse;
        const error = json.api_error_message ?? '';

        // unreachable backend
        if (res.status === 502) {
          return rejectWith(
            {
              api_error_message: t('unreachable'),
              api_response: '',
              api_server_version: systemConfig.system.version,
              api_status_code: 502
            },
            t('unreachable')
          );
        }

        // malformed payload
        if (!isAPIData(json)) {
          return rejectWith(
            {
              api_error_message: t('invalid'),
              api_response: '',
              api_server_version: systemConfig.system.version,
              api_status_code: 400
            },
            t('invalid')
          );
        }

        // quota exceeded
        if (res.status === 503) {
          if (['API', 'quota', 'daily'].every(v => error.includes(v))) {
            window.location.reload();
          }
          if (['quota', 'submission'].every(v => error.includes(v))) {
            return rejectWith(json);
          }
        }

        // unauthorized
        if (res.status === 401 && reloadOnUnauthorize) {
          // window.location.reload();
          return rejectWith(json);
        }

        // generic non-success
        if (res.status !== 200) {
          return rejectWith(json, json.api_error_message);
        }

        // success
        if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();

        onSuccess?.(json as Response);
        return json as Response;
      } finally {
        onExit?.();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [systemConfig.system.version, t]
  );
};

export const useIsDebouncing = (delay: number | null = null, dependencies: readonly unknown[] = []): boolean => {
  const [bouncedDependencies, setBouncedDependencies] = useState<string | null>(null);

  const stringifiedDependencies = useMemo<string>(() => stableStringify(dependencies), [dependencies]);

  useEffect(() => {
    if (!delay) return;
    const handler = setTimeout(() => setBouncedDependencies(stableStringify(dependencies)), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...dependencies]);

  return useMemo(
    () => (delay ? bouncedDependencies !== stringifiedDependencies : false),
    [bouncedDependencies, delay, stringifiedDependencies]
  );
};

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
  retryAfter = DEFAULT_RETRY_MS,
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

export const useAPIMutation = <
  Props extends unknown[],
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>,
  mutationProps?: Omit<UseMutationOptions<APIResponse<Response>, APIResponse<Error>, Props, unknown>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const mutation = useMutation<APIResponse<Response>, APIResponse<Error>, Props>(
    {
      ...mutationProps,
      mutationFn: (props: Props) => apiCallFn(mutationFn(...props)),
      retry: mutationProps?.retry ?? false
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = getAPIResponse(
    mutation.data,
    mutation.error,
    mutation.failureReason
  );

  return {
    ...mutation,

    /** normalized API response */
    data,
    error,
    serverVersion,
    statusCode,

    /** execution */
    mutate: (...props: Props) => mutation.mutate(props),
    mutateAsync: (...props: Props) => mutation.mutateAsync(props)
  };
};

export type UseInfiniteAPIQueryProps<Response = unknown, Request extends APIRequest = APIRequest, Error = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseAPICallFnProps<APIResponse<Response>, Request, APIResponse<Error>>;
  getPreviousOffset?: (
    firstPage: APIResponse<Response>,
    allPages: Array<APIResponse<Response>>,
    firstPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  getNextOffset?: (
    lastPage: APIResponse<Response>,
    allPages: Array<APIResponse<Response>>,
    lastPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  allowCache?: boolean;
  retryAfter?: number;
};

export const useInfiniteAPIQuery = <
  Response = unknown,
  Request extends APIRequest = APIRequest,
  Error extends string = string
>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null,
  allowCache = false,
  retryAfter = DEFAULT_RETRY_MS
}: UseInfiniteAPIQueryProps<Response, Request, Error>) => {
  const queryClient = useQueryClient();
  const apiCallFn = useAPICallFn<APIResponse<Response>>();

  const base = getParams(initialOffset);

  const query = useInfiniteQuery<
    APIResponse<Response>,
    APIResponse<Error>,
    InfiniteData<APIResponse<Response>, number>,
    APIQueryKey,
    number
  >(
    {
      queryKey: [base?.url, base?.method ?? 'GET', stableStringify(base?.body ?? null), allowCache],
      queryFn: async ({ signal, pageParam }) => apiCallFn({ ...getParams(pageParam as number), signal }),
      initialPageParam: initialOffset,
      getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
        getPreviousOffset(firstPage, allPages, firstPageParam, allPageParams),
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
        getNextOffset(lastPage, allPages, lastPageParam, allPageParams),
      retry: (failureCount, error) => failureCount < 3 && error?.api_status_code === 502,
      retryDelay: failureCount => Math.min(retryAfter * (failureCount + 1), 10000)
    },
    queryClient
  );

  return useMemo(
    () => ({
      data: query?.data.pages.map(page => page.api_response),
      error: query?.data.pages.map(page => page.api_error_message),
      pages: query?.data.pageParams,
      serverVersion: query?.data.pages.map(page => page.api_server_version),
      statusCode: query?.data.pages.map(page => page.api_status_code),
      fetchNextPage: query?.fetchNextPage,
      fetchPreviousPage: query?.fetchPreviousPage,
      hasNextPage: query?.hasNextPage,
      hasPreviousPage: query?.hasPreviousPage,
      isFetchingNextPage: query?.isFetchingNextPage,
      isFetchingPreviousPage: query?.isFetchingPreviousPage,
      dataUpdatedAt: query?.dataUpdatedAt,
      errorUpdatedAt: query?.errorUpdatedAt,
      failureCount: query?.failureCount,
      failureReason: query?.failureReason,
      fetchStatus: query?.fetchStatus,
      isError: query?.isError,
      isFetched: query?.isFetched,
      isFetchedAfterMount: query?.isFetchedAfterMount,
      isFetching: query?.isFetching,
      isInitialLoading: query?.isInitialLoading,
      isLoading: query?.isLoading,
      isLoadingError: query?.isLoadingError,
      isPaused: query?.isPaused,
      isPending: query?.isPending,
      isPlaceholderData: query?.isPlaceholderData,
      isRefetchError: query?.isRefetchError,
      isRefetching: query?.isRefetching,
      isStale: query?.isStale,
      isSuccess: query?.isSuccess,
      promise: query?.promise,
      refetch: query?.refetch,
      status: query?.status
    }),
    [
      query?.data.pages,
      query?.data.pageParams,
      query?.fetchNextPage,
      query?.fetchPreviousPage,
      query?.hasNextPage,
      query?.hasPreviousPage,
      query?.isFetchingNextPage,
      query?.isFetchingPreviousPage,
      query?.dataUpdatedAt,
      query?.errorUpdatedAt,
      query?.failureCount,
      query?.failureReason,
      query?.fetchStatus,
      query?.isError,
      query?.isFetched,
      query?.isFetchedAfterMount,
      query?.isFetching,
      query?.isInitialLoading,
      query?.isLoading,
      query?.isLoadingError,
      query?.isPaused,
      query?.isPending,
      query?.isPlaceholderData,
      query?.isRefetchError,
      query?.isRefetching,
      query?.isStale,
      query?.isSuccess,
      query?.promise,
      query?.refetch,
      query?.status
    ]
  );
};

export type UseDownloadBlobProps = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<BlobResponse, APIResponse<Error>, BlobResponse, APIQueryKey>,
    'queryKey' | 'queryFn'
  >;
  allowCache?: boolean;
  disabled?: boolean;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  url: string;
};

export const useDownloadBlob = ({
  allowCache = false,
  disabled,
  queryProps = null,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  url
}: UseDownloadBlobProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['api']);
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  const query = useQuery<BlobResponse, APIResponse<Error>, BlobResponse, APIQueryKey>(
    {
      ...queryProps,
      queryKey: [url, 'GET', stableStringify(null), allowCache],
      retry: (failureCount, error) => failureCount < 3 && error?.api_status_code === 502,
      retryDelay: failureCount => Math.min(retryAfter * (failureCount + 1), 10000),
      queryFn: async ({ signal }) => {
        // Reject if the query is not enabled
        if (disabled) return Promise.reject(null);

        // fetching the API's data
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'X-XSRF-TOKEN': getXSRFCookie() },
          signal
        });

        // Setting the API quota
        const apiQuota = res.headers.get('X-Remaining-Quota-Api');
        if (apiQuota) setApiQuotaremaining(parseInt(apiQuota));

        // Setting the Submission quota
        const submissionQuota = res.headers.get('X-Remaining-Quota-Submission');
        if (submissionQuota) setSubmissionQuotaremaining(parseInt(submissionQuota));

        // Handle an unreachable API
        if (res.status === 502) {
          showErrorMessage(t('unreachable'), 10000);
          return Promise.reject({
            api_error_message: t('unreachable'),
            api_response: '',
            api_server_version: systemConfig.system.version,
            api_status_code: 502
          });
        }

        const json = (await res.json()) as BlobResponse;

        // Check for an invalid json format
        if (!isAPIData(json)) {
          showErrorMessage(t('invalid'));
          return Promise.reject({
            api_error_message: t('invalid'),
            api_response: '',
            api_server_version: systemConfig.system.version,
            api_status_code: 400
          });
        }

        const { api_error_message: error } = json;

        // Reload when the user has exceeded their daily API call quota.
        if (res.status === 503 && ['API', 'quota', 'daily'].every(v => error.includes(v))) {
          window.location.reload();
          return Promise.reject(json);
        }

        // Reject if the user has exceeded their daily submissions quota.
        if (res.status === 503 && ['quota', 'submission'].every(v => error.includes(v))) {
          return Promise.reject(json);
        }

        // Reload when the user is not logged in
        if (res.status === 401 && reloadOnUnauthorize) {
          window.location.reload();
          return Promise.reject(json);
        }

        // Reject if API Server is unavailable and should attempt to retry
        if (res.status === 502) {
          showErrorMessage(json.api_error_message, 30000);
          return Promise.reject(json);
        }

        // Handle successful request
        if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();

        // Handle all non-successful request
        if (res.status !== 200) {
          showErrorMessage(json.api_error_message);
          return Promise.reject(json);
        }

        return Promise.resolve({
          api_error_message: '',
          api_response: res.body,
          api_server_version: systemConfig.system.version,
          api_status_code: res.status,
          filename: getFileName(res.headers.get('Content-Disposition')),
          size: parseInt(res.headers.get('Content-Length')),
          type: res.headers.get('Content-Type')
        });
      }
    },
    queryClient
  );

  const { statusCode, serverVersion, data, error, filename, size, type } = useMemo(
    () => getBlobResponse(query.data, query.error, query.failureReason),
    [query.data, query.error, query.failureReason]
  );

  return useMemo(
    () => ({
      data: data,
      error: error,
      filename: filename,
      serverVersion: serverVersion,
      size: size,
      statusCode: statusCode,
      type: type,
      dataUpdatedAt: query?.dataUpdatedAt,
      errorUpdatedAt: query?.errorUpdatedAt,
      failureCount: query?.failureCount,
      failureReason: query?.failureReason,
      fetchStatus: query?.fetchStatus,
      isError: query?.isError,
      isFetched: query?.isFetched,
      isFetchedAfterMount: query?.isFetchedAfterMount,
      isFetching: query?.isFetching,
      isInitialLoading: query?.isInitialLoading,
      isLoading: query?.isLoading,
      isLoadingError: query?.isLoadingError,
      isPaused: query?.isPaused,
      isPending: query?.isPending,
      isPlaceholderData: query?.isPlaceholderData,
      isRefetchError: query?.isRefetchError,
      isRefetching: query?.isRefetching,
      isStale: query?.isStale,
      isSuccess: query?.isSuccess,
      promise: query?.promise,
      refetch: query?.refetch,
      status: query?.status
    }),
    [
      data,
      error,
      filename,
      serverVersion,
      size,
      statusCode,
      type,
      query?.dataUpdatedAt,
      query?.errorUpdatedAt,
      query?.failureCount,
      query?.failureReason,
      query?.fetchStatus,
      query?.isError,
      query?.isFetched,
      query?.isFetchedAfterMount,
      query?.isFetching,
      query?.isInitialLoading,
      query?.isLoading,
      query?.isLoadingError,
      query?.isPaused,
      query?.isPending,
      query?.isPlaceholderData,
      query?.isRefetchError,
      query?.isRefetching,
      query?.isStale,
      query?.isSuccess,
      query?.promise,
      query?.refetch,
      query?.status
    ]
  );
};

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

export const useALMutation = <Props extends unknown[], Request extends ALRequests, Error extends string = string>(
  mutationFn: (...props: Props) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>,
  mutationProps?: Omit<
    UseMutationOptions<APIResponse<ALResponses<Request>>, APIResponse<Error>, Props, unknown>,
    'mutationFn'
  >
) => useAPIMutation<Props, ALResponses<Request>, Request, Error>(mutationFn, mutationProps);

export type UseInfiniteALQueryProps<Request extends ALRequests, Error extends string = string> = {
  initialOffset?: number;
  getParams: (offset: number) => UseAPICallFnProps<APIResponse<ALResponses<Request>>, Request, APIResponse<Error>>;
  getPreviousOffset?: (
    firstPage: APIResponse<ALResponses<Request>>,
    allPages: Array<APIResponse<ALResponses<Request>>>,
    firstPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  getNextOffset?: (
    lastPage: APIResponse<ALResponses<Request>>,
    allPages: Array<APIResponse<ALResponses<Request>>>,
    lastPageParam: number,
    allPageParams: Array<number>
  ) => number | undefined;
  allowCache?: boolean;
  retryAfter?: number;
};

export const useInfiniteALQuery = <Request extends ALRequests, Error extends string = string>({
  initialOffset = 0,
  getParams = () => null,
  getPreviousOffset = () => null,
  getNextOffset = () => null,
  allowCache = false,
  retryAfter
}: UseInfiniteALQueryProps<Request, Error>) =>
  useInfiniteAPIQuery<ALResponses<Request>, Request, Error>({
    initialOffset,
    getParams,
    getPreviousOffset,
    getNextOffset,
    allowCache,
    retryAfter
  });

export type UseBootstrapQueryProps = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<
      APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
      APIResponse<Error>,
      APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
      APIQueryKey
    >,
    'queryKey' | 'queryFn'
  >;
  switchRenderedApp: (value: string) => void;
  setConfiguration: (cfg: Configuration) => void;
  setLoginParams: (params: LoginParamsProps) => void;
  setUser: (user: WhoAmIProps | CustomUser) => void;
  setReady: (layout: boolean, borealis: boolean, iconifyUrl: string) => void;
  disabled?: boolean;
  retryAfter?: number;
  allowCache?: boolean;
};

export const useBootstrapQuery = ({
  queryProps = null,
  switchRenderedApp = () => null,
  setConfiguration = () => null,
  setLoginParams = () => null,
  setUser = () => null,
  setReady = () => null,
  disabled = false,
  retryAfter = DEFAULT_RETRY_MS,
  allowCache = false
}: UseBootstrapQueryProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['api']);
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  const query = useQuery<
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIResponse<Error>,
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIQueryKey
  >(
    {
      ...queryProps,
      enabled: !disabled,
      queryKey: ['/api/v4/user/whoami/', 'GET', stableStringify(null), allowCache],
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => Math.min(retryAfter * (failureCount + 1), 10000),
      queryFn: async ({ signal }) => {
        // Reject if the query is not enabled
        if (disabled) {
          return Promise.reject(null);
        }

        // fetching the API's data
        const res = await fetch('/api/v4/user/whoami/', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'X-XSRF-TOKEN': getXSRFCookie() },
          signal
        });

        // Setting the API quota
        const apiQuota = res.headers.get('X-Remaining-Quota-Api');
        if (apiQuota) setApiQuotaremaining(parseInt(apiQuota));

        // Setting the Submission quota
        const submissionQuota = res.headers.get('X-Remaining-Quota-Submission');
        if (submissionQuota) setSubmissionQuotaremaining(parseInt(submissionQuota));

        // Handle an unreachable API
        if (res.status === 502) {
          showErrorMessage(t('unreachable'), 10000);
          return Promise.reject({
            api_error_message: t('unreachable'),
            api_response: '',
            api_server_version: systemConfig.system.version,
            api_status_code: 502
          });
        }

        const json = (await res.json()) as APIResponse<Configuration | LoginParamsProps | WhoAmIProps>;

        // Check for an invalid json format
        if (!isAPIData(json)) {
          showErrorMessage(t('invalid'), 30000);
          switchRenderedApp('load');
          return Promise.reject({
            api_error_message: t('invalid'),
            api_response: '',
            api_server_version: systemConfig.system.version,
            api_status_code: 400
          });
        }

        const { api_error_message: error } = json;

        // Forbiden response indicate that the user's account is locked.
        if (res.status === 403) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          setConfiguration(json.api_response as Configuration);
          switchRenderedApp('locked');
          return Promise.reject(json);
        }

        // Unauthorized response indicate that the user is not logged in.
        if (res.status === 401) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          localStorage.setItem('loginParams', JSON.stringify(json.api_response));
          sessionStorage.clear();
          setLoginParams(json.api_response as LoginParamsProps);
          switchRenderedApp('login');
          return Promise.reject(json);
        }

        // Daily quota error, stop everything!
        if (res.status === 503 && ['API', 'quota', 'daily'].every(v => error.includes(v))) {
          switchRenderedApp('quota');
          return Promise.reject(json);
        }

        // Handle all non-successful request
        if (res.status !== 200) {
          showErrorMessage(json.api_error_message);
          return Promise.reject(json);
        }

        if (res.status === 200) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();

          const user = json.api_response as WhoAmIProps;

          // Set the current user
          setUser(user);

          // Mark the interface ready
          setReady(
            true,
            'borealis' in user.configuration.ui.api_proxies,
            user.configuration?.ui?.api_proxies?.borealis?.custom_iconify || null
          );

          // Render appropriate page
          if (!user.agrees_with_tos && user.configuration.ui.tos) {
            switchRenderedApp('tos');
          } else {
            switchRenderedApp('routes');
          }

          return Promise.resolve(json);
        }
      }
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = getAPIResponse(query.data, query.error, query.failureReason);

  return {
    ...query,
    data,
    error,
    serverVersion,
    statusCode
  };
};
