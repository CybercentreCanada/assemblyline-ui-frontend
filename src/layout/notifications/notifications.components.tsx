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
import type { SelectChangeEvent, SvgIconProps } from '@mui/material';
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
  FormControl,
  Link,
  MenuItem,
  Select,
  Skeleton,
  styled,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useApiMutation } from 'core/api';
import { useAppConfigStore, useAppSetConfigStore } from 'core/config';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppSnackbar } from 'core/snackbar';
import DOMPurify from 'dompurify';
import type { JSONFeedAuthor, JSONFeedItem } from 'layout/notifications';
import {
  useNotificationClose,
  useNotificationFeed,
  useNotificationNewCount,
  useNotificationOpen
} from 'layout/notifications';
import { getBackgroundColor, getColor } from 'layout/notifications/notifications.utils';
import type { SystemMessage } from 'models/api/user';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { IconButton } from 'ui/buttons/IconButton';
import ConfirmationDialog from 'ui/ConfirmationDialog';
import { CustomChip } from 'ui/CustomChip';
import Moment from 'ui/Moment';

//*****************************************************************************************
// Constants & Styled Components
//*****************************************************************************************

const Row = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  width: '100%'
}));

Row.displayName = 'Row';

const Description = styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: theme.typography.body2.fontFamily,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  letterSpacing: theme.typography.body2.letterSpacing,
  lineHeight: theme.typography.body2.lineHeight,
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  },
  '& > *': {
    marginBlockEnd: theme.spacing(0.5),
    marginBlockStart: theme.spacing(0.5)
  }
}));

Description.displayName = 'Description';

//*****************************************************************************************
// SystemMessageIcon
//*****************************************************************************************

export type SystemMessageIconProps = SvgIconProps & {
  severity?: SystemMessage['severity'];
};

const SystemMessageIcon = memo(({ severity, fontSize = 'medium', style, ...props }: SystemMessageIconProps) => {
  const theme = useTheme();

  const Icon =
    {
      error: ErrorOutlineOutlinedIcon,
      info: InfoOutlinedIcon,
      success: CheckCircleOutlinedIcon,
      warning: ReportProblemOutlinedIcon
    }?.[severity] ?? NotificationsOutlinedIcon;

  return (
    <Icon
      fontSize={fontSize}
      style={{
        backgroundColor: 'inherit',
        color: 'inherit',
        marginLeft: theme.spacing(1.5),
        marginRight: theme.spacing(1.5),
        ...getColor(severity, 1, theme),
        ...style
      }}
      {...props}
    />
  );
});

SystemMessageIcon.displayName = 'SystemMessageIcon';

//*****************************************************************************************
// NotificationAuthor
//*****************************************************************************************

export type NotificationAuthorProps = {
  author: JSONFeedAuthor;
};

const NotificationAuthor = memo(({ author }: NotificationAuthorProps) => {
  const theme = useTheme();

  return !author ? null : !author?.url ? (
    <div style={{ display: 'contents' }}>
      {!author.avatar ? null : (
        <img
          alt={author.avatar}
          src={author.avatar}
          style={{
            borderRadius: '50%',
            color: theme.palette.text.secondary,
            marginLeft: theme.spacing(0.25),
            marginRight: theme.spacing(0.25),
            maxHeight: '25px'
          }}
        />
      )}
      {!author.name ? null : (
        <Typography
          color="textSecondary"
          sx={{
            color: theme.palette.text.secondary,
            marginLeft: theme.spacing(0.25),
            marginRight: theme.spacing(0.25)
          }}
          variant="caption"
        >
          {author.name}
        </Typography>
      )}
    </div>
  ) : (
    <Link
      href={author.url}
      rel="noopener noreferrer"
      style={{ display: 'contents' }}
      target="_blank"
      title={author.url}
    >
      {!author.avatar ? null : (
        <img
          alt={author.avatar}
          src={author.avatar}
          style={{
            borderRadius: '50%',
            color: theme.palette.text.secondary,
            marginLeft: theme.spacing(0.25),
            marginRight: theme.spacing(0.25),
            maxHeight: '25px'
          }}
        />
      )}
      {!author.name ? null : (
        <Typography
          color="textSecondary"
          sx={{
            color: theme.palette.text.secondary,
            marginLeft: theme.spacing(0.25),
            marginRight: theme.spacing(0.25),
            transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
            '&:hover': {
              color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark
            }
          }}
          variant="caption"
        >
          {author.name}
        </Typography>
      )}
    </Link>
  );
});

