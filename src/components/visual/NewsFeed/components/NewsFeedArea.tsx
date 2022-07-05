import {
  Badge,
  Button,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Popper,
  Select,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import AddAlertOutlinedIcon from '@material-ui/icons/AddAlertOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import NotificationsActiveOutlinedIcon from '@material-ui/icons/NotificationsActiveOutlined';
import NotificationsNoneOutlinedIcon from '@material-ui/icons/NotificationsNoneOutlined';
import { Alert, AlertTitle } from '@material-ui/lab';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmationDialog from '../../ConfirmationDialog';
import { useNewsFeed } from '../contexts/NewsFeedContext';

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

export const NewsFeedArea = () => {
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

  const onNewsFeedAreaIconClick = (event: React.MouseEvent) => {
    // onOpenFeedDrawer();
    if (!systemMessage && currentUser.is_admin) {
      setEdit(true);
    } else {
      if (!read) setRead(true);
      setPopperAnchorEl(popperAnchorEl ? null : event.currentTarget);
    }
  };

  const handleSeverityChange = event => {
    switch (event.target.value) {
      case 'info':
        setSeverity('info');
        break;
      case 'warning':
        setSeverity('warning');
        break;
      case 'error':
        setSeverity('error');
        break;
      case 'success':
        setSeverity('success');
        break;
      default:
        setSeverity('info');
    }
  };

  const onSaveSystemMessage = () => {
    setSaveConfirmation(true);
  };

  const doSaveSystemMessage = () => {
    setSaveConfirmation(false);
    const data = { user: currentUser.username, title: newTitle, severity, message: newMsg };
    apiCall({
      url: '/api/v4/system/system_message/',
      method: 'PUT',
      body: data,
      onSuccess: () => {
        showSuccessMessage(t('save.success'));
        setSystemMessage(data);
        setEdit(false);
        setRead(false);
      }
    });
  };

  const onDeleteSystemMessage = event => {
    event.stopPropagation();
    setDeleteConfirmation(true);
  };

  const doDeleteSystemMessage = () => {
    setDeleteConfirmation(false);
    apiCall({
      url: '/api/v4/system/system_message/',
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        setSystemMessage(null);
      }
    });
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

  const closeNewsFeedArea = () => {
    setPopperAnchorEl(null);
  };

  return (
    <>
      <Dialog
        fullWidth
        open={edit}
        onClose={onCancelSystemMessage}
        aria-labelledby="na-dialog-title"
        aria-describedby="na-dialog-description"
      >
        <DialogTitle id="na-dialog-title">{t('edit.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="na-dialog-description">{t('edit.text')}</DialogContentText>
        </DialogContent>
        <DialogContent>
          <Typography variant="subtitle2">{t('edit.severity')}</Typography>
          <Select
            fullWidth
            id="na-severity"
            value={severity}
            onChange={handleSeverityChange}
            variant="outlined"
            margin="dense"
            style={{ marginBottom: theme.spacing(2) }}
          >
            <MenuItem value="info">{t('severity.info')}</MenuItem>
            <MenuItem value="warning">{t('severity.warning')}</MenuItem>
            <MenuItem value="success">{t('severity.success')}</MenuItem>
            <MenuItem value="error">{t('severity.error')}</MenuItem>
          </Select>
          <Typography variant="subtitle2">{t('edit.message.title')}</Typography>
          <TextField
            autoFocus
            size="small"
            variant="outlined"
            fullWidth
            onChange={event => setNewTitle(event.target.value)}
            value={newTitle}
            style={{ marginBottom: theme.spacing(2) }}
          />
          <Typography variant="subtitle2">{t('edit.message')}</Typography>
          <TextField
            size="small"
            variant="outlined"
            multiline
            fullWidth
            rows={4}
            onChange={event => setNewMsg(event.target.value)}
            value={newMsg}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelSystemMessage} color="secondary">
            {t('edit.button.cancel')}
          </Button>
          <Button onClick={onSaveSystemMessage} color="primary" disabled={!newMsg}>
            {t('edit.button.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={saveConfirmation}
        handleClose={() => setSaveConfirmation(false)}
        handleAccept={doSaveSystemMessage}
        title={t('save.title')}
        cancelText={t('save.cancelText')}
        acceptText={t('save.acceptText')}
        text={t('save.text')}
      />
      <ConfirmationDialog
        open={deleteConfirmation}
        handleClose={() => setDeleteConfirmation(false)}
        handleAccept={doDeleteSystemMessage}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />

      <IconButton
        disabled={!systemMessage && !currentUser.is_admin}
        color="inherit"
        aria-label="open drawer"
        onClick={onNewsFeedAreaIconClick}
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
      <Popper
        open={!!popperAnchorEl}
        anchorEl={popperAnchorEl}
        className={classes.popper}
        placement="bottom-end"
        transition
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={closeNewsFeedArea}>
            <Fade {...TransitionProps} timeout={250}>
              <Paper elevation={4}>
                {systemMessage && (
                  <Alert
                    severity={systemMessage.severity}
                    onClick={closeNewsFeedArea}
                    classes={{ message: classes.message, action: classes.action }}
                    action={
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
                    <div style={{ paddingTop: theme.spacing(1), textAlign: 'right' }}>{systemMessage.user}</div>
                  </Alert>
                )}
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
};

export default NewsFeedArea;
