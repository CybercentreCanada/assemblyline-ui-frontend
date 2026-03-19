import { TextField } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { TextDivider } from '../log-in.components';
import { useLoginRequest, useLoginReset } from '../log-in.hooks';
import { useLoginForm } from '../log-in.providers';

export const OneTimePassword = React.memo(() => {
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
        {t('button')}
      </Button>
    </form>
  );
});