NotificationAuthor.displayName = 'NotificationAuthor';

//*****************************************************************************************
// NotificationItem
//*****************************************************************************************

export type NotificationItemProps = {
  hideDivider?: boolean;
  notification: JSONFeedItem;
};

const NotificationItem = memo(({ hideDivider = false, notification }: NotificationItemProps) => {
  const theme = useTheme();

  return !notification ? null : (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: theme.spacing(1.25),
          width: '100%'
        }}
      >
        <Typography color="secondary" sx={{ lineHeight: 'revert' }} variant="caption">
          <Moment variant="localeDate">{notification.date_published}</Moment>
        </Typography>

        <div style={{ alignItems: 'center', display: 'flex', width: '100%' }}>
          {!notification.url ? (
            <Typography
              color="secondary"
              sx={{
                color: theme.palette.primary.main,
                flex: 1,
                fontSize: 'large',
                fontWeight: notification._isNew ? 800 : 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              variant="body1"
            >
              {notification.title}
            </Typography>
          ) : (
            <div>
              <Link
                href={notification.url}
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  width: '100%'
                }}
                target="_blank"
                title={notification.url}
              >
                <Typography
                  color="secondary"
                  sx={{
                    color: theme.palette.primary.main,
                    flex: 1,
                    fontSize: 'large',
                    fontWeight: notification._isNew ? 800 : 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
                    '&:hover': {
                      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
                    }
                  }}
                  variant="body1"
                >
                  {notification.title}
                </Typography>
              </Link>
            </div>
          )}
        </div>

        {notification.content_md ? (
          <div>
            <Description>
              <Markdown components={{ a: props => <Link href={props.href}>{props.children}</Link> }}>
                {notification.content_md}
              </Markdown>
            </Description>
          </div>
        ) : notification.content_html ? (
          <div>
            <Description
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(notification.content_html, { USE_PROFILES: { html: true } })
              }}
            />
          </div>
        ) : notification.content_text ? (
          <div>
            <Description>{notification.content_text}</Description>
          </div>
        ) : null}

        {!notification.image ? null : (
          <div style={{ display: 'grid', justifyContent: 'center' }}>
            <img
              alt={notification.image}
              src={notification.image}
              style={{
                borderRadius: '5px',
                maxHeight: '256px',
                maxWidth: '256px',
                marginTop: '8px'
              }}
            />
          </div>
        )}

        {!notification.authors ? null : (
          <div
            style={{
              alignItems: 'center',
              color: theme.palette.secondary.main,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'right',
              paddingRight: theme.spacing(1),
              paddingTop: theme.spacing(1),
              width: '100%'
            }}
          >
            <div style={{ flexGrow: 1 }}>
              {notification.tags
                ?.filter(tag => ['new', 'current', 'dev', 'service', 'blog', 'community'].includes(tag))
                .map((tag, i) => (
                  <CustomChip
                    key={`tag-${i}`}
                    color={
                      tag === 'new'
                        ? 'info'
                        : tag === 'current'
                          ? 'success'
                          : tag === 'dev' || tag === 'community'
                            ? 'warning'
                            : tag === 'service'
                              ? 'secondary'
                              : 'default'
                    }
                    label={tag}
                    size="small"
                    sx={{
                      marginLeft: theme.spacing(0.25),
                      marginRight: theme.spacing(0.25),
                      textTransform: 'capitalize'
                    }}
                    type="round"
                    variant="outlined"
                  />
                ))}
            </div>
            {notification.authors
              .filter((_, i) => i < 2)
              .map((author, i) => (
                <NotificationAuthor key={`${i} - ${author.name}`} author={author} />
              ))}
          </div>
        )}
      </div>

      {hideDivider ? null : (
        <Divider
          variant="fullWidth"
          sx={{
            width: '95%',
            '@media print': {
              backgroundColor: '#0000001f !important'
            }
          }}
        />
      )}
    </>
  );
});

