import { Avatar, Link, Typography, useTheme } from '@mui/material';
import { useAppConfigStore } from 'core/config';
import { useSaveAppConfig } from 'core/config/config.hooks';
import { useAppConfigSetStore } from 'core/config/config.providers';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Button } from 'ui/buttons/Button';
import { useLoginRequest, useLoginReset, useQuickLogin } from '../log-in.hooks';
import { useLoginForm } from '../log-in.providers';

//*****************************************************************************************
// SingleSignOn
//*****************************************************************************************
export const SingleSignOn = React.memo(() => {
  const { t } = useTranslation(['login']);
  const theme = useTheme();
  const form = useLoginForm();

  const requestLogin = useLoginRequest();
  const resetLogin = useLoginReset();
  const quickLogin = useQuickLogin();

  useEffect(() => {
    if (quickLogin) requestLogin.mutate();
  }, [quickLogin, requestLogin]);

  return quickLogin ? null : (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        requestLogin.mutate();
      }}
    >
      <form.Subscribe selector={s => [s.values.avatar, s.values.username, s.values.email] as const}>
        {([avatar, username, email]) => (
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'center' }}>
            {!avatar ? null : (
              <Avatar
                src={avatar}
                style={{ alignSelf: 'center', width: theme.spacing(18), height: theme.spacing(18) }}
              />
            )}

            <Typography color="textPrimary">{username}</Typography>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              {email}
            </Typography>

            <Button
              color="primary"
              style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
              type="submit"
              variant="contained"
            >
              {t('button')}
            </Button>

            <Link variant="body2" href="#" onClick={() => resetLogin()}>
              {t('other')}
            </Link>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
});

SingleSignOn.displayName = 'SingleSignOn';

//*****************************************************************************************
// OAuthLogin
//*****************************************************************************************
export const OAuthLogin = React.memo(() => {
  const { t } = useTranslation(['login']);
  const location = useLocation();
  const oAuthProviders = useAppConfigStore(s => s.auth.login.oauth_providers);

  const setStore = useAppConfigSetStore();
  const save = useSaveAppConfig();

  const handleClick = useCallback(() => {
    const { pathname, search, hash } = location;
    if (!['/logout'].includes(pathname)) {
      setStore(s => {
        s.auth.redirectTo = `${pathname}${search}${hash}`;
        return s;
      });
      save();
    }
  }, [location, save, setStore]);

  return (oAuthProviders || []).map((provider, i) => (
    <Button
      key={`${provider}-${i}`}
      color="primary"
      href={`/api/v4/auth/login/?oauth_provider=${provider}`}
      variant="contained"
      onClick={handleClick}
    >
      {`${t('button_oauth')} ${provider.replace(/_/g, ' ')}`}
    </Button>
  ));
});

OAuthLogin.displayName = 'OAuthLogin';

//*****************************************************************************************
// SAML
//*****************************************************************************************
export const SAMLLogin = React.memo(() => {
  const { t } = useTranslation(['login']);
  const location = useLocation();
  const allowSAML = useAppConfigStore(s => s.auth.login.allow_saml_login);

  const setStore = useAppConfigSetStore();
  const save = useSaveAppConfig();

  const handleClick = useCallback(() => {
    const { pathname, search, hash } = location;
    if (!['/logout'].includes(pathname)) {
      setStore(s => {
        s.auth.redirectTo = `${pathname}${search}${hash}`;
        return s;
      });
      save();
    }
  }, [location, save, setStore]);

  return !allowSAML ? null : (
    <Button color="primary" href="/api/v4/auth/saml/sso/" variant="contained" onClick={handleClick}>
      {t('button_saml')}
    </Button>
  );
});

SAMLLogin.displayName = 'SAMLLogin';
