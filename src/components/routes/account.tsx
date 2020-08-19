import { Avatar, Box, Button, CircularProgress, IconButton, makeStyles, useTheme } from '@material-ui/core';
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
  const [newImg, setNewImg] = useState('');
  const [user, setUser] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser } = useUser<CustomUser>();
  const apiCall = useMyAPI();
  const useStyles = makeStyles(curTheme => ({
    no_pad: {
      padding: 0
    },
    page: {
      maxWidth: '960px',
      width: '100%',
      [curTheme.breakpoints.down('sm')]: {
        maxWidth: '100%'
      },
      [curTheme.breakpoints.only('md')]: {
        maxWidth: '630px'
      }
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

  function handleFileChange(dataURI) {
    setNewImg(dataURI);
  }
  function handleFile(e) {
    var reader = new FileReader();
    var file = e.target.files[0];

    if (!file) return;

    reader.onload = function (img) {
      handleFileChange(img.target.result);
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    // Load user on start
    apiCall({
      url: `/api/v4/user/${currentUser.username}/?load_avatar`,
      onSuccess: api_data => {
        //setUser(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <Box className={classes.page} display="inline-block" textAlign="center">
        {user ? (
          <>
            <Box textAlign="left">
              <input
                ref={inputRef}
                accept="image/*"
                id="contained-button-file"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFile}
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
                    src={newImg ? newImg : user.avatar}
                  >
                    {user.name
                      .split(' ', 2)
                      .map(n => n[0].toUpperCase())
                      .join('')}
                  </Avatar>
                </IconButton>
              </label>
            </Box>

            <Button
              style={{ marginLeft: '1rem', marginTop: '3rem', marginBottom: '3rem' }}
              variant="contained"
              color="primary"
              disabled={buttonLoading}
              onClick={saveUser}
            >
              {t('page.account.save')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </>
        ) : (
          <>
            <Skeleton variant="circle" width={theme.spacing(16)} height={theme.spacing(16)} />
            <Box alignSelf="center">
              <Skeleton style={{ marginTop: '3rem' }} width="8rem" height="3rem" />
            </Box>
          </>
        )}
      </Box>
    </PageCenter>
  );
}
