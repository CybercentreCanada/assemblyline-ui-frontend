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
import {
  Badge,
  type BadgeProps,
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
  type SelectChangeEvent,
  Skeleton,
  styled,
  type SvgIconProps,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { useApiMutation } from 'core/api';
import { useAppConfig, useAppSetConfig } from 'core/config';
import { useAppSnackbar } from 'core/snackbar';
import DOMPurify from 'dompurify';
import type { SystemMessage } from 'models/api/user';
import type { ChangeEvent, ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { Button } from 'ui/buttons/Button';
import { IconButton } from 'ui/buttons/IconButton';
import { CustomChip } from 'ui/CustomChip';
import { useNotificationAutoRefresh, useNotificationClose } from './notifications.hooks';
import type { JSONFeedAuthor, JSONFeedItem } from './notifications.models';
import { DEFAULT_SYSTEM_MESSAGE } from './notifications.models';
import { formatDate, getBackgroundColor, getColor } from './notifications.utils';

const Row = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
}));

const ItemContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
  padding: `${theme.spacing(1.25)} ${theme.spacing(0.5)}`
}));

type SystemMessageIconProps = SvgIconProps & {
  severity?: SystemMessage['severity'];
};

const SystemMessageIcon = memo(({ severity, fontSize = 'medium', ...props }: SystemMessageIconProps) => {
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
});

SystemMessageIcon.displayName = 'SystemMessageIcon';

const TAG_COLORS: Record<string, 'info' | 'success' | 'warning' | 'secondary' | 'default'> = {
  new: 'info',
  current: 'success',
  dev: 'warning',
  community: 'warning',
  service: 'secondary',
  blog: 'default'
};

//*****************************************************************************************
// Notification Author
//*****************************************************************************************

const NotificationAuthor = memo(({ author }: { author: JSONFeedAuthor }) => {
  const theme = useTheme();

  const content = (
    <>
      {author?.avatar ? (
        <img
          src={author.avatar}
          alt={author.name || ''}
          style={{
            maxHeight: '25px',
            borderRadius: '50%',
            marginLeft: theme.spacing(0.25),
            marginRight: theme.spacing(0.25)
          }}
        />
      ) : null}
      {author?.name ? (
        <Typography
          variant="caption"
          color="text.secondary"
          style={{ marginLeft: theme.spacing(0.25), marginRight: theme.spacing(0.25) }}
        >
          {author.name}
        </Typography>
      ) : null}
    </>
  );

  return author?.url ? (
    <Link href={author.url} target="_blank" rel="noopener noreferrer" style={{ display: 'contents' }}>
      {content}
    </Link>
  ) : (
    <div style={{ display: 'contents' }}>{content}</div>
  );
});

NotificationAuthor.displayName = 'NotificationAuthor';

//*****************************************************************************************
// Notification Item
//*****************************************************************************************

const NotificationItem = memo(({ notification }: { notification: JSONFeedItem }) => {
  const theme = useTheme();

  const content = useMemo(() => {
    if (notification.content_md) {
      return (
        <Markdown
          components={{
            a: props => (
              <Link href={props.href} target="_blank" rel="noopener noreferrer">
                {props.children}
              </Link>
            )
          }}
        >
          {notification.content_md}
        </Markdown>
      );
    }

    if (notification.content_html) {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(notification.content_html, { USE_PROFILES: { html: true } })
          }}
        />
      );
    }

    if (notification.content_text) return <>{notification.content_text}</>;
    return null;
  }, [notification.content_html, notification.content_md, notification.content_text]);

  return (
    <ItemContainer>
      <Typography variant="caption" color="textSecondary">
        {formatDate(notification.date_published)}
      </Typography>

      {notification.url ? (
        <Link href={notification.url} target="_blank" rel="noopener noreferrer" underline="none">
          <Typography
            variant="subtitle1"
            style={{
              fontWeight: notification._isNew ? 700 : 500,
              color: theme.palette.primary.main
            }}
          >
            {notification.title}
          </Typography>
        </Link>
      ) : (
        <Typography variant="subtitle1" style={{ fontWeight: notification._isNew ? 700 : 500 }}>
          {notification.title}
        </Typography>
      )}

      {content ? <Typography variant="body2">{content}</Typography> : null}

      {notification.tags?.length ? (
        <Row style={{ flexWrap: 'wrap', gap: theme.spacing(0.5) }}>
          {notification.tags
            .filter(tag => ['new', 'current', 'dev', 'service', 'blog', 'community'].includes(tag))
            .map((tag, i) => (
              <CustomChip
                key={`${notification.id}-tag-${i}`}
                size="small"
                type="round"
                variant="outlined"
                color={TAG_COLORS[tag] || 'default'}
                label={tag}
                style={{ textTransform: 'capitalize' }}
              />
            ))}
        </Row>
      ) : null}

      {notification.image ? (
        <div style={{ display: 'grid', justifyContent: 'center' }}>
          <img
            src={notification.image}
            alt={notification.title || 'notification'}
            style={{ maxWidth: '256px', maxHeight: '256px', borderRadius: '5px', marginTop: '8px' }}
          />
        </div>
      ) : null}

      {notification.authors?.length ? (
        <Row style={{ justifyContent: 'flex-end', gap: theme.spacing(0.5), paddingTop: theme.spacing(0.5) }}>
          {notification.authors
            .filter((_, i) => i < 2)
            .map((author, i) => (
              <NotificationAuthor key={`${notification.id}-author-${i}`} author={author} />
            ))}
        </Row>
      ) : null}
    </ItemContainer>
  );
});

