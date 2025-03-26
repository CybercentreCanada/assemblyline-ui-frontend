import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { ApiKey, User } from 'components/models/base/user';
import CustomChip from 'components/visual/CustomChip';
import DatePicker from 'components/visual/DatePicker';
import Moment from 'components/visual/Moment';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';

type APIKeyCardProps = {
  name: string;
  apikey: ApiKey;
  askForDelete: (apikey: string) => void;
  changeApikey: (apikey: ApiKey) => void;
};

const APIKeyCard = ({ name, apikey, askForDelete, changeApikey }: APIKeyCardProps) => {
  const { t } = useTranslation(['apikeys']);
  const theme = useTheme();

  return (
    <Card
      style={{
        backgroundColor: '#00000015',
        padding: theme.spacing(1),
        borderRadius: theme.spacing(0.5),
        marginBottom: theme.spacing(1)
      }}
      variant="outlined"
    >
      <CardActionArea>
        <CardContent>
          <div style={{ display: 'flex', marginBottom: theme.spacing(1), alignItems: 'center' }}>
            <Typography style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>{apikey.key_name}</Typography>

            <div>
              <IconButton size="small" onClick={() => changeApikey(apikey)}>
                <EditOutlinedIcon />
              </IconButton>

              <IconButton size="small" onClick={() => askForDelete(apikey.id)}>
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </div>

            {apikey.expiry_ts ? (
              <div>
                {t('expiration_date')}: <span />
                <Moment format="YYYY-MM-DD">{apikey.expiry_ts}</Moment>
              </div>
            ) : (
              ''
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {apikey.roles?.sort().map((e, x) => (
              <div key={x} style={{ marginRight: theme.spacing(0.5), marginBottom: theme.spacing(0.25) }}>
                <CustomChip type="rounded" label={t(`role.${e}`)} size="tiny" color="primary" />
              </div>
            ))}
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

type APIKeysProps = {
  user: User;
  toggleAPIKey: (name: string, apiKey?: ApiKey) => void;
  reloadApiKey: () => void;
};

export default function APIKeys({ user, toggleAPIKey, reloadApiKey }: APIKeysProps) {
  const { t } = useTranslation(['apikeys']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { configuration, user: currentUser } = useALContext();
  const { copy } = useClipboard();
  const { showSuccessMessage } = useMySnackbar();

  const [modifyApikey, setModifyApikey] = useState(false);
  const [createNewKey, setCreateNewKey] = useState(false);
  const [deleteApikeyId, setDeleteApikeyId] = useState(null);
  const [tempAPIKey, setTempAPIKey] = useState<ApiKey>(null);
  const [createMessage, setCreateMessage] = useState(null);
  const [tempKeyName, setTempKeyName] = useState('');
  const [tempExpiryTs, setTempExpiryTs] = useState(null);
  const [tempKeyPriv, setTempKeyPriv] = useState(['R']);
  const [tempKeyRoles, setTempKeyRoles] = useState(configuration.user.priv_role_dependencies.R);

  const [apikeys, SetApikeys] = useState(user.apikeys);

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const regex = RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');

  function handleDelete() {
    apiCall({
      url: `/api/v4/apikey/${deleteApikeyId}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('apikeys.removed'));
        handleNew();
        setDeleteApikeyId(null);
        setCreateNewKey(false);
        setModifyApikey(false);
      }
    });
  }

  function handleCreate() {
    apiCall({
      method: 'PUT',
      body: {
        key_name: tempKeyName,
        roles: tempKeyRoles,
        expiry_ts: tempExpiryTs,
        priv: tempKeyPriv
      },
      url: `/api/v4/apikey/add/` + (createNewKey ? '' : `?keyid=${encodeURIComponent(tempAPIKey.id)}`),
      onSuccess: api_data => {
        createNewKey
          ? setCreateMessage(api_data.api_response.keypassword)
          : showSuccessMessage(`Key ${api_data.api_response.key_name} Successfully updated.`);

        setCreateNewKey(false);
        setModifyApikey(false);
        handleNew();

        toggleAPIKey(api_data.api_response.name, {
          acl: api_data.api_response.apikey.acl,
          roles: api_data.api_response.apikey.roles,
          key_name: api_data.api_response.apikey.key_name,
          uname: api_data.api_response.apikey.uname,
          expiry_ts: api_data.api_response.apikey.expiry_ts,
          id: api_data.api_response.apikeye.id
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
    setTempKeyPriv(event.target.value.split());
    let roles = [];
    if (tempKeyPriv) {
      for (const ac of tempKeyPriv) {
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

    setTempKeyPriv(['C']);
    setTempKeyRoles(newRoles);
  }

  function handleNew() {
    setModifyApikey(false);
    setCreateNewKey(false);
    setTempAPIKey(null);
    setTempKeyName('');
    setTempExpiryTs(null);
    setTempKeyPriv(['R']);
    reloadApiKey();

    setTempKeyRoles(configuration.user.priv_role_dependencies.R);
  }

  function askForDelete(keyId: string) {
    setDeleteApikeyId(keyId);
  }

  function changeApikey(apikey: ApiKey) {
    setModifyApikey(true);
    setCreateNewKey(false);
    setTempAPIKey(apikey);
    setTempExpiryTs(apikey.expiry_ts);
    setTempKeyPriv(apikey.acl);
    setTempKeyName(apikey.key_name);
  }

  useEffect(() => {
    SetApikeys(user.apikeys);
  }, [reloadApiKey, apikeys]);

  return (
    <>
      <div style={{ display: 'flex', marginBottom: theme.spacing(1), alignItems: 'center' }}>
        <Typography variant="h4" style={{ flexGrow: 1 }}>
          {t('apikeys.title')}
        </Typography>
        <Tooltip title={t('apikeys.add')}>
          <IconButton
            onClick={() => {
              setCreateNewKey(true);
            }}
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
        {Object.keys(apikeys).length !== 0 ? (
          Object.entries(apikeys).map(([name, apikey]) => (
            <APIKeyCard
              key={apikey.id}
              name={name}
              apikey={apikey}
              askForDelete={askForDelete}
              changeApikey={changeApikey}
            />
          ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('apikeys.none')}
          </Typography>
        )}
      </div>

      <Dialog
        fullScreen={fullScreen}
        open={createMessage !== null}
        onClose={() => {
          setCreateMessage(null);
        }}
        aria-labelledby="new-dialog-title"
        aria-describedby="new-dialog-description"
        PaperProps={{ style: { minWidth: '650px' } }}
      >
        <DialogTitle id="new-dialog-title">{t('apikeys.new_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="new-dialog-description" component="div">
            <div style={{ paddingTop: theme.spacing(2), paddingBottom: theme.spacing(4) }}>
              <Card
                variant="outlined"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: theme.palette.background.default,
                  padding: `${theme.spacing(1)} ${theme.spacing(2)}`
                }}
              >
                <Typography component="span" style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {createMessage ? createMessage : ''}
                </Typography>
                <IconButton
                  color="primary"
                  size="large"
                  onClick={() => copy(createMessage ? createMessage : '', 'drawerTop')}
                >
                  <BsClipboard fontSize="large" />
                </IconButton>
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
          <Button onClick={() => setCreateMessage(null)} color="primary" autoFocus>
            {t('done')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen={fullScreen}
        open={deleteApikeyId !== null}
        onClose={() => setDeleteApikeyId(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('apikeys.remove_title')}: {deleteApikeyId}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t('apikeys.remove_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteApikeyId(null)} color="primary" autoFocus>
            {t('cancel')}
          </Button>
          <Button onClick={() => handleDelete()} color="primary">
            {t('apikeys.remove')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen={fullScreen}
        open={modifyApikey || createNewKey}
        onClose={() => handleNew()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {createNewKey ? t('apikeys.add_title') : t('apikeys.modify_title')}
        </DialogTitle>
        <DialogContent>
          <TextField
            style={{ width: '100%' }}
            size="small"
            margin="normal"
            variant="outlined"
            label={t('apikeys.temp_token')}
            onChange={handleKeyNameChange}
            value={tempKeyName}
            disabled={!createNewKey || modifyApikey}
            autoFocus
          />
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <div style={{ alignSelf: 'center', flexGrow: 2 }}>
              <FormControl size="small">
                <Select id="priv" value={tempKeyPriv.join('')} onChange={handleSelectChange} variant="outlined">
                  <MenuItem value="R">{t('apikeys.r_token')}</MenuItem>
                  <MenuItem value="RW">{t('apikeys.rw_token')}</MenuItem>
                  <MenuItem value="W">{t('apikeys.w_token')}</MenuItem>
                  {configuration.auth.allow_extended_apikeys && <MenuItem value="E">{t('apikeys.e_token')}</MenuItem>}
                  <MenuItem value="C">{t('apikeys.c_token')}</MenuItem>
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
          <div>
            {t('expiration_date')} <span />
            <DatePicker
              aria-labelledby="expiry_ts-label"
              date={tempExpiryTs}
              setDate={date => setTempExpiryTs(date)}
              type="input"
              minDateTomorrow
              defaultDateOffset={
                createNewKey && configuration.auth.apikey_max_dtl ? configuration.auth.apikey_max_dtl - 1 : null
              }
            />
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
            {createNewKey ? t('apikeys.add') : t('apikeys.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
