import { CircularProgress, Divider, TextField, TextFieldProps, Typography, useTheme } from '@mui/material';
import { useAppConfigStore } from 'core/config';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from './log-in.providers';
import {
  EMAIL_PATTERN,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateUsername
} from './log-in.utils';

//*****************************************************************************************
// Divider
//*****************************************************************************************

export const TextDivider = React.memo(() => {
  const theme = useTheme();
  const { t } = useTranslation(['login']);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Divider sx={{ flex: 1 }} />
      <div style={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}>{t('divider')}</div>
      <Divider sx={{ flex: 1 }} />
    </div>
  );
});

TextDivider.displayName = 'TextDivider';

//*****************************************************************************************
// LoginDivider
//*****************************************************************************************

export const LoginDivider = React.memo(() => {
  const allowUserPass = useAppConfigStore(s => s.auth.login.allow_userpass_login);
  const allowSAML = useAppConfigStore(s => s.auth.login.allow_saml_login);
  const oAuthProviders = useAppConfigStore(s => s.auth.login.oauth_providers);

  return !allowUserPass || (!oAuthProviders?.length && !allowSAML) ? null : <TextDivider />;
});

LoginDivider.displayName = 'LoginDivider';

//*****************************************************************************************
// Username Input
//*****************************************************************************************
export const UsernameInput = React.memo((props: TextFieldProps) => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  return (
    <form.Field name="username" validators={{ onChange: ({ value }) => validateUsername(value) }}>
      {field => (
        <TextField
          label={t('username')}
          size="small"
          slotProps={{
            input: { autoCorrect: 'off', autoCapitalize: 'off' },
            htmlInput: {
              required: true,
              minLength: USERNAME_MIN_LENGTH,
              pattern: USERNAME_PATTERN.source,
              onInput: event => {
                const validate = USERNAME_PATTERN.test(event.target.value);
                if (!validate) event.target.setCustomValidity(t('validate.username.characters'));
                else event.target.setCustomValidity('');
              }
            }
          }}
          variant="outlined"
          {...props}
          value={field.state.value}
          onChange={event => field.handleChange(event.target.value)}
        />
      )}
    </form.Field>
  );
});

UsernameInput.displayName = 'UsernameInput';

//*****************************************************************************************
// Password Input
//*****************************************************************************************
export const PasswordInput = React.memo((props: TextFieldProps) => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  return (
    <form.Field name="password" validators={{ onChange: ({ value }) => validatePassword(value) }}>
      {field => (
        <TextField
          label={t('password')}
          size="small"
          type="password"
          variant="outlined"
          slotProps={{
            htmlInput: {
              required: true
            }
          }}
          {...props}
          value={field.state.value}
          onChange={event => field.handleChange(event.target.value)}
        />
      )}
    </form.Field>
  );
});

PasswordInput.displayName = 'PasswordInput';

//*****************************************************************************************
// Password Input
//*****************************************************************************************
export const PasswordConfirmInput = React.memo((props: TextFieldProps) => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  return (
    <form.Field
      name="password_confirm"
      validators={{
        onChangeListenTo: ['password'],
        onChange: ({ value, fieldApi }) => validatePasswordConfirm(fieldApi.form.state.values.password, value)
      }}
    >
      {field => (
        <TextField
          label={t('password_confirm')}
          size="small"
          type="password"
          variant="outlined"
          slotProps={{
            htmlInput: {
              required: true,
              onInput: event => {
                if (event.target.value !== field.form.state.values.password)
                  event.target.setCustomValidity(t('validate.password_confirm.mismatch'));
                else event.target.setCustomValidity('');
              }
            }
          }}
          {...props}
          value={field.state.value}
          onChange={event => field.handleChange(event.target.value)}
        />
      )}
    </form.Field>
  );
});

PasswordConfirmInput.displayName = 'PasswordConfirmInput';

//*****************************************************************************************
// Email Input
//*****************************************************************************************
export const EmailInput = React.memo((props: TextFieldProps) => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  return (
    <form.Field name="email" validators={{ onChange: ({ value }) => validateEmail(value) }}>
      {field => (
        <TextField
          label={t('email')}
          size="small"
          type="email"
          variant="outlined"
          slotProps={{
            htmlInput: {
              required: true,
              pattern: EMAIL_PATTERN.source,
              onInput: event => {
                const validate = EMAIL_PATTERN.test(event.target.value);
                if (!validate) event.target.setCustomValidity(t('validate.email.invalid'));
                else event.target.setCustomValidity('');
              }
            }
          }}
          {...props}
          value={field.state.value}
          onChange={event => field.handleChange(event.target.value)}
        />
      )}
    </form.Field>
  );
});

EmailInput.displayName = 'EmailInput';

//*****************************************************************************************
// Loading Card
//*****************************************************************************************
export const LoadingCard = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  return (
    <form.Subscribe selector={s => s.values.loading}>
      {loading => (
        <>
          <Typography sx={{ width: '100%', textAlign: 'center' }}>{loading}</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress variant="indeterminate" />
          </div>
        </>
      )}
    </form.Subscribe>
  );
});

LoadingCard.displayName = 'LoadingCard';
