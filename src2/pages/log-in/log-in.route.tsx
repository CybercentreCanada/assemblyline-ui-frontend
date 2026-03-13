import { Box, Stack, useTheme } from '@mui/material';
import { useAPIMutation } from 'core/api';
import { useAppConfigStore } from 'core/config';
import { useAppBanner, useAppBannerVert } from 'core/preference/preference.hooks';
import { createAppRoute } from 'core/router/route/route.utils';
import { useAppSnackbar } from 'features/snackbar/useAppSnackbar';
import { getProvider, getSAMLData } from 'lib/utils/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { PageCardCentered } from 'ui/layouts/PageCardCentered';
import { Login } from './components/Login';
import { ResetPassword } from './components/ResetPassword';
import { ResetPasswordNow } from './components/ResetPasswordNow';
import { SignUp } from './components/SignUp';
import { LoginFormProvider, useLoginForm } from './log-in.providers';

type LoginRequest = {
  user: string;
  password: string;
  otp: string;
  webauthn_auth_resp: number[] | null;
  oauth_token_id: string;
  saml_token_id: string;
};

//*****************************************************************************************
// Login Page Content
//*****************************************************************************************
const LoginPageContent = React.memo(() => {
  const Banner = useAppBanner();
  const BannerVert = useAppBannerVert();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['login']);
  const { showErrorMessage, showSuccessMessage } = useAppSnackbar();
  const form = useLoginForm();

  const allowSAML = useAppConfigStore(s => s.auth.login.allow_saml_login);
  const oAuthProviders = useAppConfigStore(s => s.auth.login.oauth_providers);

  const provider = useMemo(() => getProvider(), []);
  const samlData = useMemo(() => getSAMLData(), []);

  const [buttonLoading, setButtonLoading] = useState(false);
  const focusTargetRef = useRef<HTMLInputElement | null>(null);

  // Quick login can only be used if there's exactly one external authentication service configured
  const quickSSOLogin = allowSAML && oAuthProviders?.length === 0 ? true : !allowSAML && oAuthProviders?.length === 1;

  const reset = (event?: React.SyntheticEvent) => {
    if (
      (['oauth'].includes(form.state.values.variant) && form.state.values.sso.oauth_token_id) ||
      !['oauth'].includes(form.state.values.variant)
    ) {
      form.setFieldValue('variant', 'login');
      form.setFieldValue('userpass.username', '');
      form.setFieldValue('userpass.password', '');
      form.setFieldValue('otp.code', '');
      form.setFieldValue('webauthn.response', null);
      form.setFieldValue('sso.avatar', '');
      form.setFieldValue('sso.username', '');
      form.setFieldValue('sso.email', '');
      form.setFieldValue('sso.oauth_token_id', '');
      form.setFieldValue('sso.saml_token_id', '');
      setButtonLoading(false);
    }
    if (event) event.preventDefault();
  };

  const loginMutation = useAPIMutation<[LoginRequest]>(body => ({
    url: '/api/v4/auth/login/',
    method: 'POST',
    body,
    reloadOnUnauthorize: false,
    onEnter: () => setButtonLoading(true),
    onExit: () => setButtonLoading(false),
    onFailure: api_data => {
      const shown = form.state.values.variant;
      if (api_data.api_error_message === 'Wrong OTP token' && shown !== 'otp') {
        form.setFieldValue('variant', 'otp');
      } else if (api_data.api_error_message === 'Wrong Security Token' && shown === 'sectoken') {
        form.setFieldValue('variant', 'otp');
        showErrorMessage(t('securitytoken.error'));
      } else if (api_data.api_error_message === 'Wrong Security Token' && shown !== 'sectoken') {
        form.setFieldValue('variant', 'sectoken');
      } else if (shown === 'oauth' || shown === 'saml') {
        showErrorMessage(api_data.api_error_message);
        reset();
      } else {
        showErrorMessage(api_data.api_error_message);
        if (focusTargetRef.current && 'select' in focusTargetRef.current) {
          focusTargetRef.current.select?.();
          focusTargetRef.current.focus?.();
        }
      }
    },
    onSuccess: () => {
      window.location.reload();
    }
  }));

  const oauthMutation = useAPIMutation<[]>(
    () => ({
      url: `/api/v4/auth/oauth/${
        provider && location.search.indexOf('provider=') === -1
          ? `${location.search}&provider=${provider}`
          : location.search
      }`,
      reloadOnUnauthorize: false,
      onSuccess: api_data => {
        form.setFieldValue('sso.avatar', api_data.api_response.avatar);
        form.setFieldValue('sso.username', api_data.api_response.username);
        form.setFieldValue('sso.email', api_data.api_response.email_adr || '');
        form.setFieldValue('sso.oauth_token_id', api_data.api_response.oauth_token_id);
      },
      onFailure: api_data => {
        showErrorMessage(api_data.api_error_message);
        form.setFieldValue('variant', 'login');
      }
    }),
    {
      onSettled: () => {
        if (provider) {
          navigate(localStorage.getItem('nextLocation') || '/');
        }
      }
    }
  );

  const signupValidate = useAPIMutation<[{ registration_key: string }]>(
    body => ({
      url: '/api/v4/auth/signup_validate/',
      method: 'POST',
      body,
      onSuccess: () => showSuccessMessage(t('signup.completed'), 10000)
    }),
    {
      onSettled: () => navigate('/')
    }
  );

  const login = useCallback(
    (focusTarget: HTMLInputElement | null) => {
      if (buttonLoading) return;
      focusTargetRef.current = focusTarget;

      const data: LoginRequest = {
        user: form.state.values.userpass.username,
        password: form.state.values.userpass.password,
        otp: form.state.values.otp.code,
        webauthn_auth_resp: form.state.values.webauthn.response,
        oauth_token_id: form.state.values.sso.oauth_token_id,
        saml_token_id: form.state.values.sso.saml_token_id
      };

      loginMutation.mutate(data);
    },
    [buttonLoading, loginMutation, form]
  );

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement> | null) => {
      if (event) {
        const firstInput = event.currentTarget?.[0] as HTMLInputElement | undefined;
        login(firstInput ?? null);
        event.preventDefault();
      } else {
        login(null);
      }
    },
    [login]
  );

  const resetPW = (event: React.MouseEvent<HTMLAnchorElement>) => {
    form.setFieldValue('variant', 'reset');
    event.preventDefault();
  };

  const signup = (event: React.MouseEvent<HTMLAnchorElement>) => {
    form.setFieldValue('variant', 'sign-up');
    event.preventDefault();
  };

  useEffect(() => {
    if (form.state.values.webauthn.response !== null) {
      login(null);
      return;
    }

    if (form.state.values.variant === 'oauth') {
      oauthMutation.mutate();
      return;
    }

    const params = new URLSearchParams(location.search);
    const registrationKey = params.get('registration_key');
    if (registrationKey) {
      signupValidate.mutate({ registration_key: registrationKey });
    }
  }, [
    form.state.values.variant,
    form.state.values.webauthn.response,
    location.search,
    login,
    oauthMutation,
    signupValidate
  ]);

  useEffect(() => {
    if (samlData !== null) {
      if (samlData.error !== null && samlData.error !== undefined) {
        showErrorMessage(samlData.error);
        reset();
      } else {
        form.setFieldValue('sso.username', samlData.username || form.state.values.sso.username);
        form.setFieldValue('sso.email', samlData.email || form.state.values.sso.email);
        form.setFieldValue('sso.saml_token_id', samlData.saml_token_id || form.state.values.sso.saml_token_id);
      }
      navigate(localStorage.getItem('nextLocation') || '/');
    }
  }, [samlData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetId = params.get('reset_id');

    if (provider) {
      form.setFieldValue('variant', 'oauth');
    } else if (resetId) {
      form.setFieldValue('variant', 'reset-now');
    } else if (samlData) {
      form.setFieldValue('variant', 'saml');
    } else {
      form.setFieldValue('variant', 'login');
    }
  }, [location.search, provider, samlData, form]);

  return (
    <PageCardCentered>
      <Stack direction="column" sx={{ rowGap: theme.spacing(2) }}>
        <form.Subscribe selector={s => s.values.mode}>
          {value => <Box>{value === 'login' ? <BannerVert /> : <Banner />}</Box>}
        </form.Subscribe>

        <form.Subscribe selector={s => s.values.mode}>
          {mode => {
            switch (mode) {
              case 'login':
                return <Login />;
              case 'reset-password-now':
                return <ResetPasswordNow />;
              case 'reset-password':
                return <ResetPassword />;
              case 'sign-up':
                return <SignUp />;
              // case 'oauth':
              //   return <SSOLogin />;
              // case 'otp':
              //   return <OneTimePassLogin />;
              // case 'sectoken':
              //   return <SecurityTokenLogin />;
              // case 'saml':
              //   return <SSOLogin />;
              default:
                return null;
            }
          }}
        </form.Subscribe>
      </Stack>
    </PageCardCentered>
  );
});

LoginPageContent.displayName = 'LoginPageContent';

//*****************************************************************************************
// Login Page
//*****************************************************************************************
export const LoginPage = React.memo(() => (
  <LoginFormProvider>
    <LoginPageContent />
  </LoginFormProvider>
));

LoginPage.displayName = 'LoginPage';

//*****************************************************************************************
// Login Routes
//*****************************************************************************************

export const LoginRoute = createAppRoute({
  component: LoginPage,
  path: '/login'
});

export default LoginRoute;
