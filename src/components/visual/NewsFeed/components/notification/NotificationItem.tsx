import { Collapse, IconButton, makeStyles, Typography, useTheme } from '@material-ui/core';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import { Alert, AlertTitle } from '@material-ui/lab';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsFeed } from '../..';

const useStyles = () =>
  makeStyles(theme => ({
    action: {
      flexDirection: 'column',
      justifyContent: 'space-evenly'
    },
    popper: {
      zIndex: theme.zIndex.drawer + 2,
      minWidth: '500px',
      [theme.breakpoints.down('sm')]: { minWidth: '320px' },
      [theme.breakpoints.down('xs')]: { minWidth: '250px' }
    },
    margin: {
      margin: theme.spacing(1)
    },
    message: {
      width: '100%',
      borderRadius: ''
    },
    icon: {
      width: '50px',
      display: 'flex',
      alignItems: 'center'
    },
    badgeInfo: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.primary.main
    },
    badgeWarning: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.warning.main
    },
    badgeSuccess: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.success.main
    },
    badgeError: {
      width: '56px',
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.error.main
    }
  }))();

export const WrappedNotificationItem = () => {
  const { t } = useTranslation(['notification']);
  const { onFeedDrawerChange } = useNewsFeed();

  const classes = useStyles();
  const theme = useTheme();
  const { systemMessage, setSystemMessage, user: currentUser } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  const [popperAnchorEl, setPopperAnchorEl] = useState(null);
  const [edit, setEdit] = useState(false);
  const [read, setRead] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const badgeColorMap = {
    info: classes.badgeInfo,
    success: classes.badgeSuccess,
    warning: classes.badgeWarning,
    error: classes.badgeError
  };

  const onEditSystemMessage = event => {
    event.stopPropagation();
    setSeverity(systemMessage.severity);
    setNewMsg(systemMessage.message);
    setNewTitle(systemMessage.title);
    setEdit(true);
  };

  const onCancelSystemMessage = () => {
    setEdit(false);
    setNewMsg('');
    setNewTitle('');
    setSeverity('info');
  };

  const closeNotificationArea = () => {
    setPopperAnchorEl(null);
  };

  const onDeleteSystemMessage = event => {
    event.stopPropagation();
    setDeleteConfirmation(true);
  };

  const [open, setopen] = useState(true);

  return (
    <Collapse in={open}>
      {systemMessage && (
        <Alert
          severity={systemMessage.severity}
          onClick={event => {
            closeNotificationArea();
            setopen(false);
          }}
          classes={{ message: classes.message, action: classes.action, icon: classes.icon }}
          action={
            currentUser &&
            currentUser.is_admin && (
              <>
                <IconButton size="small" onClick={onEditSystemMessage} color="inherit">
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton size="small" onClick={onDeleteSystemMessage} color="inherit">
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </>
            )
          }
        >
          {systemMessage.title && <AlertTitle>{systemMessage.title}</AlertTitle>}
          {systemMessage.message}
          <div style={{ paddingTop: theme.spacing(1), textAlign: 'right' }}>
            <Typography variant="caption">{systemMessage.user}</Typography>
          </div>
        </Alert>
      )}
    </Collapse>
  );
};

export const NotificationItem = React.memo(WrappedNotificationItem);
export default NotificationItem;
