import { WhoAmI } from 'components/models/ui/user';
import { getFileName } from 'helpers/utils';
import getXSRFCookie from 'helpers/xsrf';
import { useTranslation } from 'react-i18next';
import useALContext from './useALContext';
import useMySnackbar from './useMySnackbar';
import { WhoAmIProps } from './useMyUser';

const DEFAULT_RETRY_MS = 32;

export type APIResponseProps<APIResponse extends any> = {
  api_error_message: string;
  api_response: APIResponse;
  api_server_version: string;
  api_status_code: number;
};

export type DownloadResponseProps<APIResponse extends any> = {
  api_error_message: string;
  api_response: APIResponse;
  api_server_version: string;
  api_status_code: number;
  filename?: string;
  type?: string;
  size?: number;
};

export type LoginParamsProps = {
  oauth_providers: string[];
  allow_userpass_login: boolean;
  allow_signup: boolean;
  allow_pw_rest: boolean;
};

type APICallProps<SuccessData extends any, FailureData extends any> = {
  url: string;
  contentType?: string;
  method?: string;
  body?: any;
  reloadOnUnauthorize?: boolean;
  allowCache?: boolean;
  onSuccess?: (api_data: APIResponseProps<SuccessData>) => void;
  onFailure?: (api_data: APIResponseProps<FailureData>) => void;
  onEnter?: () => void;
  onExit?: () => void;
  onFinalize?: (api_data: APIResponseProps<any>) => void;
  retryAfter?: number;
};

type BootstrapProps = {
  switchRenderedApp: (value: string) => void;
  setConfiguration: (cfg: WhoAmI) => void;
  setLoginParams: (params: LoginParamsProps) => void;
  setUser: (user: WhoAmIProps) => void;
  setReady: (isReady: boolean) => void;
  retryAfter?: number;
};

type DownloadBlobProps<SuccessData extends any, FailureData extends any> = {
  url: string;
  onSuccess?: (blob: DownloadResponseProps<SuccessData>) => void;
  onFailure?: (api_data: DownloadResponseProps<FailureData>) => void;
  onEnter?: () => void;
  onExit?: () => void;
  retryAfter?: number;
};

type UseMyAPIReturn = {
  apiCall: <SuccessData = any, FailureData = any>(props: APICallProps<SuccessData, FailureData>) => void;
  bootstrap: (props: BootstrapProps) => void;
  downloadBlob: <SuccessData = any, FailureData = any>(props: DownloadBlobProps<SuccessData, FailureData>) => void;
};

