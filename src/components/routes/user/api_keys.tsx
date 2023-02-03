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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip from 'components/visual/CustomChip';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type APIKeyProps = {
  acl: string[];
  roles: string[];
};

type APIKeyCardProps = {
  name: string;
  apikey: APIKeyProps;
  askForDelete: (name: string) => void;
};

type APIKeysProps = {
  user: {
    [name: string]: any;
    apikeys: {
      [name: string]: APIKeyProps;
    };
  };
  toggleAPIKey: (name: string, apiKey?: APIKeyProps) => void;
};

const APIKeyCard = ({ name, apikey, askForDelete }: APIKeyCardProps) => {
  const { t } = useTranslation(['user']);
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
        {apikey.roles?.sort().map((e, x) => (
          <div key={x} style={{ marginRight: theme.spacing(0.5), marginBottom: theme.spacing(0.25) }}>
            <CustomChip type="rounded" label={t(`role.${e}`)} size="tiny" color="primary" />
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default function APIKeys({ user, toggleAPIKey }: APIKeysProps) {
  const { t } = useTranslation(['user']);
  const [selectedAPIKey, setSelectedAPIKey] = useState(null);
  const [addApikey, setAddApikey] = useState(false);
  const { configuration, user: currentUser } = useALContext();
  const [tempAPIKey, setTempAPIKey] = useState(null);
  const [tempKeyName, setTempKeyName] = useState('');
  const [tempKeyPriv, setTempKeyPriv] = useState('READ');
  const [tempKeyRoles, setTempKeyRoles] = useState(configuration.user.priv_role_dependencies.R);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccessMessage } = useMySnackbar();
  const regex = RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');

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
        setAddApikey(false);
        setTempAPIKey(api_data.api_response.apikey);
        toggleAPIKey(api_data.api_response.name, {
          acl: api_data.api_response.acl,
          roles: api_data.api_response.roles
        });
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
    const acl = configuration.user.api_priv_map[event.target.value];
    let roles = [];
    if (acl) {
      for (const ac of acl) {
        const aclRoles = configuration.user.priv_role_dependencies[ac];
        if (aclRoles) {
          roles.push(...aclRoles.filter(r => currentUser.roles.includes(r)));
        }
      }
    }
    setTempKeyRoles(roles);
  }

  function toggleRole(role) {
    const newRoles = [...tempKeyRoles];
    if (newRoles.indexOf(role) === -1) {
      newRoles.push(role);
    } else {
      newRoles.splice(newRoles.indexOf(role), 1);
    }

    setTempKeyPriv('CUSTOM');
    setTempKeyRoles(newRoles);
  }

  function handleNew() {
    setAddApikey(false);
    setTempAPIKey(null);
    setTempKeyName('');
    setTempKeyPriv('READ');
    setTempKeyRoles(configuration.user.priv_role_dependencies.R);
  }

  function askForDelete(securityToken) {
    setSelectedAPIKey(securityToken);
  }

  return (
    <>
      <div style={{ display: 'flex', marginBottom: theme.spacing(1), alignItems: 'center' }}>
        <Typography variant="h4" style={{ flexGrow: 1 }}>
          {t('apikeys.title')}
        </Typography>
        <Tooltip title={t('apikeys.add')}>
          <IconButton
            onClick={() => setAddApikey(true)}
            style={{
              color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
            }}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </div>
      <Typography variant="caption" gutterBottom>
        {t('apikeys.desc')}
      </Typography>
      <div style={{ paddingTop: theme.spacing(4), paddingBottom: theme.spacing(4) }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('apikeys.list')}
        </Typography>
        {Object.keys(user.apikeys).length !== 0 ? (
          Object.entries(user.apikeys).map(([name, apikey], i) => (
            <APIKeyCard key={i} name={name} apikey={apikey} askForDelete={askForDelete} />
          ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('apikeys.none')}
          </Typography>
        )}
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
            <div style={{ paddingTop: theme.spacing(2), paddingBottom: theme.spacing(4) }}>
              <Card variant="outlined" style={{ backgroundColor: theme.palette.background.default }}>
                <div style={{ padding: theme.spacing(2) }}>
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

      <Dialog
        fullScreen={fullScreen}
        open={addApikey}
        onClose={() => handleNew()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('apikeys.add_title')}</DialogTitle>
        <DialogContent>
          <TextField
            style={{ width: '100%' }}
            size="small"
            margin="normal"
            variant="outlined"
            label={t('apikeys.temp_token')}
            onChange={handleKeyNameChange}
            value={tempKeyName}
            autoFocus
          />
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <div style={{ alignSelf: 'center', flexGrow: 2 }}>
              <FormControl size="small">
                <Select id="priv" value={tempKeyPriv} onChange={handleSelectChange} variant="outlined">
                  <MenuItem value="READ">{t('apikeys.r_token')}</MenuItem>
                  <MenuItem value="READ_WRITE">{t('apikeys.rw_token')}</MenuItem>
                  <MenuItem value="WRITE">{t('apikeys.w_token')}</MenuItem>
                  {configuration.auth.allow_extended_apikeys && (
                    <MenuItem value="EXTENDED">{t('apikeys.e_token')}</MenuItem>
                  )}
                  <MenuItem value="CUSTOM">{t('apikeys.c_token')}</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <div style={{ marginTop: theme.spacing(2) }}>
            {currentUser.roles.sort().map((role, role_id) => (
              <CustomChip
                key={role_id}
                type="rounded"
                size="small"
                color={tempKeyRoles.includes(role) ? 'primary' : 'default'}
                onClick={() => toggleRole(role)}
                label={t(`role.${role}`)}
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleNew()} color="primary">
            {t('cancel')}
          </Button>
          <Button
            onClick={() => handleCreate()}
            color="primary"
            disabled={tempKeyName === null || tempKeyName === '' || tempKeyRoles.length === 0}
          >
            {t('apikeys.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
