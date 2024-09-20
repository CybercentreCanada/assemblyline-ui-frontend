/* eslint-disable jsx-a11y/anchor-is-valid */
import { Avatar, Button, CircularProgress, Link, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
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

type SSOProps = {
  avatar: string;
  username: string;
  email: string;
  tokenID: string;
  buttonLoading: boolean;
  onSubmit: (event) => void;
  reset: (event) => void;
};

export function SSOLogin({ avatar, username, email, tokenID, buttonLoading, onSubmit, reset }: SSOProps) {
  const { t } = useTranslation(['login']);
  const classes = useStyles();
  const theme = useTheme();

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
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
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
