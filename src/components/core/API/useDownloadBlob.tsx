import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useQuota from 'components/hooks/useQuota';
import { getFileName } from 'helpers/utils';
import getXSRFCookie from 'helpers/xsrf';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse, BlobResponse } from './models';
import { getBlobResponse, isAPIData } from './utils';

type Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = Omit<
  DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  'queryKey' | 'initialData' | 'enabled'
> & {
  url: string;
  allowCache?: boolean;
  enabled?: boolean;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
};

export const useMyQuery = ({
  url,
  reloadOnUnauthorize = true,
  retryAfter = DEFAULT_RETRY_MS,
  allowCache = false,
  enabled,
  ...options
}: Props<BlobResponse, APIResponse<Error>, BlobResponse, QueryKey>) => {
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  const queryClient = useQueryClient();

  const query = useQuery<BlobResponse, APIResponse<Error>, BlobResponse>(
    {
      ...options,
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

        const json = (await res.json()) as APIResponse<Response>;

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

  return { ...query, ...getBlobResponse(query?.data, query?.error, query?.failureReason) };
};
