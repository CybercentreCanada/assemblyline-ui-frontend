/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  createStyles,
  Link,
  makeStyles,
  Typography,
  useTheme
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import React from 'react';
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

type OAuthProps = {
  avatar: string;
  username: string;
  oAuthToken: string;
  buttonLoading: boolean;
  onSubmit: (event) => void;
  reset: (event) => void;
};

export function OAuthLogin({ avatar, username, oAuthToken, buttonLoading, onSubmit, reset }: OAuthProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();

  return (
    <form onSubmit={onSubmit}>
      <Box display="flex" flexDirection="column" textAlign="center" justifyContent="center">
        {!oAuthToken ? (
          <Skeleton variant="circle" style={{ alignSelf: 'center' }} width={144} height={144} />
        ) : (
          <Avatar style={{ alignSelf: 'center', width: theme.spacing(18), height: theme.spacing(18) }} src={avatar} />
        )}
        <Typography color="textPrimary" gutterBottom>
          {!oAuthToken ? <Skeleton /> : username}
        </Typography>
        {!oAuthToken ? (
          <Skeleton style={{ height: '56px', marginTop: '1.5rem', marginBottom: '1.5rem' }} />
        ) : (
          <Button
            type="submit"
            style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
            variant="contained"
            color="primary"
            disabled={buttonLoading}
          >
            {t('page.login.button')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        )}
        {!oAuthToken ? (
          <Skeleton />
        ) : (
          <Link variant="body2" href="#" onClick={reset}>
            {t('page.login.other')}
          </Link>
        )}
      </Box>
    </form>
  );
}
