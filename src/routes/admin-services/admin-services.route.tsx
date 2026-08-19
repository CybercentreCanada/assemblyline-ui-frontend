import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { invalidateApiQuery } from 'core/api';
import { createAppRoute } from 'core/routes';
import { AppPageFullWidth } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { JSONFeedItem } from 'layout/notifications';
import { fetchJSONNotifications } from 'layout/notifications/notifications.utils';
import type { ServiceIndexed, ServiceUpdateData, ServiceUpdates } from 'models/base/service';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommunityServiceTable from 'routes/admin-services/components/CommunityServiceTable';
import NewServiceTable from 'routes/admin-services/components/NewServiceTable';
import { ServiceTable } from 'routes/search/components/service';
import { FileDownloader } from 'ui/buttons/FileDownloader';
import ConfirmationDialog from 'ui/ConfirmationDialog';
import { PageHeader } from 'ui/layouts/PageHeader';

export const AdminServicesPage = memo(() => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const { configuration, user: currentUser } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showInfoMessage, showErrorMessage } = useMySnackbar();

  const [serviceResults, setServiceResults] = useState<ServiceIndexed[]>(null);
  const [updates, setUpdates] = useState<ServiceUpdates>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [openRestore, setOpenRestore] = useState<boolean>(false);
  const [restoreConfirmation, setRestoreConfirmation] = useState<boolean>(false);
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);
  const [manifest, setManifest] = useState<string>('');
  const [restore, setRestore] = useState<string>('');
  const [serviceFeeds, setServiceFeeds] = useState<JSONFeedItem[]>(null);
  const [communityFeeds, setCommunityFeeds] = useState<JSONFeedItem[]>(null);
  const [availableServices, setAvailableServices] = useState<JSONFeedItem[]>(null);
  const [availableCommunityServices, setAvailableCommunityServices] = useState<JSONFeedItem[]>(null);
  const [installingServices, setInstallingServices] = useState<string[]>([]);

  const lastInstallingServices = useRef<string[]>([]);
  const installingServicesTimeout = useRef<NodeJS.Timeout>(null);

  const serviceNames = useMemo<string[]>(
    () =>
      (serviceFeeds || [])
        .reduce((prev: string[], item) => (item?.summary ? [...prev, item.summary] : prev), [])
        .sort(),
    [serviceFeeds]
  );

  const reload = useCallback(() => {
    apiCall<ServiceIndexed[]>({
      url: '/api/v4/service/all/',
      onSuccess: api_data => setServiceResults(api_data.api_response)
    });
    apiCall<ServiceUpdates>({
      url: '/api/v4/service/updates/',
      onSuccess: api_data => setUpdates(api_data.api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeServiceDialog = useCallback(() => {
    setManifest('');
    setOpen(false);
  }, []);

  const closeRestoreDialog = useCallback(() => {
    setRestore('');
    setOpenRestore(false);
  }, []);

  const handleRestoreChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRestore(event.target.value);
  }, []);

  const handleManifestChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setManifest(event.target.value);
  }, []);

  const handleAddService = useCallback(() => {
    apiCall({
      method: 'PUT',
      contentType: 'text/plain',
      url: '/api/v4/service/',
      body: manifest,
      onSuccess: () => {
        showSuccessMessage(t('add.success'));
        closeServiceDialog();
        setTimeout(() => reload(), 1000);
        invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 3000);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, reload, t]);

  const handleRestore = useCallback(() => {
    apiCall({
      method: 'PUT',
      contentType: 'text/plain',
      url: '/api/v4/service/restore/',
      body: restore,
      onSuccess: () => {
        showSuccessMessage(t('restore.success'));
        closeRestoreDialog();
        setRestoreConfirmation(false);
        setTimeout(() => reload(), 1000);
        invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 3000);
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, restore, t]);

  const pollInstalling = useCallback(first => {
    apiCall<string[]>({
      url: '/api/v4/service/installing/',
      onSuccess: api_data => {
        if (first) {
          lastInstallingServices.current = api_data.api_response;
          if (api_data.api_response && api_data.api_response.length > 0)
            showInfoMessage(`${t('message.installing')} ${api_data.api_response.join(', ')}.`);
        }
        setInstallingServices(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUpdate = useCallback(
    (svc: string, updateData: ServiceUpdateData) => {
      apiCall({
        method: 'PUT',
        url: '/api/v4/service/update/',
        body: {
          name: svc,
          update_data: updateData
        },
        onSuccess: () => {
          const newUpdates = { ...updates };
          newUpdates[svc] = { ...newUpdates[svc], updating: true };
          setUpdates(newUpdates);
          invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 3000);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updates]
  );

  const updateAll = useCallback(
    () => {
      apiCall<{ updated: string[]; updating: string[] }>({
        url: '/api/v4/service/update_all/',
        onSuccess: api_data => {
          const newUpdates = { ...updates };
          for (const srv of api_data.api_response.updating) {
            newUpdates[srv] = { ...newUpdates[srv], updating: true };
          }

          for (const srv of api_data.api_response.updated) {
            delete newUpdates[srv];
          }
          setUpdates(newUpdates);
          invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 3000);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updates]
  );

  const onInstallServices = useCallback(
    (services: JSONFeedItem[]) => {
      if (!services) return;
      apiCall({
        method: 'PUT',
        url: '/api/v4/service/install/',
        body: services.map(s => ({ name: s.summary, image: s.id })),
        onSuccess: () => pollInstalling(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pollInstalling]
  );

  useEffect(() => {
    if (currentUser.is_admin) {
      reload();
      pollInstalling(true);
    }
    window.addEventListener('reloadServicesEvent', reload);
    return () => {
      window.removeEventListener('reloadServicesEvent', reload);
    };
  }, []);

  useEffect(() => {
    fetchJSONNotifications({
      urls: configuration?.ui?.services_feed ? [configuration?.ui?.services_feed] : [],
      onSuccess: values => setServiceFeeds(values)
    });
  }, [configuration?.ui?.services_feed, fetchJSONNotifications, setServiceFeeds]);

  useEffect(() => {
    fetchJSONNotifications({
      urls: configuration?.ui?.community_feed ? [configuration?.ui?.community_feed] : [],
      onSuccess: values => setCommunityFeeds(values)
    });
  }, [configuration?.ui?.community_feed, fetchJSONNotifications, setCommunityFeeds]);

  useEffect(() => {
    if (!communityFeeds || !serviceResults) return;
    const serviceResultNames = serviceResults.map(result => result?.name);
    setAvailableCommunityServices(communityFeeds.filter(feed => !serviceResultNames.includes(feed.summary)));
  }, [communityFeeds, serviceResults]);

  useEffect(() => {
    if (!serviceFeeds || !serviceResults) return;
    const serviceResultNames = serviceResults.map(result => result?.name);
    setAvailableServices(serviceFeeds.filter(feed => !serviceResultNames.includes(feed.summary)));
  }, [serviceFeeds, serviceResults]);

  useEffect(() => {
    if (!installingServices || installingServices.length === 0) return;
    if (installingServicesTimeout.current) clearTimeout(installingServicesTimeout.current);
    installingServicesTimeout.current = setTimeout(() => pollInstalling(false), 10000);
  }, [installingServices, pollInstalling]);

  useEffect(() => {
    const diff = installingServices
      .filter(x => !lastInstallingServices.current.includes(x))
      .concat(lastInstallingServices.current.filter(x => !installingServices.includes(x)))
      .sort((a, b) => a.localeCompare(b));

    if (diff.length === 0) return;
    apiCall({
      url: '/api/v4/service/installing/',
      method: 'POST',
      body: diff,
      onSuccess: api_data => {
        const response = api_data.api_response as {
          installed: string[];
          installing: string[];
          not_installed: string[];
        };

        const installing = response.installing.filter(i => !lastInstallingServices.current.includes(i));
        if (installing.length > 0) showInfoMessage(`${t('message.installing')} ${installing.join(', ')}.`);

        if (response.installed.length > 0) {
          showSuccessMessage(`${t('message.installed')} ${response.installed.join(', ')}.`);
          reload();
        }

        if (response.not_installed.length > 0)
          showErrorMessage(`${t('message.failed')} ${response.not_installed.join(', ')}.`);

        lastInstallingServices.current = installingServices;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installingServices, showErrorMessage, showInfoMessage, showSuccessMessage, t]);

  return (
    <AppPageFullWidth>
      <ConfirmationDialog
        open={restoreConfirmation}
        handleClose={() => setRestoreConfirmation(false)}
        handleAccept={handleRestore}
        title={t('restore.confirm.title')}
        text={t('restore.confirm.text')}
        cancelText={t('restore.confirm.cancel')}
        acceptText={t('restore.confirm.accept')}
        waiting={waitingDialog}
      />
      <Dialog
        open={openRestore}
        onClose={closeRestoreDialog}
        aria-labelledby="restore-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="restore-dialog-title">{t('restore.title')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('restore.paste')}
            multiline
            rows={24}
            variant="outlined"
            fullWidth
            InputProps={{
              style: { fontFamily: 'monospace' }
            }}
            onChange={handleRestoreChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRestoreDialog} color="secondary">
            {t('restore.cancelText')}
          </Button>
          <Button onClick={() => setRestoreConfirmation(true)} color="primary" disabled={!restore}>
            {t('restore.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={closeServiceDialog} aria-labelledby="form-dialog-title" fullWidth maxWidth="md">
        <DialogTitle id="form-dialog-title">{t('add.title')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('add.paste')}
            multiline
            rows={24}
            variant="outlined"
            fullWidth
            InputProps={{
              style: { fontFamily: 'monospace' }
            }}
            onChange={handleManifestChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeServiceDialog} color="secondary">
            {t('add.cancelText')}
          </Button>
          <Button onClick={handleAddService} color="primary" disabled={!manifest}>
            {t('add.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>

      <PageHeader
        primary={t('title')}
        actions={
          <>
            <Tooltip
              PopperProps={{
                disablePortal: true
              }}
              disableInteractive
              title={t('add')}
            >
              <IconButton
                style={{
                  color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                }}
                onClick={() => setOpen(true)}
                size="large"
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              PopperProps={{
                disablePortal: true
              }}
              disableInteractive
              title={
                updates &&
                Object.values(updates).some((srv: ServiceUpdateData) => srv.update_available && !srv.updating)
                  ? t('update_all')
                  : t('update_none')
              }
            >
              <span>
                <IconButton
                  color="primary"
                  onClick={updateAll}
                  disabled={
                    !updates ||
                    !Object.values(updates).some((srv: ServiceUpdateData) => srv.update_available && !srv.updating)
                  }
                  size="large"
                >
                  <SystemUpdateAltIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip
              PopperProps={{
                disablePortal: true
              }}
              disableInteractive
              title={
                availableServices &&
                availableServices.length > 0 &&
                availableServices.some(s => !installingServices?.includes(s?.summary))
                  ? t('install_all')
                  : t('install_none')
              }
            >
              <span>
                <IconButton
                  color="primary"
                  onClick={() => onInstallServices(availableServices)}
                  disabled={
                    !availableServices ||
                    availableServices.length === 0 ||
                    availableServices.every(s => installingServices?.includes(s?.summary))
                  }
                  size="large"
                >
                  <CloudDownloadOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>
            <FileDownloader link="/api/v4/service/backup/" tooltip={t('backup')} />
            <Tooltip
              PopperProps={{
                disablePortal: true
              }}
              disableInteractive
              title={t('restore')}
            >
              <IconButton onClick={() => setOpenRestore(true)} size="large">
                <RestoreOutlinedIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      <Grid container alignItems="center" spacing={3}>
        <Grid size="grow">
          <Typography variant="h5">{t('title.loaded')}</Typography>
          {serviceResults ? (
            <Typography variant="caption" component="p">{`${serviceResults.length} ${t('count')}`}</Typography>
          ) : (
            <Skeleton width="8rem" />
          )}
        </Grid>
      </Grid>
      <div style={{ paddingTop: theme.spacing(2) }}>
        <ServiceTable serviceResults={serviceResults} updates={updates} onUpdate={onUpdate} />
      </div>

      <Grid container alignItems="center" spacing={3} style={{ marginTop: theme.spacing(2) }}>
        <Grid size="grow">
          <Typography variant="h5">{t('title.available')}</Typography>
          {availableServices ? (
            <Typography variant="caption" component="p">
              {`${availableServices.length} ${t('count.available')}`}
            </Typography>
          ) : (
            <Skeleton width="8rem" />
          )}
        </Grid>
      </Grid>
      <div style={{ paddingTop: theme.spacing(2) }}>
        <NewServiceTable
          services={availableServices?.sort((a, b) => a.id.localeCompare(b.id))}
          installingServices={installingServices}
          onInstall={onInstallServices}
        />
      </div>

      <Grid container alignItems="center" spacing={3} style={{ marginTop: theme.spacing(2) }}>
        <Grid size="grow">
          <Typography variant="h5">{t('title.available.community')}</Typography>
          {availableCommunityServices ? (
            <Typography variant="caption" component="p">
              {`${availableCommunityServices.length} ${t('count.available.community')}`}
            </Typography>
          ) : (
            <Skeleton width="8rem" />
          )}
        </Grid>
      </Grid>
      <div style={{ paddingTop: theme.spacing(2) }}>
        <CommunityServiceTable
          services={availableCommunityServices?.sort((a, b) => a.id.localeCompare(b.id))}
          installingServices={installingServices}
          onInstall={onInstallServices}
        />
      </div>
    </AppPageFullWidth>
  );
});

export const AdminServicesRoute = createAppRoute({
  component: AdminServicesPage,

  path: '/admin/services',

  ancestor: '/admin',
  shortname: () => ['app_route.admin_services.shortname', { ns: 'adminServices' }],
  fullname: () => ['app_route.admin_services.fullname', { ns: 'adminServices' }],
  shorticon: () => <AccountTreeOutlinedIcon />,
  fullicon: () => <AccountTreeOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin
});
