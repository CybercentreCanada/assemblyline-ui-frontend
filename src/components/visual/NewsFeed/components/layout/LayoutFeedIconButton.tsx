import { Badge, IconButton, makeStyles, useTheme } from '@material-ui/core';
import AddAlertOutlinedIcon from '@material-ui/icons/AddAlertOutlined';
import NotificationsActiveOutlinedIcon from '@material-ui/icons/NotificationsActiveOutlined';
import NotificationsNoneOutlinedIcon from '@material-ui/icons/NotificationsNoneOutlined';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
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
      width: '100%'
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
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.error.main
    }
  }))();

export const LayoutFeedIconButton = () => {
  const { t } = useTranslation(['notification']);
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

  const { onFeedDrawerChange } = useNewsFeed();

  const badgeColorMap = {
    info: classes.badgeInfo,
    success: classes.badgeSuccess,
    warning: classes.badgeWarning,
    error: classes.badgeError
  };

  return (
    <IconButton
      disabled={!systemMessage && !currentUser.is_admin}
      color="inherit"
      aria-label="open drawer"
      onClick={() => onFeedDrawerChange(true)}
    >
      {systemMessage ? (
        <Badge
          invisible={read}
          classes={{ badge: badgeColorMap[systemMessage.severity] }}
          badgeContent={t(`severity.${systemMessage.severity}`).charAt(0).toUpperCase()}
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
