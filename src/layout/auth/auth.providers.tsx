import { useAppInterfaceStore } from 'core/interface';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { useAuthQuery } from './auth.hooks';
import { LoadingPage } from './loading/loading.route';
import { LockedPage } from './locked/locked.route';
import { LoginPage } from './log-in/log-in.route';
import { LogoutPage } from './log-out/log-out.route';
import { QuotaPage } from './quota/quota.route';
import { ToSPage } from './terms-of-service/terms-of-service.route';

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
