import { Box, Button, CircularProgress, createStyles, makeStyles, TextField, Typography } from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles(() =>
  createStyles({
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12
    }
  })
);

type ResetPasswordNowProps = {
  buttonLoading: boolean;
  setButtonLoading: (value: boolean) => void;
};

export function ResetPasswordNow({ buttonLoading, setButtonLoading }: ResetPasswordNowProps) {
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation(['login']);
  const classes = useStyles();
  const apiCall = useMyAPI();
  const params = new URLSearchParams(location.search);
  const [resetID, setResetID] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [done, setDone] = useState(false);

  function onSubmit(event) {
    apiCall({
      url: '/api/v4/auth/reset_pwd/',
      method: 'POST',
      body: {
        reset_id: resetID,
        password,
        password_confirm: passwordConfirm
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false),
      onSuccess: () => {
        setDone(true);
        setTimeout(() => window.location.reload(false), 7000);
      }
    });
    event.preventDefault();
  }

  useEffect(() => {
    setResetID(params.get('reset_id'));

    if (params.get('reset_id')) {
      history.push('/');
    }
    // eslint-disable-next-line
  }, []);

  return (
    <form onSubmit={onSubmit}>
      <Box display="flex" flexDirection="column">
        {done ? (
          <>
            <Typography align="center" variant="h6" gutterBottom>
              {t('reset_now.done')}
            </Typography>
            <Typography align="center" variant="caption">
              {t('reset_now.redirect')}
            </Typography>
          </>
        ) : (
          <>
            <TextField
              autoFocus
              type="password"
              variant="outlined"
              size="small"
              label={t('reset_now.password')}
              onChange={event => setPassword(event.target.value)}
            />
            <TextField
              style={{ marginTop: '.5rem' }}
              type="password"
              variant="outlined"
              size="small"
              label={t('reset_now.password_confirm')}
              onChange={event => setPasswordConfirm(event.target.value)}
            />
            <Button
              type="submit"
              style={{ marginTop: '1.5rem' }}
              variant="contained"
              color="primary"
              disabled={buttonLoading}
            >
              {t('reset_now.button')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </>
        )}
      </Box>
    </form>
  );
}

type ResetPasswordProps = {
  buttonLoading: boolean;
  setButtonLoading: (value: boolean) => void;
};

export function ResetPassword({ buttonLoading, setButtonLoading }: ResetPasswordProps) {
  const { t } = useTranslation(['login']);
  const classes = useStyles();
  const apiCall = useMyAPI();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function onSubmit(event) {
    apiCall({
      url: '/api/v4/auth/get_reset_link/',
      method: 'POST',
      body: { email },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false),
      onSuccess: () => setDone(true)
    });
    event.preventDefault();
  }

  return (
    <form onSubmit={onSubmit}>
      <Box display="flex" flexDirection="column">
        {done ? (
          <Typography align="center">{t('reset.done')}</Typography>
        ) : (
          <>
            <TextField
              autoFocus
              type="email"
              variant="outlined"
              size="small"
              label={t('reset.email')}
              onChange={event => setEmail(event.target.value)}
            />
            <Button
              type="submit"
              style={{ marginTop: '1.5rem' }}
              variant="contained"
              color="primary"
              disabled={buttonLoading}
            >
              {t('reset.button')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </>
        )}
      </Box>
    </form>
  );
}
