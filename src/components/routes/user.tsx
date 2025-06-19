import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Skeleton from '@mui/material/Skeleton';
import { red } from '@mui/material/colors';
import PageCenter from 'commons/components/pages/PageCenter';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { User } from 'components/models/base/user';
import APIKeys from 'components/routes/user/api_keys';
import Apps from 'components/routes/user/apps';
import DisableOTP from 'components/routes/user/disable_otp';
import OTP from 'components/routes/user/otp';
import SecurityToken from 'components/routes/user/token';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import React, { memo, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';

type ParsedUser = Omit<
  User,
  'api_daily_quota' | 'api_quota' | 'submission_async_quota' | 'submission_daily_quota' | 'submission_quota'
> & {
  '2fa_enabled'?: boolean;
  api_daily_quota?: User['api_daily_quota'] | string;
  api_quota?: User['api_quota'] | string;
  identity_id?: string;
  new_pass_confirm?: string;
  new_pass?: string;
  submission_async_quota?: User['submission_async_quota'] | string;
  submission_daily_quota?: User['submission_daily_quota'] | string;
  submission_quota?: User['submission_quota'] | string;
};

type UserProps = {
  username?: string | null;
};

type ParamProps = {
  id: string;
};

const DeleteButton = memo(
  styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700]
    },
    minWidth: theme.spacing(16)
  }))
);

const ClickRow = ({ children, enabled, onClick, chevron = false, ...other }) => (
  <TableRow
    hover={enabled}
    style={{ cursor: enabled ? 'pointer' : 'default' }}
    onClick={enabled ? () => onClick() : null}
    {...other}
  >
    {children}

    {chevron && <TableCell align="right">{enabled && <ChevronRightOutlinedIcon />}</TableCell>}
  </TableRow>
);