NotificationItem.displayName = 'NotificationItem';

//*****************************************************************************************
// AnnouncementSection
//*****************************************************************************************

export type AnnouncementSectionProps = Record<string, never>;

export const AnnouncementSection = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const systemMessage = useAppConfigStore(s => s?.systemMessage ?? null);
  const currentUser = useAppConfigStore(s => s?.user);
  const setInterfaceStore = useAppSetInterfaceStore();

  const handleOpenCreateDialog = useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.announcementDraft = {
        message: '',
        severity: 'info',
        title: '',
        user: currentUser?.uname || currentUser?.name || ''
      };
      s.notifications.announcementEditOpen = true;
      return s;
    });
  }, [currentUser, setInterfaceStore]);

  const handleOpenEditDialog = useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.announcementDraft = { ...systemMessage };
      s.notifications.announcementEditOpen = true;
      return s;
    });
  }, [setInterfaceStore, systemMessage]);

  const handleOpenDeleteDialog = useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.announcementDeleteOpen = true;
      return s;
    });
  }, [setInterfaceStore]);

  const color2Style = getColor(systemMessage?.severity, 2, theme);

  return !(systemMessage || currentUser?.is_admin) ? null : (
    <>
      <Row style={{ paddingTop: theme.spacing(2) }}>
        <SystemMessageIcon severity={systemMessage?.severity} />
        <Typography
          variant="h6"
          sx={{
            fontSize: 'large',
            fontWeight: 'bolder',
            flex: 1,
            ...color2Style
          }}
        >
          {t('systemMessage.header')}
        </Typography>
        {!currentUser?.is_admin ? null : !systemMessage ? (
          <div style={{ paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
            <Tooltip aria-label={t('add.title')} title={t('add.title')}>
              <IconButton color="inherit" size="small" onClick={handleOpenCreateDialog}>
                <AddOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <>
            <div style={{ paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
              <Tooltip aria-label={t('edit.title')} title={t('edit.title')}>
                <IconButton size="small" onClick={handleOpenEditDialog}>
                  <EditOutlinedIcon sx={{ ...color2Style }} />
                </IconButton>
              </Tooltip>
            </div>
            <div style={{ paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
              <Tooltip aria-label={t('delete.title')} title={t('delete.title')}>
                <IconButton size="small" onClick={handleOpenDeleteDialog}>
                  <DeleteOutlineOutlinedIcon sx={{ ...color2Style }} />
                </IconButton>
              </Tooltip>
            </div>
          </>
        )}
      </Row>

      <Divider
        variant="fullWidth"
        sx={{
          marginBottom: theme.spacing(2),
          width: '100%',
          ...getBackgroundColor(systemMessage?.severity, 2, theme),
          '@media print': {
            backgroundColor: '#0000001f !important'
          }
        }}
      />

      {!systemMessage ? (
        <Row style={{ justifyContent: 'center' }}>
          <Typography color="secondary" variant="body2">
            {t('systemMessage.none')}
          </Typography>
        </Row>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: theme.spacing(1.25),
            paddingTop: theme.spacing(1.25),
            width: '100%'
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: 'large',
              fontWeight: 'bolder',
              paddingLeft: theme.spacing(1.25),
              ...color2Style
            }}
          >
            {systemMessage.title}
          </Typography>
          <Typography
            color="textPrimary"
            variant="body2"
            sx={{
              paddingLeft: theme.spacing(1.25)
            }}
          >
            {systemMessage.message}
          </Typography>
          <Typography
            color="textSecondary"
            variant="caption"
            sx={{
              paddingRight: theme.spacing(1),
              paddingTop: theme.spacing(1),
              textAlign: 'right'
            }}
          >
            {systemMessage.user}
          </Typography>
        </div>
      )}
    </>
  );
});

AnnouncementSection.displayName = 'AnnouncementSection';

//*****************************************************************************************
// AnnouncementEditDialog
//*****************************************************************************************

export type AnnouncementEditDialogProps = Record<string, never>;

export const AnnouncementEditDialog = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const systemMessage = useAppConfigStore(s => s?.systemMessage ?? null);
  const isEditDialogOpen = useAppInterfaceStore(s => s.notifications.announcementEditOpen);
  const draftTitle = useAppInterfaceStore(s => s.notifications.announcementDraft.title);
  const draftMessage = useAppInterfaceStore(s => s.notifications.announcementDraft.message);
  const draftSeverity = useAppInterfaceStore(s => s.notifications.announcementDraft.severity);
  const setInterfaceStore = useAppSetInterfaceStore();

  const handleSeverityChange = useCallback(
    (event: SelectChangeEvent) => {
      if (!['error', 'warning', 'info', 'success'].includes(event.target.value)) return;
      const val = event.target.value as SystemMessage['severity'];
      setInterfaceStore(s => {
        s.notifications.announcementDraft.severity = val;
        return s;
      });
    },
    [setInterfaceStore]
  );

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value;
      setInterfaceStore(s => {
        s.notifications.announcementDraft.title = val;
        return s;
      });
    },
    [setInterfaceStore]
  );

  const handleMessageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = event.target.value;
      setInterfaceStore(s => {
        s.notifications.announcementDraft.message = val;
        return s;
      });
    },
    [setInterfaceStore]
  );

  const handleCancel = useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.announcementEditOpen = false;
      return s;
    });
  }, [setInterfaceStore]);

  const handleSave = useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.saveConfirmationOpen = true;
      return s;
    });
  }, [setInterfaceStore]);

  return (
    <Dialog
      aria-describedby="na-dialog-description"
      aria-labelledby="na-dialog-title"
      fullWidth
      open={isEditDialogOpen}
      onClose={handleCancel}
    >
      <DialogTitle id="na-dialog-title">{!systemMessage ? t('add.title') : t('edit.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="na-dialog-description">{t('edit.text')}</DialogContentText>
      </DialogContent>
      <DialogContent>
        <Typography variant="subtitle2">{t('edit.severity')}</Typography>
        <FormControl fullWidth size="small">
          <Select
            fullWidth
            id="na-severity"
            onChange={handleSeverityChange}
            style={{ marginBottom: theme.spacing(2) }}
            value={!draftSeverity ? 'info' : draftSeverity}
            variant="outlined"
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
          fullWidth
          onChange={handleTitleChange}
          size="small"
          style={{ marginBottom: theme.spacing(2) }}
          value={!draftTitle ? '' : draftTitle}
          variant="outlined"
        />

        <Typography variant="subtitle2">{t('edit.message')}</Typography>
        <TextField
          fullWidth
          multiline
          onChange={handleMessageChange}
          rows={4}
          size="small"
          value={!draftMessage ? '' : draftMessage}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleCancel}>
          {t('edit.button.cancel')}
        </Button>
        <Button color="primary" disabled={!draftMessage?.trim()} onClick={handleSave}>
          {t('edit.button.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AnnouncementEditDialog.displayName = 'AnnouncementEditDialog';

//*****************************************************************************************
// AnnouncementSaveConfirmation
//*****************************************************************************************

export type AnnouncementSaveConfirmationProps = Record<string, never>;

export const AnnouncementSaveConfirmation = memo(() => {
  const { t } = useTranslation(['notifications']);
  const { showSuccessMessage } = useAppSnackbar();
  const saveConfirmationOpen = useAppInterfaceStore(s => s.notifications.saveConfirmationOpen);
  const draftMessage = useAppInterfaceStore(s => s.notifications.announcementDraft);
  const setInterfaceStore = useAppSetInterfaceStore();
  const setConfigStore = useAppSetConfigStore();

  const handleClose = useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.saveConfirmationOpen = false;
      return s;
    });
  }, [setInterfaceStore]);

  const handleSaveMutation = useApiMutation(() => ({
    body: draftMessage,
    method: 'PUT',
    url: '/api/v4/system/system_message/',
    onSuccess: () => {
      showSuccessMessage(t('save.success'));
      setConfigStore(c => ({ ...c, systemMessage: draftMessage }));
      setInterfaceStore(s => {
        s.notifications.announcementEditOpen = false;
        s.notifications.saveConfirmationOpen = false;
        return s;
      });
    }
  }));

  const handleAccept = useCallback(() => {
    handleSaveMutation.mutate();
  }, [handleSaveMutation]);

  return (
    <ConfirmationDialog
      acceptText={t('save.acceptText')}
      cancelText={t('save.cancelText')}
      handleAccept={handleAccept}
      handleClose={handleClose}
      open={saveConfirmationOpen}
      text={t('save.text')}
      title={t('save.title')}
      waiting={handleSaveMutation.isPending}
    />
  );
});

