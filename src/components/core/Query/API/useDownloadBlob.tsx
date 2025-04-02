import type { UndefinedInitialDataOptions } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { APIResponse, BlobResponse } from 'components/core/Query/components/api.models';
import { DEFAULT_RETRY_MS } from 'components/core/Query/components/constants';
import { getBlobResponse, isAPIData } from 'components/core/Query/components/utils';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useQuota from 'components/hooks/useQuota';
import { getFileName } from 'helpers/utils';
import getXSRFCookie from 'helpers/xsrf';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type UseDownloadBlobProps = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<Promise<unknown>, APIResponse<Error>, BlobResponse, [unknown]>,
    'queryKey' | 'queryFn'
  >;
  url: string;
  allowCache?: boolean;
  enabled?: boolean;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
};

export const useDownloadBlob = ({
  queryProps = null,
  url,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  allowCache = false,
  enabled
}: UseDownloadBlobProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  const query = useQuery<Promise<unknown>, APIResponse<Error>, BlobResponse, [unknown]>(
    {
      ...queryProps,
      queryKey: [
        {
          url,
          method: 'GET',
          allowCache,
          enabled,
          reloadOnUnauthorize,
          retryAfter,
          systemVersion: systemConfig.system.version
        }
      ],
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000)),
      queryFn: async ({ signal }) => {
        // Reject if the query is not enabled
        if (!enabled) return Promise.reject(null);

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
          showErrorMessage(t('api.unreachable'), 10000);
          return Promise.reject({
            api_error_message: t('api.unreachable'),
            api_response: '',
            api_server_version: systemConfig.system.version,
            api_status_code: 502
          });
        }

        const json = (await res.json()) as BlobResponse;

        // Check for an invalid json format
        if (!isAPIData(json)) {
          showErrorMessage(t('api.invalid'));
          return Promise.reject({
            api_error_message: t('api.invalid'),
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
