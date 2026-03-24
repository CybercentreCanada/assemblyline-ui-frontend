import { Stack, useTheme } from '@mui/material';
import { AppBanner, AppVerticalBanner } from 'core/layout/layout.components';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { PageCardCentered } from 'ui/layouts/PageCardCentered';
import { OneTimePassword } from './components/OneTimePassword';
import { ResetPasswordConfirmation, ResetPasswordLink, ResetPasswordRequest } from './components/ResetPassword';
import { SecurityTokenLogin } from './components/SecurityToken';
import { SignUpConfirmation, SignUpLink, SignUpRequest } from './components/SignUp';
import { OAuthLogin, SAMLLogin, SingleSignOn } from './components/SingleSignOn';
import { UserPasswordLogin } from './components/UserPassword';
import { LoadingCard, LoginDivider } from './log-in.components';
import { useOAuthLogin, usePasswordResetEmail, useSAMLLogin, useSignUpEmail } from './log-in.hooks';
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
  const theme = useTheme();
  const form = useLoginForm();

  usePasswordResetEmail();
  useSignUpEmail();
  useOAuthLogin();
  useSAMLLogin();

  return (
    <PageCardCentered>
      <Stack direction="column" sx={{ rowGap: theme.spacing(2) }}>
        <form.Subscribe selector={s => s.values.mode}>
          {mode => (
            <>
              {mode === 'log-in' ? <AppVerticalBanner /> : <AppBanner />}

              {(() => {
                switch (mode) {
                  case 'loading':
                    return <LoadingCard />;
                  case 'log-in':
                    return (
                      <>
                        <UserPasswordLogin />
                        <SignUpLink />
                        <ResetPasswordLink />

                        <LoginDivider />

                        <OAuthLogin />
                        <SAMLLogin />
                      </>
                    );
                  case 'otp':
                    return <OneTimePassword />;
                  case 'reset-password-confirmation':
                    return <ResetPasswordConfirmation />;
                  case 'reset-password-request':
                    return <ResetPasswordRequest />;
                  case 'sectoken':
                    return <SecurityTokenLogin />;
                  case 'sign-up-confirmation':
                    return <SignUpConfirmation />;
                  case 'sign-up-request':
                    return <SignUpRequest />;
                  case 'sso':
                    return <SingleSignOn />;
                  default:
                    return null;
                }
              })()}
            </>
          )}
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
