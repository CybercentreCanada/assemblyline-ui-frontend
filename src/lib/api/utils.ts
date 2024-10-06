import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useQuota from 'components/hooks/useQuota';
import getXSRFCookie from 'helpers/xsrf';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse, ApiCallProps } from './models';

export const isAPIData = (value: object): value is APIResponse =>
  value !== undefined &&
  value !== null &&
  'api_response' in value &&
  'api_error_message' in value &&
  'api_server_version' in value &&
  'api_status_code' in value;

const getValue = <K extends keyof APIResponse<unknown>>(
  key: K,
  ...responses: APIResponse<unknown>[]
): APIResponse<unknown>[K] => responses?.find(r => !!r?.[key])?.[key] || null;

export const getAPIResponse = <R, E>(data: APIResponse<R>, error: APIResponse<E>, failureReason: APIResponse<E>) => ({
  statusCode: getValue('api_status_code', data, error, failureReason),
  serverVersion: getValue('api_server_version', data, error, failureReason),
  data: getValue('api_response', data, error, failureReason) as R,
  error: getValue('api_error_message', data, error, failureReason) as E
});

export const useApiCallFn = <Response, Body extends object = object>() => {
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  return useCallback(
    async ({
      url,
      contentType = 'application/json',
      method = 'GET',
      body = null,
      reloadOnUnauthorize = true,
      retryAfter = DEFAULT_RETRY_MS,
      enabled = true
    }: ApiCallProps<Body>) => {
      // Reject if the query is not enabled
      if (!enabled) return Promise.reject(null);

      // // Check the cache
      // const cachedURL = sessionStorage.getItem(url);
      // if (allowCache && cachedURL) {
      //   const apiData = JSON.parse(cachedURL) as APIResponse<Response>;
      //   return Promise.resolve(apiData);
      // }

      // fetching the API's data
      const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': contentType, 'X-XSRF-TOKEN': getXSRFCookie() },
        body: (!body ? null : contentType === 'application/json' ? JSON.stringify(body) : body) as BodyInit
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

      const { api_status_code: statusCode, api_error_message: error } = json;

      // // Reload when the user has exceeded their daily API call quota.
      if (statusCode === 503 && ['API', 'quota', 'daily'].every(v => error.includes(v))) {
        window.location.reload();
        return Promise.reject(json);
      }

      // Reject if the user has exceeded their daily submissions quota.
      if (statusCode === 503 && ['quota', 'submission'].every(v => error.includes(v))) {
        return Promise.reject(json);
      }

      // Reload when the user is not logged in
      if (statusCode === 401 && reloadOnUnauthorize) {
        window.location.reload();
        return Promise.reject(json);
      }

      // Reject if API Server is unavailable and should attempt to retry
      if (statusCode === 502) {
        showErrorMessage(json.api_error_message, 30000);
        return Promise.reject(json);
      }

      // Handle successful request
      if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();

      // Handle all non-successful request
      if (statusCode !== 200) {
        showErrorMessage(json.api_error_message);
        return Promise.reject(json);
      }

      // // Cache success status
      // if (allowCache) {
      //   try {
      //     sessionStorage.setItem(url, JSON.stringify(json));
      //   } catch (error) {
      //     // We could not store into the Session Storage, this means that it is full
      //     // Let's delete the oldest quarter of items to free up some space
      //     [...Array(Math.floor(sessionStorage.length / 4))].forEach(_ => {
      //       sessionStorage.removeItem(sessionStorage.key(0));
      //     });
      //   }
      // }

      return Promise.resolve(json);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setApiQuotaremaining, setSubmissionQuotaremaining, systemConfig.system.version, t]
  );
};
