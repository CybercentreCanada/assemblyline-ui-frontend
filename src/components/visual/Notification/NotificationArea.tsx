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
import type { SelectChangeEvent, SvgIconProps, Theme } from '@mui/material';
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
  Skeleton,
  styled,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { blue } from '@mui/material/colors';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Configuration } from 'components/models/base/config';
import type { ServiceIndexed } from 'components/models/base/service';
import type { SystemMessage } from 'components/models/ui/user';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import NotificationItem from 'components/visual/Notification/NotificationItem';
import type { JSONFeedItem } from 'components/visual/Notification/useNotificationFeed';
import { useNotificationFeed } from 'components/visual/Notification/useNotificationFeed';
import type { PossibleColor } from 'helpers/colors';
import 'moment-timezone';
import type { ComponentProps, ComponentType, CSSProperties, ElementType } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Row = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
}));

type SystemMessageIconProps = SvgIconProps & {
  severity?: PossibleColor;
};

const SystemMessageIcon = styled(({ severity, fontSize = 'medium', ...props }: SystemMessageIconProps) => {
  switch (severity) {
    case 'error':
      return <ErrorOutlineOutlinedIcon fontSize={fontSize} {...props} />;
    case 'warning':
      return <ReportProblemOutlinedIcon fontSize={fontSize} {...props} />;
    case 'info':
      return <InfoOutlinedIcon fontSize={fontSize} {...props} />;
    case 'success':
      return <CheckCircleOutlinedIcon fontSize={fontSize} {...props} />;
    default:
      return <NotificationsOutlinedIcon fontSize={fontSize} {...props} />;
  }
})<SystemMessageIconProps>(({ theme }) => ({
  color: 'inherit',
  backgroundColor: 'inherit',
  marginLeft: theme.spacing(1.5),
  marginRight: theme.spacing(1.5)
}));

const getColor = (severity: PossibleColor, variant: 1 | 2 | 3, theme: Theme) => {
  const colors: Record<string, Record<number, CSSProperties>> = {
    error: {
      1: { color: theme.palette.error.main },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(250, 179, 174)' : 'rgb(97, 26, 21)' },
      3: { color: theme.palette.getContrastText(theme.palette.error.main) }
    },
    warning: {
      1: { color: theme.palette.warning.main },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(255, 213, 153)' : 'rgb(102, 60, 0)' },
      3: { color: theme.palette.getContrastText(theme.palette.warning.main) }
    },
    info: {
      1: { color: blue[500] },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(166, 213, 250)' : 'rgb(13, 60, 97)' },
      3: { color: theme.palette.getContrastText(theme.palette.primary.main) }
    },
    success: {
      1: { color: theme.palette.success.main },
      2: { color: theme.palette.mode === 'dark' ? 'rgb(183, 223, 185)' : 'rgb(30, 70, 32)' },
      3: { color: theme.palette.getContrastText(theme.palette.success.main) }
    }
  };

  return colors?.[severity]?.[variant];
};

const getBackgroundColor = (severity: PossibleColor, variant: 1 | 2 | 3, theme: Theme) => {
  const backgroundColors: Record<string, Record<number, CSSProperties>> = {
    error: {
      1: { backgroundColor: theme.palette.error.main },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(24, 6, 5)' : 'rgb(253, 236, 234)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.error.main) }
    },
    warning: {
      1: { backgroundColor: theme.palette.warning.main },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(25, 15, 0)' : 'rgb(255, 244, 229)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.warning.main) }
    },
    info: {
      1: { backgroundColor: blue[500] },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(3, 14, 24)' : 'rgb(232, 244, 253)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.primary.main) }
    },
    success: {
      1: { backgroundColor: theme.palette.success.main },
      2: { backgroundColor: theme.palette.mode === 'dark' ? 'rgb(7, 17, 7)' : 'rgb(237, 247, 237)' },
      3: { backgroundColor: theme.palette.getContrastText(theme.palette.success.main) }
    }
  };

  return backgroundColors?.[severity]?.[variant];
};

