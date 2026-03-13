import { Typography } from '@mui/material';
import { useAPIMutation } from 'core/api';
import { useAppSnackbar } from 'features/snackbar/useAppSnackbar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { EmailInput, TextDivider } from '../log-in.components';
import { useLoginForm } from '../log-in.providers';
import { useLoginReset } from '../log-in.utils';

export const ResetPassword = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage } = useAppSnackbar();

  const reset = useLoginReset();

  const resetPassword = useAPIMutation<[{ email: string }]>(body => ({
    url: '/api/v4/auth/get_reset_link/',
    method: 'POST',
    body,
    onFailure: api_data => showErrorMessage(api_data.api_error_message),
    onSuccess: () => form.setFieldValue('reset.done', true)
  }));

  return (
    <form.Subscribe selector={s => s.values.reset.done}>
      {done =>
        done ? (
          <Typography align="center">{t('reset.done')}</Typography>
        ) : (
          <>
            <EmailInput autoFocus disabled={resetPassword.isPending} />

            <form.Subscribe
              selector={s =>
                ({
                  isInvalid: !s.values.reset.email || s.fieldMeta['reset.email'].errors.length > 0,
                  values: { email: s.values.reset.email.trim().toLowerCase() }
                }) as const
              }
            >
              {({ values, isInvalid }) => (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isInvalid}
                  progress={resetPassword.isPending}
                  onClick={() => resetPassword.mutate(values)}
                >
                  {t('reset.button')}
                </Button>
              )}
            </form.Subscribe>

            <TextDivider />

            <Button variant="text" color="primary" disabled={resetPassword.isPending} onClick={() => reset()}>
              {t('signin')}
            </Button>
          </>
        )
      }
    </form.Subscribe>
  );
});
