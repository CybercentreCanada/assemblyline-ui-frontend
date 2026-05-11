import { DEFAULT_APP_PREFERENCE } from 'app/core.preference';
import type { ApiRequest, ApiResponse } from 'core/api/api.models';
import { isApiData } from 'core/api/api.utils';
import { useAppConfig } from 'core/config';
import { useAppSetInterfaceStore } from 'core/interface';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getXSRFCookie } from 'shared/utils/xsrf.utils';

export type UseApiCallFnProps<
  Response extends ApiResponse,
  Request extends ApiRequest = ApiRequest,
  Error extends ApiResponse = ApiResponse<string>
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

export const useApiCallFn = <
  Response extends ApiResponse,
  Request extends ApiRequest = ApiRequest,
  Error extends ApiResponse = ApiResponse<string>
>() => {
  const { t } = useTranslation(['api']);
  const { showErrorMessage, closeSnackbar } = useAppSnackbar();
  const systemConfig = useAppConfig(s => s.configuration);
  const setInterfaceStore = useAppSetInterfaceStore();

  return useCallback(
    async ({
      body = null,
      contentType = 'application/json',
      credentials = 'same-origin',
      disabled = false,
      headers,
      method = 'GET',
      reloadOnUnauthorize = true,
      retryAfter = DEFAULT_APP_PREFERENCE.api.retryTime,
      signal,
      url,
      onSuccess,
      onFailure,
      onEnter,
      onExit
    }: UseApiCallFnProps<Response, Request, Error>) => {
      onEnter?.();

      if (disabled) {
        onExit?.();
        return Promise.reject(null);
      }

      const rejectWith = (err: ApiResponse, fallbackMsg?: string) => {
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
          setInterfaceStore(s => {
            s.quota.api = parseInt(apiQuota);
            return s;
          });
        }

        // Setting the Submission quota
        const submissionQuota = res.headers.get('X-Remaining-Quota-Submission');
        if (submissionQuota) {
          setInterfaceStore(s => {
            s.quota.submission = parseInt(submissionQuota);
            return s;
          });
        }

        const json = (await res.json()) as ApiResponse;
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
        if (!isApiData(json)) {
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
        if (retryAfter !== DEFAULT_APP_PREFERENCE.api.retryTime) closeSnackbar();

        onSuccess?.(json as Response);
        return json as Response;
      } finally {
        onExit?.();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [systemConfig?.system?.version, t]
  );
};
