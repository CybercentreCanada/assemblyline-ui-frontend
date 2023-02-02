/* eslint-disable @typescript-eslint/no-unused-vars */
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

  // const blocker = useBlocker(when);
  const { t } = useTranslation();
  const { setDrawerClosePrompt } = useDrawer();
  // const blocker = useBlocker(when);

  const [open, setOpen] = useState(false);

  const unblock = useCallback(() => {
    setDrawerClosePrompt(false);
    // blocker.reset();
    window.onbeforeunload = undefined;
    // }, [blocker, setDrawerClosePrompt]);
  }, [setDrawerClosePrompt]);

  useEffect(() => {
    if (when) {
      // Prevent drawer from being closed
      setDrawerClosePrompt(true);
      // Prevent page to be reload
      window.onbeforeunload = () => true;
    } else {
      unblock();
    }
    return () => {
      unblock();
    };
    // }, [setDrawerClosePrompt, unblock, blocker, when]);
  }, [setDrawerClosePrompt, unblock, when]);

  const handleAccept = useCallback(async () => {
    if (onAccept) {
      const canRoute = await Promise.resolve(onAccept());
      if (canRoute) {
        unblock();
      }
    }
  }, [onAccept, unblock]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());
      if (canRoute) {
        unblock();
      }
    }
    setOpen(false);
  }, [onCancel, unblock]);

  return open ? (
    <ConfirmationDialog
      title={title || t('router_prompt_titleg')}
      open={open}
      handleAccept={handleAccept}
      acceptText={acceptText || t('router_prompt_accept')}
      handleClose={handleCancel}
      cancelText={cancelText || t('router_prompt_cancel')}
      text={text || t('router_prompt_text')}
    />
  ) : null;
}
