import { Link, Typography } from '@mui/material';
import { useAPIMutation } from 'core/api';
import { useAppConfigStore } from 'core/config';
import { useAppSnackbar } from 'features/snackbar/useAppSnackbar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import TextDivider from 'ui/TextDivider';
import { PasswordInput, UsernameInput } from '../log-in.components';
import { useLoginForm } from '../log-in.providers';
import { useLoginReset } from '../log-in.utils';

//*****************************************************************************************
// UserPassLogin
//*****************************************************************************************
const UserPassLogin = React.memo(() => {
  const { t } = useTranslation(['login']);
  const allowUserPass = useAppConfigStore(s => s.auth.login.allow_userpass_login);
  const form = useLoginForm();
  const { showErrorMessage } = useAppSnackbar();

  const login = useAPIMutation<[{ user: string; password: string }]>(body => ({
    url: '/api/v4/auth/login/',
    method: 'POST',
    body,
    onFailure: api_data => showErrorMessage(api_data.api_error_message),
    onSuccess: () => window.location.reload(),
    onEnter: () => form.setFieldValue('disabled', true),
    onExit: () => form.setFieldValue('disabled', false)
  }));

  return !allowUserPass ? null : (
    <form.Subscribe selector={s => s.values.disabled}>
      {disabled => (
        <>
          <UsernameInput autoFocus disabled={disabled} />
          <PasswordInput disabled={disabled} />

          <form.Subscribe
            selector={s =>
              ({
                values: {
                  user: s.values.inputs.username,
                  password: s.values.inputs.password
                },
                isInvalid:
                  !s.values.inputs.username ||
                  !s.values.inputs.password ||
                  s.fieldMeta['inputs.username'].errors.length > 0 ||
                  s.fieldMeta['inputs.password'].errors.length > 0
              }) as const
            }
          >
            {({ values, isInvalid }) => (
              <Button
                variant="contained"
                color="primary"
                disabled={isInvalid || disabled}
                progress={login.isPending}
                onClick={() => login.mutate(values)}
              >
                {t('login')}
              </Button>
            )}
          </form.Subscribe>
        </>
      )}
    </form.Subscribe>
  );
});

UserPassLogin.displayName = 'UserPassLogin';

//*****************************************************************************************
// Signup
//*****************************************************************************************
export const SignUpLinks = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  const reset = useLoginReset();

  const allowUserPass = useAppConfigStore(s => s.auth.login.allow_userpass_login);
  const allowSignup = useAppConfigStore(s => s.auth.login.allow_signup);

  return !allowUserPass || !allowSignup ? null : (
    <form.Subscribe selector={s => s.values.disabled}>
      {disabled => (
        <>
          <Typography align="center" variant="caption">
            {t('signup')}&nbsp;&nbsp;
            <Link
              href="#"
              onClick={() => {
                if (!disabled) {
                  reset();
                  form.setFieldValue('mode', 'sign-up');
                }
              }}
            >
              {t('signup.link')}
            </Link>
          </Typography>
          <Typography align="center" variant="caption">
            {t('reset.desc')}&nbsp;&nbsp;
            <Link
              href="#"
              onClick={() => {
                if (!disabled) {
                  reset();
                  form.setFieldValue('mode', 'reset-password');
                }
              }}
            >
              {t('reset.link')}
            </Link>
          </Typography>
        </>
      )}
    </form.Subscribe>
  );
});

SignUpLinks.displayName = 'SignUpLinks';

//*****************************************************************************************
// Divider
//*****************************************************************************************

export const Divider = React.memo(() => {
  const allowUserPass = useAppConfigStore(s => s.auth.login.allow_userpass_login);
  const allowSAML = useAppConfigStore(s => s.auth.login.allow_saml_login);
  const oAuthProviders = useAppConfigStore(s => s.auth.login.oauth_providers);

  return !allowUserPass || (!oAuthProviders?.length && !allowSAML) ? null : <TextDivider />;
});

//*****************************************************************************************
// OAuth
//*****************************************************************************************
export const OAuth = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const oAuthProviders = useAppConfigStore(s => s.auth.login.oauth_providers);

  const login = useAPIMutation<[string]>(url => ({
    url,
    method: 'GET'
  }));

  return (oAuthProviders || []).map((item, i) => (
    <form.Subscribe key={i} selector={s => s.values.disabled}>
      {disabled => (
        <Button
          color="primary"
          disabled={disabled}
          variant="contained"
          onClick={() => {
            const nextLocation =
              location.pathname === '/logout' ? '/' : `${location.pathname}${location.search}${location.hash}`;
            localStorage.setItem('nextLocation', nextLocation);
            login.mutate(`/api/v4/auth/login/?oauth_provider=${item}`);
          }}
        >
          {`${t('button_oauth')} ${item.replace(/_/g, ' ')}`}
        </Button>
      )}
    </form.Subscribe>
  ));
});

//*****************************************************************************************
// SAML
//*****************************************************************************************
export const SAML = React.memo(() => {
  const { t } = useTranslation(['login']);
  const allowSAML = useAppConfigStore(s => s.auth.login.allow_saml_login);
  const form = useLoginForm();

  const login = useAPIMutation<[string]>(url => ({
    url,
    method: 'GET'
  }));

  return !allowSAML ? null : (
    <form.Subscribe selector={s => s.values.disabled}>
      {disabled => (
        <Button
          color="primary"
          disabled={disabled}
          variant="contained"
          onClick={() => {
            const nextLocation =
              location.pathname === '/logout' ? '/' : `${location.pathname}${location.search}${location.hash}`;
            localStorage.setItem('nextLocation', nextLocation);
            login.mutate('/api/v4/auth/saml/sso/');
          }}
        >
          {t('button_saml')}
        </Button>
      )}
    </form.Subscribe>
  );
});

//*****************************************************************************************
// Login
//*****************************************************************************************
export const Login = React.memo(() => {
  return (
    <>
      <UserPassLogin />
      <SignUpLinks />

      <Divider />

      <OAuth />
      <SAML />
    </>
  );
});

Login.displayName = 'Login';