NotificationItem.displayName = 'NotificationItem';

//*****************************************************************************************
// Announcement Actions
//*****************************************************************************************

const AnnouncementActions = memo(() => {
  const { t } = useTranslation(['notifications']);

  const isAdmin = useAppConfig(s => Boolean(s?.user?.is_admin));
  const systemMessage = useAppConfig(s => s?.systemMessage ?? null);

  const setConfig = useAppSetConfig();

  const handleOpenCreateDialog = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: {
          ...prev.layout.notifications,
          announcementDraft: { ...DEFAULT_SYSTEM_MESSAGE },
          announcementEditOpen: true
        }
      }
    }));
  }, [setConfig]);

  const handleOpenEditDialog = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: {
          ...prev.layout.notifications,
          announcementDraft: { ...systemMessage },
          announcementEditOpen: true
        }
      }
    }));
  }, [setConfig, systemMessage]);

  const handleOpenDeleteDialog = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: { ...prev.layout.notifications, announcementDeleteOpen: true }
      }
    }));
  }, [setConfig]);

  return isAdmin ? (
    <Row style={{ width: 'auto' }}>
      {Boolean(systemMessage) ? (
        <>
          <IconButton size="small" onClick={handleOpenEditDialog} tooltip={t('edit.title')}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleOpenDeleteDialog} tooltip={t('delete.title')}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <IconButton size="small" onClick={handleOpenCreateDialog} tooltip={t('add.title')}>
          <AddOutlinedIcon fontSize="small" />
        </IconButton>
      )}
    </Row>
  ) : null;
});

AnnouncementActions.displayName = 'AnnouncementActions';

//*****************************************************************************************
// Announcement Content
//*****************************************************************************************

const AnnouncementContent = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const systemMessage = useAppConfig(s => (s?.systemMessage ?? null) as SystemMessage | null);

  return systemMessage ? (
    <>
      <Typography
        variant="body1"
        style={{ fontWeight: 700, paddingLeft: theme.spacing(1.25), ...getColor(systemMessage.severity, 2, theme) }}
      >
        {systemMessage.title || t('systemMessage.header')}
      </Typography>
      <Typography variant="body2" color="text.secondary" style={{ paddingLeft: theme.spacing(1.25) }}>
        {systemMessage.message}
      </Typography>
      {systemMessage.user ? (
        <Typography
          variant="caption"
          color="text.secondary"
          style={{ display: 'block', textAlign: 'right', paddingTop: theme.spacing(1), paddingRight: theme.spacing(1) }}
        >
          {systemMessage.user}
        </Typography>
      ) : null}
    </>
  ) : (
    <Typography variant="body2" color="text.secondary">
      {t('systemMessage.none')}
    </Typography>
  );
});

AnnouncementContent.displayName = 'AnnouncementContent';

//*****************************************************************************************
// Announcement Save Confirmation Dialog
//*****************************************************************************************

