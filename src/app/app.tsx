// TODO: change syntax to "import type {theme}" to avoid potential problems like type-only imports being incorrectly bundled.
import { useClue } from '@cccsaurora/clue-ui';
import Routes from 'app/routes';
import useMyPreferences from 'app/useMyPreferences';
import useMySitemap from 'app/useMySitemap';
import { APIProvider } from 'core/api/api.providers';
import { useBootstrapQuery } from 'core/api/hooks/useBootstrapQuery';
import type { LoginParamsProps } from 'core/api/useMyAPI';
import useALContext from 'core/config/useALContext';
import QuotaExceeded from 'core/template/branding/AppVerticalBanner';
import type { AppPreferenceConfigs, AppSiteMapConfigs, AppTheme } from 'core/template/components/app/AppConfigs';
import AppProvider from 'core/template/components/app/AppProvider';
import type { AppUserService } from 'core/template/components/app/AppUserService';
import { useAppLayout } from 'core/template/components/app/hooks';
import { useAppSwitcher } from 'core/template/components/app/hooks/useAppSwitcher';
import useMyTheme from 'core/template/useMyTheme';
import LoadingScreen from 'layout/auth/loading/loading';
import LockedPage from 'layout/auth/locked/locked.route';
import LoginScreen from 'layout/auth/log-in/login';
import Tos from 'layout/auth/terms-of-service/terms-of-service.route';
import useMyUser from 'layout/auth/useALContext';
import QuotaProvider from 'layout/quota/QuotaProvider';
import SafeResultsProvider from 'layout/safe-results/SafeResultsProvider';
import type { CustomUser } from 'models/api/user';
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import setMomentFRLocale from 'shared/utils/moment-fr-locale';
import { getProvider, getSAMLData } from 'shared/utils/utils';

type PossibleApps = 'load' | 'locked' | 'login' | 'routes' | 'tos' | 'quota';

const MyAppMain = () => {
  const storedLoginParams = localStorage.getItem('loginParams');
  const defaultLoginParams = storedLoginParams ? JSON.parse(storedLoginParams) : null;

  const provider = getProvider();
  const samlData = getSAMLData();
  const { setUser, setConfiguration, user, configuration } = useALContext();
  const { setReady: setAppLayoutReady } = useAppLayout();
  const { setReady: setClueReady, setCustomIconify } = useClue();
  const { setItems } = useAppSwitcher();

  const [renderedApp, setRenderedApp] = useState<PossibleApps>(
    user ? 'routes' : provider || samlData ? 'login' : 'load'
  );
  const [loginParams, setLoginParams] = useState<LoginParamsProps | null>(defaultLoginParams);

  const switchRenderedApp = useCallback(
    (value: PossibleApps) => {
      if (renderedApp !== value) {
        setRenderedApp(value);
      }
    },
    [renderedApp]
  );

  const setReady = useCallback(
    (layout: boolean, clue: boolean, iconifyUrl: string = null) => {
      setAppLayoutReady(layout);
      setClueReady(clue);
      setCustomIconify(iconifyUrl);
    },
    [setAppLayoutReady, setClueReady, setCustomIconify]
  );

  useEffect(() => {
    if (configuration && configuration.ui.apps) {
      setItems(configuration.ui.apps);
    }
  }, [configuration, setItems]);

  useBootstrapQuery({
    switchRenderedApp,
    setConfiguration,
    setLoginParams,
    setUser,
    setReady
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
