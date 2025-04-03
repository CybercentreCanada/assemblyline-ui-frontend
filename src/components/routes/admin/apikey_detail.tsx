import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
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
import { ACL, Role, type ApiKey } from 'components/models/base/user';
import ForbiddenPage from 'components/routes/403';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import DatePicker from 'components/visual/DatePicker';
import Moment from 'components/visual/Moment';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

type ApikeyDetailProps = {
  key_id?: string;
  close?: () => void;
};

const ApikeyDetail = ({ key_id = null, close = () => null }: ApikeyDetailProps) => {
  const { t } = useTranslation(['apikeys']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [apikey, setApikey] = useState<ApiKey>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [waitingDialog, setWaitingDialog] = useState(false);
  const { configuration, user: currentUser, c12nDef } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const navigate = useNavigate();
  const [modified, setModified] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [tempExpiryTs, setTempExpiryTs] = useState<string>(null);
  const [tempKeyPriv, setTempKeyPriv] = useState<ACL[]>(['R']);
  const [tempKeyRoles, setTempKeyRoles] = useState<Role[]>(configuration.user.priv_role_dependencies.R);

  const reload = useCallback(() => {
    apiCall({
      url: `/api/v4/apikey/${key_id || id}/`,
      onSuccess: api_data => {
        setApikey(api_data.api_response);
        setTempExpiryTs(api_data.api_response.expiry_ts);
        setTempKeyPriv(api_data.api_response.acl);
        setTempKeyRoles(api_data.api_response.roles);
      }
    });
  }, [key_id, id]);

  const removeApikey = useCallback(() => {
    apiCall({
      url: `/api/v4/apikey/${key_id || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        setDeleteDialog(false);
        showSuccessMessage(t('delete.success'));
        if (id || key_id) {
          setTimeout(() => navigate('/admin/apikeys'), 1000);
        }
        close();
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  }, [key_id, id]);

  const saveApikey = useCallback(() => {
    apiCall({
      method: 'PUT',
      body: {
        key_name: apikey.key_name,
        roles: tempKeyRoles,
        expiry_ts: tempExpiryTs,
        priv: tempKeyPriv,
        uname: apikey.uname
      },
      url: `/api/v4/apikey/add/?keyid=${encodeURIComponent(apikey.id)}`,
      onEnter: () => {
        setWaitingDialog(true);
      },
      onExit: () => {
        setWaitingDialog(false);
        setModified(false);
        reload();
        setTimeout(() => close(), 1000);
      }
    });
  }, [apikey, tempKeyRoles, tempExpiryTs, tempKeyPriv]);

  const handleExpiryDateChange = useCallback(
    date => {
      setApikey({ ...apikey, expiry_ts: date });
      setTempExpiryTs(date);
      setModified(true);
    },
    [apikey]
  );

  const handleSelectChange = useCallback(
    event => {
      const acl = event.target.value.split('');
      let roles = [];

      if (acl) {
        for (const ac of acl) {
          const aclRoles = configuration.user.priv_role_dependencies[ac];
          if (aclRoles) {
            roles.push(...aclRoles.filter(r => currentUser.roles.includes(r)));
          }
        }
      }
      setApikey({ ...apikey, roles, acl });
      setTempKeyPriv(acl);
      setTempKeyRoles(roles);
      setModified(true);
    },
    [apikey]
  );

  const toggleRole = useCallback(
    role => {
      const newRoles = [...apikey.roles];
      if (newRoles.indexOf(role) === -1) {
        newRoles.push(role);
      } else {
        newRoles.splice(newRoles.indexOf(role), 1);
      }

      setApikey({ ...apikey, roles: newRoles, acl: ['C'] });
      setTempKeyPriv(['C']);
      setTempKeyRoles(newRoles);

      setModified(true);
    },
    [apikey]
  );

  useEffect(() => {
    if (key_id || id) {
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key_id, id]);

  return currentUser.is_admin ? (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => {
          setDeleteDialog(false);
          close();
        }}
        handleAccept={removeApikey}
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
              {apikey ? (
                <>
                  {(key_id || id) && (
                    <div>
                      {
                        <Tooltip title={t('remove')}>
                          <IconButton
                            sx={{
                              color:
                                theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                            }}
                            onClick={() => setDeleteDialog(true)}
                            size="large"
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
            {apikey ? (
              <div style={{ textAlign: 'left', flexGrow: 0 }}>
                <Grid container>
                  <Grid item md={4}>
                    <span style={{ fontWeight: 500 }}>{t('key.name.title')}</span>
                  </Grid>
                  <Grid item md={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    <span style={{ fontWeight: 500 }}>{apikey.key_name}</span>
                  </Grid>
                  <Grid item md={4}>
                    <span style={{ fontWeight: 500 }}>{t('username.title')}</span>
                  </Grid>
                  <Grid item md={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    <span style={{ fontWeight: 500 }}>{apikey.uname}</span>
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
              {apikey ? (
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                  <FormControl size="small">
                    <Select id="priv" value={apikey.acl.join('')} onChange={handleSelectChange} variant="outlined">
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
              {apikey ? (
                <div style={{ marginTop: theme.spacing(2) }}>
                  {currentUser.roles.sort().map((role, role_id) => (
                    <CustomChip
                      key={role_id}
                      type="rounded"
                      size="small"
                      color={apikey.roles.includes(role) ? 'primary' : 'default'}
                      onClick={() => toggleRole(role)}
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
              {apikey ? (
                <Grid item md={3} sx={{ textAlign: 'right', flexGrow: 0 }}>
                  <DatePicker
                    date={apikey.expiry_ts}
                    setDate={handleExpiryDateChange}
                    tooltip={t('expiry.change')}
                    minDateTomorrow
                  />
                </Grid>
              ) : (
                <div></div>
              )}

              <Divider />
            </Grid>

            {apikey ? (
              <div>
                <Grid container>
                  <Grid item xs={6} sm={6}>
                    <span style={{ fontWeight: 500 }}>{t('creation_date')}</span>
                  </Grid>
                  <Grid item xs={6} sm={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    <Moment format="YYYY-MM-DD">{apikey.creation_date}</Moment>
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <span style={{ fontWeight: 500 }}>{t('last_used')}</span>
                  </Grid>
                  <Grid item xs={6} sm={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    {apikey.last_used ? <Moment format="YYYY-MM-DD">{apikey.last_used}</Moment> : <></>}
                  </Grid>

                  <Grid item xs={6} sm={6}>
                    <span style={{ fontWeight: 500 }}>{t('expiration_date')}</span>
                  </Grid>
                  <Grid item xs={6} sm={6} sx={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    {apikey.expiry_ts ? <Moment format="YYYY-MM-DD">{apikey.expiry_ts}</Moment> : <></>}
                  </Grid>
                </Grid>
              </div>
            ) : (
              <div></div>
            )}
          </Grid>
        </Grid>
      </div>
      {apikey && modified ? (
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
            disabled={buttonLoading || !modified}
            onClick={saveApikey}
            sx={{ justifyContent: 'center', align: 'center' }}
          >
            {t('save')}
            {buttonLoading && <CircularProgress size={24} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
};

export default ApikeyDetail;
