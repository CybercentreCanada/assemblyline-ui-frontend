import {
  Avatar,
  Box,
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
  Typography,
  useTheme,
  withWidth
} from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import CloseIcon from '@material-ui/icons/Close';
import Skeleton from '@material-ui/lab/Skeleton';
import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import APIKeys from 'components/routes/user/api_keys';
import DisableOTP from 'components/routes/user/disable_otp';
import OTP from 'components/routes/user/otp';
import SecurityToken from 'components/routes/user/token';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import ChipInput from 'material-ui-chip-input';
import { OptionsObject, useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

type UserProps = {
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  username?: string | null;
};

type ParamProps = {
  id: string;
};

function User({ width, username }: UserProps) {
  const { id } = useParams<ParamProps>();
  const inputRef = useRef(null);
  const { t } = useTranslation(['user']);
  const theme = useTheme();
  const [drawerType, setDrawerType] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [modified, setModified] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser } = useUser<CustomUser>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const apiCall = useMyAPI();
  const useStyles = makeStyles(curTheme => ({
    page: {
      width: '90%',
      maxWidth: '1200px',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
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
      display: 'inline-block'
    },
    skelButton: {
      display: 'inline-block',
      width: '9rem',
      height: '4rem'
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

  const snackBarSuccessOptions: OptionsObject = {
    variant: 'success',
    autoHideDuration: 3000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    onClick: snack => {
      closeSnackbar();
    }
  };

  function saveUser() {
    apiCall({
      url: `/api/v4/user/${username || id}/`,
      method: 'POST',
      body: user,
      onSuccess: () => {
        setModified(false);
        enqueueSnackbar(t('success_save'), snackBarSuccessOptions);
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

  function toggleAPIKey(apiKey) {
    const newKeys = user.apikeys;
    if (newKeys.indexOf(apiKey) === -1) {
      newKeys.push(apiKey);
    } else {
      newKeys.splice(newKeys.indexOf(apiKey), 1);
    }
    setUser({ ...user, apikeys: newKeys });
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
      enqueueSnackbar(t('2fa_already_enabled'), {
        ...snackBarSuccessOptions,
        variant: 'error',
        autoHideDuration: 3000
      });
    } else if (value) {
      enqueueSnackbar(t('2fa_enabled'), snackBarSuccessOptions);
    } else {
      enqueueSnackbar(t('2fa_disabled'), {
        ...snackBarSuccessOptions,
        variant: 'warning',
        autoHideDuration: 3000
      });
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
    if (user) {
      setDrawerType(type);
      setDrawerOpen(true);
    }
  }

  function toggleRole(role) {
    const newTypes = user.type;
    if (newTypes.indexOf(role) === -1) {
      newTypes.push(role);
    } else {
      newTypes.splice(newTypes.indexOf(role), 1);
    }
    setModified(true);
    setUser({ ...user, type: newTypes });
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
    // Load user on start
    apiCall({
      url: `/api/v4/user/${username || id}/?load_avatar`,
      onSuccess: api_data => {
        setUser(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <React.Fragment key="right">
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box alignSelf="flex-end">
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box pt={4} pb={6} px={4} className={classes.drawer} display="flex" flexDirection="column">
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
                  token: (
                    <SecurityToken
                      user={user}
                      toggleToken={toggleToken}
                      enqueueSnackbar={enqueueSnackbar}
                      snackBarOptions={snackBarSuccessOptions}
                    />
                  ),
                  api_key: (
                    <APIKeys
                      user={user}
                      toggleAPIKey={toggleAPIKey}
                      enqueueSnackbar={enqueueSnackbar}
                      snackBarOptions={snackBarSuccessOptions}
                    />
                  )
                }[drawerType]
              : null}
          </Box>
        </Drawer>
      </React.Fragment>

      <Box className={classes.page} py={6} display="inline-block" textAlign="center">
        <Grid container spacing={2} justify="center">
          <Grid item sm={12} md={3}>
            <Grid container className={classes.group}>
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
                    />
                    <label htmlFor="contained-button-file">
                      <IconButton
                        onClick={e => {
                          inputRef.current.click();
                        }}
                      >
                        <Avatar
                          style={{
                            width: theme.spacing(16),
                            height: theme.spacing(16)
                          }}
                          alt={user.name}
                          src={user.avatar}
                        >
                          {user.name
                            .split(' ', 2)
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
                    width={theme.spacing(16)}
                    height={theme.spacing(16)}
                  />
                )}
                <Typography gutterBottom>{user ? user.uname : <Skeleton />}</Typography>
              </Grid>
              <Grid item style={{ marginTop: '2rem' }} xs={12}>
                {user ? (
                  <CustomChip
                    color={user.is_active ? 'primary' : 'default'}
                    onClick={currentUser.username !== user.uname ? toggleAccountEnabled : null}
                    label={user.is_active ? t('enabled') : t('disabled')}
                    type="square"
                  />
                ) : (
                  <Skeleton className={classes.skelButton} />
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={12} md={9} style={{ width: '100%' }}>
            <Classification
              type={currentUser.is_admin ? 'picker' : 'pill'}
              size="medium"
              format="long"
              c12n={user && user.classification}
              setClassification={setClassification}
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
                      {user ? <Box>{user.uname}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('name')}>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('name')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('name')}</Typography>}
                      {user ? <Box>{user.name}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('groups')}>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('groups')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('groups')}</Typography>}
                      {user ? <Box>{user.groups.join(' | ')}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow className={classes.row}>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('email')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('email')}</Typography>}
                      {user ? <Box>{user.email}</Box> : <Skeleton />}
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
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('roles')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('roles')}</Typography>}
                      {user ? (
                        <Box>
                          <CustomChip
                            type="square"
                            size="small"
                            color={user.type.includes('user') ? 'primary' : 'default'}
                            onClick={
                              currentUser.username !== user.uname && currentUser.is_admin
                                ? () => toggleRole('user')
                                : null
                            }
                            label={t('normal_user')}
                          />
                          <CustomChip
                            type="square"
                            size="small"
                            color={user.type.includes('admin') ? 'primary' : 'default'}
                            onClick={
                              currentUser.username !== user.uname && currentUser.is_admin
                                ? () => toggleRole('admin')
                                : null
                            }
                            label={t('admin')}
                          />
                          <CustomChip
                            type="square"
                            size="small"
                            color={user.type.includes('signature_manager') ? 'primary' : 'default'}
                            onClick={currentUser.is_admin ? () => toggleRole('signature_manager') : null}
                            label={t('signature_manager')}
                          />
                          <CustomChip
                            type="square"
                            size="small"
                            color={user.type.includes('signature_importer') ? 'primary' : 'default'}
                            onClick={currentUser.is_admin ? () => toggleRole('signature_importer') : null}
                            label={t('signature_importer')}
                          />
                        </Box>
                      ) : (
                        <Skeleton />
                      )}
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                  <TableRow
                    hover={currentUser.is_admin}
                    style={{ cursor: currentUser.is_admin ? 'pointer' : 'default' }}
                    onClick={currentUser.is_admin ? event => toggleDrawer('api_quota') : null}
                  >
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('api_quota')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : <Typography variant="caption">{t('api_quota')}</Typography>}
                      {user ? <Box>{user.api_quota}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                  </TableRow>
                  <TableRow
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
                      {user ? <Box>{user.submission_quota}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">{currentUser.is_admin ? <ChevronRightOutlinedIcon /> : null}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

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
                  {currentUser.allow_2fa ? (
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
                  ) : null}
                  {user ? (
                    user['2fa_enabled'] && currentUser.allow_security_tokens ? (
                      <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('token')}>
                        <TableCell width="100%">{user ? t('token') : <Skeleton />}</TableCell>
                        <TableCell align="right">
                          <ChevronRightOutlinedIcon />
                        </TableCell>
                      </TableRow>
                    ) : null
                  ) : null}
                  {currentUser.allow_apikeys ? (
                    <TableRow hover style={{ cursor: 'pointer' }} onClick={() => toggleDrawer('api_key')}>
                      <TableCell width="100%">{user ? t('apikeys') : <Skeleton />}</TableCell>
                      <TableCell align="right">
                        <ChevronRightOutlinedIcon />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>

            {user && modified ? (
              <Box
                py={1}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  backgroundColor: theme.palette.background.default,
                  boxShadow: theme.shadows[4]
                }}
              >
                <Button variant="contained" color="primary" disabled={buttonLoading || !modified} onClick={saveUser}>
                  {t('save')}
                  {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </Box>
    </PageCenter>
  );
}

User.defaultProps = {
  username: null
};

export default withWidth()(User);
