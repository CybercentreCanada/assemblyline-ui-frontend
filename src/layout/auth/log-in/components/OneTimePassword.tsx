import { TextField } from '@mui/material';
import { TextDivider } from 'layout/auth/log-in/log-in.components';
import { useLoginRequest, useLoginReset } from 'layout/auth/log-in/log-in.hooks';
import { useLoginForm } from 'layout/auth/log-in/log-in.providers';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';

export const OneTimePassword = memo(() => {
  const { t } = useTranslation(['login']);

  const form = useLoginForm();
  const requestLogin = useLoginRequest();
  const resetLogin = useLoginReset();

  return (
    <form
      style={{ display: 'contents' }}
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        requestLogin.mutate();
      }}
    >
      <form.Field name="otp_code">
        {field => (
          <TextField
            label={t('otp')}
            size="small"
            type="number"
            variant="outlined"
            slotProps={{
              htmlInput: {
                required: true,
                maxLength: 6
              }
            }}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
          />
        )}
      </form.Field>

      <Button color="primary" type="submit" variant="contained">
        {t('button')}
      </Button>

      <TextDivider />

      <Button variant="text" color="primary" onClick={() => resetLogin()}>
        {t('other')}
      </Button>
    </form>
  );
});

OneTimePassword.displayName = 'OneTimePassword';
