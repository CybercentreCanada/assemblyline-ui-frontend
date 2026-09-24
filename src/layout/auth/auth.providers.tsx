import { useAppInterfaceStore } from 'core/interface';
import { useAuthQuery, useAuthenticating } from 'layout/auth/auth.hooks';
import { LoadingPage } from 'layout/auth/loading/loading.route';
import { LockedPage } from 'layout/auth/locked/locked.route';
import { LoginPage } from 'layout/auth/log-in/log-in.route';
import { LogoutPage } from 'layout/auth/log-out/log-out.route';
import { QuotaPage } from 'layout/auth/quota/quota.route';
import { ToSPage } from 'layout/auth/terms-of-service/terms-of-service.route';
import type { PropsWithChildren } from 'react';
import { memo, useMemo } from 'react';

//*****************************************************************************************
// App Auth
//*****************************************************************************************

const AUTH_PAGES = {
  loading: <LoadingPage />,
  locked: <LockedPage />,
  login: <LoginPage />,
  logout: <LogoutPage />,
  quota: <QuotaPage />,
  tos: <ToSPage />
} as const;

export const AppAuthLayout = memo(({ children }: PropsWithChildren) => {
  const mode = useAppInterfaceStore(s => s.auth.mode);

  useAuthenticating();
  useAuthQuery();

  return useMemo(() => (mode === 'app' ? children : (AUTH_PAGES[mode] ?? null)), [children, mode]);
});

AppAuthLayout.displayName = 'AppAuthLayout';
