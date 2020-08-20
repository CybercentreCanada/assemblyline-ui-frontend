import { Box, Button, CircularProgress, createStyles, makeStyles, TextField, Typography } from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

type SignUpProps = {
  buttonLoading: boolean;
  setButtonLoading: (value: boolean) => void;
};

export function SignUp({ buttonLoading, setButtonLoading }: SignUpProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const apiCall = useMyAPI();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [done, setDone] = useState(false);

  function onSubmit(event) {
    apiCall({
      url: '/api/v4/auth/signup/',
      method: 'POST',
      body: {
        user: username,
        password,
        password_confirm: passwordConfirm,
        email
      },
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
          <>
            <Typography align="center">{t('page.login.signup.done')}</Typography>
          </>
        ) : (
          <>
            <TextField
              autoFocus
              inputProps={{ autoCorrect: 'off', autoCapitalize: 'off' }}
              variant="outlined"
              size="small"
              label={t('page.login.signup.username')}
              onChange={event => setUsername(event.target.value)}
            />
            <TextField
              style={{ marginTop: '.5rem' }}
              type="password"
              variant="outlined"
              size="small"
              label={t('page.login.signup.password')}
              onChange={event => setPassword(event.target.value)}
            />
            <TextField
              style={{ marginTop: '.5rem' }}
              type="password"
              variant="outlined"
              size="small"
              label={t('page.login.signup.password_confirm')}
              onChange={event => setPasswordConfirm(event.target.value)}
            />
            <TextField
              inputProps={{ autoCorrect: 'off', autoCapitalize: 'off' }}
              style={{ marginTop: '.5rem' }}
              variant="outlined"
              size="small"
              label={t('page.login.signup.email')}
              onChange={event => setEmail(event.target.value)}
            />
            <Button
              type="submit"
              style={{ marginTop: '1.5rem' }}
              variant="contained"
              color="primary"
              disabled={buttonLoading}
            >
              {t('page.login.signup.button')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </>
        )}
      </Box>
    </form>
  );
}
