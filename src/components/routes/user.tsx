import {
  Avatar,
  Button,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  isWidthDown,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
  withWidth
} from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import CloseIcon from '@material-ui/icons/Close';
import Skeleton from '@material-ui/lab/Skeleton';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import APIKeys from 'components/routes/user/api_keys';
import DisableOTP from 'components/routes/user/disable_otp';
import OTP from 'components/routes/user/otp';
import SecurityToken from 'components/routes/user/token';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import ChipInput from 'material-ui-chip-input';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory, useLocation, useParams } from 'react-router-dom';
import Apps from './user/apps';

type UserProps = {
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  username?: string | null;
};

type ParamProps = {
  id: string;
};

const DeleteButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700]
    },
    minWidth: theme.spacing(16)
  }
}))(Button);

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

function User({ width, username }: UserProps) {
  const { id } = useParams<ParamProps>();
  const location = useLocation();
  const inputRef = useRef(null);
  const { t } = useTranslation(['user']);
  const theme = useTheme();
  const history = useHistory();
  const [drawerType, setDrawerType] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [modified, setModified] = useState(false);
  const [editable, setEditable] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser, configuration } = useALContext();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { showErrorMessage, showSuccessMessage, showWarningMessage } = useMySnackbar();
  const sp1 = theme.spacing(1);
  const sp4 = theme.spacing(4);
  const sp6 = theme.spacing(6);

  const { apiCall } = useMyAPI();
  const useStyles = makeStyles(curTheme => ({
    drawer: {
      width: '500px',
      [theme.breakpoints.down('xs')]: {
        width: '100vw'
      }
    },
    row: {
      height: '62px'
    },
    group: {
      marginTop: '1rem'
    },
    skelItem: {
      display: 'inline-block',
      margin: theme.spacing(0.5)
    },
    skelButton: {
      display: 'inline-block',
      width: '9rem',
      height: theme.spacing(5)
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12
    }
  }));
  const classes = useStyles();

  const doDeleteUser = () => {
    apiCall({
      url: `/api/v4/user/${username || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        setTimeout(() => {
          history.push('/admin/users');
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

  function toggleAPIKey(name, apiKey) {
    const newKeys = { ...user.apikeys };
    if (name in user.apikeys) {
      delete newKeys[name];
      setUser({ ...user, apikeys: newKeys });
    } else {
      newKeys[name] = apiKey;
      setUser({ ...user, apikeys: newKeys });
    }
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

  useEffect(() => {
    // Make interface editable
    setEditable(currentUser.is_admin || currentUser.roles.includes('self_manage'));

    // Load user on start
    if (currentUser.is_admin || !location.pathname.includes('/admin/')) {
      apiCall({
        url: `/api/v4/user/${username || id}/?load_avatar`,
        onSuccess: api_data => {
          setUser(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return !currentUser.is_admin && location.pathname.includes('/admin/') ? (
    <Redirect to="/forbidden" />
  ) : (
    <PageCenter margin={4} width="100%">
      <React.Fragment key="right">
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <div style={{ alignSelf: 'flex-end' }}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div
            style={{
              paddingTop: sp4,
              paddingBottom: sp6,
              paddingLeft: sp4,
              paddingRight: sp4,
              display: 'flex',
              flexDirection: 'column'
            }}
            className={classes.drawer}
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
                        margin="normal"
                        variant="outlined"
                        onChange={event => setAPIQuota(event.target.value)}
                        value={user.api_quota}
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
                      <ChipInput
                        margin="normal"
                        defaultValue={user.groups}
                        onChange={chips => setGroups(chips)}
                        variant="outlined"
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
                        onChange={event => setSubmissionQuota(event.target.value)}
                        value={user.submission_quota}
                      />
                    </>
                  ),
                  otp: <OTP setDrawerOpen={setDrawerOpen} set2FAEnabled={set2FAEnabled} />,
                  disable_otp: <DisableOTP setDrawerOpen={setDrawerOpen} set2FAEnabled={set2FAEnabled} />,
                  token: <SecurityToken user={user} toggleToken={toggleToken} />,
                  api_key: <APIKeys user={user} toggleAPIKey={toggleAPIKey} />,
                  apps: <Apps user={user} toggleApp={toggleApp} />
                }[drawerType]
              : null}
          </div>
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
        <Grid item xs={12} sm={12} md={3}>
          <Grid container className={classes.group}>
            {id && (
              <Grid item xs={12}>
                <div style={{ paddingBottom: sp4 }}>
                  {user ? (
                    <DeleteButton
                      fullWidth={downSM}
                      disabled={buttonLoading}
                      variant="contained"
                      onClick={handleDeleteUser}
                    >
                      {t('remove')}
                      {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </DeleteButton>
                  ) : (
                    <Skeleton
                      variant="rect"
                      className={classes.skelButton}
                      style={{ minWidth: theme.spacing(16), width: downSM ? '100%' : null }}
                    />
                  )}
                </div>
              </Grid>
            )}
            <Grid item xs={12}>
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
                      onClick={e => {
                        inputRef.current.click();
                      }}
                      disabled={!editable}
                    >
                      <Avatar
                        style={{
                          width: downSM ? theme.spacing(24) : theme.spacing(16),
                          height: downSM ? theme.spacing(24) : theme.spacing(16)
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
                  className={classes.skelItem}
                  variant="circle"
                  width={downSM ? theme.spacing(24.5) : theme.spacing(16.5)}
                  height={downSM ? theme.spacing(24.5) : theme.spacing(16.5)}
                />
              )}
              <Typography gutterBottom>{user ? user.uname : <Skeleton />}</Typography>
            </Grid>
            <Grid item style={{ marginTop: '2rem' }} xs={12}>
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
                    variant="rect"
                    className={classes.skelButton}
                    style={{ minWidth: theme.spacing(16), width: downSM ? '100%' : null }}
                  />
                )}
              </div>
            </Grid>
          </Grid>
        </Grid>

        <Grid item sm={12} md={9} style={{ width: '100%' }}>
          <Classification
            type={editable ? 'picker' : 'pill'}
            size="medium"
            format="long"
            c12n={user && user.classification}
            setClassification={setClassification}
            isUser
            dynGroup={user && user.email ? user.email.toUpperCase().split('@')[1] : null}
          />
          <TableContainer className={classes.group} component={Paper}>
            <Table aria-label={t('profile')}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={isWidthDown('xs', width) ? 2 : 3}>
                    <Typography variant="h6" gutterBottom>
                      {t('profile')}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={classes.row}>
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('uname')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('uname')}</Typography>}
                    {user ? <div>{user.uname}</div> : <Skeleton />}
                  </TableCell>
                  <TableCell align="right" />
                </TableRow>
                <ClickRow enabled={editable} chevron onClick={() => toggleDrawer('name')}>
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('name')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('name')}</Typography>}
                    {user ? <div>{user.name}</div> : <Skeleton />}
                  </TableCell>
                </ClickRow>
                <ClickRow enabled={editable} chevron onClick={() => toggleDrawer('groups')}>
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('groups')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('groups')}</Typography>}
                    {user ? <div>{user.groups.join(' | ')}</div> : <Skeleton />}
                  </TableCell>
                </ClickRow>
                <TableRow className={classes.row}>
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('email')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('email')}</Typography>}
                    {user ? <div>{user.email}</div> : <Skeleton />}
                  </TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer className={classes.group} component={Paper}>
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
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('type')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('type')}</Typography>}
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
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('roles')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('roles')}</Typography>}
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
                  className={classes.row}
                  hover={currentUser.is_admin}
                  style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                  onClick={currentUser.is_admin ? event => toggleDrawer('api_quota') : null}
                >
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('api_quota')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('api_quota')}</Typography>}
                    {user ? <div>{user.api_quota}</div> : <Skeleton />}
                  </TableCell>
                  <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                </TableRow>
                <TableRow
                  className={classes.row}
                  hover={currentUser.is_admin}
                  style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                  onClick={currentUser.is_admin ? event => toggleDrawer('submission_quota') : null}
                >
                  {isWidthDown('xs', width) ? null : (
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{t('submission_quota')}</TableCell>
                  )}
                  <TableCell width="100%">
                    {!isWidthDown('xs', width) ? null : (
                      <Typography variant="caption">{t('submission_quota')}</Typography>
                    )}
                    {user ? <div>{user.submission_quota}</div> : <Skeleton />}
                  </TableCell>
                  <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {editable && (
            <TableContainer className={classes.group} component={Paper}>
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
                  {user && currentUser.username === user.uname && configuration.auth.allow_2fa && (
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
                {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Button>
            </div>
          ) : null}
        </Grid>
      </Grid>
    </PageCenter>
  );
}

User.defaultProps = {
  username: null
};

export default withWidth()(User);
