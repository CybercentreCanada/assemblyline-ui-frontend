import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
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
import type { ACL, ApiKey, Role } from 'components/models/base/user';
import { PRIV_TO_ACL_MAP } from 'components/models/base/user';
import CustomChip from 'components/visual/CustomChip';
import DatePicker from 'components/visual/DatePicker';
import Moment from 'components/visual/Moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';

/**
 * @name useAPIKeyUtilities
 * @description Utilities values and function used by the API keys components
 * @param defaults default API key value
 * @param selectACL Applying the corresponding ACL and role values given an stringified ACL input value
 * @param toggleRole Applying the corresponding ACL and role values when toggling the value of a role
 */
export const useAPIKeyUtilities = () => {
  const { configuration, user: currentUser } = useALContext();

  const defaults = useMemo<ApiKey>(
    () => ({
      acl: ['R'],
      expiry_ts: null,
      key_name: '',
      roles: [...configuration.user.priv_role_dependencies.R],
      uname: ''
    }),
    [configuration.user.priv_role_dependencies.R]
  );

  const arraysEqual = useCallback((array1: unknown[], array2: unknown[]): boolean => {
    const arr2 = array2.sort();
    return array1.length === array2.length && array1.sort().every((value, index) => value === arr2[index]);
  }, []);

  const selectACL = useCallback(
    (value: string) => {
      const acl = value.split('') as ACL[];
      const roles = [
        ...new Set(
          acl.flatMap(item =>
            configuration.user.priv_role_dependencies[item].filter(r => currentUser.roles.includes(r))
          )
        )
      ].sort();

      return { roles, acl };
    },
    [configuration.user.priv_role_dependencies, currentUser.roles]
  );

  const toggleRole = useCallback(
    (roles: Role[], role: Role) => {
      const index = roles.indexOf(role);
      const nextRoles = index < 0 ? [...roles, role].sort() : roles.filter(r => r !== role);
      const acl = Object.entries(PRIV_TO_ACL_MAP).find(([, values]) =>
        arraysEqual([...new Set(values.flatMap(v => configuration.user.priv_role_dependencies[v]))], nextRoles)
      );
      return { acl: !acl ? (['C'] as ACL[]) : acl[1], roles: nextRoles };
    },
    [arraysEqual, configuration.user.priv_role_dependencies]
  );

  return { defaults, selectACL, toggleRole };
};

/**
 * @name APIKeyDeleteDialog
 * @description Defines the dialog component to delete an API key.
 */

type APIKeyDeleteDialogProps = {
  apikey: ApiKey;
  children: (onOpen: () => void) => React.ReactNode;
  onAPIKeysChange?: (changeApiKeys: (prev: ApiKey[]) => ApiKey[]) => void;
};

