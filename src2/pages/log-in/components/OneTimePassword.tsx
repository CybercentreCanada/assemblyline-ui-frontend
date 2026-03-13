import { TextField } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { useLoginForm } from '../log-in.providers';

type OTPProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement> | null) => void;
  buttonLoading: boolean;
};

export const OneTimePassLogin = React.memo(({ onSubmit, buttonLoading }: OTPProps) => {
  const { t } = useTranslation(['login']);
  const form = useLoginForm();

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <form.Subscribe selector={s => [s.values.otp.code, s.values.disabled] as const}>
          {([code, disabled]) => (
            <TextField
              inputProps={{ maxLength: 6 }}
              autoFocus
              variant="outlined"
              size="small"
              label={t('otp')}
              value={code}
              disabled={disabled}
              onChange={event => form.setFieldValue('otp.code', event.target.value)}
            />
          )}
        </form.Subscribe>

        <Button type="submit" variant="contained" color="primary" disabled={buttonLoading} progress={buttonLoading}>
          {t('button')}
        </Button>
      </div>
    </form>
  );
});
