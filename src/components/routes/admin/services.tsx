import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import Service from 'components/routes/admin/service_detail';
import ServiceTable from 'components/visual/SearchResult/service';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

export default function Services() {
  const { t } = useTranslation(['adminServices']);
  const [serviceResults, setServiceResults] = useState(null);
  const [updates, setUpdates] = useState(null);
  const [open, setOpen] = useState(false);
  const [manifest, setManifest] = useState('');
  const { showSuccessMessage } = useMySnackbar();
  const theme = useTheme();
  const apiCall = useMyAPI();
  const { user: currentUser } = useUser<CustomUser>();
  const { setGlobalDrawer } = useDrawer();

  const handleAddService = () => {
    apiCall({
      method: 'PUT',
      url: '/api/v4/service/',
      body: manifest,
      onSuccess: api_data => {
        showSuccessMessage(t('add.success'));
      }
    });
  };

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

  const onDeleted = () => {
    setGlobalDrawer(null);
    setTimeout(() => reload(), 1000);
  };

  const setService = useCallback(
    service_name => {
      setGlobalDrawer(<Service name={service_name} onDeleted={onDeleted} />);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title" fullWidth maxWidth="md">
        <DialogTitle id="form-dialog-title">{t('add.title')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('add.paste')}
            multiline
            rows={24}
            variant="outlined"
            fullWidth
            onChange={handleManifestChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
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
