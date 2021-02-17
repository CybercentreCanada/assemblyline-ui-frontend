import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
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

export default function Apps({ user, toggleApp }: APIKeysProps) {
  const { t } = useTranslation(['user']);
  const [selectedApp, setSelectedApp] = useState(null);
  const apiCall = useMyAPI();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();
  const sp1 = theme.spacing(1);
  const sp4 = theme.spacing(4);

  function handleDelete() {
    apiCall({
      url: `/api/v4/auth/obo_token/${selectedApp}/`,
      method: 'DELETE',
      onSuccess: () => {
        toggleApp(selectedApp);
        setSelectedApp(null);
        showSuccessMessage(t('apps.removed'));
      },
      onFailure: api_data => {
        setSelectedApp(null);
        showErrorMessage(api_data.api_error_message);
      }
    });
  }

  function askForDelete(app) {
    setSelectedApp(app);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('apps.title')}
      </Typography>
      <Typography variant="caption" gutterBottom>
        {t('apps.desc')}
      </Typography>
      <div style={{ paddingTop: sp4, paddingBottom: sp4 }}>
        {user.apps && Object.keys(user.apps).length !== 0 ? (
          Object.keys(user.apps).map(e => (
            <Tooltip key={e} title={user.apps[e].netloc}>
              <Chip
                label={`${user.apps[e].server} [${user.apps[e].scope.toUpperCase()}]`}
                onDelete={() => askForDelete(e)}
                style={{ marginRight: sp1, marginBottom: sp1 }}
              />
            </Tooltip>
          ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('apps.none')}
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
          {`${t('apps.remove_title')}: ${
            selectedApp &&
            user.apps[selectedApp] &&
            `${user.apps[selectedApp].server} [${user.apps[selectedApp].scope.toUpperCase()}]`
          }`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t('apps.remove_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedApp(null)} color="primary" autoFocus>
            {t('cancel')}
          </Button>
          <Button onClick={() => handleDelete()} color="primary">
            {t('apps.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
