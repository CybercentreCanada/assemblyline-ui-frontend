import { useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { OneTimePassword } from 'layout/auth/log-in/components/OneTimePassword';
import {
  ResetPasswordConfirmation,
  ResetPasswordLink,
  ResetPasswordRequest
} from 'layout/auth/log-in/components/ResetPassword';
import { SecurityTokenLogin } from 'layout/auth/log-in/components/SecurityToken';
import { SignUpConfirmation, SignUpLink, SignUpRequest } from 'layout/auth/log-in/components/SignUp';
import { OAuthLogin, SAMLLogin, SingleSignOn } from 'layout/auth/log-in/components/SingleSignOn';
import { UserPasswordLogin } from 'layout/auth/log-in/components/UserPassword';
import { LoadingCard, LoginDivider } from 'layout/auth/log-in/log-in.components';
import { useOAuthLogin, usePasswordResetEmail, useSAMLLogin, useSignUpEmail } from 'layout/auth/log-in/log-in.hooks';
import { LoginFormProvider, useLoginForm } from 'layout/auth/log-in/log-in.providers';
import { memo } from 'react';
import { AppBanner, AppVerticalBanner } from 'ui/branding';
import { PageCardCentered } from 'ui/pages/PageCardCentered';

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
const LoginPageContent = memo(() => {
  const theme = useTheme();
  const form = useLoginForm();

  usePasswordResetEmail();
  useSignUpEmail();
  useOAuthLogin();
  useSAMLLogin();

  return (
    <PageCardCentered>
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
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
      </div>
    </PageCardCentered>
  );
});

LoginPageContent.displayName = 'LoginPageContent';

//*****************************************************************************************
// Login Page
//*****************************************************************************************
export const LoginPage = memo(() => (
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
