import { DEFAULT_RETRY_MS } from 'components/core/API/utils/constants';
import type { APIRequest, APIResponse } from 'components/core/API/utils/models';
import { isAPIData } from 'components/core/API/utils/utils';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useQuota from 'components/hooks/useQuota';
import getXSRFCookie from 'helpers/xsrf';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type UseAPICallFnProps<
  Response extends APIResponse,
  Request extends APIRequest = APIRequest,
  Error extends APIResponse = APIResponse<string>
> = Request &
  Omit<RequestInit, 'url' | 'method' | 'body'> & {
    contentType?: string;
    reloadOnUnauthorize?: boolean;
    retryAfter?: number;
    signal?: AbortSignal;
    onSuccess?: (data: Response) => void;
    onFailure?: (Error: Error) => void;
    onEnter?: () => void;
    onExit?: () => void;
  };

export const useAPICallFn = <
  Response extends APIResponse,
  Request extends APIRequest = APIRequest,
  Error extends APIResponse = APIResponse<string>
>() => {
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  return useCallback(
    async ({
      body = null,
      contentType = 'application/json',
      credentials = 'same-origin',
      headers = null,
      method = 'GET',
      reloadOnUnauthorize = true,
      retryAfter = DEFAULT_RETRY_MS,
      signal,
      url,
      onSuccess = () => null,
      onFailure = () => null,
      onEnter = () => null,
      onExit = () => null
    }: UseAPICallFnProps<Response, Request, Error>) => {
      onEnter();

      // Reject if the query is not enabled
      // if (!enabled) {
      //   return Promise.reject(null).then(data => {
      //     onExit();
      //     return data;
      //   });
      // }

      // fetching the API's data
      const res = await fetch(url, {
        body: (body === null ? null : contentType === 'application/json' ? JSON.stringify(body) : body) as BodyInit,
        credentials,
        headers: { ...headers, 'Content-Type': contentType, 'X-XSRF-TOKEN': getXSRFCookie() },
        method,
        signal
      });

      // Setting the API quota
      const apiQuota = res.headers.get('X-Remaining-Quota-Api');
      if (apiQuota) setApiQuotaremaining(parseInt(apiQuota));

      // Setting the Submission quota
      const submissionQuota = res.headers.get('X-Remaining-Quota-Submission');
      if (submissionQuota) setSubmissionQuotaremaining(parseInt(submissionQuota));

      const json = (await res.json()) as APIResponse;

      // Handle an unreachable API
      if (res.status === 502) {
        showErrorMessage(t('api.unreachable'), 10000);
        onFailure(json as Error);
        return Promise.reject({
          api_error_message: t('api.unreachable'),
          api_response: '',
          api_server_version: systemConfig.system.version,
          api_status_code: 502
        }).then(data => {
          onExit();
          return data;
        });
      }

      // Check for an invalid json format
      if (!isAPIData(json)) {
        showErrorMessage(t('api.invalid'));
        onFailure(json as Error);
        return Promise.reject({
          api_error_message: t('api.invalid'),
          api_response: '',
          api_server_version: systemConfig.system.version,
          api_status_code: 400
        }).then(data => {
          onExit();
          return data;
        });
      }

      const { api_error_message: error } = json;

      // Reload when the user has exceeded their daily API call quota.
      if (res.status === 503 && ['API', 'quota', 'daily'].every(v => error.includes(v))) {
        window.location.reload();
        onFailure(json as Error);
        return Promise.reject(json).then(data => {
          onExit();
          return data;
        });
      }

      // Reject if the user has exceeded their daily submissions quota.
      if (res.status === 503 && ['quota', 'submission'].every(v => error.includes(v))) {
        onFailure(json as Error);
        return Promise.reject(json).then(data => {
          onExit();
          return data;
        });
      }

      // Reload when the user is not logged in
      if (res.status === 401 && reloadOnUnauthorize) {
        window.location.reload();
        onFailure(json as Error);
        return Promise.reject(json).then(data => {
          onExit();
          return data;
        });
      }

      // Reject if API Server is unavailable and should attempt to retry
      if (res.status === 502) {
        showErrorMessage(json.api_error_message, 30000);
        onFailure(json as Error);
        return Promise.reject(json).then(data => {
          onExit();
          return data;
        });
      }

      // Handle successful request
      if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();

      // Handle all non-successful request
      if (res.status !== 200) {
        showErrorMessage(json.api_error_message);
        onFailure(json as Error);
        return Promise.reject(json).then(data => {
          onExit();
          return data;
        });
      }

      onSuccess(json as Response);
      return Promise.resolve(json).then(data => {
        onExit();
        return data;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setApiQuotaremaining, setSubmissionQuotaremaining, systemConfig.system.version, t]
  );
};