const AnnouncementSaveConfirmation = memo(() => {
  const { t } = useTranslation(['notifications']);
  const { showSuccessMessage } = useAppSnackbar();

  const saveConfirmationOpen = useAppConfig(s => s?.layout?.notifications?.saveConfirmationOpen ?? false);
  const draftMessage = useAppConfig(s => (s?.layout?.notifications?.announcementDraft ?? null) as SystemMessage | null);

  const setConfig = useAppSetConfig();

  const handleCloseDialog = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: { ...prev.layout.notifications, saveConfirmationOpen: false }
      }
    }));
  }, [setConfig]);

  const handleSaveSystemMessage = useApiMutation(() => ({
    url: '/api/v4/system/system_message/',
    method: 'PUT',
    body: draftMessage,
    onSuccess: () => {
      showSuccessMessage(t('save.success'));

      setConfig(prev => ({
        systemMessage: draftMessage,
        layout: {
          ...prev.layout,
          notifications: {
            ...prev.layout.notifications,
            saveConfirmationOpen: false,
            announcementEditOpen: false
          }
        }
      }));
    }
  }));

  return (
    <Dialog open={saveConfirmationOpen} onClose={handleCloseDialog}>
      <DialogTitle>{t('save.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('save.text')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} disabled={handleSaveSystemMessage.isPending}>
          {t('save.cancelText')}
        </Button>
        <Button
          color="primary"
          onClick={() => handleSaveSystemMessage.mutate()}
          progress={handleSaveSystemMessage.isPending}
        >
          {t('save.acceptText')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AnnouncementSaveConfirmation.displayName = 'AnnouncementSaveConfirmation';

//*****************************************************************************************
// Announcement Edit Dialog
//*****************************************************************************************

const AnnouncementEditDialog = memo(() => {
  const { t } = useTranslation(['notifications']);

  const isEditDialogOpen = useAppConfig(s => s?.layout?.notifications?.announcementEditOpen ?? false);
  const isSaving = useAppConfig(s => s?.layout?.notifications?.announcementSaving ?? false);
  const systemMessage = useAppConfig(s => (s?.systemMessage ?? null) as SystemMessage | null);
  const title = useAppConfig(s => s.layout.notifications.announcementDraft.title);
  const message = useAppConfig(s => s.layout.notifications.announcementDraft.message);
  const severity = useAppConfig(s => s.layout.notifications.announcementDraft.severity);

  const setConfig = useAppSetConfig();

  const handleSeverityChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value as SystemMessage['severity'];
      if (!['error', 'warning', 'info', 'success'].includes(value)) return;

      setConfig(prev => ({
        layout: {
          ...prev.layout,
          notifications: {
            ...prev.layout.notifications,
            announcementDraft: { ...prev.layout.notifications.announcementDraft, severity: value }
          }
        }
      }));
    },
    [setConfig]
  );

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setConfig(prev => ({
        layout: {
          ...prev.layout,
          notifications: {
            ...prev.layout.notifications,
            announcementDraft: { ...prev.layout.notifications.announcementDraft, title: event.target.value }
          }
        }
      }));
    },
    [setConfig]
  );

  const handleMessageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setConfig(prev => ({
        layout: {
          ...prev.layout,
          notifications: {
            ...prev.layout.notifications,
            announcementDraft: { ...prev.layout.notifications.announcementDraft, message: event.target.value }
          }
        }
      }));
    },
    [setConfig]
  );

  const handleCancel = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: { ...prev.layout.notifications, announcementEditOpen: false }
      }
    }));
  }, [setConfig]);

  const handleAccept = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: { ...prev.layout.notifications, saveConfirmationOpen: true }
      }
    }));
  }, [setConfig]);

  return (
    <Dialog fullWidth maxWidth="sm" open={isEditDialogOpen} onClose={handleCancel}>
      <DialogTitle>{Boolean(systemMessage) ? t('edit.title') : t('add.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ marginBottom: '16px' }}>{t('edit.text')}</DialogContentText>

        <Typography variant="subtitle2" style={{ marginTop: '8px', marginBottom: '6px' }}>
          {t('edit.severity')}
        </Typography>
        <FormControl fullWidth size="small" style={{ marginBottom: '16px' }}>
          <Select value={severity} onChange={handleSeverityChange}>
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
          size="small"
          value={title}
          onChange={handleTitleChange}
          style={{ marginBottom: '16px' }}
        />

        <Typography variant="subtitle2">{t('edit.message')}</Typography>
        <TextField fullWidth multiline rows={4} value={message} onChange={handleMessageChange} />
      </DialogContent>
      <DialogActions>
        <Button color="secondary" disabled={isSaving} onClick={handleCancel}>
          {t('edit.button.cancel')}
        </Button>
        <Button color="primary" disabled={isSaving || !message?.trim()} onClick={handleAccept}>
          {t('edit.button.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AnnouncementEditDialog.displayName = 'AnnouncementEditDialog';

//*****************************************************************************************
// Announcement Delete Dialog
//*****************************************************************************************

const AnnouncementDeleteDialog = memo(() => {
  const { t } = useTranslation(['notifications']);
  const { showSuccessMessage } = useAppSnackbar();

  const isDeleteDialogOpen = useAppConfig(s => s.layout.notifications.announcementDeleteOpen);

  const setConfig = useAppSetConfig();

  const handleCloseDialog = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: { ...prev.layout.notifications, announcementDeleteOpen: false }
      }
    }));
  }, [setConfig]);

  const handleDeleteSystemMessage = useApiMutation(() => ({
    url: '/api/v4/system/system_message/',
    method: 'DELETE',
    body: null,
    onSuccess: () => {
      showSuccessMessage(t('delete.success'));

      setConfig(prev => ({
        systemMessage: null,
        layout: {
          ...prev.layout,
          notifications: { ...prev.layout.notifications, announcementDeleteOpen: false }
        }
      }));
    }
  }));

  return (
    <Dialog fullWidth maxWidth="xs" open={isDeleteDialogOpen} onClose={handleCloseDialog}>
      <DialogTitle>{t('delete.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('delete.text')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} disabled={handleDeleteSystemMessage.isPending}>
          {t('delete.cancelText')}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => handleDeleteSystemMessage.mutate()}
          progress={handleDeleteSystemMessage.isPending}
        >
          {t('delete.acceptText')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AnnouncementDeleteDialog.displayName = 'AnnouncementDeleteDialog';

//*****************************************************************************************
// Notification Feed Header
//*****************************************************************************************

const NotificationFeedHeader = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();

  return (
    <>
      <Row style={{ paddingTop: theme.spacing(2) }}>
        <FeedbackOutlinedIcon
          fontSize="medium"
          style={{ marginLeft: theme.spacing(1.5), marginRight: theme.spacing(1.5) }}
        />
        <Typography variant="h6" style={{ fontSize: 'large', fontWeight: 'bolder', flex: 1 }}>
          {t('notification.header')}
        </Typography>
      </Row>
      <Divider style={{ marginBottom: '16px', width: '100%' }} />
    </>
  );
});

NotificationFeedHeader.displayName = 'NotificationFeedHeader';

//*****************************************************************************************
// Notifications Content
//*****************************************************************************************

const NotificationContent = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();

  const isLoading = useAppConfig(s => s?.layout?.notifications?.loading ?? false);
  const notifications = useAppConfig(s => s?.layout?.notifications?.items ?? []);

  return isLoading ? (
    <Row>
      <Skeleton variant="text" animation="wave" style={{ width: '100%', height: theme.spacing(8) }} />
    </Row>
  ) : notifications.length === 0 ? (
    <Row style={{ justifyContent: 'center' }}>
      <Typography variant="body2" color="secondary">
        {t('notification.none')}
      </Typography>
    </Row>
  ) : (
    <>
      {notifications.map((n, i) => (
        <NotificationItem key={n.id || i} notification={n} />
      ))}
    </>
  );
});

