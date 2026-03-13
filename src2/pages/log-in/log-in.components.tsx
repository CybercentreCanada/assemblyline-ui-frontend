import { Divider, TextField, TextFieldProps, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from './log-in.providers';
import { validateEmail, validatePassword, validatePasswordConfirm, validateUsername } from './log-in.utils';

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
// Username Input
//*****************************************************************************************
export const UsernameInput = React.memo((props: TextFieldProps) => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  return (
    <form.Field
      name="inputs.username"
      validators={{
        // onBlur: ({ value }) => validateUsername(value)
        onChange: ({ value }) => validateUsername(value)
      }}
    >
      {field => {
        const errors = field.state.meta.errors ?? [];
        const showError = field.state.meta.isTouched && errors.length > 0;
        return (
          <TextField
            error={showError}
            helperText={showError ? t(`${errors[0]}`) : undefined}
            label={t('username')}
            size="small"
            slotProps={{ input: { autoCorrect: 'off', autoCapitalize: 'off' } }}
            variant="outlined"
            {...props}
            value={field.state.value}
            onChange={event => form.setFieldValue('inputs.username', event.target.value)}
            // onBlur={event => {
            //   form.validateField('inputs.username', 'blur');
            // }}
          />
        );
      }}
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
    <form.Field
      name="inputs.password"
      validators={{
        // onBlur: ({ value }) => validatePassword(value)
        onChange: ({ value }) => validatePassword(value)
      }}
    >
      {field => {
        const errors = field.state.meta.errors ?? [];
        const showError = field.state.meta.isTouched && errors.length > 0;

        return (
          <TextField
            error={showError}
            helperText={showError ? t(`${errors[0]}`) : undefined}
            label={t('password')}
            size="small"
            type="password"
            variant="outlined"
            {...props}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            // onBlur={event => {
            //   form.validateField('inputs.username', 'blur');
            // }}
          />
        );
      }}
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
      name="inputs.password_confirm"
      validators={{
        // onBlurListenTo: ['signup.password'],
        // onBlur: ({ value, fieldApi }) => validatePasswordConfirm(fieldApi.form.state.values.signup.password, value)
        onChangeListenTo: ['inputs.password'],
        onChange: ({ value, fieldApi }) => validatePasswordConfirm(fieldApi.form.state.values.inputs.password, value)
      }}
    >
      {field => {
        const errors = field.state.meta.errors ?? [];
        const showError = field.state.meta.isTouched && errors.length > 0;
        return (
          <TextField
            error={showError}
            helperText={showError ? t(`${errors[0]}`) : undefined}
            label={t('password_confirm')}
            size="small"
            type="password"
            variant="outlined"
            {...props}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            // onBlur={event => {
            //   form.validateField('inputs.username', 'blur');
            // }}
          />
        );
      }}
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
    <form.Field
      name="inputs.email"
      validators={{
        // onBlur: ({ value }) => validateEmail(value)
        onChange: ({ value }) => validateEmail(value)
      }}
    >
      {field => {
        const errors = field.state.meta.errors ?? [];
        const showError = field.state.meta.isTouched && errors.length > 0;
        return (
          <TextField
            error={showError}
            helperText={showError ? t(`${errors[0]}`) : undefined}
            label={t('email')}
            size="small"
            type="email"
            variant="outlined"
            {...props}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            // onBlur={event => {
            //   form.validateField('inputs.username', 'blur');
            // }}
          />
        );
      }}
    </form.Field>
  );
});

EmailInput.displayName = 'EmailInput';
