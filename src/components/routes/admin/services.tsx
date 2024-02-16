import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
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
  useMediaQuery,
  useTheme
} from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import { ServiceIndexed, ServiceUpdates } from 'components/models/base/service';
import { API } from 'components/models/ui';
import ServiceDetail from 'components/routes/admin/service_detail';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import FileDownloader from 'components/visual/FileDownloader';
import { JSONFeedItem, useNotificationFeed } from 'components/visual/Notification/useNotificationFeed';
import ServiceTable from 'components/visual/SearchResult/service';
import NewServiceTable from 'components/visual/ServiceManagement/NewServiceTable';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';

export default function Services() {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { configuration } = useALContext();
  const { fetchJSONNotifications } = useNotificationFeed();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage, showInfoMessage, showErrorMessage } = useMySnackbar();
  const { setGlobalDrawer, closeGlobalDrawer, globalDrawerOpened } = useDrawer();

  const [serviceResults, setServiceResults] = useState<ServiceIndexed[]>(null);
  const [updates, setUpdates] = useState<ServiceUpdates>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [openRestore, setOpenRestore] = useState<boolean>(false);
  const [restoreConfirmation, setRestoreConfirmation] = useState<boolean>(false);
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);
  const [manifest, setManifest] = useState<string>('');
  const [restore, setRestore] = useState<string>('');
  const [serviceFeeds, setServiceFeeds] = useState<JSONFeedItem[]>(null);
  const [availableServices, setAvailableServices] = useState<JSONFeedItem[]>(null);
  const [installingServices, setInstallingServices] = useState<string[]>([]);

  const lastInstallingServices = useRef<string[]>([]);
  const installingServicesTimeout = useRef<NodeJS.Timeout>(null);

  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

  const handleAddService = () => {
    apiCall({
      method: 'PUT',
      contentType: 'text/plain',
      url: '/api/v4/service/',
      body: manifest,
      onSuccess: api_data => {
        showSuccessMessage(t('add.success'));
        closeServiceDialog();
        setTimeout(() => reload(), 1000);
      }
    });
  };

  const closeServiceDialog = useCallback(() => {
    setManifest('');
    setOpen(false);
  }, []);

  const handleRestore = () => {
    apiCall({
      method: 'PUT',
      contentType: 'text/plain',
      url: '/api/v4/service/restore/',
      body: restore,
      onSuccess: api_data => {
        showSuccessMessage(t('restore.success'));
        closeRestoreDialog();
        setRestoreConfirmation(false);
        setTimeout(() => reload(), 1000);
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  const closeRestoreDialog = () => {
    setRestore('');
    setOpenRestore(false);
  };

  function handleRestoreChange(event) {
    setRestore(event.target.value);
  }

  function handleManifestChange(event) {
    setManifest(event.target.value);
  }

  const reload = useCallback(() => {
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: (api_data: API<ServiceIndexed[]>) => setServiceResults(api_data.api_response)
    });
    apiCall({
      url: '/api/v4/service/updates/',
      onSuccess: (api_data: API<ServiceUpdates>) => setUpdates(api_data.api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollInstalling = useCallback(first => {
    apiCall({
      url: '/api/v4/service/installing/',
      onSuccess: (api_data: API<string[]>) => {
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

  useEffectOnce(() => {
    if (currentUser.is_admin) {
      reload();
      pollInstalling(true);
    }
    window.addEventListener('reloadServicesEvent', reload);
    return () => {
      window.removeEventListener('reloadServicesEvent', reload);
    };
  });

  const onUpdate = useCallback(
    (svc, updateData) => {
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
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updates]
  );

  const updateAll = useCallback(
    () => {
      apiCall({
        url: '/api/v4/service/update_all/',
        onSuccess: (api_data: API<{ updated: string[]; updating: string[] }>) => {
          const newUpdates = { ...updates };
          for (const srv of api_data.api_response.updating) {
            newUpdates[srv] = { ...newUpdates[srv], updating: true };
          }

          for (const srv of api_data.api_response.updated) {
            delete newUpdates[srv];
          }
          setUpdates(newUpdates);
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

  const onUpdated = useCallback(() => {
    if (!isXL) closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadServicesEvent')), 1000);
  }, [closeGlobalDrawer, isXL]);

  const onDeleted = useCallback(() => {
    closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadServicesEvent')), 1000);
  }, [closeGlobalDrawer]);

  useEffect(() => {
    if (serviceResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<ServiceDetail name={location.hash.slice(1)} onDeleted={onDeleted} onUpdated={onUpdated} />);
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const setService = useCallback(
    (service_name: string) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${service_name}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname, location.search]
  );

  useEffect(() => {
    fetchJSONNotifications({
      urls: configuration?.ui?.services_feed ? [configuration?.ui?.services_feed] : [],
      onSuccess: values => setServiceFeeds(values)
    });
  }, [configuration?.ui?.services_feed, fetchJSONNotifications, setServiceFeeds]);

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

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
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
      <Grid container alignItems="center" spacing={3}>
        <Grid item xs>
          <Typography variant="h4">{t('title')}</Typography>
        </Grid>
        <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
          <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
            <Tooltip title={t('add')}>
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
              title={
                updates && Object.values(updates).some((srv: any) => srv.update_available && !srv.updating)
                  ? t('update_all')
                  : t('update_none')
              }
            >
              <span>
                <IconButton
                  color="primary"
                  onClick={updateAll}
                  disabled={
                    !updates || !Object.values(updates).some((srv: any) => srv.update_available && !srv.updating)
                  }
                  size="large"
                >
                  <SystemUpdateAltIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip
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
            <FileDownloader icon={<GetAppOutlinedIcon />} link={`/api/v4/service/backup/`} tooltip={t('backup')} />
            <Tooltip title={t('restore')}>
              <IconButton onClick={() => setOpenRestore(true)} size="large">
                <RestoreOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Grid>
      </Grid>

      <Grid container alignItems="center" spacing={3}>
        <Grid item xs>
          <Typography variant="h5">{t('title.loaded')}</Typography>
          {serviceResults ? (
            <Typography variant="caption" component="p">{`${serviceResults.length} ${t('count')}`}</Typography>
          ) : (
            <Skeleton width="8rem" />
          )}
        </Grid>
      </Grid>
      <div style={{ paddingTop: theme.spacing(2) }}>
        <ServiceTable serviceResults={serviceResults} updates={updates} setService={setService} onUpdate={onUpdate} />
      </div>

      <Grid container alignItems="center" spacing={3} style={{ marginTop: theme.spacing(2) }}>
        <Grid item xs>
          <Typography variant="h5">{t('title.available')}</Typography>
          {availableServices ? (
            <Typography variant="caption" component="p">{`${availableServices.length} ${t(
              'count.available'
            )}`}</Typography>
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
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
