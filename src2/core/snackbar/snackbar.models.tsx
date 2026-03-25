import type { OptionsObject, SnackbarMessage } from 'notistack';

export type AppSnackbarVariant = 'error' | 'success' | 'warning' | 'info';

export type AppSnackbarShowMessage = (message: SnackbarMessage, timeout?: number, options?: OptionsObject) => void;