type NotificationColorProps<T extends ElementType<unknown>> = ComponentProps<T> & {
  component: T;
  children?: React.ReactNode;
  severity?: PossibleColor;
  colorType?: 1 | 2 | 3;
  backgroundColorType?: 1 | 2 | 3;
};

const NotificationColor = <T extends ComponentType<any>>({
  component: Component = 'div',
  children,
  severity = null,
  colorType = null,
  backgroundColorType = null,
  style,
  ...props
}: NotificationColorProps<T>) => {
  const theme = useTheme();

  return (
    <Component
      {...props}
      style={{
        ...getColor(severity, colorType, theme),
        ...getBackgroundColor(severity, backgroundColorType, theme),
        ...style
      }}
    >
      {children}
    </Component>
  );
};

const WrappedNotificationArea = () => {
  const { t } = useTranslation(['notification']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  const { systemMessage, setSystemMessage, user: currentUser, configuration } = useALContext();
  const { fetchJSONNotifications } = useNotificationFeed();

  const [notifications, setNotifications] = useState<JSONFeedItem[]>([]);
  const [newSystemMessage, setNewSystemMessage] = useState<SystemMessage>({
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
      nots.map((n: JSONFeedItem) => ({
        ...n,
        _isNew: new Date(n.date_published).valueOf() > lastTimeOpen.current.valueOf()
      }))
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

  const handleSeverityChange = useCallback((event: SelectChangeEvent) => {
    if (!['error', 'warning', 'info', 'success'].includes(event.target.value)) return;
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

  const arrayEquals = useCallback(
    (a, b) =>
      Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]),
    []
  );

  const arrayHigher = useCallback((a: any, b: any) => {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    let i = 0;
    while (i < a.length) {
      if (a[i] > b[i]) return true;
      else if (a[i] < b[i]) return false;
      else i++;
    }
    return false;
  }, []);

  const getVersionValues = useCallback(
    (value: string): number[] =>
      value
        ?.match(/(\d){1,}\.(\d){1,}\.(\d){1,}\..*/g)
        ?.at(0)
        ?.replaceAll(/[^0-9.]/g, '')
        ?.split('.')
        ?.map(v => parseInt(v)),
    []
  );

  const getVersionType = useCallback(
    (notification: JSONFeedItem, config: Configuration): null | 'newer' | 'current' | 'older' => {
      const notVer = notification?.url;
      const sysVer = config?.system?.version;
      if (
        !(
          (/(d|D)ev/g.test(notVer) && /(\d){1,}\.(\d){1,}\.(\d){1,}\.(d|D)ev(\d){1,}/g.test(sysVer)) ||
          (/(s|S)table/g.test(notVer) && /(\d){1,}\.(\d){1,}\.(\d){1,}\.(\d){1,}/g.test(sysVer))
        )
      )
        return null;

      const notValues: number[] = getVersionValues(notVer);
      const sysValues: number[] = getVersionValues(sysVer);

      if (arrayEquals(notValues, sysValues)) return 'current';
      else if (arrayHigher(notValues, sysValues)) return 'newer';
      else return 'older';
    },
    [arrayEquals, arrayHigher, getVersionValues]
  );

  const setIsNew = useCallback(
    (notification: JSONFeedItem): boolean =>
      new Date(notification.date_published).valueOf() > lastTimeOpen.current.valueOf(),
    []
  );

  const getNewService = useCallback((notification: JSONFeedItem, services: ServiceIndexed[]): null | boolean => {
    if (!/(s|S)ervice/g.test(notification.title)) return null;
    const notificationTitle = notification?.title?.toLowerCase().slice(0, -16);
    return services.some(s => notificationTitle === s?.name?.toLowerCase());
  }, []);

  useEffect(() => {
    handleLastTimeOpen();
    if (!configuration || !currentUser) return;
    apiCall<ServiceIndexed[]>({
      url: '/api/v4/service/all/',
      onSuccess: api_data => {
        const services2: ServiceIndexed[] =
          api_data && api_data.api_response && Array.isArray(api_data.api_response) ? api_data.api_response : null;
        fetchJSONNotifications({
          urls: configuration.ui.rss_feeds,
          onSuccess: (feedItems: JSONFeedItem[]) =>
            setNotifications(_n => {
              const isAdmin = currentUser?.is_admin;
              let newNots = feedItems.filter(n => {
                if (new Date(n.date_published) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) return false;

                if (!isAdmin) {
                  const isNewService = getNewService(n, services2);
                  if (isNewService === false) return false;

                  const isNewVersion = getVersionType(n, configuration);
                  if (isNewVersion === 'newer') return false;
                }

                return true;
              });

              newNots = newNots.map(n => {
                const _isNew = setIsNew(n);
                // eslint-disable-next-line no-unsafe-optional-chaining
                let tags = [...n?.tags];
                if (isAdmin) {
                  const isNewService = getNewService(n, services2);
                  const isNewVersion = getVersionType(n, configuration);
                  tags = [
                    isNewService === false ? 'new' : null,
                    isNewVersion === 'newer' ? 'new' : null,
                    isNewVersion === 'current' ? 'current' : null,
                    ...tags
                  ];
                }
                return { ...n, _isNew, tags };
              });

              newNots = newNots.sort(
                (a, b) => new Date(b.date_published).valueOf() - new Date(a.date_published).valueOf()
              );
              return newNots;
            })
        });
      }
    });
    return () => setNotifications([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, currentUser, fetchJSONNotifications, getNewService, getVersionType, handleLastTimeOpen, setIsNew]);

  return (
    <>
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
          <FormControl size="small" fullWidth>
            <Select
              fullWidth
              id="na-severity"
              value={newSystemMessage.severity}
              onChange={handleSeverityChange}
              variant="outlined"
              style={{ marginBottom: theme.spacing(2) }}
            >
              <MenuItem value="info">{t('severity.info')}</MenuItem>
              <MenuItem value="warning">{t('severity.warning')}</MenuItem>
              <MenuItem value="success">{t('severity.success')}</MenuItem>
              <MenuItem value="error">{t('severity.error')}</MenuItem>
            </Select>
          </FormControl>
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

      <Tooltip title={t('notification.title')} aria-label={t('add.title')}>
        <IconButton color="inherit" aria-label="open drawer" onClick={onOpenNotificationArea} size="large">
          <Badge
            invisible={systemMessageRead && notifications.filter(n => n._isNew).length === 0}
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
            slotProps={{
              badge: {
                style: {
                  color: theme.palette.getContrastText(theme.palette.primary.main),
                  backgroundColor: theme.palette.primary.main,
                  ...getBackgroundColor(systemMessage?.severity, 1, theme)
                }
              }
            }}
          />
        </IconButton>
      </Tooltip>
      <Drawer
        anchor="right"
        open={drawer}
        onClose={onCloseNotificationArea}
        slotProps={{
          paper: {
            sx: {
              width: '80%',
              maxWidth: '500px',
              [theme.breakpoints.down('sm')]: {
                width: '100%'
              }
            }
          }
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            overflowX: 'hidden',
            pageBreakBefore: 'avoid',
            pageBreakInside: 'avoid',
            padding: theme.spacing(2.5),
            paddingTop: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              alignContent: 'stretch',
              flexWrap: 'nowrap'
            }}
          >
            <Row
              style={{
                position: 'sticky',
                paddingTop: theme.spacing(1),
                zIndex: 20000,
                top: '0px',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <IconButton size="large" onClick={onCloseNotificationArea}>
                <CloseOutlinedIcon fontSize="medium" />
              </IconButton>
            </Row>
            {(systemMessage || (currentUser && currentUser.is_admin)) && (
              <>
                <Row style={{ paddingTop: theme.spacing(2) }}>
                  <NotificationColor
                    component={SystemMessageIcon}
                    severity={systemMessage?.severity}
                    colorType={1}
                    sx={{
                      color: 'inherit',
                      backgroundColor: 'inherit',
                      marginLeft: theme.spacing(1.5),
                      marginRight: theme.spacing(1.5)
                    }}
                  />
                  <NotificationColor
                    component={Typography}
                    severity={systemMessage?.severity}
                    colorType={2}
                    variant="h6"
                    children={t('systemMessage.header')}
                    sx={{
                      fontSize: 'large',
                      fontWeight: 'bolder',
                      flex: 1
                    }}
                  />
                  {currentUser &&
                    currentUser.is_admin &&
                    (systemMessage ? (
                      <>
                        <div style={{ paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
                          <Tooltip title={t('edit.title')} aria-label={t('edit.title')}>
                            <NotificationColor
                              component={IconButton}
                              severity={systemMessage?.severity}
                              colorType={2}
                              size="small"
                              onClick={onOpenEditSystemMessageDialog}
                              children={<EditOutlinedIcon />}
                            />
                          </Tooltip>
                        </div>
                        <div style={{ paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
                          <Tooltip title={t('delete.title')} aria-label={t('delete.title')}>
                            <NotificationColor
                              component={IconButton}
                              severity={systemMessage?.severity}
                              colorType={2}
                              size="small"
                              onClick={() => setDeleteConfirmation(true)}
                              children={<DeleteOutlineOutlinedIcon />}
                            />
                          </Tooltip>
                        </div>
                      </>
                    ) : (
                      <div style={{ paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
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
                </Row>
                <NotificationColor
                  component={Divider}
                  severity={systemMessage?.severity}
                  backgroundColorType={2}
                  variant="fullWidth"
                  sx={{
                    marginBottom: theme.spacing(2),
                    width: '100%',
                    '@media print': {
                      backgroundColor: '#0000001f !important'
                    }
                  }}
                />
                {systemMessage ? (
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      paddingTop: theme.spacing(1.25),
                      paddingBottom: theme.spacing(1.25)
                    }}
                  >
                    <NotificationColor
                      component={Typography}
                      severity={systemMessage?.severity}
                      colorType={2}
                      variant="body1"
                      children={systemMessage.title}
                      sx={{
                        fontSize: 'large',
                        fontWeight: 'bolder',
                        paddingLeft: theme.spacing(1.25)
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="textPrimary"
                      children={systemMessage.message}
                      sx={{
                        paddingLeft: theme.spacing(1.25)
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      children={systemMessage.user}
                      sx={{
                        textAlign: 'right',
                        paddingTop: theme.spacing(1),
                        paddingRight: theme.spacing(1)
                      }}
                    />
                  </div>
                ) : (
                  <Row style={{ justifyContent: 'center' }}>
                    <Typography variant="body2" color="secondary" children={t(`systemMessage.none`)} />
                  </Row>
                )}
              </>
            )}
            <Row style={{ paddingTop: theme.spacing(2) }}>
              <FeedbackOutlinedIcon
                fontSize="medium"
                sx={{
                  color: 'inherit',
                  backgroundColor: 'inherit',
                  marginLeft: theme.spacing(1.5),
                  marginRight: theme.spacing(1.5)
                }}
              />
              <Typography
                variant="h6"
                children={t(`notification.header`)}
                sx={{ fontSize: 'large', fontWeight: 'bolder', flex: 1 }}
              />
            </Row>
            <Divider
              variant="fullWidth"
              sx={{
                marginBottom: theme.spacing(2),
                width: '100%',
                '@media print': {
                  backgroundColor: '#0000001f !important'
                }
              }}
            />
            {notifications === null ? (
              <Row>
                <Skeleton variant="text" animation="wave" sx={{ width: '100%', height: theme.spacing(8) }} />
              </Row>
            ) : notifications.length === 0 ? (
              <Row style={{ justifyContent: 'center' }}>
                <Typography variant="body2" color="secondary" children={t('notification.none')} />
              </Row>
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