AnnouncementSaveConfirmation.displayName = 'AnnouncementSaveConfirmation';

//*****************************************************************************************
// AnnouncementDeleteDialog
//*****************************************************************************************

export type AnnouncementDeleteDialogProps = Record<string, never>;

export const AnnouncementDeleteDialog = memo(() => {
  const { t } = useTranslation(['notifications']);
  const { showSuccessMessage } = useAppSnackbar();
  const deleteConfirmationOpen = useAppInterfaceStore(s => s.notifications.announcementDeleteOpen);
  const setInterfaceStore = useAppSetInterfaceStore();
  const setConfigStore = useAppSetConfigStore();

  const handleClose = useCallback(() => {
    setInterfaceStore(s => {
      s.notifications.announcementDeleteOpen = false;
      return s;
    });
  }, [setInterfaceStore]);

  const handleDeleteMutation = useApiMutation(() => ({
    body: null,
    method: 'DELETE',
    url: '/api/v4/system/system_message/',
    onSuccess: () => {
      showSuccessMessage(t('delete.success'));
      setConfigStore(c => ({ ...c, systemMessage: null }));
      setInterfaceStore(s => {
        s.notifications.announcementDeleteOpen = false;
        return s;
      });
    }
  }));

  const handleAccept = useCallback(() => {
    handleDeleteMutation.mutate();
  }, [handleDeleteMutation]);

  return (
    <ConfirmationDialog
      acceptText={t('delete.acceptText')}
      cancelText={t('delete.cancelText')}
      handleAccept={handleAccept}
      handleClose={handleClose}
      open={deleteConfirmationOpen}
      text={t('delete.text')}
      title={t('delete.title')}
      waiting={handleDeleteMutation.isPending}
    />
  );
});

