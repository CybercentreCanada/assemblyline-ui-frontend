import { Button, CircularProgress, createStyles, makeStyles, TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() =>
  createStyles({
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12
    }
  })
);

type OTPProps = {
  onSubmit: (event) => void;
  buttonLoading: boolean;
  setOneTimePass: (value: string) => void;
};

export function OneTimePassLogin({ onSubmit, buttonLoading, setOneTimePass }: OTPProps) {
  const { t } = useTranslation(['login']);
  const classes = useStyles();

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
          {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
        </Button>
      </div>
    </form>
  );
}
