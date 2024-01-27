import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { SystemMessageDefinition } from 'components/hooks/useMyUser';
import { SeveritySchema } from 'components/models/system_message';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationItem, useNotificationFeed } from '.';
import ConfirmationDialog from '../ConfirmationDialog';
import { SeverityBadge, SeverityIcon, StyledSeverity } from './SystemMessage';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: '80%',
    maxWidth: '500px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  root: {
    height: '100%',
    width: '100%',
    overflowX: 'hidden',
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid',
    padding: theme.spacing(2.5),
    paddingTop: 0
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'stretch',
    flexWrap: 'nowrap'
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  closeRow: {
    position: 'sticky',
    paddingTop: theme.spacing(1),
    zIndex: 20000,
    top: '0px',
    backgroundColor: theme.palette.background.paper
  },
  center: {
    justifyContent: 'center'
  },
  close: {},
  skeleton: {
    width: '100%',
    height: theme.spacing(8)
  },
  divider: {
    marginBottom: theme.spacing(2),
    width: '100%',
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  },
  icon: {
    color: 'inherit',
    backgroundColor: 'inherit',
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5)
  },
  header: {
    paddingTop: theme.spacing(2)
  },
  title: {
    fontSize: 'large',
    fontWeight: 'bolder',
    flex: 1
  },
  messageTitle: {
    fontSize: 'large',
    fontWeight: 'bolder',
    paddingLeft: theme.spacing(1.25)
  },
  messageBody: {
    paddingLeft: theme.spacing(1.25)
  },
  message: {
    paddingLeft: theme.spacing(1.25)
  },
  item: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25)
  },
  user: {
    textAlign: 'right',
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  action: {
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5)
  }
}));

