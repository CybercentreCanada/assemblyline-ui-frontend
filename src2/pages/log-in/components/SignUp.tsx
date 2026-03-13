import { Typography } from '@mui/material';
import { useAPIMutation } from 'core/api';
import { useAppSnackbar } from 'features/snackbar/useAppSnackbar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { EmailInput, PasswordConfirmInput, PasswordInput, TextDivider, UsernameInput } from '../log-in.components';
import { useLoginForm } from '../log-in.providers';
import { useLoginReset } from '../log-in.utils';

export const SignUp = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage } = useAppSnackbar();

  const reset = useLoginReset();

  const createAccount = useAPIMutation<[{ user: string; password: string; password_confirm: string; email: string }]>(
    body => ({
      url: '/api/v4/auth/signup/',
      method: 'POST',
      body,
      onFailure: api_data => showErrorMessage(api_data.api_error_message),
      onSuccess: () => form.setFieldValue('signup.done', true)
    })
  );

  return (
    <form.Subscribe selector={s => s.values.signup.done}>
      {done =>
        done ? (
          <Typography align="center">{t('signup.done')}</Typography>
        ) : (
          <>
            <UsernameInput autoFocus disabled={createAccount.isPending} />
            <PasswordInput disabled={createAccount.isPending} />
            <PasswordConfirmInput disabled={createAccount.isPending} />
            <EmailInput disabled={createAccount.isPending} />

            <form.Subscribe
              selector={s =>
                ({
                  values: {
                    user: s.values.signup.username,
                    password: s.values.signup.password,
                    password_confirm: s.values.signup.password_confirm,
                    email: s.values.signup.email
                  },
                  isInvalid:
                    !s.values.signup.username ||
                    !s.values.signup.password ||
                    !s.values.signup.password_confirm ||
                    !s.values.signup.email ||
                    s.fieldMeta['signup.username'].errors.length > 0 ||
                    s.fieldMeta['signup.password'].errors.length > 0 ||
                    s.fieldMeta['signup.password_confirm'].errors.length > 0 ||
                    s.fieldMeta['signup.email'].errors.length > 0
                }) as const
              }
            >
              {({ values, isInvalid }) => (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isInvalid}
                  progress={createAccount.isPending}
                  onClick={() => createAccount.mutate(values)}
                >
                  {t('signup.button')}
                </Button>
              )}
            </form.Subscribe>

            <TextDivider />

            <Button variant="text" color="primary" disabled={createAccount.isPending} onClick={() => reset()}>
              {t('signin')}
            </Button>
          </>
        )
      }
    </form.Subscribe>
  );
});

SignUp.displayName = 'SignUp';
