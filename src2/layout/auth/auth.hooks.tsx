import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiQueryKey, ApiResponse } from 'core/api';
import { isApiData, stableStringify } from 'core/api';
import { useAppConfig, useAppSetConfig, useSaveAppConfig } from 'core/config';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppSnackbar } from 'core/snackbar';
import type { WhoAmIProps } from 'models/api/user';
import type { Configuration } from 'models/base/config';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { getXSRFCookie } from 'shared/utils/xsrf.utils';
import type { LoginParamsProps } from './auth.models';
import { normalizeWhoAmI } from './auth.utils';

const DEFAULT_RETRY_TIME = 10_000;

/**
 * @name useScoreToVerdict
 * @description Returns a function that maps a numeric score to a verdict string.
 * @returns Score-to-verdict mapping function
 */
export const useScoreToVerdict = () => {
  const verdicts = useAppConfig(s => s?.configuration?.submission?.verdicts);

  return useCallback(
    (score: number | null) => {
      if (score >= verdicts.malicious) return 'malicious';
      else if (score >= verdicts.highly_suspicious) return 'highly_suspicious';
      else if (score >= verdicts.suspicious) return 'suspicious';
      else if (score === null || score >= verdicts.info) return 'info';
      else return 'safe';
    },
    [verdicts]
  );
};

/**
 * @name useIsAppReady
 * @description Returns whether the app is ready (user is active and ToS accepted).
 * @returns Boolean indicating readiness
 */
export const useIsAppReady = () => {
  const agrees_with_tos = useAppConfig(s => s?.user?.agrees_with_tos);
  const is_active = useAppConfig(s => s?.user?.is_active);
  const tos = useAppConfig(s => s?.configuration?.ui?.tos);

  return useMemo(() => is_active && (agrees_with_tos || !tos), [agrees_with_tos, is_active, tos]);
};

/**
 * @name useIsAuthenticating
 * @description Returns whether the user is currently in an OAuth/SAML flow.
 * @returns Boolean indicating authentication in progress
 */
export const useIsAuthenticating = () => {
  const { pathname } = useLocation();

  const disableWhoAmI = useAppInterfaceStore(s => s.auth.disableWhoAmI);

  return useMemo(
    () => pathname.includes(`/oauth/`) || pathname.includes(`/saml/`) || disableWhoAmI,
    [disableWhoAmI, pathname]
  );
};

/**
 * @name useAuthQuery
 * @description Main auth hook that fetches whoami and sets up the auth store state.
 * @returns TanStack Query result for the whoami endpoint
 */
export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['api']);
  const { showErrorMessage, closeSnackbar } = useAppSnackbar();

  const systemConfig = useAppConfig(s => s?.configuration);

  const setInterfaceStore = useAppSetInterfaceStore();
  const setConfig = useAppSetConfig();

  const isAuthenticating = useIsAuthenticating();
  const saveSettings = useSaveAppConfig();

  const disabled = false;
  const retryAfter = 10 * 1000;
  const allowCache = false;

  return useQuery<
    ApiResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    ApiResponse<Error>,
    ApiResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    ApiQueryKey
  >(
    {
      queryKey: ['/api/v4/user/whoami/', 'GET', stableStringify(null), allowCache],
      enabled: !isAuthenticating,
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

        let json: ApiResponse<Configuration | LoginParamsProps | WhoAmIProps>;
        try {
          json = (await res.json()) as ApiResponse<Configuration | LoginParamsProps | WhoAmIProps>;
        } catch {
          json = {
            api_error_message: res.statusText || t('invalid'),
            api_response: null as unknown as Configuration | LoginParamsProps | WhoAmIProps,
            api_server_version: systemConfig.system.version,
            api_status_code: res.status
          };
        }

        // Unauthorized response indicate that the user is not logged in.
        if (res.status === 401) {
          if (retryAfter !== DEFAULT_RETRY_TIME) closeSnackbar();

          setInterfaceStore(s => {
            s.auth.login = {
              ...s.auth.login,
              ...(isApiData(json) ? ((json.api_response as LoginParamsProps) ?? {}) : {})
            };
            s.auth.mode = 'login';
            return s;
          });
          sessionStorage.clear();
          saveSettings();
          return Promise.reject(json);
        }

        // Check for an invalid json format
        if (!isApiData(json)) {
          showErrorMessage(t('invalid'), 30000);
          setInterfaceStore(s => {
            s.auth.mode = 'loading';
            return s;
          });
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
          if (retryAfter !== DEFAULT_RETRY_TIME) closeSnackbar();
          setInterfaceStore(s => {
            s.auth.mode = 'locked';
            return s;
          });

          setConfig(s => {
            if (json.api_response) s.configuration = json.api_response as Configuration;

            return s;
          });
          return Promise.reject(json);
        }

        // Daily quota error, stop everything!
        if (res.status === 503 && ['API', 'quota', 'daily'].every(v => error.includes(v))) {
          setInterfaceStore(s => {
            s.auth.mode = 'quota';
            return s;
          });
          return Promise.reject(json);
        }

        // Handle all non-successful request
        if (res.status !== 200) {
          showErrorMessage(json.api_error_message);
          return Promise.reject(json);
        }

        if (res.status === 200) {
          if (retryAfter !== DEFAULT_RETRY_TIME) closeSnackbar();

          const user = json.api_response as WhoAmIProps;

          // Set the current user
          setConfig(s => ({ ...s, ...normalizeWhoAmI(json.api_response) }));

          // Mark the interface ready
          // TODO
          // setReady(
          //   true,
          //   'borealis' in user.configuration.ui.api_proxies,
          //   user.configuration?.ui?.api_proxies?.borealis?.custom_iconify || null
          // );

          // Render appropriate page
          if (!user.agrees_with_tos && user.configuration.ui.tos) {
            setInterfaceStore(s => {
              s.auth.mode = 'tos';
              return s;
            });
          } else {
            setInterfaceStore(s => {
              s.auth.mode = 'app';
              return s;
            });
          }

          return Promise.resolve(json);
        }
      }
    },
    queryClient
  );
};
