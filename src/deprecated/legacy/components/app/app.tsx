// TODO: change syntax to "import type {theme}" to avoid potential problems like type-only imports being incorrectly bundled.
import { useClue } from '@cccsaurora/clue-ui';
import type { AppPreferenceConfigs, AppSiteMapConfigs, AppTheme } from 'deprecated/legacy/commons/components/app/AppConfigs';
import AppProvider from 'deprecated/legacy/commons/components/app/AppProvider';
import type { AppUserService } from 'deprecated/legacy/commons/components/app/AppUserService';
import { useAppLayout } from 'deprecated/legacy/commons/components/app/hooks';
import { useAppSwitcher } from 'deprecated/legacy/commons/components/app/hooks/useAppSwitcher';
import { useBootstrapQuery } from 'core/api/hooks/useBootstrapQuery';
import { APIProvider } from 'core/api/api.providers';
import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import type { LoginParamsProps } from 'deprecated/hooks/useMyAPI';
import useMyPreferences from 'deprecated/legacy/components/hooks/useMyPreferences';
import useMySitemap from 'deprecated/legacy/components/hooks/useMySitemap';
import useMyTheme from 'deprecated/legacy/components/hooks/useMyTheme';
import useMyUser from 'deprecated/hooks/useALContext';
import type { CustomUser } from 'models/api/user';
import QuotaProvider from 'deprecated/legacy/components/providers/QuotaProvider';
import SafeResultsProvider from 'deprecated/legacy/components/providers/SafeResultsProvider';
import LoadingScreen from 'deprecated/legacy/components/routes/loading';
import LockedPage from 'layout/auth/locked/locked.route';
import LoginScreen from 'deprecated/legacy/components/routes/login';
import QuotaExceeded from 'core/template/components/AppVerticalBanner';
import Routes from 'deprecated/legacy/components/routes/routes';
import Tos from 'layout/auth/terms-of-service/terms-of-service.route';
import setMomentFRLocale from 'shared/utils/moment-fr-locale';
import { getProvider, getSAMLData } from 'shared/utils/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

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
