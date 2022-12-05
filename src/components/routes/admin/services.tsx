import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link as MaterialLink,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import RestoreOutlinedIcon from '@material-ui/icons/RestoreOutlined';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import { Skeleton } from '@material-ui/lab';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import Service from 'components/routes/admin/service_detail';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import ServiceTable from 'components/visual/SearchResult/service';
import NewServiceTable from 'components/visual/ServiceManagement/NewServiceTable';
import {
  JSONFeedItem,
  ServiceFeedItem,
  useNotificationFeed
} from 'components/visual/ServiceManagement/useNotificationFeed';
import getXSRFCookie from 'helpers/xsrf';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

export default function Services() {
  const { t } = useTranslation(['adminServices']);
  const [serviceResults, setServiceResults] = useState(null);
  const [updates, setUpdates] = useState(null);
  const [open, setOpen] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);
  const [restoreConfirmation, setRestoreConfirmation] = useState(false);
  const [manifest, setManifest] = useState('');
  const [restore, setRestore] = useState('');
  const { showSuccessMessage, showInfoMessage, showErrorMessage } = useMySnackbar();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useUser<CustomUser>();
  const { setGlobalDrawer, closeGlobalDrawer } = useDrawer();
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

  const closeServiceDialog = () => {
    setManifest('');
    setOpen(false);
  };

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
      }
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

  const reload = () => {
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: api_data => setServiceResults(api_data.api_response)
    });
    apiCall({
      url: '/api/v4/service/updates/',
      onSuccess: api_data => setUpdates(api_data.api_response)
    });
  };

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
        onSuccess: resp => {
          const newUpdates = { ...updates };
          for (const srv of resp.api_response.updating) {
            newUpdates[srv] = { ...newUpdates[srv], updating: true };
          }

          for (const srv of resp.api_response.updated) {
            delete newUpdates[srv];
          }
          setUpdates(newUpdates);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updates]
  );

  const onUpdated = () => {
    if (!isXL) closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadServices')), 1000);
  };

  const onDeleted = () => {
    closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadServices')), 1000);
  };

  const setService = useCallback(
    (service_name: string) => {
      setGlobalDrawer(<Service name={service_name} onDeleted={onDeleted} onUpdated={onUpdated} />);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (currentUser.is_admin) {
      reload();
    }

    window.addEventListener('reloadServices', reload);
    return () => {
      window.removeEventListener('reloadServices', reload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { configuration } = useALContext();
  const { fetchJSONNotifications } = useNotificationFeed();
  const [serviceFeeds, setServiceFeeds] = useState<JSONFeedItem[]>(null);
  const [availableServices, setAvailableServices] = useState<ServiceFeedItem[]>(null);
  const [servicesBeingInstalled, setServicesBeingInstalled] = useState<ServiceFeedItem[]>([]);
  const installStatusTimeout = useRef<NodeJS.Timeout>(null);

  const fetchServiceStatus = useCallback(
    ({
      data,
      onResponse
    }: {
      data: Array<string>;
      onResponse: (response: {
        installed: Array<{
          status: string;
          accepts: string;
          category: string;
          description: string;
          enabled: string;
          name: string;
          privileged: string;
          rejects: string;
          stage: string;
          version: string;
        }>;
        installing: Array<string>;
        invalid: Array<string>;
      }) => void;
    }) =>
      apiCall({
        method: 'POST',
        url: '/api/v4/service/install_status/',
        body: data,
        onSuccess: api_data => onResponse(api_data.api_response)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const requestServiceInstall = useCallback(
    ({
      data,
      onResponse
    }: {
      data: Array<ServiceFeedItem>;
      onResponse: (response: {
        installed: Array<{
          status: string;
          accepts: string;
          category: string;
          description: string;
          enabled: string;
          name: string;
          privileged: string;
          rejects: string;
          stage: string;
          version: string;
        }>;
        installing: Array<string>;
        invalid: Array<string>;
      }) => void;
    }) =>
      apiCall({
        method: 'PUT',
        url: '/api/v4/service/install/',
        body: [
          ...data.map(s => ({
            name: s.summary,
            install_data: {
              auth: null,
              image: s.id
            }
          })),
          { install_data: { auth: null, image: 'cccs/assemblyline-service-VirusTotal' }, name: 'VirusTotal' },
          { install_data: { auth: null, image: 'cccs/assemblyline-service-random' }, name: 'random' }
        ],
        onSuccess: api_data => onResponse(api_data.api_response)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const dispatchInstallStatus = useCallback(() => {
    if (installStatusTimeout.current) clearTimeout(installStatusTimeout.current);
    installStatusTimeout.current = setTimeout(
      () => window.dispatchEvent(new CustomEvent('checkServiceInstallEvent')),
      10000
    );
  }, []);

  const onInstallStatusChange = useCallback(() => {
    if (servicesBeingInstalled)
      fetchServiceStatus({
        data: servicesBeingInstalled.map(s => s.summary),
        onResponse: ({ installed, installing, invalid }) => {
          if (installed.length > 0) {
            setServiceResults(results => {
              installed.forEach(i => results.push(i));
              return results.sort((a, b) => a.name.localeCompare(b.name));
            });
            setAvailableServices(as => as?.filter(s => !installed?.map(i => i.name).includes(s.summary)));
            showSuccessMessage(
              `${t('message.installed')} ${servicesBeingInstalled
                .filter(s => installed?.map(i => i.name).includes(s.summary))
                .map(s => s.summary)
                .join(', ')}.`
            );
          }
          if (invalid.length > 0) {
            setServicesBeingInstalled(sbi => sbi?.filter(s => !invalid?.includes(s.summary)));
            showErrorMessage(
              `${t('message.failed')} ${servicesBeingInstalled
                ?.filter(s => invalid?.includes(s.summary))
                .map(s => s.summary)
                .join(', ')}.`
            );
          }
          if (installing.length > 0) {
            setServicesBeingInstalled(sbi => sbi?.filter(s => installing.includes(s.summary)));
            dispatchInstallStatus();
          }
        }
      });
  }, [dispatchInstallStatus, fetchServiceStatus, servicesBeingInstalled, showErrorMessage, showSuccessMessage, t]);

  useEffect(() => {
    window.addEventListener('checkServiceInstallEvent', onInstallStatusChange);
    return () => {
      clearTimeout(installStatusTimeout.current);
      window.removeEventListener('checkServiceInstallEvent', onInstallStatusChange);
    };
  }, [onInstallStatusChange]);

  useEffect(() => {
    fetchJSONNotifications({
      urls: [configuration?.ui?.services_feed],
      onSuccess: values => setServiceFeeds(values)
    });
  }, [configuration?.ui?.services_feed, fetchJSONNotifications, setServiceFeeds]);

  useEffect(() => {
    if (!serviceFeeds || !serviceResults || availableServices) return;
    fetchServiceStatus({
      data: serviceFeeds.filter(s => !serviceResults?.some(r => s?.title.includes(r?.name))).map(s => s.summary),
      onResponse: ({ installing }) => {
        setAvailableServices(serviceFeeds?.filter(s => !serviceResults?.some(r => s?.summary.includes(r?.name))));

        if (installing.length > 0) {
          const newValue = serviceFeeds.filter(s => installing.includes(s.summary));
          setServicesBeingInstalled(newValue);
          showInfoMessage(`${t('message.installing')} ${newValue.map(s => s.summary).join(', ')}.`);
          dispatchInstallStatus();
        }
      }
    });
  }, [
    serviceFeeds,
    serviceResults,
    availableServices,
    fetchServiceStatus,
    showInfoMessage,
    dispatchInstallStatus,
    setAvailableServices,
    servicesBeingInstalled,
    t
  ]);

  const onInstall = useCallback(
    (services: Array<ServiceFeedItem>) => {
      requestServiceInstall({
        data: services,
        onResponse: ({ installed, installing, invalid }) => {
          if (installed.length > 0) {
            setServiceResults((results: Array<any>) => {
              installed.forEach(i => results.push(i));
              return results
                .filter((item, i) => results.findIndex(e => e.name === item.name) === i)
                .sort((a, b) => a?.name?.localeCompare(b?.name));
            });
            setAvailableServices(as => as?.filter(s => !installed?.map(i => i.name).includes(s.summary)));
            showSuccessMessage(`${t('message.installed')} ${installed.map(i => i?.name).join(', ')}.`);
          }
          if (invalid.length > 0) {
            setServicesBeingInstalled(sbi => sbi?.filter(s => !invalid.includes(s.summary)));
            showErrorMessage(`${t('message.failed')} ${invalid.join(', ')}.`);
          }
          if (installing.length > 0) {
            setServicesBeingInstalled(sbi => {
              installing.forEach(
                i => serviceFeeds.find(f => f.summary === i) && sbi.push(serviceFeeds.find(f => f.summary === i))
              );
              return sbi
                ?.filter((item, i) => sbi?.findIndex(e => e?.summary === item?.summary) === i)
                .sort((a, b) => a?.summary?.localeCompare(b?.summary));
            });
            showInfoMessage(`${t('message.installing')} ${installing.join(', ')}.`);
            dispatchInstallStatus();
          }
        }
      });
    },
    [
      dispatchInstallStatus,
      requestServiceInstall,
      serviceFeeds,
      showErrorMessage,
      showInfoMessage,
      showSuccessMessage,
      t
    ]
  );

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
                  color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                }}
                onClick={() => setOpen(true)}
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
                >
                  <SystemUpdateAltIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip
              title={
                availableServices && availableServices.length > 0 && availableServices.some(s => !s._isInstalling)
                  ? t('install_all')
                  : t('install_none')
              }
            >
              <span>
                <IconButton
                  color="primary"
                  onClick={() => onInstall(availableServices)}
                  disabled={
                    !availableServices ||
                    availableServices.length === 0 ||
                    !availableServices.some(s => !s._isInstalling)
                  }
                >
                  <CloudDownloadOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('backup')}>
              <IconButton component={MaterialLink} href={`/api/v4/service/backup/?XSRF_TOKEN=${getXSRFCookie()}`}>
                <GetAppOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('restore')}>
              <IconButton onClick={() => setOpenRestore(true)}>
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
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ServiceTable serviceResults={serviceResults} updates={updates} setService={setService} onUpdate={onUpdate} />
      </div>

      <Grid container alignItems="center" spacing={3} style={{ paddingTop: theme.spacing(2) }}>
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
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <NewServiceTable
          services={availableServices?.sort((a, b) => a.id.localeCompare(b.id))}
          servicesBeingInstalled={servicesBeingInstalled}
          onInstall={onInstall}
        />
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
