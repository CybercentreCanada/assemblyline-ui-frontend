import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip from 'components/visual/CustomChip';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type APIKeyProps = {
  acl: string;
  roles: string[];
};

type APIKeysProps = {
  user: { [name: string]: any; apikeys: { [name: string]: APIKeyProps } };
  toggleAPIKey: (name: string, apiKey?: APIKeyProps) => void;
};

export default function APIKeys({ user, toggleAPIKey }: APIKeysProps) {
  const { t } = useTranslation(['user']);
  const [selectedAPIKey, setSelectedAPIKey] = useState(null);
  const { configuration } = useALContext();
  const [tempAPIKey, setTempAPIKey] = useState(null);
  const [tempKeyName, setTempKeyName] = useState('');
  const [tempKeyPriv, setTempKeyPriv] = useState('READ');
  const [tempKeyRoles, setTempKeyRoles] = useState(null);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccessMessage } = useMySnackbar();
  const regex = RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  function handleDelete() {
    apiCall({
      url: `/api/v4/auth/apikey/${selectedAPIKey}/`,
      method: 'DELETE',
      onSuccess: () => {
        toggleAPIKey(selectedAPIKey);
        setSelectedAPIKey(null);
        showSuccessMessage(t('apikeys.removed'));
      }
    });
  }

  function handleCreate() {
    apiCall({
      method: 'PUT',
      body: tempKeyRoles,
      url: `/api/v4/auth/apikey/${tempKeyName}/${tempKeyPriv}/`,
      onSuccess: api_data => {
        setTempAPIKey(api_data.api_response.apikey);
        toggleAPIKey(tempKeyName, { acl: tempKeyPriv, roles: tempKeyRoles });
      }
    });
  }

  function handleKeyNameChange(event) {
    if (regex.test(event.target.value) || event.target.value === '') {
      setTempKeyName(event.target.value);
    } else {
      event.preventDefault();
    }
  }

  function handleSelectChange(event) {
    setTempKeyPriv(event.target.value);
  }

  function handleNew() {
    setTempAPIKey(null);
    setTempKeyName('');
    setTempKeyPriv('READ');
  }

  function askForDelete(securityToken) {
    setSelectedAPIKey(securityToken);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('apikeys.title')}
      </Typography>
      <Typography variant="caption" gutterBottom>
        {t('apikeys.desc')}
      </Typography>
      <div style={{ paddingTop: sp4, paddingBottom: sp4 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('apikeys.list')}
        </Typography>
        {Object.keys(user.apikeys).length !== 0 ? (
          Object.entries(user.apikeys).map(([name, apikey], i) => (
            <Paper
              key={i}
              style={{ backgroundColor: '#00000015', padding: theme.spacing(1), borderRadius: '5px' }}
              variant="outlined"
            >
              <div style={{ display: 'flex', marginBottom: theme.spacing(1), alignItems: 'center' }}>
                <Typography variant="button" style={{ flexGrow: 1 }}>
                  {name} [{apikey.acl}]
                </Typography>
                <div>
                  <IconButton size="small" onClick={() => askForDelete(name)}>
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {apikey.roles.map((e, x) => (
                  <div key={x} style={{ marginRight: theme.spacing(0.5), marginBottom: theme.spacing(0.25) }}>
                    <CustomChip type="rounded" label={t(`role.${e}`)} size="tiny" color="primary" />
                  </div>
                ))}
              </div>
            </Paper>
          ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('apikeys.none')}
          </Typography>
        )}
      </div>

      <div style={{ paddingTop: sp4 }}>
        <TextField
          style={{ width: '100%' }}
          size="small"
          margin="normal"
          variant="outlined"
          label={t('apikeys.temp_token')}
          onChange={handleKeyNameChange}
          value={tempKeyName}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <div style={{ alignSelf: 'center', flexGrow: 2 }}>
          <Select id="priv" value={tempKeyPriv} onChange={handleSelectChange} variant="outlined" margin="dense">
            <MenuItem value="READ">{t('apikeys.r_token')}</MenuItem>
            <MenuItem value="READ_WRITE">{t('apikeys.rw_token')}</MenuItem>
            <MenuItem value="WRITE">{t('apikeys.w_token')}</MenuItem>
            {configuration.auth.allow_extended_apikeys && <MenuItem value="EXTENDED">{t('apikeys.e_token')}</MenuItem>}
          </Select>
        </div>
        <div style={{ alignSelf: 'flex-end', paddingLeft: sp1 }}>
          <Button disabled={tempKeyName === ''} onClick={() => handleCreate()} color="primary" variant="contained">
            {t('apikeys.add')}
          </Button>
        </div>
      </div>

      <Dialog
        fullScreen={fullScreen}
        open={tempAPIKey !== null}
        onClose={() => handleNew()}
        aria-labelledby="new-dialog-title"
        aria-describedby="new-dialog-description"
      >
        <DialogTitle id="new-dialog-title">{t('apikeys.new_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="new-dialog-description" component="div">
            <div style={{ paddingTop: sp2, paddingBottom: sp4 }}>
              <Card variant="outlined" style={{ backgroundColor: theme.palette.background.default }}>
                <div style={{ padding: sp2 }}>
                  <Typography style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>{tempAPIKey}</Typography>
                </div>
              </Card>
            </div>
          </DialogContentText>
          <DialogContentText id="new-dialog-notice-title" component="div">
            <Typography variant="subtitle2" color="textPrimary">
              {t('apikeys.new_notice_title')}
            </Typography>
          </DialogContentText>
          <DialogContentText id="new-dialog-notice-texte" component="div">
            <Typography variant="body2">{t('apikeys.new_notice_text')}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleNew()} color="primary" autoFocus>
            {t('done')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen={fullScreen}
        open={selectedAPIKey !== null}
        onClose={() => setSelectedAPIKey(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('apikeys.remove_title')}: {selectedAPIKey}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t('apikeys.remove_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAPIKey(null)} color="primary" autoFocus>
            {t('cancel')}
          </Button>
          <Button onClick={() => handleDelete()} color="primary">
            {t('apikeys.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
