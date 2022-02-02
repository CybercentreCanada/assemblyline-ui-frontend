import AppContextProvider from 'commons/components/app/AppContextProvider';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import AppLayoutProvider from 'commons/components/layout/LayoutProvider';
import SiteMapProvider from 'commons/components/sitemap/SitemapProvider';
import UserProvider from 'commons/components/user/UserProvider';
import useALContext from 'components/hooks/useALContext';
import useMyAPI, { LoginParamsProps } from 'components/hooks/useMyAPI';
import useMyLayout from 'components/hooks/useMyLayout';
import useMySitemap from 'components/hooks/useMySitemap';
import useMyUser from 'components/hooks/useMyUser';
import LoadingScreen from 'components/routes/loading';
import LockedPage from 'components/routes/locked';
import LoginScreen from 'components/routes/login';
import Routes from 'components/routes/routes';
import Tos from 'components/routes/tos';
import CarouselProvider from 'components/visual/CarouselProvider';
import DrawerProvider from 'components/visual/DrawerProvider';
import HighlightProvider from 'components/visual/HighlightProvider';
import { getProvider } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

type PossibleApps = 'load' | 'locked' | 'login' | 'routes' | 'tos';

const MyApp = () => {
  const storedLoginParams = localStorage.getItem('loginParams');
  const defaultLoginParams = storedLoginParams ? JSON.parse(storedLoginParams) : null;

  const provider = getProvider();
  const { setUser, setConfiguration, user, configuration } = useALContext();
  const { setReady, setApps } = useAppLayout();
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
      setApps(configuration.ui.apps);
    }
  }, [configuration, setApps]);

  useEffect(() => {
    if (user || provider) {
      return;
    }

    bootstrap({ switchRenderedApp, setConfiguration, setLoginParams, setUser, setReady });
    // eslint-disable-next-line
  }, []);
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

const AppInit: React.FC = () => {
  // WARNING: do not use these hooks any other places than here.
  // Each of these hooks have corresponding hooks in the commons
  //  that accesses they global state stored in react context providers.
  const layoutProps = useMyLayout();
  const sitemapProps = useMySitemap();
  const userProps = useMyUser();
  // For src/components/hooks/useMyLayout -[use]-> src/commons/components/hooks/useAppLayout
  // For src/components/hooks/useMySiteMap -[use]-> src/commons/components/hooks/useAppSiteMap
  // For src/components/hooks/useMyUser -[use]-> src/commons/components/hooks/useAppUser

  // General TemplateUI layout structure.
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <UserProvider {...userProps}>
        <SiteMapProvider {...sitemapProps}>
          <HighlightProvider>
            <CarouselProvider>
              <DrawerProvider>
                <AppLayoutProvider {...layoutProps}>
                  <MyApp />
                </AppLayoutProvider>
              </DrawerProvider>
            </CarouselProvider>
          </HighlightProvider>
        </SiteMapProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

// Main Application entry component.
// This will initialize things like theme and snackar providers which will then be available
//  from this point on.
const App = () => {
  const colors = {
    darkPrimary: '#7c93b9',
    darkSecondary: '#929cad',
    lightPrimary: '#0b65a1',
    lightSecondary: '#939dac'
  };
  return (
    <AppContextProvider defaultTheme="light" colors={colors}>
      <AppInit />
    </AppContextProvider>
  );
};

export default App;
