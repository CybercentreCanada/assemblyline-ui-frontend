import { Theme } from '@mui/material/styles';
import { AppPreferenceConfigs, AppSiteMapConfigs, AppThemeConfigs } from 'commons/components/app/AppConfigs';
import AppProvider from 'commons/components/app/AppProvider';
import useAppLayout from 'commons/components/app/hooks/useAppLayout';
import useALContext from 'components/hooks/useALContext';
import useMyAPI, { LoginParamsProps } from 'components/hooks/useMyAPI';
import useMyLayout from 'components/hooks/useMyLayout';
import useMyPreferences from 'components/hooks/useMyPreferences';
import useMySitemap from 'components/hooks/useMySitemap';
import useMyTheme from 'components/hooks/useMyTheme';
import useMyUser, { CustomAppUserService } from 'components/hooks/useMyUser';
import LoadingScreen from 'components/routes/loading';
import LockedPage from 'components/routes/locked';
import LoginScreen from 'components/routes/login';
import Routes from 'components/routes/routes';
import Tos from 'components/routes/tos';
import CarouselProvider from 'components/visual/CarouselProvider';
import DrawerProvider from 'components/visual/DrawerProvider';
import HighlightProvider from 'components/visual/HighlightProvider';
import SafeResultsProvider from 'components/visual/SafeResultsProvider';
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
  const { setReady /* setApps */ } = useAppLayout();
  const { bootstrap } = useMyAPI();

  const [renderedApp, setRenderedApp] = useState<PossibleApps>(user ? 'routes' : provider ? 'login' : 'load');
  const [loginParams, setLoginParams] = useState<LoginParamsProps | null>(defaultLoginParams);

  const switchRenderedApp = (value: PossibleApps) => {
    if (renderedApp !== value) {
      setRenderedApp(value);
    }
  };

  // useEffect(() => {
  //   if (configuration && configuration.ui.apps) {
  //     setApps(configuration.ui.apps);
  //   }
  // }, [configuration, setApps]);

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

const MyAppProvider: React.FC<any> = () => {
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
    <>
      {/* <SafeResultsProvider> */}
      {/* <UserProvider {...userProps}> */}
      {/* <SiteMapProvider {...sitemapProps}> */}
      <HighlightProvider>
        <CarouselProvider>
          <DrawerProvider>
            {/* <AppLayoutProvider {...layoutProps}> */}
            <MyAppMain />
            {/* </AppLayoutProvider> */}
          </DrawerProvider>
        </CarouselProvider>
      </HighlightProvider>
      {/* </SiteMapProvider> */}
      {/* </UserProvider> */}
      {/* </SafeResultsProvider> */}
    </>
  );
};

export const MyApp: React.FC<any> = () => {
  const myPreferences: AppPreferenceConfigs = useMyPreferences();
  const myTheme: AppThemeConfigs = useMyTheme();
  const mySitemap: AppSiteMapConfigs = useMySitemap();
  const myUser: CustomAppUserService = useMyUser();
  // const mySearch: AppSearchService<SearchJobRow> = useMySearch();
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <SafeResultsProvider>
        <AppProvider
          user={myUser}
          preferences={myPreferences}
          theme={myTheme}
          sitemap={mySitemap} /* search={mySearch} */
        >
          <MyAppProvider />
        </AppProvider>
      </SafeResultsProvider>
    </BrowserRouter>
  );
};

// Main Application entry component.
// This will initialize things like theme and snackar providers which will then be available
//  from this point on.
// const MyApp = () => {
//   const colors = {
//     darkPrimary: '#7c93b9',
//     darkSecondary: '#929cad',
//     lightPrimary: '#0b65a1',
//     lightSecondary: '#939dac'
//   };
//   return (
//     <AppContextProvider defaultTheme="light" colors={colors}>
//       <AppInit />
//     </AppContextProvider>
//   );
// };

export default MyApp;
