import useALContext from 'components/hooks/useALContext';
import type { LoginParamsProps } from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useQuota from 'components/hooks/useQuota';
import type { Configuration } from 'components/models/base/config';
import type { WhoAmIProps } from 'components/models/ui/user';
import { getFileName } from 'helpers/utils';
import getXSRFCookie from 'helpers/xsrf';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse, BlobResponse } from './models';

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

type BootstrapProps = {
  switchRenderedApp: (value: string) => void;
  setConfiguration: (cfg: Configuration) => void;
  setLoginParams: (params: LoginParamsProps) => void;
  setUser: (user: WhoAmIProps) => void;
  setReady: (layout: boolean, borealis: boolean) => void;
  retryAfter?: number;
};

export const useBootstrapFn = () => {
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  return useCallback(
    async ({
      switchRenderedApp,
      setConfiguration,
      setLoginParams,
      setUser,
      setReady,
      retryAfter = DEFAULT_RETRY_MS
    }: BootstrapProps) => {
      // fetching the API's data
      const res = await fetch('/api/v4/user/whoami/', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'X-XSRF-TOKEN': getXSRFCookie() }
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

      const json = (await res.json()) as APIResponse<Configuration | LoginParamsProps | WhoAmIProps>;

      // Check for an invalid json format
      if (!isAPIData(json)) {
        showErrorMessage(t('api.invalid'), 30000);
        switchRenderedApp('load');
        return Promise.reject({
          api_error_message: t('api.invalid'),
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
        setReady(true, user.configuration.ui.api_proxies.includes('borealis'));

        // Render appropriate page
        if (!user.agrees_with_tos && user.configuration.ui.tos) {
          switchRenderedApp('tos');
        } else {
          switchRenderedApp('routes');
        }

        return Promise.resolve(json);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setApiQuotaremaining, setSubmissionQuotaremaining, systemConfig.system.version, t]
  );
};

type ApiCallProps<Body extends object = object> = {
  url: string;
  contentType?: string;
  method?: string;
  body?: Body;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  enabled?: boolean;
};

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

      const statusCode = res.status;
      const { api_error_message: error } = json;

      // Reload when the user has exceeded their daily API call quota.
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

      return Promise.resolve(json);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setApiQuotaremaining, setSubmissionQuotaremaining, systemConfig.system.version, t]
  );
};

type DownloadBlobProps = {
  url: string;
  reloadOnUnauthorize?: boolean;
  retryAfter?: number;
  enabled?: boolean;
};

export const useDownloadBlobFn = <Response extends BlobResponse>() => {
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  return useCallback(
    async ({ url, enabled, reloadOnUnauthorize, retryAfter }: DownloadBlobProps) => {
      // Reject if the query is not enabled
      if (!enabled) return Promise.reject(null);

      // fetching the API's data
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'X-XSRF-TOKEN': getXSRFCookie() }
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

      // Reload when the user has exceeded their daily API call quota.
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

      return Promise.resolve({
        api_error_message: '',
        api_response: res.body,
        api_server_version: systemConfig.system.version,
        api_status_code: res.status,
        filename: getFileName(res.headers.get('Content-Disposition')),
        size: parseInt(res.headers.get('Content-Length')),
        type: res.headers.get('Content-Type')
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setApiQuotaremaining, setSubmissionQuotaremaining, systemConfig.system.version, t]
  );
};
