import { useAppConfig } from 'core/config';
import { LoadingPage } from 'pages/loading/loading.route';
import { LockedPage } from 'pages/locked/locked.route';
import { LoginPage } from 'pages/log-in/log-in.route';
import { LogoutPage } from 'pages/log-out/log-out.route';
import { QuotaPage } from 'pages/quota/quota.route';
import { ToSPage } from 'pages/terms-of-service/terms-of-service.route';
import React, { PropsWithChildren } from 'react';
import { useAuthQuery } from './auth.hooks';

export const AppAuthProvider = React.memo(({ children }: PropsWithChildren) => {
  const mode = useAppConfig(s => s.auth.mode);

  useAuthQuery();

  switch (mode) {
    case 'app':
      return children;
    case 'loading':
      return <LoadingPage />;
    case 'locked':
      return <LockedPage />;
    case 'login':
      return <LoginPage />;
    case 'logout':
      return <LogoutPage />;
    case 'quota':
      return <QuotaPage />;
    case 'tos':
      return <ToSPage />;
    default:
      return null;
  }
});
