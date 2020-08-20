import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Typography,
  useTheme,
  withWidth
} from '@material-ui/core';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import Skeleton from '@material-ui/lab/Skeleton';
import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import { OptionsObject, useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type AccountProps = {
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

function Account<AppBarProps>({ width }) {
  const inputRef = useRef(null);
  const { t } = useTranslation();
  const theme = useTheme();
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
    autoHideDuration: 10000,
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
      url: `/api/v4/user/${currentUser.username}/`,
      method: 'POST',
      body: user,
      onSuccess: () => {
        setModified(false);
        enqueueSnackbar(t('page.account.success_save'), snackBarSuccessOptions);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  }

  function setName(value) {
    setModified(true);
    setUser({ ...user, name: value });
  }

  function setGroups(value) {
    setModified(true);
    setUser({ ...user, groups: [value] });
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

  function handleClick(event, value) {}

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
      url: `/api/v4/user/${currentUser.username}/?load_avatar`,
      onSuccess: api_data => {
        // TODO: uncomment when done making pretty
        // setUser(api_data.api_response);
        setTimeout(() => setUser(api_data.api_response), 1500);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <Box className={classes.page} display="inline-block" textAlign="center">
        <Box pt={6} pb={4}>
          <Typography variant="h4">{t('page.account')}</Typography>
        </Box>

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
                            .map(n => n[0].toUpperCase())
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
                  <Chip
                    color={user.is_active ? 'primary' : 'default'}
                    onClick={toggleAccountEnabled}
                    label={user.is_active ? t('page.account.enabled') : t('page.account.disabled')}
                  />
                ) : (
                  <Skeleton className={classes.skelButton} />
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={12} md={9} style={{ width: '100%' }}>
            <TableContainer className={classes.group} component={Paper}>
              <Table aria-label={t('page.account.profile')}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={isWidthDown('xs', width) ? 2 : 3}>
                      <Typography variant="h6" gutterBottom>
                        {t('page.account.profile')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('page.account.uname')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : (
                        <Typography variant="caption">{t('page.account.uname')}</Typography>
                      )}
                      {user ? <Box>{user.uname}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={event => handleClick(event, user.name)}>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('page.account.name')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : (
                        <Typography variant="caption">{t('page.account.name')}</Typography>
                      )}
                      {user ? <Box>{user.name}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={event => handleClick(event, user.groups)}>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('page.account.groups')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : (
                        <Typography variant="caption">{t('page.account.groups')}</Typography>
                      )}
                      {user ? <Box>{user.groups}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('page.account.email')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : (
                        <Typography variant="caption">{t('page.account.email')}</Typography>
                      )}
                      {user ? <Box>{user.email}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer className={classes.group} component={Paper}>
              <Table aria-label={t('page.account.options')}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="h6" gutterBottom>
                        {t('page.account.options')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('page.account.roles')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : (
                        <Typography variant="caption">{t('page.account.roles')}</Typography>
                      )}
                      {user ? (
                        <Box>
                          <Chip
                            style={{ margin: '2px' }}
                            size="small"
                            color={user.type.includes('user') ? 'primary' : 'default'}
                            onClick={() => toggleRole('user')}
                            label={t('page.account.normal_user')}
                          />
                          <Chip
                            style={{ margin: '2px' }}
                            size="small"
                            color={user.type.includes('admin') ? 'primary' : 'default'}
                            onClick={() => toggleRole('admin')}
                            label={t('page.account.admin')}
                          />
                          <Chip
                            style={{ margin: '2px' }}
                            size="small"
                            color={user.type.includes('signature_manager') ? 'primary' : 'default'}
                            onClick={() => toggleRole('signature_manager')}
                            label={t('page.account.signature_manager')}
                          />
                          <Chip
                            style={{ margin: '2px' }}
                            size="small"
                            color={user.type.includes('signature_importer') ? 'primary' : 'default'}
                            onClick={() => toggleRole('signature_importer')}
                            label={t('page.account.signature_importer')}
                          />
                        </Box>
                      ) : (
                        <Skeleton />
                      )}
                    </TableCell>
                    <TableCell align="right" />
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={event => handleClick(event, user.api_quota)}>
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('page.account.api_quota')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : (
                        <Typography variant="caption">{t('page.account.api_quota')}</Typography>
                      )}
                      {user ? <Box>{user.api_quota}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow
                    hover
                    style={{ cursor: 'pointer' }}
                    onClick={event => handleClick(event, user.submission_quota)}
                  >
                    {isWidthDown('xs', width) ? null : (
                      <TableCell style={{ whiteSpace: 'nowrap' }}>{t('page.account.submission_quota')}</TableCell>
                    )}
                    <TableCell width="100%">
                      {!isWidthDown('xs', width) ? null : (
                        <Typography variant="caption">{t('page.account.submission_quota')}</Typography>
                      )}
                      {user ? <Box>{user.submission_quota}</Box> : <Skeleton />}
                    </TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer className={classes.group} component={Paper}>
              <Table aria-label={t('page.account.security')}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="h6" gutterBottom>
                        {t('page.account.security')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={event => handleClick(event, user.name)}>
                    <TableCell width="100%">{user ? t('page.account.change_password') : <Skeleton />}</TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={event => handleClick(event, user.name)}>
                    <TableCell width="100%">{user ? t('page.account.2fa_on') : <Skeleton />}</TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={event => handleClick(event, user.groups)}>
                    <TableCell width="100%">{user ? t('page.account.token') : <Skeleton />}</TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                  <TableRow hover style={{ cursor: 'pointer' }} onClick={event => handleClick(event, user.groups)}>
                    <TableCell width="100%">{user ? t('page.account.api_key') : <Skeleton />}</TableCell>
                    <TableCell align="right">
                      <ChevronRightOutlinedIcon />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={3}>
              {user ? (
                <Button variant="contained" color="primary" disabled={buttonLoading || !modified} onClick={saveUser}>
                  {t('page.account.save')}
                  {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              ) : (
                <Skeleton className={classes.skelButton} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageCenter>
  );
}

export default withWidth()(Account);
