// TODO: change syntax to "import type {theme}" to avoid potential problems like type-only imports being incorrectly bundled.
import { useBorealis } from 'borealis-ui';
import type { AppPreferenceConfigs, AppSiteMapConfigs, AppTheme } from 'commons/components/app/AppConfigs';
import AppProvider from 'commons/components/app/AppProvider';
import type { AppUserService } from 'commons/components/app/AppUserService';
import { useAppLayout } from 'commons/components/app/hooks';
import { useAppSwitcher } from 'commons/components/app/hooks/useAppSwitcher';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import { APIProvider } from 'components/core/Query/components/APIProvider';
import useALContext from 'components/hooks/useALContext';
import type { LoginParamsProps } from 'components/hooks/useMyAPI';
import useMyAPI from 'components/hooks/useMyAPI';
import useMyPreferences from 'components/hooks/useMyPreferences';
import useMySitemap from 'components/hooks/useMySitemap';
import useMyTheme from 'components/hooks/useMyTheme';
import useMyUser from 'components/hooks/useMyUser';
import type { CustomUser } from 'components/models/ui/user';
import QuotaProvider from 'components/providers/QuotaProvider';
import SafeResultsProvider from 'components/providers/SafeResultsProvider';
import LoadingScreen from 'components/routes/loading';
import LockedPage from 'components/routes/locked';
import LoginScreen from 'components/routes/login';
import QuotaExceeded from 'components/routes/quota';
import Routes from 'components/routes/routes';
import Tos from 'components/routes/tos';
import setMomentFRLocale from 'helpers/moment-fr-locale';
import { getProvider } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router';

type PossibleApps = 'load' | 'locked' | 'login' | 'routes' | 'tos' | 'quota';

const MyAppMain = () => {
  const storedLoginParams = localStorage.getItem('loginParams');
  const defaultLoginParams = storedLoginParams ? JSON.parse(storedLoginParams) : null;

  const provider = getProvider();
  const { setUser, setConfiguration, user, configuration } = useALContext();
  const { setReady: setAppLayoutReady } = useAppLayout();
  const { setReady: setBorealisReady, setCustomIconify } = useBorealis();
  const { setItems } = useAppSwitcher();
  const { bootstrap } = useMyAPI();

  const [renderedApp, setRenderedApp] = useState<PossibleApps>(user ? 'routes' : provider ? 'login' : 'load');
  const [loginParams, setLoginParams] = useState<LoginParamsProps | null>(defaultLoginParams);

  const switchRenderedApp = (value: PossibleApps) => {
    if (renderedApp !== value) {
      setRenderedApp(value);
    }
  };

  const setReady = (layout: boolean, borealis: boolean, iconifyUrl: string = null) => {
    setAppLayoutReady(layout);
    setBorealisReady(borealis);
    setCustomIconify(iconifyUrl);
  };

  useEffect(() => {
    if (configuration && configuration.ui.apps) {
      setItems(configuration.ui.apps);
    }
  }, [configuration, setItems]);

  useEffectOnce(() => {
    if (user || provider) {
      return;
    }

    bootstrap({ switchRenderedApp, setConfiguration, setLoginParams, setUser, setReady });
  });

  setMomentFRLocale();

  return {
    load: <LoadingScreen />,
    locked: <LockedPage />,
    login: loginParams ? (
      <LoginScreen
        oAuthProviders={loginParams.oauth_providers}
        allowUserPass={loginParams.allow_userpass_login}
        allowSignup={loginParams.allow_signup}
        allowSAML={loginParams.allow_saml_login}
      />
    ) : (
      <LoadingScreen />
    ),
    routes: <Routes />,
    tos: <Tos />,
    quota: <QuotaExceeded />
  }[renderedApp];
};

export const MyApp: React.FC = () => {
  const myPreferences: AppPreferenceConfigs = useMyPreferences();
  const myThemes: AppTheme[] = useMyTheme();
  const mySitemap: AppSiteMapConfigs = useMySitemap();
  const myUser: AppUserService<CustomUser> = useMyUser();
  // TODO: add this back in
  // const mySearch: AppSearchService<SearchItem> = useMySearch();

  return (
    <BrowserRouter basename="/">
      <APIProvider>
        <SafeResultsProvider>
          <QuotaProvider>
            <AppProvider
              preferences={myPreferences}
              themes={myThemes}
              sitemap={mySitemap}
              user={myUser}
              // search={mySearch}
            >
              <MyAppMain />
            </AppProvider>
          </QuotaProvider>
        </SafeResultsProvider>
      </APIProvider>
    </BrowserRouter>
  );
};

export default MyApp;
