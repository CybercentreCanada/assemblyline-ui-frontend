/* eslint-disable @typescript-eslint/no-unused-vars */
import { useBlocker } from 'components/hooks/useBlocker';
import useDrawer from 'components/hooks/useDrawer';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { unstable_useBlocker as useBlocker } from 'react-router';
import ConfirmationDialog from './ConfirmationDialog';

// IMPORTANT, the URL blocker does not work with the current BrowserRouter
// This is only partially working, the drawer will be prevented from closing and
// the page will be prevented from being refreshed but you can still use the
// Router to navigate away

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
  const [currentTX, setCurrentTX] = useState(null);

  // Blockers for the reload even and the drawer getting close or re-used
  const unblock = useCallback(() => {
    setDrawerClosePrompt(false);
    window.onbeforeunload = undefined;
  }, [setDrawerClosePrompt]);

  useEffect(() => {
    if (when) {
      // Prevent drawer from being closed
      setDrawerClosePrompt(true);
      // Prevent page to be reload
      window.onbeforeunload = () => true;
    }
  }, [setDrawerClosePrompt, unblock, when]);

  useEffect(() => {
    return () => {
      unblock();
    };
  }, [unblock]);

  // Blocker for the history
  const blocker = useCallback(tx => {
    setCurrentTX(tx);
    setOpen(true);
  }, []);

  useBlocker(blocker, when);

  // Dialog actions
  const handleAccept = useCallback(async () => {
    if (onAccept) {
      const canRoute = await Promise.resolve(onAccept());
      if (canRoute) {
        if (currentTX) currentTX.retry();
        unblock();
      }
    }
    setOpen(false);
  }, [currentTX, onAccept, unblock]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());
      if (canRoute) {
        if (currentTX) currentTX.retry();
        unblock();
      }
    }
    setOpen(false);
  }, [currentTX, onCancel, unblock]);

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
