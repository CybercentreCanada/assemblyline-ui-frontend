import { OptionsObject, useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default function useClipboard() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const snackBarOptions: OptionsObject = {
    preventDuplicate: true,
    autoHideDuration: 3000,
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
      enqueueSnackbar(`'${text}' ${t('clipboard.success')}`, { variant: 'success', ...snackBarOptions });
    } else {
      enqueueSnackbar(`'${text}' ${t('clipboard.failure')}`, { variant: 'error', ...snackBarOptions });
    }
  };

  return { copy };
}
