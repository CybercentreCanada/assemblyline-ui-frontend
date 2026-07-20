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
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { ApiKey } from 'models/base/user';
import { ForbiddenPage } from 'pages/forbidden/forbidden';
import { useAPIKeyUtilities } from 'pages/user/components/api_keys';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';
import ConfirmationDialog from 'ui/ConfirmationDialog';
import CustomChip from 'ui/CustomChip';
import DatePicker from 'ui/DatePicker';
import { PageHeader } from 'ui/layouts/PageHeader';
import Moment from 'ui/Moment';
import { PageCenter } from 'ui/pages/PageCenter';

//*****************************************************************************************
// AdminAPIKeyDetail Page
//*****************************************************************************************

export const AdminAPIKeyDetailPage = memo(() => {
  const { t } = useTranslation(['adminAPIkeys']);
  const navigate = useAppNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { configuration, user: currentUser } = useALContext();
  const { selectACL, toggleRole } = useAPIKeyUtilities();
  const { id } = useAppPathParams<'/admin/apikeys/:id'>();
  const { showSuccessMessage } = useMySnackbar();

  const [apiKey, setApiKey] = useState<ApiKey>(null);
  const [prevApiKey, setPrevApiKey] = useState<ApiKey>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);

  const modified = useMemo<boolean>(() => JSON.stringify(apiKey) !== JSON.stringify(prevApiKey), [apiKey, prevApiKey]);

  const handleReload = useCallback(() => {
    apiCall<ApiKey>({
      url: `/api/v4/apikey/${id}/`,
      onSuccess: ({ api_response }) => {
        setApiKey({ ...api_response, roles: api_response.roles.sort() });
        setPrevApiKey({ ...api_response, roles: api_response.roles.sort() });
      },
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = useCallback(() => {
    apiCall({
      url: `/api/v4/apikey/${id}/`,
      method: 'DELETE',
      onSuccess: () => {
        setDeleteDialog(false);
        showSuccessMessage(t('delete.success'));
        navigate.here().delete(true);
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
  }, [id, showSuccessMessage, t, navigate]);

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
    if (id) {
      handleReload();
    }
  }, [id, handleReload]);

  return currentUser.is_admin ? (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => {
          setDeleteDialog(false);
          navigate.here().delete(true);
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
        slotProps={{
          root: { style: { marginBottom: theme.spacing(4) } },
          actions: { spacing: 1 }
        }}
        actions={
          <IconButton
            disabled={loading}
            loading={!apiKey}
            preventRender={!id}
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
});

AdminAPIKeyDetailPage.displayName = 'AdminAPIKeyDetailPage';

//*****************************************************************************************
// AdminAPIKeyDetail Route
//*****************************************************************************************

export const AdminAPIKeyDetailRoute = createAppRoute({
  component: AdminAPIKeyDetailPage,
  route: '/admin/apikeys/:id',
  path: s => ({ id: s.string(null) }),

  forbidden: s => !s.user.is_admin
});
