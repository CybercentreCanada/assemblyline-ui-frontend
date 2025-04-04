import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { SelectChangeEvent } from '@mui/material';
import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { PRIV_TO_ACL_MAP, type ACL, type ApiKey, type Role } from 'components/models/base/user';
import ForbiddenPage from 'components/routes/403';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import DatePicker from 'components/visual/DatePicker';
import Moment from 'components/visual/Moment';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

const arraysEqual = (array1: unknown[], array2: unknown[]): boolean => {
  const arr2 = array2.sort();
  return array1.length === array2.length && array1.sort().every((value, index) => value === arr2[index]);
};

type ParamProps = {
  id: string;
};

type ApikeyDetailProps = {
  key_id?: string;
  onClose?: () => void;
};

const ApikeyDetail = ({ key_id = null, onClose = () => null }: ApikeyDetailProps) => {
  const { t } = useTranslation(['adminAPIkeys']);
  const navigate = useNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { configuration, user: currentUser } = useALContext();
  const { id } = useParams<ParamProps>();
  const { showSuccessMessage } = useMySnackbar();

  const [apiKey, setApiKey] = useState<ApiKey>(null);
  const [prevApiKey, setPrevApiKey] = useState<ApiKey>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);

  const modified = useMemo<boolean>(() => JSON.stringify(apiKey) !== JSON.stringify(prevApiKey), [apiKey, prevApiKey]);

  const handleReload = useCallback(() => {
    apiCall<ApiKey>({
      url: `/api/v4/apikey/${key_id || id}/`,
      onSuccess: ({ api_response }) => {
        setApiKey({ ...api_response, roles: api_response.roles.sort() });
        setPrevApiKey({ ...api_response, roles: api_response.roles.sort() });
      },
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key_id, id]);

  const handleDelete = useCallback(() => {
    apiCall({
      url: `/api/v4/apikey/${key_id || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        setDeleteDialog(false);
        showSuccessMessage(t('delete.success'));
        if (id || key_id) setTimeout(() => navigate('/admin/apikeys'), 1000);
        onClose();
      },
      onEnter: () => {
        setLoading(true);
        setWaitingDialog(true);
      },
      onExit: () => {
        setLoading(false);
        setWaitingDialog(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key_id, id, showSuccessMessage, t, onClose, navigate]);

  const handleSave = useCallback(
    (value: ApiKey) => {
      apiCall({
        url: `/api/v4/apikey/add/?keyid=${encodeURIComponent(value.id)}`,
        method: 'PUT',
        body: {
          expiry_ts: value.expiry_ts,
          key_name: value.key_name,
          priv: value.acl,
          roles: value.roles,
          uname: value.uname
        },
        onSuccess: () => {
          setPrevApiKey({ ...value });
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadAPIKeys')), 1000);
        },
        onEnter: () => {
          setLoading(true);
          setWaitingDialog(true);
        },
        onExit: () => {
          setLoading(false);
          setWaitingDialog(false);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleACLChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const acl = event.target.value.split('') as ACL[];
      const roles = [
        ...new Set(
          acl.flatMap(item =>
            configuration.user.priv_role_dependencies[item].filter(r => currentUser.roles.includes(r))
          )
        )
      ].sort();
      setApiKey(prev => ({ ...prev, roles, acl }));
    },
    [configuration.user.priv_role_dependencies, currentUser.roles]
  );

  const handleRoleChange = useCallback(
    (role: Role) => {
      setApiKey(prev => {
        const index = prev.roles.indexOf(role);
        const roles = index < 0 ? [...prev.roles, role].sort() : prev.roles.filter(r => r !== role);
        const acl = Object.entries(PRIV_TO_ACL_MAP).find(([, values]) =>
          arraysEqual([...new Set(values.flatMap(v => configuration.user.priv_role_dependencies[v]))], roles)
        );
        return { ...prev, acl: !acl ? ['C'] : acl[1], roles: roles };
      });
    },
    [configuration.user.priv_role_dependencies]
  );

  useEffect(() => {
    if (key_id || id) {
      handleReload();
    }
  }, [key_id, id, handleReload]);

  return currentUser.is_admin ? (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => {
          setDeleteDialog(false);
          onClose();
        }}
        handleAccept={() => handleDelete()}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={waitingDialog}
      />

      <div style={{ textAlign: 'left' }}>
        <Grid container sx={{ marginBottom: theme.spacing(1) }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item md={9} sx={{ textAlign: 'left', flexGrow: 0 }}>
              <Typography variant="h4">{t('apikey')}</Typography>
            </Grid>

            <Grid item md={3} sx={{ textAlign: 'right', flexGrow: 0 }}>
              {apiKey ? (
                <>
                  {(key_id || id) && (
                    <div>
                      {
                        <Tooltip title={t('remove')}>
                          <IconButton
                            disabled={loading}
                            size="large"
                            onClick={() => setDeleteDialog(true)}
                            sx={{
                              color:
                                theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                            }}
                          >
                            <DeleteOutlineOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex' }}>
                    <Skeleton variant="circular" height="3rem" width="3rem" sx={{ margin: theme.spacing(0.5) }} />
                    {
                      <>
                        <Skeleton variant="circular" height="3rem" width="3rem" sx={{ margin: theme.spacing(0.5) }} />
                        <Skeleton variant="circular" height="3rem" width="3rem" sx={{ margin: theme.spacing(0.5) }} />
                      </>
                    }
                  </div>
                </>
              )}
            </Grid>
          </Grid>

          <Grid container sx={{ marginBottom: theme.spacing(1) }}>
            <Grid item xs={12} sx={{ textAlign: 'left', flexGrow: 0 }}>
              <Typography variant="h6" sx={{ marginBottom: theme.spacing(1) }}>
                {t('key.detail.title')}
              </Typography>
              <Divider />
            </Grid>
          </Grid>
          <Grid container sx={{ marginBottom: theme.spacing(1) }}>
            {apiKey ? (
              <div style={{ textAlign: 'left', flexGrow: 0 }}>
                <Grid container>
                  <Grid item md={4}>
                    <span style={{ fontWeight: 500 }}>{t('key.name.title')}</span>
                  </Grid>
                  <Grid item md={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    <span style={{ fontWeight: 500 }}>{apiKey.key_name}</span>
                  </Grid>
                  <Grid item md={4}>
                    <span style={{ fontWeight: 500 }}>{t('username.title')}</span>
                  </Grid>
                  <Grid item md={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    <span style={{ fontWeight: 500 }}>{apiKey.uname}</span>
                  </Grid>
                </Grid>
              </div>
            ) : (
              <div></div>
            )}
          </Grid>

          <Grid container sx={{ marginBottom: theme.spacing(1) }}>
            <Grid item xs={12} sx={{ textAlign: 'left', flexGrow: 0, marginBottom: theme.spacing(1) }}>
              <Typography variant="h6" sx={{ marginBottom: theme.spacing(1) }}>
                {t('permissions.title')}
              </Typography>
              <Divider />
            </Grid>
            <Grid container>
              {apiKey ? (
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                  <FormControl size="small">
                    <Select
                      id="priv"
                      value={apiKey.acl.join('')}
                      onChange={event => handleACLChange(event)}
                      variant="outlined"
                    >
                      <MenuItem value="R">{t('apikeys.r_token')}</MenuItem>
                      <MenuItem value="RW">{t('apikeys.rw_token')}</MenuItem>
                      <MenuItem value="W">{t('apikeys.w_token')}</MenuItem>
                      {configuration.auth.allow_extended_apikeys && (
                        <MenuItem value="E">{t('apikeys.e_token')}</MenuItem>
                      )}
                      <MenuItem value="C">{t('apikeys.c_token')}</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              ) : (
                <div></div>
              )}
              {apiKey ? (
                <div style={{ marginTop: theme.spacing(2) }}>
                  {currentUser.roles.sort().map((role, role_id) => (
                    <CustomChip
                      key={role_id}
                      type="rounded"
                      size="small"
                      color={apiKey.roles.includes(role) ? 'primary' : 'default'}
                      onClick={() => handleRoleChange(role)}
                      label={t(`role.${role}`)}
                    />
                  ))}
                </div>
              ) : (
                <div></div>
              )}
              <RouterPrompt when={modified} />
            </Grid>
          </Grid>

          <Grid container sx={{ marginBottom: theme.spacing(1) }}>
            <Grid container>
              <Grid item md={9} sx={{ textAlign: 'left', flexGrow: 0 }}>
                <Typography variant="h6">{t('timing.title')}</Typography>
              </Grid>
              {apiKey ? (
                <Grid item md={3} sx={{ textAlign: 'right', flexGrow: 0 }}>
                  <DatePicker
                    date={apiKey.expiry_ts}
                    setDate={date => setApiKey(prev => ({ ...prev, expiry_ts: date }))}
                    tooltip={t('expiry.change')}
                    minDateTomorrow
                  />
                </Grid>
              ) : (
                <div></div>
              )}

              <Divider />
            </Grid>

            {apiKey ? (
              <div>
                <Grid container>
                  <Grid item xs={6} sm={6}>
                    <span style={{ fontWeight: 500 }}>{t('creation_date')}</span>
                  </Grid>
                  <Grid item xs={6} sm={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    <Moment format="YYYY-MM-DD">{apiKey.creation_date}</Moment>
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <span style={{ fontWeight: 500 }}>{t('last_used')}</span>
                  </Grid>
                  <Grid item xs={6} sm={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    {apiKey.last_used ? <Moment format="YYYY-MM-DD">{apiKey.last_used}</Moment> : <></>}
                  </Grid>

                  <Grid item xs={6} sm={6}>
                    <span style={{ fontWeight: 500 }}>{t('expiration_date')}</span>
                  </Grid>
                  <Grid item xs={6} sm={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    {apiKey.expiry_ts ? <Moment format="YYYY-MM-DD">{apiKey.expiry_ts}</Moment> : <></>}
                  </Grid>
                </Grid>
              </div>
            ) : (
              <div></div>
            )}
          </Grid>
        </Grid>
      </div>
      {apiKey && modified ? (
        <div
          style={{
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: theme.zIndex.drawer - 1,
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[4]
          }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={loading || !modified}
            onClick={() => handleSave(apiKey)}
            sx={{ justifyContent: 'center', align: 'center' }}
          >
            {t('save')}
            {loading && <CircularProgress size={24} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
};

export default ApikeyDetail;
