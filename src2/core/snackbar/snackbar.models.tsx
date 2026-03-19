import { SnackbarProviderProps } from 'notistack';

export type AppSnackbarPreference = {
  dense: SnackbarProviderProps['dense'];
  maxSnack: SnackbarProviderProps['maxSnack'];
};

export type AppSnackbarConfig = AppSnackbarPreference;
