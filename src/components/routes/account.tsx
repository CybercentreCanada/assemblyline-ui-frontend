import { Avatar, Box, Button, CircularProgress, Grid, IconButton, makeStyles, useTheme } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Account() {
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
      width: '80%'
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
      height: '3rem'
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
      body: JSON.stringify(user),
      onSuccess: () => window.location.reload(false),
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  }

  function toggleAccountEnabled() {
    setUser({ ...user, is_active: !user.is_active });
  }

  function handleAvatar(e) {
    var reader = new FileReader();
    var file = e.target.files[0];

    if (!file) return;

    reader.onload = function (img) {
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
        //setTimeout(() => setUser(api_data.api_response), 1500);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <Box mt={6} className={classes.page} display="inline-block" textAlign="center">
        <Grid container spacing={6}>
          <Grid item xs={6} className={classes.item}>
            <Grid container spacing={3}>
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
                            width: theme.spacing(20),
                            height: theme.spacing(20)
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
                    width={theme.spacing(20)}
                    height={theme.spacing(20)}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                {user ? (
                  <Button
                    variant="contained"
                    color={user.is_active ? 'primary' : 'secondary'}
                    onClick={toggleAccountEnabled}
                  >
                    {user.is_active ? t('page.account.enabled') : t('page.account.disabled')}
                  </Button>
                ) : (
                  <Skeleton className={classes.skelButton} />
                )}
              </Grid>
            </Grid>
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
