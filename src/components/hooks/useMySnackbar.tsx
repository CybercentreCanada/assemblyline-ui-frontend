import { OptionsObject, useSnackbar } from 'notistack';

export default function useMySnackbar() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const snackBarOptions: OptionsObject = {
    preventDuplicate: true,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    onClick: snack => {
      closeSnackbar();
    }
  };

  function showErrorMessage(message, timeout = 5000) {
    enqueueSnackbar(message, { variant: 'error', autoHideDuration: timeout, ...snackBarOptions });
  }

  function showWarningMessage(message, timeout = 5000) {
    enqueueSnackbar(message, { variant: 'warning', autoHideDuration: timeout, ...snackBarOptions });
  }

  function showSuccessMessage(message, timeout = 5000) {
    enqueueSnackbar(message, { variant: 'success', autoHideDuration: timeout, ...snackBarOptions });
  }

  function showInfoMessage(message, timeout = 5000) {
    enqueueSnackbar(message, { variant: 'info', autoHideDuration: timeout, ...snackBarOptions });
  }

  return {
    showErrorMessage,
    showWarningMessage,
    showSuccessMessage,
    showInfoMessage,
    closeSnackbar
  };
}
