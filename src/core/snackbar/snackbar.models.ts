import type { OptionsObject, SnackbarMessage } from 'notistack';

/** Allowed snackbar severity variants. */
export type AppSnackbarVariant = 'error' | 'info' | 'success' | 'warning';

/** Callback signature for showing a snackbar message. */
export type AppSnackbarShowMessage = (message: SnackbarMessage, timeout?: number, options?: OptionsObject) => void;
