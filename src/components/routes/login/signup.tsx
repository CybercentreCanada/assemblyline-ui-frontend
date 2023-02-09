import { Button, CircularProgress, TextField, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { useState } from 'react';
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
  reset: (event: any) => void;
};

export function SignUp({ buttonLoading, setButtonLoading, reset }: SignUpProps) {
  const { t } = useTranslation(['login']);
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [done, setDone] = useState(false);
  const { showErrorMessage } = useMySnackbar();

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
      onFailure: api_data => {
        if (api_data.api_status_code === 403) {
          reset(null);
        }
        showErrorMessage(api_data.api_error_message);
      },
      onSuccess: () => setDone(true)
    });
    event.preventDefault();
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {done ? (
          <>
            <Typography align="center">{t('signup.done')}</Typography>
          </>
        ) : (
          <>
            <TextField
              autoFocus
              inputProps={{ autoCorrect: 'off', autoCapitalize: 'off' }}
              variant="outlined"
              size="small"
              label={t('signup.username')}
              onChange={event => setUsername(event.target.value)}
            />
            <TextField
              style={{ marginTop: '.5rem' }}
              type="password"
              variant="outlined"
              size="small"
              label={t('signup.password')}
              onChange={event => setPassword(event.target.value)}
            />
            <TextField
              style={{ marginTop: '.5rem' }}
              type="password"
              variant="outlined"
              size="small"
              label={t('signup.password_confirm')}
              onChange={event => setPasswordConfirm(event.target.value)}
            />
            <TextField
              inputProps={{ autoCorrect: 'off', autoCapitalize: 'off' }}
              style={{ marginTop: '.5rem' }}
              variant="outlined"
              size="small"
              label={t('signup.email')}
              onChange={event => setEmail(event.target.value)}
            />
            <Button
              type="submit"
              style={{ marginTop: '1.5rem' }}
              variant="contained"
              color="primary"
              disabled={buttonLoading}
            >
              {t('signup.button')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
