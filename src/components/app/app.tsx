// TODO: change syntax to "import type {theme}" to avoid potential problems like type-only imports being incorrectly bundled.
import type { Theme } from '@mui/material/styles';
import { AppPreferenceConfigs, AppSiteMapConfigs, AppThemeConfigs } from 'commons/components/app/AppConfigs';
import AppProvider from 'commons/components/app/AppProvider';
import useAppLayout from 'commons/components/app/hooks/useAppLayout';
import useAppSwitcher from 'commons/components/app/hooks/useAppSwitcher';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI, { LoginParamsProps } from 'components/hooks/useMyAPI';
import useMyPreferences from 'components/hooks/useMyPreferences';
import useMySitemap from 'components/hooks/useMySitemap';
import useMyTheme from 'components/hooks/useMyTheme';
import useMyUser, { CustomAppUserService } from 'components/hooks/useMyUser';
import SafeResultsProvider from 'components/providers/SafeResultsProvider';
import LoadingScreen from 'components/routes/loading';
import LockedPage from 'components/routes/locked';
import LoginScreen from 'components/routes/login';
import Routes from 'components/routes/routes';
import Tos from 'components/routes/tos';
import setMomentFRLocale from 'helpers/moment-fr-locale';
import { getProvider } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Constructs the theme object with the default parameters
declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

type PossibleApps = 'load' | 'locked' | 'login' | 'routes' | 'tos';

const MyAppMain = () => {
  const storedLoginParams = localStorage.getItem('loginParams');
  const defaultLoginParams = storedLoginParams ? JSON.parse(storedLoginParams) : null;

  const provider = getProvider();
  const { setUser, setConfiguration, user, configuration } = useALContext();
  const { setReady } = useAppLayout();
  const { setItems } = useAppSwitcher();
  const { bootstrap } = useMyAPI();

  const [renderedApp, setRenderedApp] = useState<PossibleApps>(user ? 'routes' : provider ? 'login' : 'load');
  const [loginParams, setLoginParams] = useState<LoginParamsProps | null>(defaultLoginParams);

  const switchRenderedApp = (value: PossibleApps) => {
    if (renderedApp !== value) {
      setRenderedApp(value);
    }
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
        allowPWReset={loginParams.allow_pw_rest}
      />
    ) : (
      <LoadingScreen />
    ),
    routes: <Routes />,
    tos: <Tos />
  }[renderedApp];
};

export const MyApp: React.FC<any> = () => {
  const myPreferences: AppPreferenceConfigs = useMyPreferences();
  const myTheme: AppThemeConfigs = useMyTheme();
  const mySitemap: AppSiteMapConfigs = useMySitemap();
  const myUser: CustomAppUserService = useMyUser();
  return (
    <BrowserRouter basename="/">
      <SafeResultsProvider>
        <AppProvider user={myUser} preferences={myPreferences} theme={myTheme} sitemap={mySitemap}>
          <MyAppMain />
        </AppProvider>
      </SafeResultsProvider>
    </BrowserRouter>
  );
};

export default MyApp;