const useMyAPI = (): UseMyAPIReturn => {
  const { t } = useTranslation();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { configuration: systemConfig } = useALContext();

  const isAPIData = (value: any): boolean => {
    if (
      value !== undefined &&
      value !== null &&
      value.hasOwnProperty('api_response') &&
      value.hasOwnProperty('api_error_message') &&
      value.hasOwnProperty('api_server_version') &&
      value.hasOwnProperty('api_status_code')
    ) {
      return true;
    }
    return false;
  };

  const bootstrap = ({
    switchRenderedApp,
    setConfiguration,
    setLoginParams,
    setUser,
    setReady,
    retryAfter = DEFAULT_RETRY_MS
  }: BootstrapProps) => {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: { 'X-XSRF-TOKEN': getXSRFCookie() },
      credentials: 'same-origin'
    };

    fetch('/api/v4/user/whoami/', requestOptions)
      .then(res => {
        if (res.status === 502) {
          return {
            api_error_message: t('api.unreachable'),
            api_response: '',
            api_server_version: '4.3.0.0',
            api_status_code: 502
          };
        }
        return res.json();
      })
      .catch(() => ({
        api_error_message: t('api.invalid'),
        api_response: '',
        api_server_version: '4.3.0.0',
        api_status_code: 400
      }))
      .then((api_data: APIResponseProps<WhoAmI>) => {
        // eslint-disable-next-line no-prototype-builtins
        if (!isAPIData(api_data)) {
          // We got no response
          showErrorMessage(t('api.invalid'), 30000);
          switchRenderedApp('load');
        } else if (api_data.api_status_code === 403) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          // User account is locked
          setConfiguration(api_data.api_response);
          switchRenderedApp('locked');
        } else if (api_data.api_status_code === 401) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          // User is not logged in
          localStorage.setItem('loginParams', JSON.stringify(api_data.api_response));
          sessionStorage.clear();
          setLoginParams(api_data.api_response);
          switchRenderedApp('login');
        } else if (api_data.api_status_code === 200) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          // Set the current user
          setUser(api_data.api_response);

          // Mark the interface ready
          setReady(true);

          // Render appropriate page
          if (!api_data.api_response.agrees_with_tos && api_data.api_response.configuration.ui.tos) {
            switchRenderedApp('tos');
          } else {
            switchRenderedApp('routes');
          }
        } else {
          // Server is unreachable or quota is reached... retry!
          if (api_data.api_status_code !== 503) {
            showErrorMessage(api_data.api_error_message, 30000);
          }
          setTimeout(() => {
            bootstrap({
              switchRenderedApp,
              setConfiguration,
              setLoginParams,
              setUser,
              setReady,
              retryAfter: Math.min(retryAfter * 2, 10000)
            });
          }, retryAfter);
          switchRenderedApp('load');
        }
      });
  };

  const apiCall = <SuccessData, FailureData>({
    url,
    contentType = 'application/json',
    method = 'GET',
    body = null,
    reloadOnUnauthorize = true,
    allowCache = false,
    onSuccess,
    onFailure,
    onEnter,
    onExit,
    onFinalize,
    retryAfter = DEFAULT_RETRY_MS
  }: APICallProps<SuccessData, FailureData>) => {
    const requestOptions: RequestInit = {
      method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': contentType,
        'X-XSRF-TOKEN': getXSRFCookie()
      },
      body: body !== null ? (contentType === 'application/json' ? JSON.stringify(body) : body) : null
    };

    // Run enter callback
    if (onEnter) onEnter();

    // Check the cache
    const cachedURL = sessionStorage.getItem(url);
    if (allowCache && cachedURL) {
      const apiData = JSON.parse(cachedURL);
      if (onExit) onExit();
      onSuccess(apiData);
      if (onFinalize) onFinalize(apiData);
      return;
    }

    // Fetch the URL
    fetch(url, requestOptions)
      .then(res => {
        if (res.status === 502) {
          return {
            api_error_message: t('api.unreachable'),
            api_response: '',
            api_server_version: systemConfig.system.version,
            api_status_code: 502
          };
        }
        return res.json();
      })
      .catch(() => ({
        api_error_message: t('api.invalid'),
        api_response: '',
        api_server_version: systemConfig.system.version,
        api_status_code: 400
      }))
      .then(api_data => {
        // Run finished Callback
        if (onExit) onExit();

        // Check Api response validity
        // eslint-disable-next-line no-prototype-builtins
        if (!isAPIData(api_data)) {
          showErrorMessage(t('api.invalid'));
          return;
        } else if (api_data.api_status_code === 401 && reloadOnUnauthorize) {
          // Detect login request
          // Do nothing... we are reloading the page
          window.location.reload();
          return;
        } else if (
          api_data.api_status_code === 502 ||
          (api_data.api_status_code === 503 &&
            api_data.api_error_message.includes('quota') &&
            !api_data.api_error_message.includes('submission'))
        ) {
          // Retryable status responses
          if (api_data.api_status_code === 502) {
            showErrorMessage(api_data.api_error_message, 30000);
          }

          setTimeout(() => {
            apiCall({
              url,
              contentType,
              method,
              body,
              reloadOnUnauthorize,
              allowCache,
              onSuccess,
              onFailure,
              onEnter,
              onExit,
              onFinalize,
              retryAfter: Math.min(retryAfter * 2, 10000)
            });
          }, retryAfter);
          return;
        } else if (api_data.api_status_code !== 200) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          // Handle errors
          // Run failure callback
          if (onFailure) {
            onFailure(api_data);
          } else {
            // Default failure handler, show toast error
            showErrorMessage(api_data.api_error_message);
          }
        } else if (onSuccess) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          // Cache success status
          if (allowCache) {
            try {
              sessionStorage.setItem(url, JSON.stringify(api_data));
            } catch (error) {
              // We could not store into the Session Storage, this means that it is full
              // Let's delete the oldest quarter of items to free up some space
              [...Array(Math.floor(sessionStorage.length / 4))].forEach(_ => {
                sessionStorage.removeItem(sessionStorage.key(0));
              });
            }
          }

          // Handle success
          // Run success callback
          onSuccess(api_data);
        } else {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
        }
        if (onFinalize) onFinalize(api_data);
      });
  };

  const downloadBlob = <SuccessData, FailureData>({
    url,
    onSuccess,
    onFailure,
    onEnter,
    onExit,
    retryAfter = DEFAULT_RETRY_MS
  }: DownloadBlobProps<SuccessData, FailureData>) => {
    const requestOptions: RequestInit = {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'X-XSRF-TOKEN': getXSRFCookie() }
    };

    // Run enter callback
    if (onEnter) onEnter();

    // Fetch the URL
    fetch(url, requestOptions)
      .then(res => {
        if (res.status === 502) {
          return {
            api_error_message: t('api.unreachable'),
            api_response: '',
            api_server_version: systemConfig.system.version,
            api_status_code: res.status
          };
        } else if (res.status === 200) {
          const header = res.headers.get('Content-Disposition');
          const filename = getFileName(header);
          return {
            api_error_message: '',
            api_response: res.body,
            api_server_version: systemConfig.system.version,
            api_status_code: res.status,
            filename: filename,
            size: parseInt(res.headers.get('Content-Length')),
            type: res.headers.get('Content-Type')
          };
        }
        return res.json();
      })
      .catch(() => ({
        api_error_message: t('api.invalid'),
        api_response: '',
        api_server_version: systemConfig.system.version,
        api_status_code: 400
      }))
      .then(api_data => {
        // Run finished Callback
        if (onExit) onExit();

        // Check Api response validity
        // eslint-disable-next-line no-prototype-builtins
        if (!isAPIData(api_data)) {
          showErrorMessage(t('api.invalid'));
          return;
        } else if (api_data.api_status_code === 401) {
          // Detect login request
          // Do nothing... we are reloading the page
          window.location.reload();
          return;
        } else if (
          api_data.api_status_code === 502 ||
          (api_data.api_status_code === 503 &&
            api_data.api_error_message.includes('quota') &&
            !api_data.api_error_message.includes('submission'))
        ) {
          // Retryable status responses
          if (api_data.api_status_code === 502) {
            showErrorMessage(api_data.api_error_message, 30000);
          }

          setTimeout(() => {
            downloadBlob({
              url,
              onSuccess,
              onFailure,
              onEnter,
              onExit,
              retryAfter: Math.min(retryAfter * 2, 10000)
            });
          }, retryAfter);
          return;
        } else if (api_data.api_status_code !== 200) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          // Handle errors
          // Run failure callback
          if (onFailure) {
            onFailure(api_data);
          } else {
            // Default failure handler, show toast error
            showErrorMessage(api_data.api_error_message);
          }
        } else if (onSuccess) {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
          // Cache success status

          // Handle success
          // Run success callback
          onSuccess(api_data);
        } else {
          if (retryAfter !== DEFAULT_RETRY_MS) closeSnackbar();
        }
      });
  };

  return { apiCall, bootstrap, downloadBlob };
};

export default useMyAPI;