AnnouncementDeleteDialog.displayName = 'AnnouncementDeleteDialog';

//*****************************************************************************************
// NotificationIconButton
//*****************************************************************************************

export type NotificationIconButtonProps = Record<string, never>;

export const NotificationIconButton = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const systemMessage = useAppConfigStore(s => s?.systemMessage ?? null);
  const isSystemMessageRead = useAppInterfaceStore(s => s.notifications.read);
  const newNotificationsCount = useNotificationNewCount();
  const handleOpen = useNotificationOpen();

  const invisible = useMemo(
    () => (isSystemMessageRead || !systemMessage?.message) && newNotificationsCount === 0,
    [isSystemMessageRead, newNotificationsCount, systemMessage?.message]
  );

  const badgeContent = useMemo(() => {
    if (systemMessage) {
      switch (systemMessage.severity) {
        case 'error':
          return '!';
        case 'warning':
          return '!';
        case 'info':
          return 'i';
        case 'success':
          return '\u2714';
        default:
          return '';
      }
    }
    return newNotificationsCount;
  }, [newNotificationsCount, systemMessage]);

  return (
    <Tooltip aria-label={t('add.title')} title={t('notification.title')}>
      <IconButton aria-label="open drawer" color="inherit" onClick={handleOpen} size="large">
        <Badge
          badgeContent={badgeContent}
          invisible={invisible}
          max={99}
          slotProps={{
            badge: {
              style: {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                ...getBackgroundColor(systemMessage?.severity, 1, theme)
              }
            }
          }}
        >
          {invisible ? <NotificationsNoneOutlinedIcon /> : <NotificationsActiveOutlinedIcon />}
        </Badge>
      </IconButton>
    </Tooltip>
  );
});

