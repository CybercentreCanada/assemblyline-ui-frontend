import useDrawer from 'components/hooks/useDrawer';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();
  const { setDrawerClosePrompt } = useDrawer();

  const [open, setOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const unblock = useCallback(() => {
    setDrawerClosePrompt(false);
    history.block(() => {});
    window.onbeforeunload = undefined;
  }, [history, setDrawerClosePrompt]);

  useEffect(() => {
    if (when) {
      // Prevent drawer from being closed
      setDrawerClosePrompt(true);
      // Prevent page to be reload
      window.onbeforeunload = () => true;
      // Prevent URL to change
      history.block(prompt => {
        setCurrentPath(prompt.pathname);
        setOpen(true);
        return false;
      });
    } else {
      unblock();
    }

    return () => {
      unblock();
    };
  }, [history, setDrawerClosePrompt, unblock, when]);

  const handleAccept = useCallback(async () => {
    if (onAccept) {
      const canRoute = await Promise.resolve(onAccept());
      if (canRoute) {
        unblock();
        history.push(currentPath);
      }
    }
  }, [currentPath, history, onAccept, unblock]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());
      if (canRoute) {
        unblock();
        history.push(currentPath);
      }
    }
    setOpen(false);
  }, [currentPath, history, onCancel, unblock]);

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
