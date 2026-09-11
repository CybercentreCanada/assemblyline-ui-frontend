import { Button, CircularProgress, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

type OTPProps = {
  onSubmit: (event) => void;
  buttonLoading: boolean;
  setOneTimePass: (value: string) => void;
};

export function OneTimePassLogin({ onSubmit, buttonLoading, setOneTimePass }: OTPProps) {
  const { t } = useTranslation(['login']);

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <TextField
          inputProps={{ maxLength: 6 }}
          autoFocus
          variant="outlined"
          size="small"
          label={t('otp')}
          onChange={event => setOneTimePass(event.target.value)}
        />
        <Button
          type="submit"
          style={{ marginTop: '1.5rem' }}
          variant="contained"
          color="primary"
          disabled={buttonLoading}
        >
          {t('button')}
          {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
        </Button>
      </div>
    </form>
  );
}
