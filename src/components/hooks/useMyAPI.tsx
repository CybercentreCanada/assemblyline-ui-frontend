import getXSRFCookie from 'helpers/xsrf';
import { useTranslation } from 'react-i18next';
import useMySnackbar from './useMySnackbar';

export type APIResponseProps = {
  api_error_message: string;
  api_response: any;
  api_server_version: string;
  api_status_code: number;
};

export default function useMyAPI() {
  const { t } = useTranslation();
  const { showErrorMessage } = useMySnackbar();

  type APICallProps = {
    url: string;
    contentType?: string;
    method?: string;
    body?: any;
    reloadOnUnauthorize?: boolean;
    allowCache?: boolean;
    onSuccess?: (api_data: APIResponseProps) => void;
    onFailure?: (api_data: APIResponseProps) => void;
    onEnter?: () => void;
    onExit?: () => void;
    onFinalize?: (api_data: APIResponseProps) => void;
  };

  function apiCall({
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
    onFinalize
  }: APICallProps) {
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
      .then(res => res.json())
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        return {
          api_error_message: t('api.unreachable'),
          api_response: '',
          api_server_version: '4.0.0',
          api_status_code: 400
        };
      })
      .then(api_data => {
        // Run finished Callback
        if (onExit) onExit();

        // Check Api response validity
        // eslint-disable-next-line no-prototype-builtins
        if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')) {
          showErrorMessage(t('api.invalid'));
        } else if (api_data.api_status_code === 401 && reloadOnUnauthorize) {
          // Detect login request
          // Do nothing... we are reloading the page
          window.location.reload();
          return;
        } else if (api_data.api_status_code !== 200) {
          // Handle errors
          // Run failure callback
          if (onFailure) {
            onFailure(api_data);
          } else {
            // Default failure handler, show toast error
            showErrorMessage(api_data.api_error_message);
          }
        } else if (onSuccess) {
          // Cache success status
          if (allowCache) {
            sessionStorage.setItem(url, JSON.stringify(api_data));
          }

          // Handle success
          // Run success callback
          onSuccess(api_data);
        }
        if (onFinalize) onFinalize(api_data);
      });
  }

  return apiCall;
}
