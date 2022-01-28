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
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import RestoreOutlinedIcon from '@material-ui/icons/RestoreOutlined';
import { Skeleton } from '@material-ui/lab';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import Service from 'components/routes/admin/service_detail';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import ServiceTable from 'components/visual/SearchResult/service';
import getXSRFCookie from 'helpers/xsrf';
import 'moment/locale/fr';
import { useCallback, useEffect, useState } from 'react';
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
  const { showSuccessMessage } = useMySnackbar();
  const theme = useTheme();
  const apiCall = useMyAPI();
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
      onSuccess: api_data => {
        setServiceResults(api_data.api_response);
      }
    });
    apiCall({
      url: '/api/v4/service/updates/',
      onSuccess: api_data => {
        setUpdates(api_data.api_response);
      }
    });
  };

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
      <Grid container alignItems="center" spacing={3} style={{ paddingBottom: theme.spacing(2) }}>
        <Grid item xs>
          <Typography variant="h4">{t('title')}</Typography>
          {serviceResults ? (
            <Typography variant="caption">{`${serviceResults.length} ${t('count')}`}</Typography>
          ) : (
            <Skeleton width="8rem" />
          )}
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

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ServiceTable serviceResults={serviceResults} updates={updates} setService={setService} onUpdate={onUpdate} />
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
