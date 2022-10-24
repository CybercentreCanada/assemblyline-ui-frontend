import { Badge, IconButton } from '@material-ui/core';
import AddAlertOutlinedIcon from '@material-ui/icons/AddAlertOutlined';
import NotificationsActiveOutlinedIcon from '@material-ui/icons/NotificationsActiveOutlined';
import NotificationsNoneOutlinedIcon from '@material-ui/icons/NotificationsNoneOutlined';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationDispatch, useNotificationStore, useNotificationStyles } from '..';

export const WrappedNotificationLayoutButton = () => {
  const { t } = useTranslation(['notification']);
  const { classes, getColor } = useNotificationStyles();
  const { systemMessage, user: currentUser } = useALContext();
  const { dispatch } = useNotificationDispatch();
  const { store } = useNotificationStore();

  return (
    <IconButton
      // disabled={!systemMessage && !currentUser.is_admin}
      color="inherit"
      aria-label="open drawer"
      onClick={() => dispatch.openDrawer()}
    >
      {true ? (
        <Badge
          invisible={store.read}
          classes={{
            badge: clsx(
              classes.badge,
              systemMessage !== undefined ? getColor(systemMessage, 'color', 3) : classes.badgeInfo,
              systemMessage !== undefined ? getColor(systemMessage, 'bgColor', 1) : classes.badgeInfo
            )
          }}
          max={99}
          badgeContent={
            systemMessage === null || systemMessage === undefined
              ? store.notification.newItemsCount
              : systemMessage.severity === 'error'
              ? `!`
              : systemMessage.severity === 'warning'
              ? `!`
              : systemMessage.severity === 'info'
              ? `i`
              : systemMessage.severity === 'success'
              ? `\u2714`
              : ''
          }
        >
          <NotificationsActiveOutlinedIcon />
        </Badge>
      ) : currentUser.is_admin ? (
        <AddAlertOutlinedIcon />
      ) : (
        <NotificationsNoneOutlinedIcon />
      )}
    </IconButton>
  );
};

export const NotificationLayoutButton = React.memo(WrappedNotificationLayoutButton);
export default NotificationLayoutButton;
