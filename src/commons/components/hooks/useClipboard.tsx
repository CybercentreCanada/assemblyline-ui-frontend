import { OptionsObject, useSnackbar } from 'notistack';

export default function useClipboard() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const snackBarOptions: OptionsObject = {
    preventDuplicate: true,
    autoHideDuration: 5000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    onClick: _snack => {
      closeSnackbar();
    }
  };

  const copy = (text: string, targetId = 'root') => {
    const el = document.createElement('textarea');
    const target = document.getElementById(targetId) || document.body;
    el.value = text;
    target.appendChild(el);
    el.focus();
    el.select();
    const copySuccess = document.execCommand('copy');
    target.removeChild(el);
    if (copySuccess) {
      enqueueSnackbar(text, { variant: 'success', ...snackBarOptions });
    } else {
      enqueueSnackbar(text, { variant: 'error', ...snackBarOptions });
    }
  };
 
  return { copy };
}