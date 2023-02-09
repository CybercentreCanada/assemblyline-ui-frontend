import { useBlocker } from 'components/hooks/useBlocker';
import useDrawer from 'components/hooks/useDrawer';
import { GD_EVENT_PREVENTED, GD_EVENT_PROCEED } from 'components/providers/DrawerProvider';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmationDialog from './ConfirmationDialog';

export function RouterPrompt(props) {
  const {
    when,
    onAccept = () => true,
    onCancel = () => false,
    text = null,
    title = null,
    acceptText = null,
    cancelText = null
  } = props;
  const { t } = useTranslation();
  const { setDrawerClosePrompt } = useDrawer();
  const [open, setOpen] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [currentTX, setCurrentTX] = useState(null);

  // Block history transactions
  const blocker = useCallback(tx => {
    setCurrentTX(tx);
    setOpen(true);
  }, []);

  // When condition is met, prevent drawer from being closed and prevent page to be reloaded
  useEffect(() => {
    if (when && !cancel) {
      setDrawerClosePrompt(true);
    } else {
      setDrawerClosePrompt(false);
    }
  }, [setDrawerClosePrompt, when, cancel]);

  // Receive drawer close prevented messages
  useEffect(() => {
    function showDialog(event: CustomEvent) {
      if (when) {
        setCurrentTX(null);
        setOpen(true);
      }
    }

    window.addEventListener(GD_EVENT_PREVENTED, showDialog);
    return () => {
      window.removeEventListener(GD_EVENT_PREVENTED, showDialog);
    };
  }, [when]);

  // unblock all on un-mount
  useEffect(() => {
    return () => {
      setCancel(true);
      setDrawerClosePrompt(false);
    };
  }, [setDrawerClosePrompt]);

  // Setup route blocker
  useBlocker(blocker, when && !cancel);

  // Unblock and allow transaction if successful
  const routeOnSuccess = useCallback(
    canRoute => {
      if (canRoute) {
        setCancel(true);
        window.dispatchEvent(new CustomEvent(GD_EVENT_PROCEED));
        if (currentTX) currentTX.retry();
      }
    },
    [currentTX]
  );

  // Dialog actions
  const handleAccept = useCallback(async () => {
    if (onAccept) {
      routeOnSuccess(await Promise.resolve(onAccept()));
    }
    setOpen(false);
  }, [onAccept, routeOnSuccess]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      routeOnSuccess(await Promise.resolve(onCancel()));
    }
    setOpen(false);
  }, [onCancel, routeOnSuccess]);

  return open ? (
    <ConfirmationDialog
      title={title || t('router_prompt_title')}
      open={open}
      handleAccept={handleAccept}
      acceptText={acceptText || t('router_prompt_accept')}
      handleClose={handleCancel}
      cancelText={cancelText || t('router_prompt_cancel')}
      text={text || t('router_prompt_text')}
    />
  ) : null;
}
