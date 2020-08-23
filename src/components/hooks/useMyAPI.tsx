import getXSRFCookie from 'helpers/xsrf';
import { OptionsObject, useSnackbar } from 'notistack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type APIResponseProps = {
  api_error_message: string;
  api_response: any;
  api_server_version: string;
  api_status_code: number;
};

export default function useMyAPI() {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return useMemo(() => {
    const snackBarOptions: OptionsObject = {
      variant: 'error',
      autoHideDuration: 5000,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center'
      },
      onClick: snack => {
        closeSnackbar();
      }
    };

    type APICallProps = {
      url: string;
      method?: string;
      body?: any;
      reloadOnUnauthorize?: boolean;
      onSuccess?: (api_data: APIResponseProps) => void;
      onFailure?: (api_data: APIResponseProps) => void;
      onEnter?: () => void;
      onExit?: () => void;
      onFinalize?: (api_data: APIResponseProps) => void;
    };

    function apiCall(props: APICallProps) {
      const { url, method, body, reloadOnUnauthorize, onSuccess, onFailure, onEnter, onExit, onFinalize } = props;
      const allowReload = reloadOnUnauthorize === undefined || reloadOnUnauthorize;
      const requestOptions: RequestInit = {
        method: method || 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getXSRFCookie()
        },
        body: body ? JSON.stringify(body) : null
      };

      // Run enter callback
      if (onEnter) onEnter();

      // Fetch the URL
      fetch(url, requestOptions)
        .then(res => {
          if (res.status === 401 && allowReload) {
            // Trigger a page reload, we're not logged in anymore
            window.location.reload(false);
          }
          return res.json();
        })
        .catch(() => {
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
            enqueueSnackbar(t('api.invalid'), snackBarOptions);
          } else if (api_data.api_status_code === 401 && allowReload) {
            // Detect login request
            // Do nothing... we are reloading the page
            return;
          } else if (api_data.api_status_code !== 200) {
            // Handle errors
            // Run failure callback
            if (onFailure) {
              onFailure(api_data);
            } else {
              // Default failure handler, show toast error
              enqueueSnackbar(api_data.api_error_message, snackBarOptions);
            }
          } else if (onSuccess) {
            // Handle success
            // Run success callback
            onSuccess(api_data);
          }
          if (onFinalize) onFinalize(api_data);
        });
    }

    return apiCall;
  }, [closeSnackbar, enqueueSnackbar, t]);
}
