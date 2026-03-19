import { useQuery, useQueryClient } from '@tanstack/react-query';
import { APIQueryKey, APIResponse, DEFAULT_RETRY_MS, isAPIData, stableStringify } from 'core/api';
import { LoginParamsProps } from 'core/auth/auth.models';
import { useSaveAppConfig } from 'core/config/config.hooks';
import { useAppConfigSetStore, useAppConfigStore } from 'core/config/config.providers';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import { getXSRFCookie } from 'lib/utils/xsrf.utils';
import { Configuration } from 'models/base/config';
import { WhoAmIProps } from 'models/ui/user';
import { useTranslation } from 'react-i18next';
import { normalizeWhoAmI } from './auth.utils';

export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useAppSnackbar();
  const setStore = useAppConfigSetStore();
  const systemConfig = useAppConfigStore(s => s?.configuration);

  const store = useAppConfigStore(s => s);

  const saveSettings = useSaveAppConfig();

  const disabled = false;
  const retryAfter = 10 * 1000;
  const allowCache = false;

  const query = useQuery<
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIResponse<Error>,
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIQueryKey
  >(
    {
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
          setStore(s => {
            s.auth.mode = 'loading';
            return s;
          });
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
          setStore(s => {
            s.auth.mode = 'locked';
            s['configuration'] = json.api_response as Configuration;
            return s;
          });
          return Promise.reject(json);
        }

        // Unauthorized response indicate that the user is not logged in.
        if (res.status === 401) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
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
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();

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

  return null;
};
