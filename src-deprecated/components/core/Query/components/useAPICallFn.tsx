import type { APIRequest, APIResponse } from 'components/core/Query/components/api.models';
import { DEFAULT_RETRY_MS } from 'components/core/Query/components/constants';
import { isAPIData } from 'components/core/Query/components/utils';
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
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

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
        if (apiQuota) setApiQuotaremaining(parseInt(apiQuota));

        // Setting the Submission quota
        const submissionQuota = res.headers.get('X-Remaining-Quota-Submission');
        if (submissionQuota) setSubmissionQuotaremaining(parseInt(submissionQuota));

        const json = (await res.json()) as APIResponse;
        const error = json.api_error_message ?? '';

        // unreachable backend
        if (res.status === 502) {
          return rejectWith(
            {
              api_error_message: t('api.unreachable'),
              api_response: '',
              api_server_version: systemConfig.system.version,
              api_status_code: 502
            },
            t('api.unreachable')
          );
        }

        // malformed payload
        if (!isAPIData(json)) {
          return rejectWith(
            {
              api_error_message: t('api.invalid'),
              api_response: '',
              api_server_version: systemConfig.system.version,
              api_status_code: 400
            },
            t('api.invalid')
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
          window.location.reload();
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
    [setApiQuotaremaining, setSubmissionQuotaremaining, systemConfig.system.version, t]
  );
};
