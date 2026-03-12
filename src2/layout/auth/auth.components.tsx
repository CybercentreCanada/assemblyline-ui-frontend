import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { Box, Button, CircularProgress, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useAppConfigStore } from 'core/config';
import { useAppBanner, useAppBannerVert } from 'core/preference/preference.hooks';
import { PageCardCentered } from 'layout/page/PageCardCentered';
import { PageCenter } from 'layout/page/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuthForm } from './auth.providers';

//*****************************************************************************************
// LoadingCard
//*****************************************************************************************
export type LoadingCardProps = {
  hideBanner?: boolean;
};

export const LoadingCard = React.memo(({ hideBanner = false }: LoadingCardProps) => {
  const Banner = useAppBannerVert();

  return hideBanner ? (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <CircularProgress variant="indeterminate" />
    </div>
  ) : (
    <PageCardCentered sx={{ textAlign: 'center' }}>
      <Banner />
      <CircularProgress variant="indeterminate" />
    </PageCardCentered>
  );
});

LoadingCard.displayName = 'LoadingScreen';

//*****************************************************************************************
// LockedPage
//*****************************************************************************************

export const LockedPage = React.memo(() => {
  const { t } = useTranslation(['locked']);
  const theme = useTheme();

  return (
    <>
      {configuration.ui.tos ? (
        <PageCenter width="65%" margin={4}>
          <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
            <HourglassEmptyOutlinedIcon color="secondary" fontSize="inherit" />
          </div>
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Typography variant="h3">{t('title')}</Typography>
          </div>
          {configuration.ui.tos_lockout_notify ? (
            <div>
              <Typography variant="h6">{t('auto_notify')}</Typography>
            </div>
          ) : (
            <div>
              <Typography variant="h6">{t('contact_admin')}</Typography>
            </div>
          )}
        </PageCenter>
      ) : (
        <ForbiddenPage disabled />
      )}
    </>
  );
});

LoadingCard.displayName = 'LoadingScreen';

//*****************************************************************************************
// UserPassLogin
//*****************************************************************************************
export const UserPassLogin = React.memo(() => {
  const { t } = useTranslation(['login']);
  const allowUserPass = useAppConfigStore(s => s.auth.login.allowUserPass);
  const form = useAuthForm();

  const buttonLoading = false;

  return !allowUserPass ? null : (
    <>
      <form.Subscribe selector={s => s.values.userpass.username}>
        {value => (
          <TextField
            autoFocus
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'off' }}
            label={t('username')}
            size="small"
            variant="outlined"
            value={value}
            onChange={event => form.setFieldValue('userpass.username', event.target.value)}
          />
        )}
      </form.Subscribe>

      <form.Subscribe selector={s => s.values.userpass.password}>
        {value => (
          <TextField
            // style={{ marginTop: '.5rem' }}
            variant="outlined"
            size="small"
            type="password"
            label={t('password')}
            value={value}
            onChange={event => form.setFieldValue('userpass.password', event.target.value)}
          />
        )}
      </form.Subscribe>

      <Button
        // type="submit"
        // style={{ marginTop: '1.5rem' }}
        variant="contained"
        color="primary"
        disabled={buttonLoading}
      >
        {t('button')}
        {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
      </Button>
    </>
  );
});

UserPassLogin.displayName = 'UserPassLogin';

//*****************************************************************************************
// LoginCard
//*****************************************************************************************
export const LoginCard = React.memo(() => {
  const { t } = useTranslation(['login']);
  const form = useAuthForm();
  const BannerVert = useAppBannerVert();
  const Banner = useAppBanner();

  return (
    <PageCardCentered>
      <Stack spacing={1}>
        <form.Subscribe selector={s => s.values.variant}>
          {value => <Box>{value === 'login' ? <BannerVert /> : <Banner />}</Box>}
        </form.Subscribe>

        <UserPassLogin />

        <div>asd</div>
        <div>asd</div>
        <div>asd</div>
        <div>asd</div>
      </Stack>
    </PageCardCentered>
  );

  return (
    <>
      {allowUserPass ? (
        <Stack spacing={1}>
          <UserPassLogin
            onSubmit={onSubmit}
            buttonLoading={buttonLoading}
            setPassword={setPassword}
            setUsername={setUsername}
          />
          {allowSignup ? (
            <>
              <Typography align="center" variant="caption">
                {t('signup')}&nbsp;&nbsp;
                <Link href="#" onClick={signup}>
                  {t('signup.link')}
                </Link>
              </Typography>
              <Typography align="center" variant="caption">
                {t('reset.desc')}&nbsp;&nbsp;
                <Link href="#" onClick={resetPW}>
                  {t('reset.link')}
                </Link>
              </Typography>
            </>
          ) : null}
        </Stack>
      ) : null}
      {(oAuthProviders !== undefined && oAuthProviders.length !== 0) || allowSAML ? (
        <>
          {allowUserPass ? <TextDivider /> : null}
          <Stack spacing={3}>
            {oAuthProviders !== undefined &&
              oAuthProviders.map((item, idx) => (
                <Button
                  key={idx}
                  variant="contained"
                  color="primary"
                  disabled={buttonLoading}
                  onClick={() => {
                    localStorage.setItem(
                      'nextLocation',
                      location.pathname === '/logout' ? '/' : `${location.pathname}${location.search}${location.hash}`
                    );
                    setButtonLoading(true);
                  }}
                  href={`/api/v4/auth/login/?oauth_provider=${item}`}
                >
                  {`${t('button_oauth')} ${item.replace(/_/g, ' ')}`}
                  {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                </Button>
              ))}
            {allowSAML && (
              <Button
                variant="contained"
                color="primary"
                disabled={buttonLoading}
                onClick={() => {
                  localStorage.setItem(
                    'nextLocation',
                    location.pathname === '/logout' ? '/' : `${location.pathname}${location.search}${location.hash}`
                  );
                  setButtonLoading(true);
                }}
                href="/api/v4/auth/saml/sso/"
              >
                {t('button_saml')}
                {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
            )}
          </Stack>
        </>
      ) : null}
    </>
  );
});

LoginCard.displayName = 'LoginCard';
