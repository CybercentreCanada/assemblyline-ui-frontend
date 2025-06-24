import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { type ApiKey } from 'components/models/base/user';
import ForbiddenPage from 'components/routes/403';
import { useAPIKeyUtilities } from 'components/routes/user/api_keys';
import { IconButton } from 'components/visual/Buttons/IconButton';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import DatePicker from 'components/visual/DatePicker';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import Moment from 'components/visual/Moment';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

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
  const { selectACL, toggleRole } = useAPIKeyUtilities();
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

  useEffect(() => {
    if (key_id || id) {
      handleReload();
    }
  }, [key_id, id, handleReload]);

  return currentUser.is_admin ? (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <RouterPrompt when={modified} />

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

      <PageHeader
        primary={t('apikey')}
        loading={!apiKey}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(4) } },
          actions: { spacing: 1 }
        }}
        actions={
          <IconButton
            disabled={loading}
            loading={!apiKey}
            preventRender={!(key_id || id)}
            size="large"
            tooltip={t('apikey.remove.tooltip')}
            onClick={() => setDeleteDialog(true)}
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
            }}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        }
      />

      <div style={{ textAlign: 'left' }}>
        <Grid container spacing={3}>
          {apiKey && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6"> {t('key.detail.title')}</Typography>
              <Divider />
              <Grid container marginTop={1}>
                <Grid size={{ xs: 4, sm: 3 }}>
                  <span style={{ fontWeight: 500 }}>{t('key.name.title')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9 }}>
                  <span style={{ fontWeight: 500 }}>{apiKey.key_name}</span>
                </Grid>
                <Grid size={{ xs: 4, sm: 3 }}>
                  <span style={{ fontWeight: 500 }}>{t('username.title')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9 }} style={{ wordBreak: 'break-word' }}>
                  <span style={{ fontWeight: 500 }}>{apiKey.uname}</span>
                </Grid>
              </Grid>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="end">
              <Grid size="grow">
                <Typography variant="h6">{t('timing.title')}</Typography>
              </Grid>
              <Grid size="auto" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                {apiKey ? (
                  <DatePicker
                    aria-labelledby="expiry_ts-label"
                    date={apiKey.expiry_ts}
                    setDate={date => setApiKey(prev => ({ ...prev, expiry_ts: date }))}
                    tooltip={t('expiry.change')}
                    minDateTomorrow
                  />
                ) : (
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                )}
              </Grid>
            </Grid>
            <Divider />
            <Grid container marginTop={1}>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>{t('creation_date')}</span>
              </Grid>
              <Grid size={{ xs: 8, sm: 9 }}>
                {apiKey ? (
                  apiKey?.creation_date ? (
                    <div>
                      <Moment format="YYYY-MM-DD">{apiKey.creation_date}</Moment>&nbsp; (
                      <Moment variant="fromNow">{apiKey.creation_date}</Moment>)
                    </div>
                  ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('none')}
                    </Typography>
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>{t('last_used')}</span>
              </Grid>
              <Grid size={{ xs: 8, sm: 9 }}>
                {apiKey ? (
                  apiKey?.last_used ? (
                    <div>
                      <Moment format="YYYY-MM-DD">{apiKey.last_used}</Moment>
                    </div>
                  ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('never')}
                    </Typography>
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>{t('expiration_date')}</span>
              </Grid>
              <Grid size={{ xs: 8, sm: 9 }}>
                {apiKey ? (
                  apiKey.expiry_ts ? (
                    <div>
                      <Moment format="YYYY-MM-DD">{apiKey.expiry_ts}</Moment>&nbsp; (
                      <Moment variant="fromNow">{apiKey.expiry_ts}</Moment>)
                    </div>
                  ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('expiry.forever')}
                    </Typography>
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="end">
              <Grid size={{ xs: 9 }}>
                <Typography variant="h6">{t('permissions.title')}</Typography>
              </Grid>
              <Grid
                size={{ xs: 3 }}
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}
              ></Grid>
            </Grid>
            <Divider />
            <Grid container marginTop={1}>
              {apiKey && (
                <FormControl size="small">
                  <Typography component="label" htmlFor="priv" variant="body2">
                    {t('acl.label')}
                  </Typography>
                  <Select
                    id="priv"
                    variant="outlined"
                    value={apiKey.acl.join('')}
                    onChange={event => setApiKey(prev => ({ ...prev, ...selectACL(event.target.value) }))}
                  >
                    <MenuItem value="R">{t('apikeys.r_token')}</MenuItem>
                    <MenuItem value="RW">{t('apikeys.rw_token')}</MenuItem>
                    <MenuItem value="W">{t('apikeys.w_token')}</MenuItem>
                    {configuration.auth.allow_extended_apikeys && <MenuItem value="E">{t('apikeys.e_token')}</MenuItem>}
                    <MenuItem value="C">{t('apikeys.c_token')}</MenuItem>
                  </Select>
                </FormControl>
              )}

              {apiKey && (
                <div style={{ marginTop: theme.spacing(2) }}>
                  <Typography component="label" htmlFor="priv" variant="body2">
                    {t('roles')}
                  </Typography>
                  <div>
                    {currentUser.roles.sort().map((role, i) => (
                      <CustomChip
                        key={`${role}-${i}`}
                        label={t(`role.${role}`)}
                        type="rounded"
                        size="small"
                        color={apiKey.roles.includes(role) ? 'primary' : 'default'}
                        onClick={() => setApiKey(prev => ({ ...prev, ...toggleRole(prev.roles, role) }))}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Grid>
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
