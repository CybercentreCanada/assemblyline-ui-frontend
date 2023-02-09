import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomChip from 'components/visual/CustomChip';
import useALContext from 'components/hooks/useALContext';

type AppsProps = {
  user: any;
  toggleApp: (apiKey: string) => void;
};

type APIKeyCardProps = {
  id: string;
  app: any;
  askForDelete: (name: string) => void;
};

const AppsCard = ({ id, app, askForDelete }: APIKeyCardProps) => {
  const { t } = useTranslation(['user']);
  const { user: currentUser } = useALContext();
  const theme = useTheme();
  return (
    <Paper
      style={{
        backgroundColor: '#00000015',
        padding: theme.spacing(1),
        borderRadius: theme.spacing(0.5),
        marginBottom: theme.spacing(1)
      }}
      variant="outlined"
    >
      <div style={{ display: 'flex', marginBottom: theme.spacing(1), alignItems: 'center' }}>
        <div style={{ flexGrow: 1 }}>
          <Typography variant="button" component="div">
            {app.server} [{app.scope}]
          </Typography>
          <Typography variant="caption" component="div">
            {app.netloc}
          </Typography>
        </div>
        <div>
          <IconButton size="small" onClick={() => askForDelete(id)}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {app.roles?.sort().map((e, x) => (
          <div key={x} style={{ marginRight: theme.spacing(0.5), marginBottom: theme.spacing(0.25) }}>
            <CustomChip
              type="rounded"
              label={t(`role.${e}`)}
              size="tiny"
              color={currentUser.roles.includes(e) ? 'primary' : 'default'}
            />
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default function Apps({ user, toggleApp }: AppsProps) {
  const { t } = useTranslation(['user']);
  const [selectedAppID, setSelectedAppID] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  function handleDelete() {
    apiCall({
      url: `/api/v4/auth/obo_token/${selectedAppID}/`,
      method: 'DELETE',
      onSuccess: () => {
        reset(selectedAppID);
        showSuccessMessage(t('apps.removed'));
      },
      onFailure: api_data => {
        reset();
        showErrorMessage(api_data.api_error_message);
      }
    });
  }

  function askForDelete(appID) {
    setSelectedAppID(appID);
    setShowDelete(true);
  }

  function reset(toggleID = null) {
    setShowDelete(false);
    setTimeout(() => {
      if (toggleID) {
        toggleApp(toggleID);
      }
      setSelectedAppID(null);
    }, 100);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('apps.title')}
      </Typography>
      <Typography variant="caption" gutterBottom>
        {t('apps.desc')}
      </Typography>
      <div style={{ paddingTop: theme.spacing(4), paddingBottom: theme.spacing(4) }}>
        {user.apps && Object.keys(user.apps).length !== 0 ? (
          Object.entries(user.apps).map(([id, app], i) => (
            <AppsCard id={id} app={app} key={i} askForDelete={askForDelete} />
          ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('apps.none')}
          </Typography>
        )}
      </div>

      <Dialog
        fullScreen={fullScreen}
        open={showDelete}
        onClose={() => reset()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`${t('apps.remove_title')}: ${
            selectedAppID &&
            user.apps[selectedAppID] &&
            `${user.apps[selectedAppID].server} [${user.apps[selectedAppID].scope.toUpperCase()}]`
          }`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t('apps.remove_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => reset()} color="primary" autoFocus>
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
