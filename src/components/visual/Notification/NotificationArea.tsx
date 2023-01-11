import {
  Badge,
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
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { blue } from '@mui/material/colors';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { ConfigurationDefinition, SystemMessageDefinition } from 'components/hooks/useMyUser';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JSONFeedItem, NotificationItem, useNotificationFeed } from '.';
import ConfirmationDialog from '../ConfirmationDialog';
import { ServiceResult } from '../SearchResult/service';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: '80%',
    maxWidth: '500px',
    [theme.breakpoints.down('lg')]: {
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
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(1),
    zIndex: 20000,
    top: '0px'
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
  },

  baseColor: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main
  },
  colorError1: { color: theme.palette.error.main },
  colorWarning1: { color: theme.palette.warning.main },
  colorInfo1: { color: blue[500] },
  colorSuccess1: { color: theme.palette.success.main },

  colorError2: { color: theme.palette.mode === 'dark' ? 'rgb(250, 179, 174)' : 'rgb(97, 26, 21)' },
  colorWarning2: { color: theme.palette.mode === 'dark' ? 'rgb(255, 213, 153)' : 'rgb(102, 60, 0)' },
  colorInfo2: { color: theme.palette.mode === 'dark' ? 'rgb(166, 213, 250)' : 'rgb(13, 60, 97)' },
  colorSuccess2: { color: theme.palette.mode === 'dark' ? 'rgb(183, 223, 185)' : 'rgb(30, 70, 32)' },

  colorError3: { color: theme.palette.getContrastText(theme.palette.error.main) },
  colorWarning3: { color: theme.palette.getContrastText(theme.palette.warning.main) },
  colorInfo3: { color: theme.palette.getContrastText(theme.palette.primary.main) },
  colorSuccess3: { color: theme.palette.getContrastText(theme.palette.success.main) },

  bgColorError1: { backgroundColor: theme.palette.error.main },
  bgColorWarning1: { backgroundColor: theme.palette.warning.main },
  bgColorInfo1: { backgroundColor: blue[500] },
  bgColorSuccess1: { backgroundColor: theme.palette.success.main },

  bgColorError2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(24, 6, 5)' : 'rgb(253, 236, 234)' },
  bgColorWarning2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(25, 15, 0)' : 'rgb(255, 244, 229)' },
  bgColorInfo2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(3, 14, 24)' : 'rgb(232, 244, 253)' },
  bgColorSuccess2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(7, 17, 7)' : 'rgb(237, 247, 237)' },

  bgColorError3: { backgroundColor: theme.palette.getContrastText(theme.palette.error.main) },
  bgColorWarning3: { backgroundColor: theme.palette.getContrastText(theme.palette.warning.main) },
  bgColorInfo3: { backgroundColor: theme.palette.getContrastText(theme.palette.primary.main) },
  bgColorSuccess3: { backgroundColor: theme.palette.getContrastText(theme.palette.success.main) }
}));