NotificationContent.displayName = 'NotificationContent';

//*****************************************************************************************
// Announcement Section
//*****************************************************************************************

export const AnnouncementSection = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();

  const systemMessage = useAppConfig(s => s?.systemMessage);

  return (
    <>
      <Row style={{ paddingTop: theme.spacing(2) }}>
        <SystemMessageIcon
          severity={systemMessage?.severity}
          style={{
            marginLeft: theme.spacing(1.5),
            marginRight: theme.spacing(1.5),
            ...getColor(systemMessage?.severity, 1, theme)
          }}
        />
        <Typography
          variant="h6"
          style={{
            fontSize: 'large',
            fontWeight: 'bolder',
            flex: 1,
            ...getColor(systemMessage?.severity, 2, theme)
          }}
        >
          {t('systemMessage.header')}
        </Typography>

        <AnnouncementActions />
      </Row>

      <Divider
        style={{
          marginBottom: '16px',
          width: '100%',
          ...getBackgroundColor(systemMessage?.severity, 2, theme)
        }}
      />

      <div
        style={{
          width: '100%',
          paddingTop: theme.spacing(1.25),
          paddingBottom: theme.spacing(1.25),
          marginBottom: theme.spacing(1.5)
        }}
      >
        <AnnouncementContent />
      </div>
    </>
  );
});

