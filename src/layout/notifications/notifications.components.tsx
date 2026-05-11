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
import type { BadgeProps, SelectChangeEvent, SvgIconProps } from '@mui/material';
import {
  Badge,
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
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { useApiMutation } from 'core/api';
import { useAppConfig } from 'core/config';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppSnackbar } from 'core/snackbar';
import DOMPurify from 'dompurify';
import {
  useNotificationClose,
  useNotificationFeed,
  useNotificationNewCount,
  useNotificationOpen
} from 'layout/notifications/notifications.hooks';
import type { JSONFeedAuthor, JSONFeedItem } from 'layout/notifications/notifications.models';
import { formatDate, getBackgroundColor, getColor } from 'layout/notifications/notifications.utils';
import type { SystemMessage } from 'models/api/user';
import type { ChangeEvent, ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { Button } from 'ui/buttons/Button';
import { IconButton } from 'ui/buttons/IconButton';
import { CustomChip } from 'ui/CustomChip';

//*****************************************************************************************
// Constants
//*****************************************************************************************

const TAG_COLORS: Record<string, 'info' | 'success' | 'warning' | 'secondary' | 'default'> = {
  new: 'info',
  current: 'success',
  dev: 'warning',
  community: 'warning',
  service: 'secondary',
  blog: 'default'
};

const VISIBLE_TAGS = ['new', 'current', 'dev', 'service', 'blog', 'community'];

const DEFAULT_SYSTEM_MESSAGE: SystemMessage = {
  message: '',
  severity: 'info',
  title: '',
  user: ''
};

const ROW_STYLE = { width: '100%', display: 'flex', flexDirection: 'row' as const, alignItems: 'center' as const };

//*****************************************************************************************
// SystemMessageIcon
//*****************************************************************************************

type SystemMessageIconProps = SvgIconProps & { severity?: SystemMessage['severity'] };

const SystemMessageIcon = memo(({ severity, fontSize = 'medium', ...props }: SystemMessageIconProps) => {
  const iconMap: Record<string, typeof ErrorOutlineOutlinedIcon> = {
    error: ErrorOutlineOutlinedIcon,
    warning: ReportProblemOutlinedIcon,
    info: InfoOutlinedIcon,
    success: CheckCircleOutlinedIcon
  };

  const Icon = iconMap[severity] ?? NotificationsOutlinedIcon;
  return <Icon fontSize={fontSize} {...props} />;
});

SystemMessageIcon.displayName = 'SystemMessageIcon';

//*****************************************************************************************
// NotificationAuthor
//*****************************************************************************************

const NotificationAuthor = memo(({ author }: { author: JSONFeedAuthor }) => {
  const theme = useTheme();

  const content = useMemo(
    () => (
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
    ),
    [author, theme]
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
// NotificationItem
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

    return notification.content_text ? <>{notification.content_text}</> : null;
  }, [notification.content_html, notification.content_md, notification.content_text]);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.75),
        padding: `${theme.spacing(1.25)} ${theme.spacing(0.5)}`
      }}
    >
      <Typography variant="caption" color="textSecondary">
        {formatDate(notification.date_published)}
      </Typography>

      {notification.url ? (
        <Link href={notification.url} target="_blank" rel="noopener noreferrer" underline="none">
          <Typography
            variant="subtitle1"
            style={{ fontWeight: notification._isNew ? 700 : 500, color: theme.palette.primary.main }}
          >
            {notification.title}
          </Typography>
        </Link>
      ) : (
        <Typography variant="subtitle1" style={{ fontWeight: notification._isNew ? 700 : 500 }}>
          {notification.title}
        </Typography>
      )}

      {content ? (
        <Typography variant="body2" component="div">
          {content}
        </Typography>
      ) : null}

      {notification.tags?.length ? (
        <div style={{ ...ROW_STYLE, flexWrap: 'wrap', gap: theme.spacing(0.5) }}>
          {notification.tags
            .filter(tag => VISIBLE_TAGS.includes(tag))
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
        </div>
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
        <div
          style={{ ...ROW_STYLE, justifyContent: 'flex-end', gap: theme.spacing(0.5), paddingTop: theme.spacing(0.5) }}
        >
          {notification.authors
            .filter((_, i) => i < 2)
            .map((author, i) => (
              <NotificationAuthor key={`${notification.id}-author-${i}`} author={author} />
            ))}
        </div>
      ) : null}
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

//*****************************************************************************************
// AnnouncementActions
//*****************************************************************************************

const AnnouncementActions = memo(() => {
  const { t } = useTranslation(['notifications']);
  const isAdmin = useAppConfig(s => Boolean(s?.user?.is_admin));
  const systemMessage = useAppConfig(s => s?.systemMessage ?? null);
  const setInterface = useAppSetInterfaceStore();

  const handleOpenCreateDialog = useCallback(() => {
    setInterface(s => {
      s.notifications.announcementDraft = { ...DEFAULT_SYSTEM_MESSAGE };
      s.notifications.announcementEditOpen = true;
      return s;
    });
  }, [setInterface]);

  const handleOpenEditDialog = useCallback(() => {
    setInterface(s => {
      s.notifications.announcementDraft = { ...(systemMessage as SystemMessage) };
      s.notifications.announcementEditOpen = true;
      return s;
    });
  }, [setInterface, systemMessage]);

  const handleOpenDeleteDialog = useCallback(() => {
    setInterface(s => {
      s.notifications.announcementDeleteOpen = true;
      return s;
    });
  }, [setInterface]);

  return isAdmin ? (
    <div style={{ ...ROW_STYLE, width: 'auto' }}>
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
    </div>
  ) : null;
});

AnnouncementActions.displayName = 'AnnouncementActions';

//*****************************************************************************************
// AnnouncementContent
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
// AnnouncementSaveConfirmation
//*****************************************************************************************

const AnnouncementSaveConfirmation = memo(() => {
  const { t } = useTranslation(['notifications']);
  const { showSuccessMessage } = useAppSnackbar();
  const saveConfirmationOpen = useAppInterfaceStore(s => s.notifications.saveConfirmationOpen);
  const draftMessage = useAppInterfaceStore(s => s.notifications.announcementDraft);
  const setInterface = useAppSetInterfaceStore();

  const handleCloseDialog = useCallback(() => {
    setInterface(s => {
      s.notifications.saveConfirmationOpen = false;
      return s;
    });
  }, [setInterface]);

  const handleSaveSystemMessage = useApiMutation(() => ({
    url: '/api/v4/system/system_message/',
    method: 'PUT',
    body: draftMessage,
    onSuccess: () => {
      showSuccessMessage(t('save.success'));
      setInterface(s => {
        s.notifications.saveConfirmationOpen = false;
        s.notifications.announcementEditOpen = false;
        return s;
      });
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
// AnnouncementEditDialog
//*****************************************************************************************

const AnnouncementEditDialog = memo(() => {
  const { t } = useTranslation(['notifications']);
  const isEditDialogOpen = useAppInterfaceStore(s => s.notifications.announcementEditOpen);
  const isSaving = useAppInterfaceStore(s => s.notifications.announcementSaving);
  const title = useAppInterfaceStore(s => s.notifications.announcementDraft.title);
  const message = useAppInterfaceStore(s => s.notifications.announcementDraft.message);
  const severity = useAppInterfaceStore(s => s.notifications.announcementDraft.severity);
  const systemMessage = useAppConfig(s => (s?.systemMessage ?? null) as SystemMessage | null);
  const setInterface = useAppSetInterfaceStore();

  const handleSeverityChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value as SystemMessage['severity'];
      setInterface(s => {
        s.notifications.announcementDraft.severity = value;
        return s;
      });
    },
    [setInterface]
  );

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInterface(s => {
        s.notifications.announcementDraft.title = event.target.value;
        return s;
      });
    },
    [setInterface]
  );

  const handleMessageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInterface(s => {
        s.notifications.announcementDraft.message = event.target.value;
        return s;
      });
    },
    [setInterface]
  );

  const handleCancel = useCallback(() => {
    setInterface(s => {
      s.notifications.announcementEditOpen = false;
      return s;
    });
  }, [setInterface]);

  const handleAccept = useCallback(() => {
    setInterface(s => {
      s.notifications.saveConfirmationOpen = true;
      return s;
    });
  }, [setInterface]);

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
// AnnouncementDeleteDialog
//*****************************************************************************************

const AnnouncementDeleteDialog = memo(() => {
  const { t } = useTranslation(['notifications']);
  const { showSuccessMessage } = useAppSnackbar();
  const isDeleteDialogOpen = useAppInterfaceStore(s => s.notifications.announcementDeleteOpen);
  const setInterface = useAppSetInterfaceStore();

  const handleCloseDialog = useCallback(() => {
    setInterface(s => {
      s.notifications.announcementDeleteOpen = false;
      return s;
    });
  }, [setInterface]);

  const handleDeleteSystemMessage = useApiMutation(() => ({
    url: '/api/v4/system/system_message/',
    method: 'DELETE',
    body: null,
    onSuccess: () => {
      showSuccessMessage(t('delete.success'));
      setInterface(s => {
        s.notifications.announcementDeleteOpen = false;
        return s;
      });
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
// NotificationFeedHeader
//*****************************************************************************************

const NotificationFeedHeader = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();

  return (
    <>
      <div style={ROW_STYLE}>
        <FeedbackOutlinedIcon
          fontSize="medium"
          style={{ marginLeft: theme.spacing(1.5), marginRight: theme.spacing(1.5) }}
        />
        <Typography variant="h6" style={{ fontSize: 'large', fontWeight: 'bolder', flex: 1 }}>
          {t('notification.header')}
        </Typography>
      </div>
      <Divider style={{ marginBottom: '16px', width: '100%' }} />
    </>
  );
});

NotificationFeedHeader.displayName = 'NotificationFeedHeader';

//*****************************************************************************************
// NotificationContent
//*****************************************************************************************

const NotificationContent = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const isLoading = useAppInterfaceStore(s => s.notifications.loading);
  const notifications = useAppInterfaceStore(s => s.notifications.items);

  return isLoading ? (
    <div style={ROW_STYLE}>
      <Skeleton variant="text" animation="wave" style={{ width: '100%', height: theme.spacing(8) }} />
    </div>
  ) : notifications.length === 0 ? (
    <div style={{ ...ROW_STYLE, justifyContent: 'center' }}>
      <Typography variant="body2" color="secondary">
        {t('notification.none')}
      </Typography>
    </div>
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
// AnnouncementSection
//*****************************************************************************************

export const AnnouncementSection = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const systemMessage = useAppConfig(s => s?.systemMessage);

  return (
    <>
      <div style={{ ...ROW_STYLE, paddingTop: theme.spacing(2) }}>
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
      </div>

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
// NotificationIconButton
//*****************************************************************************************

const NotificationIconButton = memo(() => {
  const { t } = useTranslation(['notifications']);
  const theme = useTheme();
  const systemMessage = useAppConfig(s => s?.systemMessage);
  const isSystemMessageRead = useAppInterfaceStore(s => s.notifications.read);
  const newNotificationsCount = useNotificationNewCount();
  const handleOpen = useNotificationOpen();

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
// NotificationCloseButton
//*****************************************************************************************

const NotificationCloseButton = memo(() => {
  const theme = useTheme();
  const handleClose = useNotificationClose();

  return (
    <div
      style={{
        ...ROW_STYLE,
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
    </div>
  );
});

NotificationCloseButton.displayName = 'NotificationCloseButton';

//*****************************************************************************************
// NotificationDrawer
//*****************************************************************************************

const NotificationDrawer = memo(({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const isDrawerOpen = useAppInterfaceStore(s => s.notifications.open);
  const handleClose = useNotificationClose();

  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={handleClose}
      slotProps={{ paper: { style: { width: '80%', maxWidth: '500px' } } }}
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
  useNotificationFeed();

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