NotificationIconButton.displayName = 'NotificationIconButton';

//*****************************************************************************************
// NotificationFeedHeader
//*****************************************************************************************

export type NotificationFeedHeaderProps = Record<string, never>;

export const NotificationFeedHeader = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();

  return (
    <>
      <Row style={{ paddingTop: theme.spacing(2) }}>
        <FeedbackOutlinedIcon
          fontSize="medium"
          sx={{
            backgroundColor: 'inherit',
            color: 'inherit',
            marginLeft: theme.spacing(1.5),
            marginRight: theme.spacing(1.5)
          }}
        />
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            fontSize: 'large',
            fontWeight: 'bolder'
          }}
        >
          {t('notification.header')}
        </Typography>
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
    </>
  );
});

NotificationFeedHeader.displayName = 'NotificationFeedHeader';

//*****************************************************************************************
// NotificationContent
//*****************************************************************************************

export type NotificationContentProps = Record<string, never>;

export const NotificationContent = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const isLoading = useAppInterfaceStore(s => s.notifications.loading);
  const notifications = useAppInterfaceStore(s => s.notifications.items);

  return isLoading ? (
    <Row>
      <Skeleton animation="wave" sx={{ height: theme.spacing(8), width: '100%' }} variant="text" />
    </Row>
  ) : !notifications?.length ? (
    <Row style={{ justifyContent: 'center' }}>
      <Typography color="secondary" variant="body2">
        {t('notification.none')}
      </Typography>
    </Row>
  ) : (
    <>
      {notifications.map((n, i) => (
        <NotificationItem key={n.id || i} hideDivider={i === notifications.length - 1} notification={n} />
      ))}
    </>
  );
});

NotificationContent.displayName = 'NotificationContent';

//*****************************************************************************************
// Notifications
//*****************************************************************************************

export type NotificationsProps = Record<string, never>;

export const Notifications = memo(() => {
  const theme = useTheme();
  const isDrawerOpen = useAppInterfaceStore(s => s.notifications.open);
  const handleClose = useNotificationClose();

  useNotificationFeed();

  return (
    <>
      <AnnouncementSaveConfirmation />
      <AnnouncementEditDialog />
      <AnnouncementDeleteDialog />
      <NotificationIconButton />
      <Drawer
        anchor="right"
        onClose={handleClose}
        open={isDrawerOpen}
        slotProps={{
          paper: {
            sx: {
              maxWidth: '500px',
              width: '80%',
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
            overflowX: 'hidden',
            pageBreakBefore: 'avoid',
            pageBreakInside: 'avoid',
            padding: theme.spacing(2.5),
            paddingTop: 0,
            width: '100%'
          }}
        >
          <div
            style={{
              alignContent: 'stretch',
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'nowrap',
              justifyContent: 'flex-start'
            }}
          >
            <Row
              style={{
                backgroundColor: theme.palette.background.paper,
                paddingTop: theme.spacing(1),
                position: 'sticky',
                top: '0px',
                zIndex: 20000
              }}
            >
              <IconButton size="large" onClick={handleClose}>
                <CloseOutlinedIcon fontSize="medium" />
              </IconButton>
            </Row>

            <AnnouncementSection />
            <NotificationFeedHeader />
            <NotificationContent />
          </div>
        </div>
      </Drawer>
    </>
  );
});

Notifications.displayName = 'Notifications';