const WrappedNotificationArea = () => {
  const { t } = useTranslation(['notification']);
  const classes = useStyles();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  const { systemMessage, setSystemMessage, user: currentUser, configuration } = useALContext();
  const { fetchJSONNotifications } = useNotificationFeed();

  const [notifications, setNotifications] = useState<Array<JSONFeedItem>>([]);
  const [newSystemMessage, setNewSystemMessage] = useState<SystemMessageDefinition>({
    user: '',
    title: '',
    severity: 'info',
    message: ''
  });

  const lastTimeOpen = useRef<Date>(new Date(0));
  const storageKey = useMemo<string>(() => 'notification.lastTimeOpen', []);
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
    setNotifications(nots =>
      nots.map((n: JSONFeedItem) => ({ ...n, _isNew: n.date_published.valueOf() > lastTimeOpen.current.valueOf() }))
    );
  }, [storageKey]);

  const onOpenCreateSystemMessageDialog = useCallback(() => {
    setEditDialog(true);
    setNewSystemMessage({
      user: currentUser.username,
      title: '',
      severity: 'info',
      message: ''
    });
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

  const handleSeverityChange = useCallback((event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    if (!['error', 'warning', 'info', 'success'].includes(event.target.value as string)) return;
    setNewSystemMessage(sm => ({ ...sm, severity: event.target.value as 'error' | 'warning' | 'info' | 'success' }));
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

  const getColor = useCallback(
    (sm: SystemMessageDefinition, color: 'color' | 'bgColor' = 'color', type: 1 | 2 | 3 = 1) => {
      if (sm === null || sm === undefined || sm.severity === null) return null;
      const c = classes[color + sm.severity.charAt(0).toUpperCase() + sm.severity.slice(1) + type];
      return c === undefined ? null : c;
    },
    [classes]
  );

  const arrayEquals = useCallback(
    (a, b) =>
      Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]),
    []
  );

  const arrayHigher = useCallback(
    (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.some((val, index) => val > b[index]),
    []
  );

  const getVersionValues = useCallback(
    (value: string): Array<number> =>
      value
        ?.match(/(\d){1,}\.(\d){1,}\.(\d){1,}\..*/g)
        ?.at(0)
        ?.replaceAll(/[^0-9.]/g, '')
        ?.split('.')
        ?.map(v => parseInt(v)),
    []
  );

  const addVersionTag = useCallback(
    (notification: JSONFeedItem, config: ConfigurationDefinition): 'new' | 'current' | null => {
      const notVer = notification?.url;
      const sysVer = config?.system?.version;
      if (
        !(
          (/(d|D)ev/g.test(notVer) && /(\d){1,}\.(\d){1,}\.(\d){1,}\.(d|D)ev(\d){1,}/g.test(sysVer)) ||
          (/(s|S)table/g.test(notVer) && /(\d){1,}\.(\d){1,}\.(\d){1,}\.(\d){1,}/g.test(sysVer))
        )
      )
        return;

      const notValues: Array<number> = getVersionValues(notVer);
      const sysValues: Array<number> = getVersionValues(sysVer);

      if (arrayEquals(notValues, sysValues)) return 'current';
      else if (arrayHigher(notValues, sysValues)) return 'new';
      else return;
    },
    [arrayEquals, arrayHigher, getVersionValues]
  );

  const setIsNew = useCallback(
    (notification: JSONFeedItem): boolean => notification.date_published.valueOf() > lastTimeOpen.current.valueOf(),
    []
  );

  const addNewServiceTag = useCallback(
    (notification: JSONFeedItem, services: Array<ServiceResult>): 'new' | null =>
      !/(s|S)ervice/g.test(notification.title) ||
      services.some(s => notification?.title?.toLowerCase().includes(s?.name?.toLowerCase()))
        ? null
        : 'new',
    []
  );

  useEffect(() => {
    handleLastTimeOpen();
    if (!configuration) return;
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: api_data => {
        const services2: Array<ServiceResult> =
          api_data && api_data.api_response && Array.isArray(api_data.api_response) ? api_data.api_response : null;
        fetchJSONNotifications({
          urls: configuration.ui.rss_feeds,
          onSuccess: (feedItems: Array<JSONFeedItem>) =>
            setNotifications(
              feedItems
                .map(n => ({
                  ...n,
                  tags: [addVersionTag(n, configuration), addNewServiceTag(n, services2), ...n.tags],
                  _isNew: setIsNew(n)
                }))
                .filter(n => n.date_published > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
                .sort((a, b) => b.date_published.valueOf() - a.date_published.valueOf())
            )
        });
      }
    });
    return () => setNotifications([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNewServiceTag, addVersionTag, configuration, fetchJSONNotifications, handleLastTimeOpen, setIsNew]);

  return <>
    <Dialog
      fullWidth
      open={editDialog}
      onClose={() => setEditDialog(false)}
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
          value={newSystemMessage.severity}
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

    <IconButton
      color="inherit"
      aria-label="open drawer"
      onClick={onOpenNotificationArea}
      size="large">
      <Badge
        invisible={systemMessageRead && notifications.filter(n => n._isNew).length === 0}
        classes={{ badge: clsx(classes.baseColor, systemMessage && getColor(systemMessage, 'bgColor', 1)) }}
        max={99}
        badgeContent={
          systemMessage
            ? systemMessage.severity === 'error'
              ? `!`
              : systemMessage.severity === 'warning'
              ? `!`
              : systemMessage.severity === 'info'
              ? `i`
              : systemMessage.severity === 'success'
              ? `\u2714`
              : ''
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
    <Drawer anchor="right" classes={{ paper: classes.drawer }} open={drawer} onClose={onCloseNotificationArea}>
      <div className={classes.root}>
        <div className={classes.container}>
          <div className={clsx(classes.row, classes.closeRow)}>
            <IconButton
              className={classes.close}
              onClick={onCloseNotificationArea}
              children={<CloseOutlinedIcon fontSize="medium" />}
              size="large" />
          </div>
          {(systemMessage || (currentUser && currentUser.is_admin)) && (
            <>
              <div className={clsx(classes.row, classes.header)}>
                {systemMessage ? (
                  systemMessage.severity === 'error' ? (
                    <ErrorOutlineOutlinedIcon
                      className={clsx(classes.icon, getColor(systemMessage, 'color', 1))}
                      fontSize="medium"
                    />
                  ) : systemMessage.severity === 'warning' ? (
                    <ReportProblemOutlinedIcon
                      className={clsx(classes.icon, getColor(systemMessage, 'color', 1))}
                      fontSize="medium"
                    />
                  ) : systemMessage.severity === 'info' ? (
                    <InfoOutlinedIcon
                      className={clsx(classes.icon, getColor(systemMessage, 'color', 1))}
                      fontSize="medium"
                    />
                  ) : systemMessage.severity === 'success' ? (
                    <CheckCircleOutlinedIcon
                      className={clsx(classes.icon, getColor(systemMessage, 'color', 1))}
                      fontSize="medium"
                    />
                  ) : null
                ) : (
                  <NotificationsOutlinedIcon className={clsx(classes.icon)} fontSize="medium" />
                )}
                <Typography
                  className={clsx(classes.title, getColor(systemMessage, 'color', 2))}
                  variant={'h6'}
                  children={t('systemMessage.header')}
                />
                {currentUser &&
                  currentUser.is_admin &&
                  (systemMessage ? (
                    <>
                      <div className={clsx(classes.action)}>
                        <Tooltip title={t('edit.title')} aria-label={t('edit.title')}>
                          <IconButton
                            className={clsx(getColor(systemMessage, 'color', 2))}
                            size="small"
                            onClick={onOpenEditSystemMessageDialog}
                            children={<EditOutlinedIcon />}
                          />
                        </Tooltip>
                      </div>
                      <div className={clsx(classes.action)}>
                        <Tooltip title={t('delete.title')} aria-label={t('delete.title')}>
                          <IconButton
                            className={clsx(getColor(systemMessage, 'color', 2))}
                            size="small"
                            onClick={() => setDeleteConfirmation(true)}
                            children={<DeleteOutlineOutlinedIcon />}
                          />
                        </Tooltip>
                      </div>
                    </>
                  ) : (
                    <div className={clsx(classes.action)}>
                      <Tooltip title={t('add.title')} aria-label={t('add.title')}>
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
              <Divider className={clsx(classes.divider, getColor(systemMessage, 'bgColor', 1))} variant="fullWidth" />
              {systemMessage ? (
                <div className={clsx(classes.item)}>
                  <Typography
                    className={clsx(classes.messageTitle, getColor(systemMessage, 'color', 2))}
                    variant="body1"
                    children={systemMessage.title}
                  />
                  <Typography
                    className={clsx(classes.messageBody)}
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
  </>;
};

export const NotificationArea = React.memo(WrappedNotificationArea);
export default NotificationArea;
