import { Avatar, Link, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/buttons/Button';
import { useLoginForm } from '../log-in.providers';

type SSOProps = {
  tokenId: string;
  buttonLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement> | null) => void;
  reset: (event?: React.SyntheticEvent) => void;
  quickLogin: boolean;
};

export const SSOLogin = React.memo(({ tokenId, buttonLoading, onSubmit, reset, quickLogin }: SSOProps) => {
  const { t } = useTranslation(['login']);
  const theme = useTheme();
  const form = useLoginForm();

  // Perform a quick login if we have all the necessary data
  if (quickLogin && tokenId) {
    onSubmit(null);
    return null;
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'center' }}>
        {!tokenId ? (
          <Skeleton variant="circular" style={{ alignSelf: 'center' }} width={144} height={144} />
        ) : (
          <Avatar
            style={{ alignSelf: 'center', width: theme.spacing(18), height: theme.spacing(18) }}
            src={form.state.values.sso.avatar}
          />
        )}
        <Typography color="textPrimary">{!tokenId ? <Skeleton /> : form.state.values.sso.username}</Typography>
        <Typography variant="caption" color="textSecondary" gutterBottom>
          {!tokenId ? <Skeleton /> : form.state.values.sso.email}
        </Typography>
        {!tokenId ? (
          <Skeleton variant="rectangular" style={{ height: '36px', marginTop: '1.5rem', marginBottom: '1.5rem' }} />
        ) : (
          <Button
            type="submit"
            style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
            variant="contained"
            color="primary"
            disabled={buttonLoading}
            progress={buttonLoading}
          >
            {t('button')}
          </Button>
        )}
        {!tokenId ? (
          <Skeleton />
        ) : (
          <Link variant="body2" href="#" onClick={reset}>
            {t('other')}
          </Link>
        )}
      </div>
    </form>
  );
});

SSOLogin.displayName = 'SSOLogin';
