import { useAuthQuery } from 'core/auth/auth.hooks';
import { useAppConfig } from 'core/config';
import React, { PropsWithChildren } from 'react';
import { LoadingPage } from './loading/loading.route';
import { LockedPage } from './locked/locked.route';
import { LoginPage } from './log-in/log-in.route';
import { LogoutPage } from './log-out/log-out.route';
import { QuotaPage } from './quota/quota.route';
import { ToSPage } from './terms-of-service/terms-of-service.route';

export const AppAuthLayout = React.memo(({ children }: PropsWithChildren) => {
  useAuthQuery();

  const mode = useAppConfig(s => s.auth.mode);

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
