/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Button, CircularProgress, Link, Theme, Typography, useTheme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useAppBannerVert from 'commons/components/app/hooks/useAppBannerVert';
import useAppLayout from 'commons/components/app/hooks/useAppLayout';
import PageCardCentered from 'commons/components/pages/PageCardCentered';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { OAuthLogin } from 'components/routes/login/oauth';
import { OneTimePassLogin } from 'components/routes/login/otp';
import { ResetPassword, ResetPasswordNow } from 'components/routes/login/reset';
import { SecurityTokenLogin } from 'components/routes/login/sectoken';
import { SignUp } from 'components/routes/login/signup';
import { UserPassLogin } from 'components/routes/login/userpass';
import TextDivider from 'components/visual/TextDivider';
import { getProvider } from 'helpers/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
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

type LoginScreenProps = {
  allowUserPass: boolean;
  allowSignup: boolean;
  allowPWReset: boolean;
  oAuthProviders: string[];
};

export default function LoginScreen({ allowUserPass, allowSignup, allowPWReset, oAuthProviders }: LoginScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const { t } = useTranslation(['login']);
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const bannerVert = useAppBannerVert();
  const banner = useAppBanner();
  const { hideMenus } = useAppLayout();
  const provider = getProvider();
  const [shownControls, setShownControls] = useState(
    provider ? 'oauth' : params.get('reset_id') ? 'reset_now' : 'login'
  );
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [oAuthTokenID, setOAuthTokenID] = useState('');
  const [oneTimePass, setOneTimePass] = useState('');
  const [webAuthNResponse, setWebAuthNResponse] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const pwPadding = allowSignup ? 1 : 2;

  function onSubmit(event) {
    login(event.target[0]);
    event.preventDefault();
  }

  function reset(event) {
    if ((shownControls === 'oauth' && oAuthTokenID) || shownControls !== 'oauth') {
      setWebAuthNResponse(null);
      setShownControls('login');
      setUsername('');
      setEmail('');
      setPassword('');
      setAvatar('');
      setOAuthTokenID('');
      setOneTimePass('');
    }
    if (event) {
      event.preventDefault();
    }
  }

  function resetPW(event) {
    setShownControls('reset');
    event.preventDefault();
  }

  function signup(event) {
    setShownControls('signup');
    event.preventDefault();
  }

  function login(focusTarget) {
    if (buttonLoading) {
      return;
    }

    const data = {
      user: username,
      password,
      otp: oneTimePass,
      webauthn_auth_resp: webAuthNResponse,
      oauth_token_id: oAuthTokenID
    };

    apiCall({
      url: '/api/v4/auth/login/',
      method: 'POST',
      body: data,
      reloadOnUnauthorize: false,
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false),
      onFailure: api_data => {
        if (api_data.api_error_message === 'Wrong OTP token' && shownControls !== 'otp') {
          setShownControls('otp');
        } else if (api_data.api_error_message === 'Wrong Security Token' && shownControls === 'sectoken') {
          setShownControls('otp');
          showErrorMessage(t('securitytoken.error'));
        } else if (api_data.api_error_message === 'Wrong Security Token' && shownControls !== 'sectoken') {
          setShownControls('sectoken');
        } else if (shownControls === 'oauth') {
          showErrorMessage(api_data.api_error_message);
          reset(null);
        } else {
          showErrorMessage(api_data.api_error_message);
          if (focusTarget !== null) {
            // eslint-disable-next-line no-prototype-builtins
            if (focusTarget.hasOwnProperty('select')) {
              focusTarget.select();
              focusTarget.focus();
            }
          }
        }
      },
      onSuccess: () => {
        window.location.reload();
      }
    });
  }

  useEffect(() => {
    if (webAuthNResponse !== null) {
      login(null);
    } else if (shownControls === 'oauth') {
      apiCall({
        url: `/api/v4/auth/oauth/${
          provider && location.search.indexOf('provider=') === -1
            ? `${location.search}&provider=${provider}`
            : location.search
        }`,
        reloadOnUnauthorize: false,
        onSuccess: api_data => {
          setAvatar(api_data.api_response.avatar);
          setUsername(api_data.api_response.username);
          setEmail(api_data.api_response.email_adr || '');
          setOAuthTokenID(api_data.api_response.oauth_token_id);
        },
        onFailure: api_data => {
          showErrorMessage(api_data.api_error_message);
          setShownControls('login');
        },
        onFinalize: () => {
          if (provider) {
            navigate(localStorage.getItem('nextLocation') || '/');
          }
        }
      });
    } else if (params.get('registration_key')) {
      apiCall({
        url: '/api/v4/auth/signup_validate/',
        method: 'POST',
        body: { registration_key: params.get('registration_key') },
        onSuccess: () => showSuccessMessage(t('signup.completed'), 10000),
        onFinalize: () => navigate('/')
      });
    }
    // eslint-disable-next-line
  }, [webAuthNResponse, shownControls]);

  useEffect(() => {
    hideMenus();
  }, [hideMenus]);

  return (
    <PageCardCentered>
      <Box style={{ cursor: 'pointer' }} onClick={reset}>
        {shownControls === 'oauth' ? banner : bannerVert}
      </Box>
      {
        {
          login: (
            <>
              {allowUserPass ? (
                <UserPassLogin
                  onSubmit={onSubmit}
                  buttonLoading={buttonLoading}
                  setPassword={setPassword}
                  setUsername={setUsername}
                />
              ) : null}
              {allowSignup ? (
                <Typography align="center" variant="caption" style={{ marginTop: theme.spacing(2) }}>
                  {t('signup')}&nbsp;&nbsp;
                  <Link href="#" onClick={signup}>
                    {t('signup.link')}
                  </Link>
                </Typography>
              ) : null}
              {allowPWReset ? (
                <Typography align="center" variant="caption" style={{ marginTop: theme.spacing(pwPadding) }}>
                  {t('reset.desc')}&nbsp;&nbsp;
                  <Link href="#" onClick={resetPW}>
                    {t('reset.link')}
                  </Link>
                </Typography>
              ) : null}
              {oAuthProviders !== undefined && oAuthProviders.length !== 0 ? (
                <>
                  {allowUserPass ? <TextDivider /> : null}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {oAuthProviders.map((item, idx) => (
                      <Button
                        key={idx}
                        style={idx !== 0 ? { marginTop: '1.5rem' } : null}
                        variant="contained"
                        color="primary"
                        disabled={buttonLoading}
                        onClick={() => {
                          localStorage.setItem(
                            'nextLocation',
                            location.pathname === '/logout'
                              ? '/'
                              : `${location.pathname}${location.search}${location.hash}`
                          );
                          setButtonLoading(true);
                        }}
                        href={`/api/v4/auth/login/?oauth_provider=${item}`}
                      >
                        {`${t('button_oauth')} ${item.replace(/_/g, ' ')}`}
                        {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                      </Button>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ),
          signup: <SignUp setButtonLoading={setButtonLoading} buttonLoading={buttonLoading} reset={reset} />,
          reset: <ResetPassword setButtonLoading={setButtonLoading} buttonLoading={buttonLoading} reset={reset} />,
          reset_now: (
            <ResetPasswordNow setButtonLoading={setButtonLoading} buttonLoading={buttonLoading} reset={reset} />
          ),
          oauth: (
            <OAuthLogin
              reset={reset}
              oAuthTokenID={oAuthTokenID}
              avatar={avatar}
              username={username}
              email={email}
              onSubmit={onSubmit}
              buttonLoading={buttonLoading}
            />
          ),
          otp: <OneTimePassLogin onSubmit={onSubmit} buttonLoading={buttonLoading} setOneTimePass={setOneTimePass} />,
          sectoken: (
            <SecurityTokenLogin
              setShownControls={setShownControls}
              setWebAuthNResponse={setWebAuthNResponse}
              username={username}
            />
          )
        }[shownControls]
      }
    </PageCardCentered>
  );
}
