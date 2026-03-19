import type { OptionsObject, SnackbarMessage } from 'notistack';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

type Variant = 'error' | 'success' | 'warning' | 'info';

type ShowMessage = (message: SnackbarMessage, timeout?: number, options?: OptionsObject) => void;

export function useAppSnackbar() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const show = useCallback(
    (variant: Variant, message: SnackbarMessage, timeout = 5000, options: OptionsObject = {}) => {
      enqueueSnackbar(message, {
        preventDuplicate: true,
        variant,
        autoHideDuration: timeout,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center'
        },
        ...options,
        SnackbarProps: {
          ...options.SnackbarProps,
          onClick: e => {
            options.SnackbarProps?.onClick?.(e);
            closeSnackbar();
          }
        }
      });
    },
    [enqueueSnackbar, closeSnackbar]
  );

  const showErrorMessage: ShowMessage = useCallback(
    (message, timeout, options) => show('error', message, timeout, options),
    [show]
  );

  const showWarningMessage: ShowMessage = useCallback(
    (message, timeout, options) => show('warning', message, timeout, options),
    [show]
  );

  const showSuccessMessage: ShowMessage = useCallback(
    (message, timeout, options) => show('success', message, timeout, options),
    [show]
  );

  const showInfoMessage: ShowMessage = useCallback(
    (message, timeout, options) => show('info', message, timeout, options),
    [show]
  );

  return {
    showErrorMessage,
    showWarningMessage,
    showSuccessMessage,
    showInfoMessage,
    closeSnackbar
  };
}
