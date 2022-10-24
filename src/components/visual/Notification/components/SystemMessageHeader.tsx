import { Divider, IconButton, Typography, useTheme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import NotificationsIcon from '@material-ui/icons/Notifications';
import clsx from 'clsx';
import { CustomUserContextProps } from 'components/hooks/useMyUser';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SystemMessageIcon, useNotification, useNotificationDispatch, useNotificationStyles } from '..';

type Props = {
  alContext: CustomUserContextProps;
};

export const WrappedSystemMessageHeader = ({ alContext }: Props) => {
  const { classes, getColor } = useNotificationStyles();
  const theme = useTheme();
  const { t, i18n } = useTranslation(['notification']);

  const { setStoreRef, dispatch, dispatchAsync } = useNotificationDispatch();
  const { onCreateSystemMessage, onEditSystemMessage, setDeleteConfirmation } = useNotification();
  const { systemMessage, user: currentUser } = alContext;

  console.log(systemMessage, currentUser);

  if ((systemMessage === null || systemMessage === undefined) && (currentUser === null || !currentUser.is_admin))
    return null;
  else if (true)
    return (
      <>
        <div className={clsx(classes.row, classes.header)}>
          {systemMessage === null || systemMessage === undefined ? (
            <NotificationsIcon className={clsx(classes.icon)} fontSize="medium" />
          ) : (
            <SystemMessageIcon
              className={clsx(classes.icon, getColor(systemMessage, 'color', 1))}
              fontSize="medium"
              systemMessage={systemMessage}
            />
          )}
          <Typography className={clsx(classes.headerTitle, getColor(systemMessage, 'color', 2))} variant={'h6'}>
            {'System Message'}
          </Typography>
          {currentUser !== null && currentUser.is_admin ? (
            systemMessage === null || systemMessage === undefined ? (
              <div className={clsx(classes.action)}>
                <IconButton size="small" color="inherit" onClick={() => dispatch.createSystemMessage({ currentUser })}>
                  <AddIcon />
                </IconButton>
              </div>
            ) : (
              <>
                <div className={clsx(classes.action)}>
                  <IconButton
                    className={clsx(getColor(systemMessage, 'color', 2))}
                    size="small"
                    onClick={() => dispatch.editSystemMessage({ currentUser, systemMessage })}
                  >
                    <EditOutlinedIcon />
                  </IconButton>
                </div>
                <div className={clsx(classes.action)}>
                  <IconButton
                    className={clsx(getColor(systemMessage, 'color', 2))}
                    size="small"
                    onClick={() => setStoreRef.current(s => ({ ...s, open: { ...s.open, deleteConfirmation: true } }))}
                  >
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </div>
              </>
            )
          ) : null}
        </div>
        <Divider
          className={clsx(classes.divider, classes.dividerMargin, getColor(systemMessage, 'bgColor', 1))}
          variant="fullWidth"
        />
      </>
    );
};

export const SystemMessageHeader = React.memo(
  WrappedSystemMessageHeader,
  (prevProps: Readonly<React.PropsWithChildren<Props>>, nextProps: Readonly<React.PropsWithChildren<Props>>) =>
    Object.is(prevProps.alContext.systemMessage, nextProps.alContext.systemMessage) &&
    Object.is(prevProps.alContext.user, nextProps.alContext.user)
);
export default SystemMessageHeader;
