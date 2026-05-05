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
  /** Whether to skip the whoami call. */
  disableWhoAmI: boolean;
  /** Login provider configuration. */
  login: {
    /** Whether SAML-based login is allowed. */
    allow_saml_login: boolean;
    /** Whether user signup is allowed. */
    allow_signup: boolean;
    /** Whether user/pass login is allowed. */
    allow_userpass_login: boolean;
    /** List of OAuth provider identifiers. */
    oauth_providers: string[];
  };
  /** Current authentication mode/page. */
  mode: 'app' | 'loading' | 'locked' | 'login' | 'logout' | 'quota' | 'tos';
  /** Post-login redirect path. */
  redirectTo: string;
};

export const DEFAULT_APP_AUTH_STORE: AppAuthStore = {
  disableWhoAmI: false,
  login: {
    allow_saml_login: false,
    allow_signup: false,
    allow_userpass_login: false,
    oauth_providers: []
  },
  mode: 'loading',
  redirectTo: null
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
