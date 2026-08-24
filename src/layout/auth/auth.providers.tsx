import { useAppInterfaceStore } from 'core/interface';
import { useAuthQuery } from 'layout/auth/auth.hooks';
import { LoadingPage } from 'layout/auth/loading/loading.route';
import { LockedPage } from 'layout/auth/locked/locked.route';
import { LoginPage } from 'layout/auth/log-in/log-in.route';
import { LogoutPage } from 'layout/auth/log-out/log-out.route';
import { QuotaPage } from 'layout/auth/quota/quota.route';
import { ToSPage } from 'layout/auth/terms-of-service/terms-of-service.route';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// App Auth
//*****************************************************************************************

export const AppAuthLayout = memo(({ children }: PropsWithChildren) => {
  useAuthQuery();

  const mode = useAppInterfaceStore(s => s.auth.mode);

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

AppAuthLayout.displayName = 'AppAuthLayout';