const WrappedNotificationArea = () => {
  const { t } = useTranslation(['notification']);
  const classes = useStyles();
  const theme = useTheme();

  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { systemMessage, setSystemMessage, user: currentUser } = useALContext();

  const [newSystemMessage, setNewSystemMessage] = useState<SystemMessageDefinition>({
    user: '',
    title: '',
    severity: 'info',
    message: ''
  });

  const lastTimeOpen = useRef<Date>(new Date(0));
  const storageKey = useMemo<string>(() => 'notification.lastTimeOpen', []);
  const notifications = useNotificationFeed({ lastTimeOpen: lastTimeOpen.current });

  const [systemMessageRead, setSystemMessageRead] = useState<boolean>(systemMessage ? false : true);

  const [drawer, setDrawer] = useState<boolean>(false);
  const [editDialog, setEditDialog] = useState<boolean>(false);
  const [saveConfirmation, setSaveConfirmation] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [waitingDialog, setWaitingDialog] = useState(false);

  const handleLastTimeOpen = useCallback(() => {
    const data = localStorage.getItem(storageKey);
    if (!data) return;

    const value = JSON.parse(data);
    if (typeof value !== 'number') return;

    lastTimeOpen.current = new Date(value);
  }, [storageKey]);

  const onOpenNotificationArea = useCallback(() => {
    setDrawer(true);
    lastTimeOpen.current = new Date();
  }, []);

  const onCloseNotificationArea = useCallback(() => {
    setDrawer(false);
    setSystemMessageRead(true);
    localStorage.setItem(storageKey, JSON.stringify(lastTimeOpen.current.valueOf()));
  }, [storageKey]);

  const onOpenCreateSystemMessageDialog = useCallback(() => {
    setEditDialog(true);
    setNewSystemMessage({ user: currentUser.username, title: '', severity: 'info', message: '' });
  }, [currentUser.username]);

  const onOpenEditSystemMessageDialog = useCallback(() => {
    setEditDialog(true);
    setNewSystemMessage({
      user: currentUser.username,
      title: systemMessage.title,
      severity: systemMessage.severity,
      message: systemMessage.message
    });
  }, [currentUser.username, systemMessage]);

  const handleSeverityChange = useCallback((event: SelectChangeEvent) => {
    const severity = SeveritySchema.parse(event.target.value);
    if (severity) setNewSystemMessage(sm => ({ ...sm, severity }));
  }, []);

  const onSaveSystemMessage = event => {
    event.stopPropagation();
    apiCall({
      url: '/api/v4/system/system_message/',
      method: 'PUT',
      body: newSystemMessage,
      onSuccess: () => {
        showSuccessMessage(t('save.success'));
        setSaveConfirmation(false);
        setSystemMessage(newSystemMessage);
        setEditDialog(false);
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  const onDeleteSystemMessage = event => {
    event.stopPropagation();
    setDeleteConfirmation(false);
    apiCall({
      url: '/api/v4/system/system_message/',
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        setSystemMessage(null);
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  useEffect(() => {
    handleLastTimeOpen();
  }, [handleLastTimeOpen]);

  return (
    <>
      <Dialog open={editDialog} fullWidth onClose={() => setEditDialog(false)}>
        <DialogTitle>{t('edit.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('edit.text')}</DialogContentText>
        </DialogContent>
        <DialogContent>
          <Typography variant="subtitle2" children={t('edit.severity')} />
          <FormControl size="small" fullWidth>
            <Select
              fullWidth
              value={newSystemMessage.severity}
              onChange={handleSeverityChange}
              variant="outlined"
              style={{ marginBottom: theme.spacing(2) }}
            >
              {['success', 'info', 'warning', 'error'].map(key => (
                <MenuItem key={key} value={key} children={t(`severity.${key}`)} />
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle2" children={t('edit.message.title')} />
          <TextField
            autoFocus
            size="small"
            variant="outlined"
            fullWidth
            onChange={event => setNewSystemMessage(sm => ({ ...sm, title: event.target.value }))}
            value={newSystemMessage.title}
            style={{ marginBottom: theme.spacing(2) }}
          />
          <Typography variant="subtitle2">{t('edit.message')}</Typography>
          <TextField
            size="small"
            variant="outlined"
            multiline
            fullWidth
            rows={4}
            onChange={event => setNewSystemMessage(sm => ({ ...sm, message: event.target.value }))}
            value={newSystemMessage.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} color="secondary">
            {t('edit.button.cancel')}
          </Button>
          <Button onClick={() => setSaveConfirmation(true)} color="primary" disabled={!newSystemMessage.message}>
            {t('edit.button.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={saveConfirmation}
        handleClose={() => setSaveConfirmation(false)}
        handleAccept={onSaveSystemMessage}
        title={t('save.title')}
        cancelText={t('save.cancelText')}
        acceptText={t('save.acceptText')}
        text={t('save.text')}
        waiting={waitingDialog}
      />
      <ConfirmationDialog
        open={deleteConfirmation}
        handleClose={() => setDeleteConfirmation(false)}
        handleAccept={onDeleteSystemMessage}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={waitingDialog}
      />

      <Tooltip title={t('notification.title')}>
        <IconButton color="inherit" size="large" onClick={onOpenNotificationArea}>
          <SeverityBadge
            severity={systemMessage?.severity}
            invisible={systemMessageRead && notifications.filter(n => n._isNew).length === 0}
            max={99}
            badgeContent={
              systemMessage
                ? SeveritySchema.parse(systemMessage?.severity) &&
                  { success: `\u2714`, info: 'i', warning: '!', error: '!' }[systemMessage?.severity]
                : notifications.filter(n => n._isNew).length
            }
            children={
              systemMessageRead && notifications.filter(n => n._isNew).length === 0 ? (
                <NotificationsNoneOutlinedIcon />
              ) : (
                <NotificationsActiveOutlinedIcon />
              )
            }
          />
        </IconButton>
      </Tooltip>
      <Drawer anchor="right" classes={{ paper: classes.drawer }} open={drawer} onClose={onCloseNotificationArea}>
        <div className={classes.root}>
          <div className={classes.container}>
            <div className={clsx(classes.row, classes.closeRow)}>
              <IconButton
                className={classes.close}
                onClick={onCloseNotificationArea}
                children={<CloseOutlinedIcon fontSize="medium" />}
                size="large"
              />
            </div>
            {(systemMessage || currentUser?.is_admin) && (
              <>
                <div className={clsx(classes.row, classes.header)}>
                  <SeverityIcon severity={systemMessage?.severity} fontSize="medium" />
                  <Typography
                    className={classes.title}
                    component={StyledSeverity}
                    severity={systemMessage?.severity}
                    setColor
                    faded
                    variant="h6"
                    children={t('systemMessage.header')}
                  />
                  {currentUser &&
                    currentUser.is_admin &&
                    (systemMessage ? (
                      <>
                        <div className={clsx(classes.action)}>
                          <Tooltip title={t('edit.title')}>
                            <IconButton
                              component={StyledSeverity}
                              severity={systemMessage?.severity}
                              setColor
                              faded
                              size="small"
                              onClick={onOpenEditSystemMessageDialog}
                              children={<EditOutlinedIcon />}
                            />
                          </Tooltip>
                        </div>
                        <div className={clsx(classes.action)}>
                          <Tooltip title={t('delete.title')}>
                            <IconButton
                              component={StyledSeverity}
                              severity={systemMessage?.severity}
                              setColor
                              faded
                              size="small"
                              onClick={() => setDeleteConfirmation(true)}
                              children={<DeleteOutlineOutlinedIcon />}
                            />
                          </Tooltip>
                        </div>
                      </>
                    ) : (
                      <div className={clsx(classes.action)}>
                        <Tooltip title={t('add.title')}>
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={onOpenCreateSystemMessageDialog}
                            children={<AddOutlinedIcon />}
                          />
                        </Tooltip>
                      </div>
                    ))}
                </div>
                <Divider
                  className={classes.divider}
                  component={StyledSeverity}
                  severity={systemMessage?.severity}
                  setBackgroundColor
                  variant="fullWidth"
                />
                {systemMessage ? (
                  <div className={clsx(classes.item)}>
                    <Typography
                      className={classes.messageTitle}
                      component={StyledSeverity}
                      severity={systemMessage?.severity}
                      setColor
                      faded
                      variant="body1"
                      children={systemMessage.title}
                    />
                    <Typography
                      className={classes.messageBody}
                      variant="body2"
                      color="textPrimary"
                      children={systemMessage.message}
                    />
                    <Typography
                      className={classes.user}
                      variant="caption"
                      color="textSecondary"
                      children={systemMessage.user}
                    />
                  </div>
                ) : (
                  <div className={clsx(classes.row, classes.center)}>
                    <Typography variant="body2" color="secondary" children={t(`systemMessage.none`)} />
                  </div>
                )}
              </>
            )}
            <div className={clsx(classes.row, classes.header)}>
              <FeedbackOutlinedIcon className={clsx(classes.icon)} fontSize="medium" />
              <Typography className={clsx(classes.title)} variant={'h6'} children={t(`notification.header`)} />
            </div>
            <Divider className={clsx(classes.divider)} variant="fullWidth" />
            {notifications === null ? (
              <div className={clsx(classes.row)}>
                <Skeleton className={clsx(classes.skeleton)} variant="text" animation="wave" />
              </div>
            ) : notifications.length === 0 ? (
              <div className={clsx(classes.row, classes.center)}>
                <Typography variant="body2" color="secondary" children={t('notification.none')} />
              </div>
            ) : (
              notifications.map((n, i) => (
                <NotificationItem key={i} notification={n} hideDivider={i === notifications.length - 1} />
              ))
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export const NotificationArea = React.memo(WrappedNotificationArea);
export default NotificationArea;
