import { Typography } from '@mui/material';
import { useAPIMutation } from 'core/api';
import { useAppSnackbar } from 'features/snackbar/useAppSnackbar';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Button } from 'ui/buttons/Button';
import { PasswordConfirmInput, PasswordInput } from '../log-in.components';
import { useLoginForm } from '../log-in.providers';

export const ResetPasswordNow = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['login']);
  const form = useLoginForm();
  const { showErrorMessage } = useAppSnackbar();

  const resetPasswordNow = useAPIMutation<[{ reset_id: string; password: string; password_confirm: string }]>(body => ({
    url: '/api/v4/auth/reset_pwd/',
    method: 'POST',
    body,
    onFailure: api_data => showErrorMessage(api_data.api_error_message),
    onSuccess: () => {
      form.setFieldValue('done', true);
      setTimeout(() => window.location.reload(), 7000);
    }
  }));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetId = params.get('reset_id') || '';
    form.setFieldValue('reset_id', resetId);
    if (params.get('reset_id')) {
      navigate('/');
    }
  }, [form, navigate, location.search]);

  return (
    <form.Subscribe selector={s => s.values.done}>
      {done =>
        done ? (
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
            <PasswordInput autoFocus disabled={resetPasswordNow.isPending} />
            <PasswordConfirmInput autoFocus disabled={resetPasswordNow.isPending} />

            <form.Subscribe
              selector={s =>
                ({
                  values: {
                    reset_id: s.values.reset_id,
                    password: s.values.inputs.password,
                    password_confirm: s.values.inputs.password_confirm
                  },
                  isInvalid:
                    !s.values.inputs.password ||
                    !s.values.inputs.password_confirm ||
                    s.fieldMeta['reset_now.password'].errors.length > 0 ||
                    s.fieldMeta['reset_now.password_confirm'].errors.length > 0
                }) as const
              }
            >
              {({ values, isInvalid }) => (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isInvalid}
                  progress={resetPasswordNow.isPending}
                  onClick={() => resetPasswordNow.mutate(values)}
                >
                  {t('reset_now.button')}
                </Button>
              )}
            </form.Subscribe>
          </>
        )
      }
    </form.Subscribe>
  );
});