AnnouncementSection.displayName = 'AnnouncementSection';

//*****************************************************************************************
// Notification Icon Button
//*****************************************************************************************

const NotificationIconButton = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();

  const systemMessage = useAppConfig(s => s?.systemMessage);
  const isSystemMessageRead = useAppConfig(s => s?.layout?.notifications?.read ?? false);
  const newNotificationsCount = useAppConfig(
    s => (s?.layout?.notifications?.items ?? []).filter(notification => notification?._isNew).length
  );

  const setConfig = useAppSetConfig();

  const hasUnreadSystemMessage = useMemo(
    () => Boolean(systemMessage?.message) && !isSystemMessageRead,
    [isSystemMessageRead, systemMessage]
  );

  const invisible = useMemo<BadgeProps['invisible']>(
    () => !hasUnreadSystemMessage && newNotificationsCount === 0,
    [hasUnreadSystemMessage, newNotificationsCount]
  );

  const badgeContent = useMemo<BadgeProps['badgeContent']>(() => {
    if (!systemMessage) return newNotificationsCount;

    switch (systemMessage.severity) {
      case 'success':
        return '\u2714';
      case 'info':
        return 'i';
      case 'warning':
        return '!';
      case 'error':
        return '!';
      default:
        return '';
    }
  }, [newNotificationsCount, systemMessage]);

  const handleOpen = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        notifications: { ...prev.layout.notifications, open: true }
      }
    }));
  }, [setConfig]);

  return (
    <IconButton size="large" tooltip={t('notification.title')} onClick={handleOpen}>
      <Badge
        invisible={invisible}
        max={99}
        badgeContent={badgeContent}
        slotProps={{
          badge: {
            style: {
              color: theme.palette.getContrastText(theme.palette.primary.main),
              backgroundColor: theme.palette.primary.main,
              ...getBackgroundColor(systemMessage?.severity, 1, theme)
            }
          }
        }}
      >
        {invisible ? <NotificationsNoneOutlinedIcon /> : <NotificationsActiveOutlinedIcon />}
      </Badge>
    </IconButton>
  );
});

NotificationIconButton.displayName = 'NotificationIconButton';

//*****************************************************************************************
// Notification Close Button
//*****************************************************************************************

const NotificationCloseButton = memo(() => {
  const theme = useTheme();
  const handleClose = useNotificationClose();

  return (
    <Row
      style={{
        position: 'sticky',
        paddingTop: theme.spacing(1),
        zIndex: 20000,
        top: '0px',
        backgroundColor: theme.palette.background.paper
      }}
    >
      <IconButton size="large" onClick={handleClose}>
        <CloseOutlinedIcon fontSize="medium" />
      </IconButton>
    </Row>
  );
});

NotificationCloseButton.displayName = 'NotificationCloseButton';

//*****************************************************************************************
// Notification Drawer
//*****************************************************************************************

const NotificationDrawer = memo(({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  const isDrawerOpen = useAppConfig(s => s.layout.notifications.open);
  const handleClose = useNotificationClose();

  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={handleClose}
      slotProps={{
        paper: {
          style: {
            width: '80%',
            maxWidth: '500px'
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
          {children}
        </div>
      </div>
    </Drawer>
  );
});

NotificationDrawer.displayName = 'NotificationDrawer';

//*****************************************************************************************
// Notifications
//*****************************************************************************************

export const Notifications = memo(() => {
  useNotificationAutoRefresh();

  return (
    <>
      <AnnouncementSaveConfirmation />
      <AnnouncementEditDialog />
      <AnnouncementDeleteDialog />
      <NotificationIconButton />
      <NotificationDrawer>
        <NotificationCloseButton />
        <AnnouncementSection />
        <NotificationFeedHeader />
        <NotificationContent />
      </NotificationDrawer>
    </>
  );
});

Notifications.displayName = 'Notifications';
