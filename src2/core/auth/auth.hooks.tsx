import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_APP_CONFIG } from 'app/app.configs';
import { APIQueryKey, APIResponse, isAPIData, stableStringify } from 'core/api';
import { LoginParamsProps } from 'core/auth/auth.models';
import { useAppSetConfig } from 'core/config';
import { useSaveAppConfig } from 'core/config/config.hooks';
import { useAppConfig } from 'core/config/config.providers';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { getXSRFCookie } from 'lib/utils/xsrf.utils';
import { Configuration } from 'models/base/config';
import { WhoAmIProps } from 'models/ui/user';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { normalizeWhoAmI } from './auth.utils';

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

export const useIsAppReady = () => {
  const agrees_with_tos = useAppConfig(s => s?.user?.agrees_with_tos);
  const is_active = useAppConfig(s => s?.user?.is_active);
  const tos = useAppConfig(s => s?.configuration?.ui?.tos);

  return useMemo(() => is_active && (agrees_with_tos || !tos), []);
};

export const useIsAuthenticating = () => {
  const { pathname } = useLocation();

  const disableWhoAmI = useAppConfig(s => s?.auth?.disableWhoAmI);

  return useMemo(
    () => pathname.includes(`/oauth/`) || pathname.includes(`/saml/`) || disableWhoAmI,
    [disableWhoAmI, pathname]
  );
};

export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['api']);
  const { showErrorMessage, closeSnackbar } = useAppSnackbar();
  const setStore = useAppSetConfig();
  const systemConfig = useAppConfig(s => s?.configuration);

  const saveSettings = useSaveAppConfig();

  const isAuthenticating = useIsAuthenticating();

  const disabled = false;
  const retryAfter = 10 * 1000;
  const allowCache = false;

  return useQuery<
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIResponse<Error>,
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIQueryKey
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
          setStore(s => {
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
          if (retryAfter !== DEFAULT_APP_CONFIG.api.retryTime) closeSnackbar();
          setStore(s => {
            s.auth.mode = 'locked';
            s['configuration'] = json.api_response as Configuration;
            return s;
          });
          return Promise.reject(json);
        }

        // Unauthorized response indicate that the user is not logged in.
        if (res.status === 401) {
          if (retryAfter !== DEFAULT_APP_CONFIG.api.retryTime) closeSnackbar();
          setStore(s => {
            s.auth.login = { ...s.auth.login, ...(json.api_response as LoginParamsProps) };
            s.auth.mode = 'login';
            return s;
          });
          sessionStorage.clear();
          saveSettings();
          return Promise.reject(json);
        }

        // Daily quota error, stop everything!
        if (res.status === 503 && ['API', 'quota', 'daily'].every(v => error.includes(v))) {
          setStore(s => {
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
          if (retryAfter !== DEFAULT_APP_CONFIG.api.retryTime) closeSnackbar();

          const user = json.api_response as WhoAmIProps;

          // Set the current user
          setStore(s => ({ ...s, ...normalizeWhoAmI(json.api_response) }));

          // Mark the interface ready
          // TODO
          // setReady(
          //   true,
          //   'borealis' in user.configuration.ui.api_proxies,
          //   user.configuration?.ui?.api_proxies?.borealis?.custom_iconify || null
          // );

          // Render appropriate page
          if (!user.agrees_with_tos && user.configuration.ui.tos) {
            setStore(s => {
              s.auth.mode = 'tos';
              return s;
            });
          } else {
            setStore(s => {
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
