import { useAppConfigStore } from 'core/config';
import { LoadingPage } from 'pages/loading/loading.route';
import { LockedPage } from 'pages/locked/locked.route';
import { LoginPage } from 'pages/log-in/log-in.route';
import { LogoutPage } from 'pages/log-out/log-out.route';
import { QuotaPage } from 'pages/quota/quota.route';
import { ToSPage } from 'pages/terms-of-service/terms-of-service.route';
import React, { PropsWithChildren } from 'react';

export const AppAuth = React.memo(({ children }: PropsWithChildren) => {
  const loginParams = useAppConfigStore(s => s.auth.login);
  const mode = useAppConfigStore(s => s.auth.mode);

  console.log(mode);

  switch (mode) {
    case 'loading':
      return <LoadingPage />;
    case 'locked':
      return <LockedPage />;
    case 'login':
      return !loginParams ? <LoadingPage /> : <LoginPage />;
    case 'quota':
      return <QuotaPage />;
    case 'app':
      return children;
    case 'tos':
      return <ToSPage />;
    case 'logout':
      return <LogoutPage />;
    default:
      return null;
  }
});
