import useMySnackbar from 'components/hooks/useMySnackbar';

export default function useClipboard() {
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const copy = (text: string, targetId = 'root') => {
    const el = document.createElement('textarea');
    const target = document.getElementById(targetId) || document.body;
    el.value = text;
    target.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, 99999);
    const copySuccess = document.execCommand('copy');
    target.removeChild(el);
    if (copySuccess) {
      showSuccessMessage(text);
    } else {
      showErrorMessage(text);
    }
  };
  return { copy };
}
