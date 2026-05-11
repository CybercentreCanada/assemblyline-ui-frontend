import { Avatar, Button, CircularProgress, Link, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';

type SSOProps = {
  avatar: string;
  username: string;
  email: string;
  tokenID: string;
  buttonLoading: boolean;
  onSubmit: (event) => void;
  reset: (event) => void;
  quickLogin: boolean;
};

export function SSOLogin({ avatar, username, email, tokenID, buttonLoading, onSubmit, reset, quickLogin }: SSOProps) {
  const { t } = useTranslation(['login']);
  const theme = useTheme();

  // Perform a quick login if we have all the necessary data
  if (quickLogin && tokenID) {
    onSubmit(null);
    return;
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'center' }}>
        {!tokenID ? (
          <Skeleton variant="circular" style={{ alignSelf: 'center' }} width={144} height={144} />
        ) : (
          <Avatar style={{ alignSelf: 'center', width: theme.spacing(18), height: theme.spacing(18) }} src={avatar} />
        )}
        <Typography color="textPrimary">{!tokenID ? <Skeleton /> : username}</Typography>
        <Typography variant="caption" color="textSecondary" gutterBottom>
          {!tokenID ? <Skeleton /> : email}
        </Typography>
        {!tokenID ? (
          <Skeleton variant="rectangular" style={{ height: '36px', marginTop: '1.5rem', marginBottom: '1.5rem' }} />
        ) : (
          <Button
            type="submit"
            style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
            variant="contained"
            color="primary"
            disabled={buttonLoading}
          >
            {t('button')}
            {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
          </Button>
        )}
        {!tokenID ? (
          <Skeleton />
        ) : (
          <Link variant="body2" href="#" onClick={reset}>
            {t('other')}
          </Link>
        )}
      </div>
    </form>
  );
}