const APIKeyDeleteDialog = React.memo(
  ({ apikey = null, children = () => null, onAPIKeysChange = () => null }: APIKeyDeleteDialogProps) => {
    const { t } = useTranslation(['adminAPIkeys']);
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { showSuccessMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDelete = useCallback(
      (values: ApiKey) => {
        apiCall({
          url: `/api/v4/apikey/${values.id}/`,
          method: 'DELETE',
          onSuccess: () => {
            showSuccessMessage(t('apikeys.removed'));
            setOpen(false);
            onAPIKeysChange(prev => prev.filter(x => x.id != values.id));
          },
          onEnter: () => setLoading(true),
          onExit: () => setLoading(false)
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [showSuccessMessage, t, onAPIKeysChange]
    );

    return (
      <>
        {children(() => setOpen(true))}
        <Dialog fullScreen={fullScreen} open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            {t('apikeys.remove_title')}: {apikey.key_name}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>{t('apikeys.remove_text')}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" autoFocus disabled={loading} onClick={() => setOpen(false)}>
              {t('cancel')}
              {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
            </Button>
            <Button color="primary" disabled={loading} onClick={() => handleDelete(apikey)}>
              {t('apikeys.remove')}
              {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

/**
 * @name NewAPIKeyDialog
 * @description Defines the dialog component to show the API key's newly created password to use it.
 */

export type NewApiKey = Pick<ApiKey, 'acl' | 'expiry_ts' | 'key_name' | 'roles' | 'uname'> & {
  keypassword: string;
};

type NewAPIKeyDialogProps = {
  apikey?: NewApiKey;
  onClose?: () => void;
};

const NewAPIKeyDialog = React.memo(({ apikey = null, onClose = () => null }: NewAPIKeyDialogProps) => {
  const { t } = useTranslation(['adminAPIkeys']);
  const theme = useTheme();
  const { copy } = useClipboard();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog fullScreen={fullScreen} open={!!apikey} onClose={onClose} PaperProps={{ style: { minWidth: '650px' } }}>
      <DialogTitle>{t('apikeys.new_title')}</DialogTitle>
      {apikey && (
        <DialogContent>
          <DialogContentText component="div">
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
                <Typography component="span" sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {apikey.keypassword}
                </Typography>
                <IconButton color="primary" size="large" onClick={() => copy(apikey.keypassword)}>
                  <BsClipboard fontSize="large" />
                </IconButton>
              </Card>
            </div>
          </DialogContentText>
          <DialogContentText component="div">
            <Typography variant="subtitle2" color="textPrimary">
              {t('apikeys.new_notice_title')}
            </Typography>
          </DialogContentText>
          <DialogContentText component="div">
            <Typography variant="body2">{t('apikeys.new_notice_text')}</Typography>
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button color="primary" autoFocus onClick={onClose}>
          {t('done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

/**
 * @name APIKeyUpsertingDialog
 * @description Defines the dialog component to create or modify an API key.
 */

type APIKeyUpsertingDialogProps = {
  apikey?: ApiKey;
  children: (onOpen: () => void) => React.ReactNode;
  onAPIKeysChange?: (changeApiKeys: (prev: ApiKey[]) => ApiKey[]) => void;
};

const APIKeyUpsertingDialog = React.memo(
  ({ apikey: prevApiKey = null, children = () => null, onAPIKeysChange = () => null }: APIKeyUpsertingDialogProps) => {
    const { t } = useTranslation(['adminAPIkeys']);
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { configuration, user: currentUser } = useALContext();
    const { defaults, selectACL, toggleRole } = useAPIKeyUtilities();
    const { showSuccessMessage } = useMySnackbar();

    const [apikey, setApiKey] = useState<ApiKey>(prevApiKey || defaults);
    const [newApiKey, setNewApiKey] = useState<NewApiKey>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const keynameRegex = useMemo(() => new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$'), []);

    const handleUpsert = useCallback(
      (values: ApiKey) => {
        apiCall<NewApiKey>({
          url: `/api/v4/apikey/add/` + (!prevApiKey ? '' : `?keyid=${encodeURIComponent(values.id)}`),
          method: 'PUT',
          body: {
            key_name: values.key_name,
            roles: values.roles,
            expiry_ts: values.expiry_ts,
            priv: values.acl
          },
          onSuccess: ({ api_response }) => {
            if (!prevApiKey) {
              setNewApiKey(api_response);
              setApiKey(prevApiKey || defaults);
            } else {
              showSuccessMessage(`${t('apikey.updated')} ${api_response.key_name}`);
            }

            setOpen(false);
            onAPIKeysChange(prev => prev.filter(x => x.key_name != api_response.key_name).concat(api_response));
          },
          onEnter: () => setLoading(true),
          onExit: () => setLoading(false)
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [prevApiKey, showSuccessMessage]
    );

    return (
      <>
        {children(() => setOpen(true))}
        <NewAPIKeyDialog apikey={newApiKey} onClose={() => setNewApiKey(null)} />
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={() => {
            setOpen(false);
            setApiKey(prevApiKey || defaults);
          }}
        >
          <DialogTitle>{!prevApiKey ? t('apikeys.add_title') : t('apikeys.modify_title')}</DialogTitle>
          <DialogContent>
            <div>
              <Typography component="label" htmlFor="temp_token" variant="body2">
                {t('apikeys.temp_token')}
              </Typography>
              <TextField
                id="temp_token"
                autoFocus
                disabled={!!prevApiKey || loading}
                margin="normal"
                size="small"
                sx={{ width: '100%', marginTop: '0px' }}
                value={apikey.key_name}
                variant="outlined"
                onChange={event => {
                  if (keynameRegex.test(event.target.value) || event.target.value === '') {
                    setApiKey(a => ({ ...a, key_name: event.target.value }));
                  } else {
                    event.preventDefault();
                  }
                }}
              />
            </div>

            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                columnGap: theme.spacing(1)
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography component="label" htmlFor="expiry_ts" variant="body2">
                  {t('expiration_date')}
                </Typography>
                <DatePicker
                  aria-labelledby="expiry_ts-label"
                  date={apikey.expiry_ts}
                  disabled={loading}
                  setDate={date => setApiKey(prev => ({ ...prev, expiry_ts: date }))}
                  type="input"
                  minDateTomorrow
                  defaultDateOffset={
                    !prevApiKey && configuration.auth.apikey_max_dtl ? configuration.auth.apikey_max_dtl - 1 : null
                  }
                />
              </div>

              <FormControl size="small" fullWidth sx={{ flex: 1 }}>
                <Typography component="label" htmlFor="priv" variant="body2">
                  {t('acl.label')}
                </Typography>
                <Select
                  id="priv"
                  variant="outlined"
                  value={apikey.acl.join('')}
                  disabled={loading}
                  onChange={event => setApiKey(prev => ({ ...prev, ...selectACL(event.target.value) }))}
                >
                  <MenuItem value="R">{t('apikeys.r_token')}</MenuItem>
                  <MenuItem value="RW">{t('apikeys.rw_token')}</MenuItem>
                  <MenuItem value="W">{t('apikeys.w_token')}</MenuItem>
                  {configuration.auth.allow_extended_apikeys && <MenuItem value="E">{t('apikeys.e_token')}</MenuItem>}
                  <MenuItem value="C">{t('apikeys.c_token')}</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div style={{ marginTop: theme.spacing(2) }}>
              {currentUser.roles.sort().map((role, i) => (
                <CustomChip
                  key={`${role}-${i}`}
                  type="rounded"
                  size="small"
                  color={apikey.roles.includes(role) ? 'primary' : 'default'}
                  label={t(`role.${role}`)}
                  disabled={loading}
                  onClick={() => setApiKey(prev => ({ ...prev, ...toggleRole(prev.roles, role) }))}
                />
              ))}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              disabled={loading}
              onClick={() => {
                setOpen(false);
                setApiKey(prevApiKey || defaults);
              }}
            >
              {t('cancel')}
              {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
            </Button>
            <Button
              color="primary"
              disabled={!apikey.key_name || !apikey.roles.length || loading}
              onClick={() => handleUpsert(apikey)}
            >
              {!prevApiKey ? t('apikeys.add') : t('apikeys.save')}
              {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

/**
 * @name APIKeyCard
 * @description Defines the Card component that displays the details of an API key
 */

type APIKeyCardProps = {
  apikey: ApiKey;
  onAPIKeysChange?: (changeApiKeys: (prev: ApiKey[]) => ApiKey[]) => void;
};

const APIKeyCard = ({ apikey, onAPIKeysChange = () => null }: APIKeyCardProps) => {
  const { t } = useTranslation(['adminAPIkeys']);
  const theme = useTheme();

  return (
    <Card variant="outlined" sx={{ backgroundColor: '#00000015', marginBottom: theme.spacing(1) }}>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', rowGap: theme.spacing(1) }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography
              style={{ flex: 1, marginRight: theme.spacing(1), fontFamily: 'monospace', wordBreak: 'break-word' }}
            >
              {apikey.key_name}
            </Typography>

            <APIKeyUpsertingDialog apikey={apikey} onAPIKeysChange={onAPIKeysChange}>
              {onOpen => (
                <Tooltip title={t('edit.button.label')}>
                  <div>
                    <IconButton size="small" onClick={() => onOpen()}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              )}
            </APIKeyUpsertingDialog>

            <APIKeyDeleteDialog apikey={apikey} onAPIKeysChange={onAPIKeysChange}>
              {onOpen => (
                <Tooltip title={t('delete.button.label')}>
                  <div>
                    <IconButton size="small" onClick={() => onOpen()}>
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              )}
            </APIKeyDeleteDialog>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: theme.spacing(1) }}>
            <span style={{ fontWeight: 500 }}>{t('creation_date')}</span>
            {apikey ? (
              apikey?.creation_date ? (
                <div>
                  <Moment format="YYYY-MM-DD">{apikey.creation_date}</Moment>&nbsp; (
                  <Moment variant="fromNow">{apikey.creation_date}</Moment>)
                </div>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {t('none')}
                </Typography>
              )
            ) : (
              <Skeleton />
            )}

            <span style={{ fontWeight: 500 }}>{t('last_used')}</span>
            {apikey ? (
              apikey?.last_used ? (
                <div>
                  <Moment format="YYYY-MM-DD">{apikey.last_used}</Moment>
                </div>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {t('none')}
                </Typography>
              )
            ) : (
              <Skeleton />
            )}

            <span style={{ fontWeight: 500 }}>{t('expiration_date')}</span>
            {apikey ? (
              apikey.expiry_ts ? (
                <div>
                  <Moment format="YYYY-MM-DD">{apikey.expiry_ts}</Moment>&nbsp; (
                  <Moment variant="fromNow">{apikey.expiry_ts}</Moment>)
                </div>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {t('expiry.forever')}
                </Typography>
              )
            ) : (
              <Skeleton />
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {apikey.roles
              ?.sort()
              .map((role, i) => (
                <CustomChip key={`${role}-${i}`} type="rounded" label={t(`role.${role}`)} size="tiny" color="primary" />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * @name APIKeys
 * @description Defines the content component of the drawer that shows the user's API keys
 */

type APIKeysProps = {
  username: string;
};

export default function APIKeys({ username }: APIKeysProps) {
  const { t } = useTranslation(['adminAPIkeys']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const onAPIKeysChange = useCallback((changeApiKeys: (prev: ApiKey[]) => ApiKey[]) => {
    setApiKeys(prev => changeApiKeys(prev));
  }, []);

  useEffect(() => {
    apiCall<ApiKey[]>({
      url: `/api/v4/apikey/username/${username}/`,
      onSuccess: ({ api_response }) => setApiKeys(api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return (
    <>
      <div style={{ display: 'flex', marginBottom: theme.spacing(1), alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('apikeys.title')}
        </Typography>

        <APIKeyUpsertingDialog onAPIKeysChange={onAPIKeysChange}>
          {onOpen => (
            <Tooltip title={t('apikeys.add')}>
              <IconButton
                onClick={() => onOpen()}
                sx={{
                  color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                }}
              >
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </APIKeyUpsertingDialog>
      </div>
      <Typography variant="caption" gutterBottom>
        {t('apikeys.desc')}
      </Typography>
      <div style={{ paddingTop: theme.spacing(4), paddingBottom: theme.spacing(4) }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('apikeys.list')}
        </Typography>
        {apiKeys.length !== 0 ? (
          apiKeys
            .sort((a, b) => a.key_name.localeCompare(b.key_name))
            .map((apikey, i) => (
              <APIKeyCard key={`${apikey.id}-${i}`} apikey={apikey} onAPIKeysChange={onAPIKeysChange} />
            ))
        ) : (
          <Typography variant="subtitle2" color="secondary">
            {t('apikeys.none')}
          </Typography>
        )}
      </div>
    </>
  );
}
