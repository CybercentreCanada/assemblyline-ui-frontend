import { OptionsObject, useSnackbar } from 'notistack';

//
export default function useClipboard() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const snackBarOptions: OptionsObject = {
    variant: 'success',
    autoHideDuration: 5000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    onClick: snack => {
      closeSnackbar();
    }
  };
  const copy = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    enqueueSnackbar(text, snackBarOptions);
  };
  return { copy };
}