function User({ username = null }: UserProps) {
  const { t } = useTranslation(['user']);
  const theme = useTheme();
  const { id } = useParams<ParamProps>();
  const location = useLocation();
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration, classificationAliases } = useALContext();
  const { showErrorMessage, showSuccessMessage, showWarningMessage } = useMySnackbar();

  const [drawerType, setDrawerType] = useState<string>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [user, setUser] = useState(null);
  const [quotas, setQuotas] = useState<{ daily_submission: number; daily_api: number }>(null);
  const [modified, setModified] = useState<boolean>(false);
  const [editable, setEditable] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const sp1 = theme.spacing(1);
  const sp4 = theme.spacing(4);
  const sp6 = theme.spacing(6);

  const classificationAliasesValues = useMemo(() => Object.entries(classificationAliases), [classificationAliases]);

  const doDeleteUser = () => {
    apiCall({
      url: `/api/v4/user/${username || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        setTimeout(() => {
          navigate('/admin/users');
        }, 500);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const handleDeleteUser = () => {
    setDeleteDialog(true);
  };

  function saveUser() {
    apiCall({
      url: `/api/v4/user/${username || id}/`,
      method: 'POST',
      body: user,
      onSuccess: () => {
        setModified(false);
        getQuotas();
        showSuccessMessage(t('success_save'));
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  }

  function toggleToken(token) {
    const newTokens = user.security_tokens;
    if (newTokens.indexOf(token) === -1) {
      newTokens.push(token);
    } else {
      newTokens.splice(newTokens.indexOf(token), 1);
    }
    setUser({ ...user, security_tokens: newTokens });
  }

  function toggleApp(app) {
    const newApps = user.apps;
    delete newApps[app];
    setUser({ ...user, apps: newApps });
  }

  function setName(value) {
    setModified(true);
    setUser({ ...user, name: value });
  }

  function setGroups(value) {
    setModified(true);
    setUser({ ...user, groups: value });
  }

  function set2FAEnabled(value) {
    if (value && user['2fa_enabled']) {
      showErrorMessage(t('2fa_already_enabled'));
    } else if (value) {
      showSuccessMessage(t('2fa_enabled'));
    } else {
      showWarningMessage(t('2fa_disabled'));
    }
    setUser({ ...user, '2fa_enabled': value });
  }

  function setClassification(value) {
    setModified(true);
    setUser({ ...user, classification: value });
  }

  function setConfirmPassword(value) {
    setModified(true);
    setUser({ ...user, new_pass_confirm: value });
  }

  function setNewPassword(value) {
    setModified(true);
    setUser({ ...user, new_pass: value });
  }

  function setAPIQuota(value) {
    setModified(true);
    setUser({ ...user, api_quota: value });
  }

  function setSubmissionQuota(value) {
    setModified(true);
    setUser({ ...user, submission_quota: value });
  }

  function setAsyncSubmissionQuota(value) {
    setModified(true);
    setUser({ ...user, submission_async_quota: value });
  }

  function setDailyAPIQuota(value) {
    setModified(true);
    setUser({ ...user, api_daily_quota: value });
  }

  function setDailySubmissionQuota(value) {
    setModified(true);
    setUser({ ...user, submission_daily_quota: value });
  }

  function toggleAccountEnabled() {
    setModified(true);
    setUser({ ...user, is_active: !user.is_active });
  }

  function toggleDrawer(type) {
    if (user && editable) {
      setDrawerType(type);
      setDrawerOpen(true);
    }
  }

  function setType(userType) {
    const newRoles = configuration.user.role_dependencies[userType];
    setModified(true);
    if (newRoles) {
      setUser({ ...user, type: [userType], roles: [...newRoles] });
    } else {
      setUser({ ...user, type: [userType] });
    }
  }

  function toggleRole(role) {
    const newRoles = [...user.roles];
    if (newRoles.indexOf(role) === -1) {
      newRoles.push(role);
    } else {
      newRoles.splice(newRoles.indexOf(role), 1);
    }

    setModified(true);
    setUser({ ...user, roles: newRoles, type: ['custom'] });
  }

  function handleAvatar(e) {
    const reader = new FileReader();
    const file = e.target.files[0];

    if (!file) return;

    reader.onload = img => {
      setModified(true);
      setUser({ ...user, avatar: img.target.result.toString() });
    };
    reader.readAsDataURL(file);
  }

  function getQuotas() {
    apiCall({
      url: `/api/v4/user/quotas/${username || id}/`,
      onSuccess: api_data => {
        setQuotas(api_data.api_response);
      }
    });
  }

  const reloadUser = () => {
    if (currentUser.is_admin || !location.pathname.includes('/admin/')) {
      apiCall({
        url: `/api/v4/user/${username || id}/?load_avatar`,
        onSuccess: api_data => {
          setUser(api_data.api_response);
        }
      });
    }
  };

  useEffectOnce(() => {
    // Make interface editable
    setEditable(currentUser.is_admin || currentUser.roles.includes('self_manage'));

    // Load user on start
    reloadUser();

    getQuotas();
  });

  return !currentUser.is_admin && location.pathname.includes('/admin/') ? (
    <Navigate to="/forbidden" replace />
  ) : (
    <PageCenter margin={4} width="100%">
      <React.Fragment key="right">
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <div style={{ alignSelf: 'flex-end' }}>
            <IconButton onClick={() => setDrawerOpen(false)} size="large">
              <CloseIcon />
            </IconButton>
          </div>
          <Box
            sx={{
              paddingTop: sp4,
              paddingBottom: sp6,
              paddingLeft: sp4,
              paddingRight: sp4,
              display: 'flex',
              flexDirection: 'column',
              width: '500px',
              [theme.breakpoints.only('xs')]: {
                width: '100vw'
              }
            }}
          >
            {drawerType && user
              ? {
                  api_quota: (
                    <>
                      <Typography variant="h4">{t('api_quota')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('api_quota_edit_title')}
                      </Typography>
                      <TextField
                        autoFocus
                        type="number"
                        margin="dense"
                        size="small"
                        variant="outlined"
                        InputProps={{ inputProps: { min: 0 } }}
                        onChange={event => setAPIQuota(event.target.value)}
                        value={user.api_quota}
                      />
                    </>
                  ),
                  api_daily_quota: (
                    <>
                      <Typography variant="h4">{t('api_daily_quota')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('api_daily_quota_edit_title')}
                      </Typography>
                      <TextField
                        autoFocus
                        type="number"
                        margin="dense"
                        size="small"
                        variant="outlined"
                        InputProps={{ inputProps: { min: 0 } }}
                        onChange={event => setDailyAPIQuota(event.target.value)}
                        value={user.api_daily_quota}
                      />
                    </>
                  ),
                  change_password: (
                    <>
                      <Typography variant="h4" gutterBottom>
                        {t('change_password')}
                      </Typography>
                      <TextField
                        autoFocus
                        type="password"
                        margin="normal"
                        variant="outlined"
                        label={t('new_password')}
                        onChange={event => setNewPassword(event.target.value)}
                      />
                      <TextField
                        type="password"
                        margin="normal"
                        variant="outlined"
                        label={t('confirm_password')}
                        onChange={event => setConfirmPassword(event.target.value)}
                      />
                    </>
                  ),
                  groups: (
                    <>
                      <Typography variant="h4">{t('groups')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('groups_edit_title')}
                      </Typography>
                      <Autocomplete
                        sx={{ margin: theme.spacing(2, 0) }}
                        multiple
                        freeSolo
                        options={[]}
                        value={user.groups.map(group =>
                          group in classificationAliases
                            ? (classificationAliases?.[group]?.short_name ??
                              classificationAliases?.[group]?.name ??
                              group)
                            : group
                        )}
                        renderInput={params => <TextField {...params} />}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip key={index} variant="outlined" label={option} {...getTagProps({ index })} />
                          ))
                        }
                        onChange={(_, value) =>
                          setGroups([
                            ...new Set(
                              value.map(group =>
                                (
                                  classificationAliasesValues.find(
                                    v =>
                                      (!!v?.[1]?.short_name && v?.[1]?.short_name === group) ||
                                      (!!v?.[1]?.name && v?.[1]?.name === group)
                                  )?.[0] ?? group
                                ).toUpperCase()
                              )
                            )
                          ])
                        }
                      />
                    </>
                  ),
                  name: (
                    <>
                      <Typography variant="h4">{t('name')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('name_edit_title')}
                      </Typography>
                      <TextField
                        autoFocus
                        margin="normal"
                        variant="outlined"
                        onChange={event => setName(event.target.value)}
                        value={user.name}
                      />
                    </>
                  ),
                  submission_quota: (
                    <>
                      <Typography variant="h4">{t('submission_quota')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('submission_quota_edit_title')}
                      </Typography>
                      <TextField
                        autoFocus
                        type="number"
                        margin="normal"
                        variant="outlined"
                        InputProps={{ inputProps: { min: 0 } }}
                        onChange={event => setSubmissionQuota(event.target.value)}
                        value={user.submission_quota}
                      />
                    </>
                  ),
                  submission_async_quota: (
                    <>
                      <Typography variant="h4">{t('submission_async_quota')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('submission_async_quota_edit_title')}
                      </Typography>
                      <TextField
                        autoFocus
                        type="number"
                        margin="normal"
                        variant="outlined"
                        InputProps={{ inputProps: { min: 0 } }}
                        onChange={event => setAsyncSubmissionQuota(event.target.value)}
                        value={user.submission_async_quota}
                      />
                    </>
                  ),
                  submission_daily_quota: (
                    <>
                      <Typography variant="h4">{t('submission_daily_quota')}</Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {t('submission_daily_quota_edit_title')}
                      </Typography>
                      <TextField
                        autoFocus
                        type="number"
                        margin="dense"
                        size="small"
                        variant="outlined"
                        InputProps={{ inputProps: { min: 0 } }}
                        onChange={event => setDailySubmissionQuota(event.target.value)}
                        value={user.submission_daily_quota}
                      />
                    </>
                  ),
                  otp: <OTP setDrawerOpen={setDrawerOpen} set2FAEnabled={set2FAEnabled} />,
                  disable_otp: (
                    <DisableOTP setDrawerOpen={setDrawerOpen} set2FAEnabled={set2FAEnabled} isUnsetOTP={false} />
                  ),
                  unset_otp: (
                    <DisableOTP
                      setDrawerOpen={setDrawerOpen}
                      set2FAEnabled={set2FAEnabled}
                      isUnsetOTP={true}
                      username={user?.uname}
                    />
                  ),
                  token: <SecurityToken user={user} toggleToken={toggleToken} />,
                  api_key: <APIKeys username={user?.uname} />,
                  apps: <Apps user={user as User} toggleApp={toggleApp} />
                }[drawerType]
              : null}
          </Box>
        </Drawer>
      </React.Fragment>

      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={doDeleteUser}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={buttonLoading}
      />

      <Grid container spacing={2} justifyContent="center">
        <Grid size={{ xs: 12, sm: 12, md: 3 }}>
          <Grid container sx={{ marginTop: '1rem' }}>
            {id && (
              <Grid size={{ xs: 12 }}>
                <div style={{ paddingBottom: sp4 }}>
                  {user ? (
                    <DeleteButton
                      fullWidth={downSM}
                      disabled={buttonLoading}
                      variant="contained"
                      onClick={handleDeleteUser}
                    >
                      {t('remove')}
                      {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                    </DeleteButton>
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        display: 'inline-block',
                        height: theme.spacing(5),
                        minWidth: theme.spacing(16),
                        width: downSM ? '100%' : '9rem'
                      }}
                    />
                  )}
                </div>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              {user ? (
                <>
                  <input
                    ref={inputRef}
                    accept="image/*"
                    id="contained-button-file"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleAvatar}
                    disabled={!editable}
                  />
                  <label htmlFor="contained-button-file">
                    <IconButton
                      onClick={() => {
                        inputRef.current.click();
                      }}
                      disabled={!editable}
                      size="large"
                    >
                      <Avatar
                        style={{
                          width: downSM ? theme.spacing(24) : theme.spacing(16),
                          height: downSM ? theme.spacing(24) : theme.spacing(16),
                          fontSize: downSM ? theme.spacing(8) : theme.spacing(6),
                          fontWeight: 500
                        }}
                        alt={user.name}
                        src={user.avatar}
                      >
                        {user.name
                          .split(' ')
                          .filter(w => w !== '')
                          .splice(0, 2)
                          .map(n => (n ? n[0].toUpperCase() : ''))
                          .join('')}
                      </Avatar>
                    </IconButton>
                  </label>
                </>
              ) : (
                <Skeleton
                  variant="circular"
                  width={downSM ? theme.spacing(24.5) : theme.spacing(16.5)}
                  height={downSM ? theme.spacing(24.5) : theme.spacing(16.5)}
                  sx={{
                    display: 'inline-block',
                    margin: theme.spacing(0.5)
                  }}
                />
              )}
              <Typography gutterBottom>{user ? user.uname : <Skeleton />}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }} style={{ marginTop: '2rem' }}>
              <div style={{ paddingBottom: id ? 0 : sp4 }}>
                {user ? (
                  <CustomChip
                    fullWidth={downSM}
                    color={user.is_active ? 'primary' : 'default'}
                    onClick={currentUser.username !== user.uname ? toggleAccountEnabled : null}
                    label={user.is_active ? t('enabled') : t('disabled')}
                    type="rounded"
                    style={{ minWidth: theme.spacing(16) }}
                  />
                ) : (
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      display: 'inline-block',
                      height: theme.spacing(5),
                      minWidth: theme.spacing(16),
                      width: downSM ? '100%' : '9rem'
                    }}
                  />
                )}
              </div>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ sm: 12, md: 9 }}>
          <Classification
            type={currentUser.is_admin ? 'picker' : 'pill'}
            size="medium"
            format="long"
            c12n={user && user.classification}
            setClassification={setClassification}
            isUser
            dynGroup={user && user.email ? user.email.toUpperCase().split('@')[1] : null}
          />
          <TableContainer component={Paper} sx={{ marginTop: '1rem' }}>
            <Table aria-label={t('profile')}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={isXS ? 2 : 3}>
                    <Typography variant="h6" gutterBottom>
                      {t('profile')}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ height: '62px' }}>
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('uname')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('uname')}</Typography>}
                    {user ? <div>{user.uname}</div> : <Skeleton />}
                  </TableCell>
                  <TableCell align="right" />
                </TableRow>
                <ClickRow enabled={editable} chevron onClick={() => toggleDrawer('name')}>
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('name')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('name')}</Typography>}
                    {user ? <div>{user.name}</div> : <Skeleton />}
                  </TableCell>
                </ClickRow>
                <ClickRow enabled={currentUser.is_admin} chevron onClick={() => toggleDrawer('groups')}>
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('groups')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('groups')}</Typography>}
                    {user ? (
                      <div>
                        {user.groups &&
                          user.groups
                            .map(group =>
                              group in classificationAliases
                                ? (classificationAliases?.[group]?.short_name ?? group)
                                : group
                            )
                            .join(' | ')}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                </ClickRow>
                <TableRow sx={{ height: '62px' }}>
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('email')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('email')}</Typography>}
                    {user ? <div>{user.email}</div> : <Skeleton />}
                  </TableCell>
                  <TableCell align="right" />
                </TableRow>
                {currentUser.is_admin && (
                  <TableRow sx={{ height: '62px' }}>
                    {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('identity_id')}</TableCell>}
                    <TableCell width="100%">
                      {!isXS ? null : <Typography variant="caption">{t('identity_id')}</Typography>}
                      {user ? <div>{user.identity_id}</div> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer component={Paper} sx={{ marginTop: '1rem' }}>
            <Table aria-label={t('options')}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="h6" gutterBottom>
                      {t('options')}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('type')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('type')}</Typography>}
                    {user ? (
                      <div>
                        {configuration.user.types.map((uType, type_id) => (
                          <CustomChip
                            key={type_id}
                            type="rounded"
                            size="small"
                            color={user.type.includes(uType) ? 'primary' : 'default'}
                            disabled={uType === 'custom'}
                            onClick={
                              currentUser.username !== user.uname && currentUser.is_admin ? () => setType(uType) : null
                            }
                            label={t(`user_type.${uType}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell align="right" />
                </TableRow>
                <TableRow>
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('roles')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('roles')}</Typography>}
                    {user ? (
                      <div>
                        {configuration.user.roles.sort().map((role, role_id) => (
                          <CustomChip
                            key={role_id}
                            type="rounded"
                            size="small"
                            color={user.roles.includes(role) ? 'primary' : 'default'}
                            onClick={
                              currentUser.username !== user.uname && currentUser.is_admin
                                ? () => toggleRole(role)
                                : null
                            }
                            label={t(`role.${role}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell align="right" />
                </TableRow>
                <TableRow
                  hover={currentUser.is_admin}
                  style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                  onClick={currentUser.is_admin ? () => toggleDrawer('api_quota') : null}
                  sx={{ height: '62px' }}
                >
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('api_quota')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('api_quota')}</Typography>}
                    {user ? (
                      <div
                        style={{
                          color:
                            user.api_quota === 0 || user.api_quota === '0' ? theme.palette.action.disabled : 'inherit'
                        }}
                      >
                        {user.api_quota === 0 || user.api_quota === '0' ? t('no_quota') : user.api_quota}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                </TableRow>
                <TableRow
                  hover={currentUser.is_admin}
                  style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                  onClick={currentUser.is_admin ? () => toggleDrawer('api_daily_quota') : null}
                  sx={{ height: '62px' }}
                >
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('api_daily_quota')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('api_daily_quota')}</Typography>}
                    {user ? (
                      <div
                        style={{
                          color:
                            user.api_daily_quota === 0 || user.api_daily_quota === '0'
                              ? theme.palette.action.disabled
                              : 'inherit'
                        }}
                      >
                        {user.api_daily_quota === 0 || user.api_daily_quota === '0' ? (
                          t('no_quota')
                        ) : (
                          <>
                            <span>{user.api_daily_quota}</span>
                            {quotas && (
                              <span style={{ paddingLeft: theme.spacing(2), color: theme.palette.action.disabled }}>
                                ({quotas.daily_api} {t('remaining')})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                </TableRow>
                <TableRow
                  hover={currentUser.is_admin}
                  style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                  onClick={currentUser.is_admin ? () => toggleDrawer('submission_quota') : null}
                  sx={{ height: '62px' }}
                >
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('submission_quota')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('submission_quota')}</Typography>}
                    {user ? (
                      <div
                        style={{
                          color:
                            user.submission_quota === 0 || user.submission_quota === '0'
                              ? theme.palette.action.disabled
                              : 'inherit'
                        }}
                      >
                        {user.submission_quota === 0 || user.submission_quota === '0'
                          ? t('no_quota')
                          : user.submission_quota}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                </TableRow>
                <TableRow
                  hover={currentUser.is_admin}
                  style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                  onClick={currentUser.is_admin ? () => toggleDrawer('submission_async_quota') : null}
                  sx={{ height: '62px' }}
                >
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('submission_async_quota')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('submission_async_quota')}</Typography>}
                    {user ? (
                      <div
                        style={{
                          color:
                            user.submission_async_quota === 0 || user.submission_async_quota === '0'
                              ? theme.palette.action.disabled
                              : 'inherit'
                        }}
                      >
                        {user.submission_async_quota === 0 || user.submission_async_quota === '0'
                          ? t('no_quota')
                          : user.submission_async_quota}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                </TableRow>
                <TableRow
                  hover={currentUser.is_admin}
                  style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                  onClick={currentUser.is_admin ? () => toggleDrawer('submission_daily_quota') : null}
                  sx={{ height: '62px' }}
                >
                  {isXS ? null : <TableCell style={{ whiteSpace: 'nowrap' }}>{t('submission_daily_quota')}</TableCell>}
                  <TableCell width="100%">
                    {!isXS ? null : <Typography variant="caption">{t('submission_quota')}</Typography>}
                    {user ? (
                      <div
                        style={{
                          color:
                            user.submission_daily_quota === 0 || user.submission_daily_quota === '0'
                              ? theme.palette.action.disabled
                              : 'inherit'
                        }}
                      >
                        {user.submission_daily_quota === 0 || user.submission_daily_quota === '0' ? (
                          t('no_quota')
                        ) : (
                          <>
                            <span>{user.submission_daily_quota}</span>
                            {quotas && (
                              <span style={{ paddingLeft: theme.spacing(2), color: theme.palette.action.disabled }}>
                                ({quotas.daily_submission} {t('remaining')})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {editable && (
            <TableContainer component={Paper} sx={{ marginTop: '1rem' }}>
              <Table aria-label={t('security')}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="h6" gutterBottom>
                        {t('security')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('change_password')}>
                    <TableCell width="100%">{user ? t('change_password') : <Skeleton />}</TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>

                  {!user || !configuration.auth.allow_2fa ? null : currentUser.username === user.uname ? (
                    <TableRow
                      hover
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleDrawer(user && user['2fa_enabled'] ? 'disable_otp' : 'otp')}
                    >
                      <TableCell width="100%">
                        {user ? user['2fa_enabled'] ? t('2fa_off') : t('2fa_on') : <Skeleton />}
                      </TableCell>
                      <TableCell align="right">
                        <ChevronRightOutlinedIcon />
                      </TableCell>
                    </TableRow>
                  ) : // admin can unset OTP for a user
                  !currentUser.is_admin || !user['2fa_enabled'] ? null : (
                    <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('unset_otp')}>
                      <TableCell width="100%">{t('unset_otp')}</TableCell>
                      <TableCell align="right">
                        <ChevronRightOutlinedIcon />
                      </TableCell>
                    </TableRow>
                  )}

                  {user &&
                    currentUser.username === user.uname &&
                    user['2fa_enabled'] &&
                    configuration.auth.allow_security_tokens && (
                      <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('token')}>
                        <TableCell width="100%">{t('token')}</TableCell>
                        <TableCell align="right">
                          <ChevronRightOutlinedIcon />
                        </TableCell>
                      </TableRow>
                    )}
                  {user &&
                    currentUser.username === user.uname &&
                    configuration.auth.allow_apikeys &&
                    user.roles.includes('apikey_access') && (
                      <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('api_key')}>
                        <TableCell width="100%">{t('apikeys')}</TableCell>
                        <TableCell align="right">
                          <ChevronRightOutlinedIcon />
                        </TableCell>
                      </TableRow>
                    )}
                  {user && currentUser.username === user.uname && user.roles.includes('obo_access') && (
                    <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('apps')}>
                      <TableCell width="100%">{t('apps')}</TableCell>
                      <TableCell align="right">
                        <ChevronRightOutlinedIcon />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <RouterPrompt when={modified} />

          {user && modified ? (
            <div
              style={{
                paddingTop: sp1,
                paddingBottom: sp1,
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: theme.zIndex.drawer - 1,
                backgroundColor: theme.palette.background.default,
                boxShadow: theme.shadows[4]
              }}
            >
              <Button variant="contained" color="primary" disabled={buttonLoading || !modified} onClick={saveUser}>
                {t('save')}
                {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
            </div>
          ) : null}
        </Grid>
      </Grid>
    </PageCenter>
  );
}

export default memo(User);
