import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  isWidthDown,
  isWidthUp,
  makeStyles,
  TextField,
  Typography,
  useTheme,
  withWidth
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
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
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser } = useUser<CustomUser>();
  const apiCall = useMyAPI();
  const useStyles = makeStyles(curTheme => ({
    no_pad: {
      padding: 0
    },
    page: {
      width: '90%',
      maxWidth: '1000px',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    item: {
      textAlign: 'center',
      padding: curTheme.spacing(2)
    },
    skelItem: {
      display: 'inline-block'
    },
    skelButton: {
      display: 'inline-block',
      width: '9rem',
      height: '4rem'
    },
    skelInput: {
      display: 'inline-block',
      height: '3rem',
      width: '100%'
    },
    skelLabel: {
      display: 'inline-block',
      width: '8rem'
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

  function saveUser() {
    apiCall({
      url: `/api/v4/user/${currentUser.username}/`,
      method: 'POST',
      body: user,
      onSuccess: () => window.location.reload(false),
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  }

  function setName(value) {
    setUser({ ...user, name: value });
  }

  function setGroups(value) {
    setUser({ ...user, groups: [value] });
  }

  function setConfirmPassword(value) {
    setUser({ ...user, new_pass_confirm: value });
  }

  function setNewPassword(value) {
    setUser({ ...user, new_pass: value });
  }

  function setAPIQuota(value) {
    setUser({ ...user, api_quota: value });
  }

  function setSubmissionQuota(value) {
    setUser({ ...user, submission_quota: value });
  }

  function toggleAccountEnabled() {
    setUser({ ...user, is_active: !user.is_active });
  }

  function toggleRole(role) {
    const newTypes = user.type;
    if (newTypes.indexOf(role) === -1) {
      newTypes.push(role);
    } else {
      newTypes.splice(newTypes.indexOf(role), 1);
    }
    setUser({ ...user, type: newTypes });
  }

  function handleAvatar(e) {
    const reader = new FileReader();
    const file = e.target.files[0];

    if (!file) return;

    reader.onload = img => {
      setUser({ ...user, avatar: img.target.result.toString() });
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    // Load user on start
    apiCall({
      url: `/api/v4/user/${currentUser.username}/?load_avatar`,
      onSuccess: api_data => {
        setUser(api_data.api_response);
        // setTimeout(() => setUser(api_data.api_response), 1500);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <Box className={classes.page} display="inline-block" textAlign="center">
        <Box pt={6} pb={8} textAlign="left">
          <Typography variant="h4">{t('page.account')}</Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={4} md={3} className={classes.item}>
            <Grid container>
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

          <Grid item xs={12} sm={8} md={5} className={classes.item}>
            <Grid
              container
              direction="column"
              alignItems="stretch"
              justify="flex-start"
              alignContent="flex-start"
              style={{ textAlign: 'left' }}
            >
              {user ? (
                <>
                  <Typography variant="caption">{user ? t('page.account.uname') : <Skeleton />}</Typography>
                  <Typography style={{ textTransform: 'uppercase' }} gutterBottom>
                    {user.uname}
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    label={t('page.account.name')}
                    value={user.name}
                    margin="dense"
                    onChange={event => setName(event.target.value)}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label={t('page.account.new_password')}
                    type="password"
                    margin="dense"
                    onChange={event => setNewPassword(event.target.value)}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label={t('page.account.confirm_password')}
                    type="password"
                    margin="dense"
                    onChange={event => setConfirmPassword(event.target.value)}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label={t('page.account.groups')}
                    margin="dense"
                    value={user.groups}
                    onChange={event => setGroups(event.target.value)}
                  />

                  <Typography style={{ marginTop: theme.spacing(2) }} variant="caption">
                    {user ? t('page.account.email') : <Skeleton />}
                  </Typography>
                  <Typography gutterBottom>{user.email}</Typography>
                </>
              ) : (
                <>
                  <Skeleton className={classes.skelInput} />
                  <Skeleton className={classes.skelInput} />
                  <Skeleton className={classes.skelInput} />
                  <Skeleton className={classes.skelInput} />
                  <Skeleton className={classes.skelInput} />
                  <Skeleton className={classes.skelInput} />
                </>
              )}
            </Grid>
          </Grid>
          <Grid
            item
            sm={4}
            style={{ display: isWidthDown('xs', width) || isWidthUp('md', width) ? 'none' : 'block' }}
          />
          <Grid item xs={12} sm={4} md={4} className={classes.item}>
            {user ? (
              <Grid
                container
                direction="column"
                alignItems="stretch"
                justify="flex-start"
                alignContent="flex-start"
                style={{ textAlign: 'left' }}
              >
                <Typography variant="caption">{user ? t('page.account.roles') : <Skeleton />}</Typography>
                <Box mb={1}>
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

                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label={t('page.account.api_quota')}
                  margin="dense"
                  value={user.api_quota}
                  onChange={event => setAPIQuota(event.target.value)}
                />

                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label={t('page.account.submission_quota')}
                  margin="dense"
                  value={user.submission_quota}
                  onChange={event => setSubmissionQuota(event.target.value)}
                />
              </Grid>
            ) : (
              <>
                <Skeleton className={classes.skelInput} />
                <Skeleton className={classes.skelInput} />
                <Skeleton className={classes.skelInput} />
                <Skeleton className={classes.skelInput} />
                <Skeleton className={classes.skelInput} />
                <Skeleton className={classes.skelInput} />
              </>
            )}
          </Grid>

          <Grid item xs={12} className={classes.item}>
            {user ? (
              <Button variant="contained" color="primary" disabled={buttonLoading} onClick={saveUser}>
                {t('page.account.save')}
                {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Button>
            ) : (
              <Skeleton className={classes.skelButton} />
            )}
          </Grid>
        </Grid>
      </Box>
    </PageCenter>
  );
}

export default withWidth()(Account);
