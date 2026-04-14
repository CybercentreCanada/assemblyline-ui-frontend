import { type OptionsObject, useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { MODULE_NAME } from '../../name';

export const useClipboard = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { t } = useTranslation(MODULE_NAME);
  const snackBarOptions: OptionsObject = {
    preventDuplicate: true,
    autoHideDuration: 3000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    SnackbarProps: {
      onClick: () => {
        closeSnackbar();
      }
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar(`${text} ${t('clipboard.success')}`, { variant: 'success', ...snackBarOptions });
    } catch {
      enqueueSnackbar(`${text} ${t('clipboard.failure')}`, { variant: 'error', ...snackBarOptions });
    }
  };

  return { copy };
};
