import { Link, Typography } from '@mui/material';
import { useAPIMutation } from 'core/api';
import { useAppConfig } from 'core/config';
import { useAppSnackbar } from 'core/snackbar/snackbar.hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { EmailInput, PasswordConfirmInput, PasswordInput, TextDivider } from '../log-in.components';
import { useLoginReset } from '../log-in.hooks';
import { useLoginForm } from '../log-in.providers';

//*****************************************************************************************
// Reset Password Confirmation
//*****************************************************************************************
export const ResetPasswordConfirmation = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage, showSuccessMessage } = useAppSnackbar();

  const resetLogin = useLoginReset();

  const confirmResetPassword = useAPIMutation<[{ reset_id: string; password: string; password_confirm: string }]>(
    body => ({
      url: '/api/v4/auth/reset_pwd/',
      method: 'POST',
      body,
      onEnter: () => {
        form.setFieldValue('mode', 'loading');
        form.setFieldValue('loading', t('reset_now.loading'));
      },
      onFailure: ({ api_status_code, api_error_message }) => {
        if (api_status_code === 403) resetLogin();
        else form.setFieldValue('mode', 'reset-password-confirmation');
        showErrorMessage(api_error_message);
      },
      onSuccess: () => {
        resetLogin();
        showSuccessMessage(t('reset_now.done'));
      }
    })
  );

  return (
    <form
      style={{ display: 'contents' }}
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        confirmResetPassword.mutate({
          reset_id: form.state.values.reset_id,
          password: form.state.values.password,
          password_confirm: form.state.values.password_confirm
        });
      }}
    >
      <PasswordInput autoFocus label={t('reset_now.password')} />
      <PasswordConfirmInput label={t('reset_now.password_confirm')} />

      <Button color="primary" type="submit" variant="contained">
        {t('reset_now.button')}
      </Button>

      <TextDivider />

      <Button variant="text" color="primary" onClick={() => resetLogin()}>
        {t('other')}
      </Button>
    </form>
  );
});

ResetPasswordConfirmation.displayName = 'ResetPasswordConfirmation';

//*****************************************************************************************
// Reset Password Request
//*****************************************************************************************
export const ResetPasswordRequest = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage, showSuccessMessage } = useAppSnackbar();

  const resetLogin = useLoginReset();

  const getResetLink = useAPIMutation<[{ email: string }]>(body => ({
    url: '/api/v4/auth/get_reset_link/',
    method: 'POST',
    body,
    onEnter: () => {
      form.setFieldValue('mode', 'loading');
      form.setFieldValue('loading', t('reset.loading'));
    },
    onFailure: ({ api_error_message }) => {
      form.setFieldValue('mode', 'reset-password-request');
      showErrorMessage(api_error_message);
    },
    onSuccess: () => {
      showSuccessMessage(t('reset.done'));
      resetLogin();
    }
  }));

  return (
    <form
      style={{ display: 'contents' }}
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        getResetLink.mutate({ email: form.state.values.email });
      }}
    >
      <EmailInput autoFocus />

      <Button color="primary" type="submit" variant="contained">
        {t('reset.button')}
      </Button>

      <TextDivider />

      <Button variant="text" color="primary" onClick={() => resetLogin()}>
        {t('other')}
      </Button>
    </form>
  );
});

ResetPasswordRequest.displayName = 'ResetPasswordRequest';

//*****************************************************************************************
// Reset Password Link
//*****************************************************************************************
export const ResetPasswordLink = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  const resetLogin = useLoginReset();

  const allowUserPass = useAppConfig(s => s.auth.login.allow_userpass_login);
  const allowSignup = useAppConfig(s => s.auth.login.allow_signup);

  return !allowUserPass || !allowSignup ? null : (
    <Typography align="center" variant="caption">
      {t('reset.desc')}&nbsp;&nbsp;
      <Link
        href="#"
        onClick={() => {
          resetLogin();
          form.setFieldValue('mode', 'reset-password-request');
        }}
      >
        {t('reset.link')}
      </Link>
    </Typography>
  );
});

ResetPasswordLink.displayName = 'ResetPasswordLink';
