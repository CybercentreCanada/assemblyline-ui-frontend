import { createAppStore } from 'features/store/createAppStore';
import { useAuthQuery } from 'layout/auth/auth.hooks';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { LoadingPage } from './loading/loading.route';
import { LockedPage } from './locked/locked.route';
import { LoginPage } from './log-in/log-in.route';
import { LogoutPage } from './log-out/log-out.route';
import { QuotaPage } from './quota/quota.route';
import { ToSPage } from './terms-of-service/terms-of-service.route';

//*****************************************************************************************
// App Auth Store
//*****************************************************************************************
export type AppAuthStore = {
  disableWhoAmI: boolean;
  mode: 'login' | 'loading' | 'locked' | 'quota' | 'tos' | 'app' | 'logout';
  redirectTo: string;
  login: {
    allow_saml_login: boolean;
    allow_signup: boolean;
    allow_userpass_login: boolean;
    oauth_providers: string[];
  };
};

export const DEFAULT_APP_AUTH_STORE: AppAuthStore = {
  disableWhoAmI: false,
  mode: 'loading',
  redirectTo: null,
  login: {
    allow_saml_login: false,
    allow_signup: false,
    allow_userpass_login: false,
    oauth_providers: []
  }
};

export const {
  StoreProvider: AppAuthStoreProvider,
  useStore: useAppAuthStore,
  useSetStore: useAppSetAuthStore
} = createAppStore<AppAuthStore>(DEFAULT_APP_AUTH_STORE);

AppAuthStoreProvider.displayName = 'AppAuthStoreProvider';

//*****************************************************************************************
// App Auth
//*****************************************************************************************

export const AppAuthLayout = memo(({ children }: PropsWithChildren) => {
  useAuthQuery();

  const mode = useAppAuthStore(s => s.mode);

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

//*****************************************************************************************
// App Auth
//*****************************************************************************************

export const AppAuth = memo(({ children }: PropsWithChildren) => {
  const preference = useAppAuthStore(s => s);
  const setAuth = useAppSetAuthStore();

  return children;
});

AppAuth.displayName = 'AppAuth';
