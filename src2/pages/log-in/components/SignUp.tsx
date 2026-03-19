import { CircularProgress, Link, Typography } from '@mui/material';
import { useAPIMutation, useAPIQuery } from 'core/api';
import { useAppConfigStore } from 'core/config';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { EmailInput, PasswordConfirmInput, PasswordInput, TextDivider, UsernameInput } from '../log-in.components';
import { useLoginReset } from '../log-in.hooks';
import { useLoginForm } from '../log-in.providers';

//*****************************************************************************************
// Sign Up Confirmation
//*****************************************************************************************
export const SignUpConfirmation = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showSuccessMessage } = useAppSnackbar();

  const resetLogin = useLoginReset();

  useAPIQuery({
    url: '/api/v4/auth/signup_validate/',
    method: 'POST',
    body: { registration_key: form.getFieldValue('registration_key') },
    onSuccess: () => showSuccessMessage(t('signup.completed'), 10000),
    onExit: () => resetLogin()
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography align="center">{t('signup.confirming')}</Typography>
      <CircularProgress variant="indeterminate" />
    </div>
  );
});

SignUpConfirmation.displayName = 'SignUpConfirmation';

//*****************************************************************************************
// Sign Up Request
//*****************************************************************************************
export const SignUpRequest = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage, showSuccessMessage } = useAppSnackbar();

  const resetLogin = useLoginReset();

  const createAccount = useAPIMutation<[{ user: string; password: string; password_confirm: string; email: string }]>(
    body => ({
      url: '/api/v4/auth/signup/',
      method: 'POST',
      body,
      onEnter: () => {
        form.setFieldValue('mode', 'loading');
      },
      onFailure: ({ api_error_message }) => {
        form.setFieldValue('mode', 'reset-password-request');
        showErrorMessage(api_error_message);
      },
      onSuccess: () => {
        resetLogin();
        showSuccessMessage(t('signup.done'));
      }
    })
  );

  return (
    <form
      style={{ display: 'contents' }}
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        createAccount.mutate({
          user: form.state.values.username,
          password: form.state.values.password,
          password_confirm: form.state.values.password_confirm,
          email: form.state.values.email
        });
      }}
    >
      <UsernameInput autoFocus />
      <PasswordInput />
      <PasswordConfirmInput />
      <EmailInput />

      <Button variant="contained" color="primary" type="submit">
        {t('signup.button')}
      </Button>

      <TextDivider />

      <Button variant="text" color="primary" onClick={() => resetLogin()}>
        {t('button')}
      </Button>
    </form>
  );
});

SignUpRequest.displayName = 'SignUpRequest';

//*****************************************************************************************
// Sign Up Link
//*****************************************************************************************
export const SignUpLink = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  const resetLogin = useLoginReset();

  const allowUserPass = useAppConfigStore(s => s.auth.login.allow_userpass_login);
  const allowSignup = useAppConfigStore(s => s.auth.login.allow_signup);

  const handleClick = useCallback(() => {
    resetLogin();
    form.setFieldValue('mode', 'sign-up-request');
  }, []);

  return !allowUserPass || !allowSignup ? null : (
    <>
      <Typography align="center" variant="caption">
        {t('signup')}&nbsp;&nbsp;
        <Link href="#" onClick={handleClick}>
          {t('signup.link')}
        </Link>
      </Typography>
    </>
  );
});

SignUpLink.displayName = 'SignUpLink';
