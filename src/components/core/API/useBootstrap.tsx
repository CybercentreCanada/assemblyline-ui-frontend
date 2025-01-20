import type { DefinedInitialDataOptions, QueryKey } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useALContext from 'components/hooks/useALContext';
import type { LoginParamsProps } from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useQuota from 'components/hooks/useQuota';
import type { Configuration } from 'components/models/base/config';
import type { WhoAmIProps } from 'components/models/ui/user';
import getXSRFCookie from 'helpers/xsrf';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RETRY_MS } from './constants';
import type { APIResponse } from './models';
import { getAPIResponse, isAPIData } from './utils';

type Props<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = Omit<
  DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  'queryKey' | 'initialData' | 'enabled'
> & {
  switchRenderedApp: (value: string) => void;
  setConfiguration: (cfg: Configuration) => void;
  setLoginParams: (params: LoginParamsProps) => void;
  setUser: (user: WhoAmIProps) => void;
  setReady: (layout: boolean, borealis: boolean) => void;
  retryAfter?: number;
};

export const useBootstrap = ({
  switchRenderedApp,
  setConfiguration,
  setLoginParams,
  setUser,
  setReady,
  retryAfter = DEFAULT_RETRY_MS,
  ...options
}: Props<
  APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
  APIResponse<Error>,
  APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
  QueryKey
>) => {
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();
  const { setApiQuotaremaining, setSubmissionQuotaremaining } = useQuota();

  const queryClient = useQueryClient();

  const query = useQuery<
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>,
    APIResponse<Error>,
    APIResponse<Configuration | LoginParamsProps | WhoAmIProps>
  >(
    {
      ...options,
      queryKey: [
        {
          url: '/api/v4/user/whoami/',
          contentType: 'application/json',
          method: 'GET',
          allowCache: false,
          retryAfter
        }
      ],
      retry: (failureCount, error) => failureCount < 1 || error?.api_status_code === 502,
      retryDelay: failureCount => (failureCount < 1 ? 1000 : Math.min(retryAfter, 10000)),
      queryFn: async ({ signal }) => {
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
          setReady(true, user.configuration.ui.api_proxies.includes('borealis'));

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

  return { ...query, ...getAPIResponse(query?.data, query?.error, query?.failureReason) };
};
