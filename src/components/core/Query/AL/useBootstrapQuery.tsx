import type { UndefinedInitialDataOptions } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { APIQueryKey, APIResponse } from 'components/core/Query/components/api.models';
import { DEFAULT_RETRY_MS } from 'components/core/Query/components/constants';
import { getAPIResponse, isAPIData, stableStringify } from 'components/core/Query/components/utils';
import useALContext from 'components/hooks/useALContext';
import type { LoginParamsProps } from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useQuota from 'components/hooks/useQuota';
import type { Configuration } from 'components/models/base/config';
import type { CustomUser, WhoAmIProps } from 'components/models/ui/user';
import getXSRFCookie from 'helpers/xsrf';
import { useTranslation } from 'react-i18next';

export type UseBootstrapQueryProps = {
  queryProps?: Omit<
    UndefinedInitialDataOptions<
      APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
      APIResponse<Error>,
      APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
      APIQueryKey
    >,
    'queryKey' | 'queryFn'
  >;
  switchRenderedApp: (value: string) => void;
  setConfiguration: (cfg: Configuration) => void;
  setLoginParams: (params: LoginParamsProps) => void;
  setUser: (user: WhoAmIProps | CustomUser) => void;
  setReady: (layout: boolean, borealis: boolean, iconifyUrl: string) => void;
  disabled?: boolean;
  retryAfter?: number;
  allowCache?: boolean;
};

export const useBootstrapQuery = ({
  queryProps = null,
  switchRenderedApp = () => null,
  setConfiguration = () => null,
  setLoginParams = () => null,
  setUser = () => null,
  setReady = () => null,
  disabled = false,
  retryAfter = DEFAULT_RETRY_MS,
  allowCache = false
}: UseBootstrapQueryProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  const query = useQuery<
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIResponse<Error>,
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIQueryKey
  >(
    {
      ...queryProps,
      enabled: !disabled,
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
          setReady(
            true,
            'borealis' in user.configuration.ui.api_proxies,
            user.configuration?.ui?.api_proxies?.borealis?.custom_iconify || null
          );

          // Render appropriate page
          if (!user.agrees_with_tos && user.configuration.ui.tos) {
            switchRenderedApp('tos');
          } else {
            switchRenderedApp('routes');
          }

          return Promise.resolve(json);
        }
      }
    },
    queryClient
  );

  const { data, error, serverVersion, statusCode } = getAPIResponse(query.data, query.error, query.failureReason);

  return {
    ...query,
    data,
    error,
    serverVersion,
    statusCode
  };
};
