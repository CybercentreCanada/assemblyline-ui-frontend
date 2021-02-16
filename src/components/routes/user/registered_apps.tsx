import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type APIKeysProps = {
  user: any;
  toggleApp: (apiKey: string) => void;
};

export default function RegisteredApps({ user, toggleApp }: APIKeysProps) {
  const { t } = useTranslation(['user']);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const apiCall = useMyAPI();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccessMessage } = useMySnackbar();
  const sp1 = theme.spacing(1);
  const sp4 = theme.spacing(4);

  function handleDelete() {
    apiCall({
      url: `/api/v4/auth/obo_token/${selectedApp}/`,
      method: 'DELETE',
      onSuccess: () => {
        toggleApp(selectedApp);
        setSelectedApp(null);
        setSelectedName(null);
        showSuccessMessage(t('registered_apps.removed'));
      }
    });
  }

  function askForDelete(app, name) {
    setSelectedApp(app);
    setSelectedName(name);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('registered_apps.title')}
      </Typography>
      <Typography variant="caption" gutterBottom>
        {t('registered_apps.desc')}
      </Typography>
      <div style={{ paddingTop: sp4, paddingBottom: sp4 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('registered_apps.list')}
        </Typography>
        {Object.keys(user.registered_apps).length !== 0 ? (
          Object.keys(user.registered_apps).map(e => (
            <Chip
              key={e}
              label={user.registered_apps[e].server}
              onDelete={() => askForDelete(e, user.registered_apps[e].server)}
              style={{ marginRight: sp1, marginBottom: sp1 }}
            />
          ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('registered_apps.none')}
          </Typography>
        )}
      </div>

      <Dialog
        fullScreen={fullScreen}
        open={selectedApp !== null}
        onClose={() => setSelectedApp(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('registered_apps.remove_title')}: {selectedName}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t('registered_apps.remove_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedApp(null)} color="primary" autoFocus>
            {t('cancel')}
          </Button>
          <Button onClick={() => handleDelete()} color="primary">
            {t('registered_apps.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
