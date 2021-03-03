import AppContextProvider from 'commons/components/app/AppContextProvider';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import AppLayoutProvider from 'commons/components/layout/LayoutProvider';
import SiteMapProvider from 'commons/components/sitemap/SitemapProvider';
import UserProvider from 'commons/components/user/UserProvider';
import useALContext from 'components/hooks/useALContext';
import useMyLayout from 'components/hooks/useMyLayout';
import useMySitemap from 'components/hooks/useMySitemap';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useMyUser from 'components/hooks/useMyUser';
import LoadingScreen from 'components/routes/loading';
import LockedPage from 'components/routes/locked';
import LoginScreen from 'components/routes/login';
import Routes from 'components/routes/routes';
import Tos from 'components/routes/tos';
import DrawerProvider from 'components/visual/DrawerProvider';
import HighlightProvider from 'components/visual/HighlightProvider';
import { getProvider } from 'helpers/utils';
import getXSRFCookie from 'helpers/xsrf';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

type LoginParamsProps = {
  oauth_providers: string[];
  allow_userpass_login: boolean;
  allow_signup: boolean;
  allow_pw_rest: boolean;
};

type PossibleApps = 'load' | 'locked' | 'login' | 'routes' | 'tos';

const MyApp = () => {
  const storedLoginParams = localStorage.getItem('loginParams');
  const defaultLoginParams = storedLoginParams ? JSON.parse(storedLoginParams) : null;

  const provider = getProvider();
  const [renderedApp, setRenderedApp] = useState<PossibleApps>(provider ? 'login' : 'load');
  const [loginParams, setLoginParams] = useState<LoginParamsProps | null>(defaultLoginParams);

  const { t } = useTranslation();
  const { setUser, setConfiguration } = useALContext();
  const { setReady } = useAppLayout();
  const { showErrorMessage } = useMySnackbar();

  const switchRenderedApp = (value: PossibleApps) => {
    if (renderedApp !== value) {
      setRenderedApp(value);
    }
  };

  useEffect(() => {
    if (provider) {
      return;
    }
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'X-XSRF-TOKEN': getXSRFCookie()
      },
      credentials: 'same-origin'
    };

    fetch('/api/v4/user/whoami/', requestOptions)
      .then(res => {
        return res.json();
      })
      .catch(() => {
        return {
          api_error_message: t('api.unreachable'),
          api_response: '',
          api_server_version: '4.0.0',
          api_status_code: 400
        };
      })
      .then(api_data => {
        // eslint-disable-next-line no-prototype-builtins
        if (api_data === undefined || !api_data.hasOwnProperty('api_response')) {
          showErrorMessage(t('api.unreachable'), 30000);
          switchRenderedApp('load');
        } else if (api_data.api_status_code === 403) {
          setConfiguration(api_data.api_response);
          switchRenderedApp('locked');
        } else if (api_data.api_status_code === 401) {
          localStorage.setItem('loginParams', JSON.stringify(api_data.api_response));
          setLoginParams(api_data.api_response);
          switchRenderedApp('login');
        } else if (api_data.api_status_code === 200) {
          setUser(api_data.api_response);
          setReady(true);
          if (!api_data.api_response.agrees_with_tos && api_data.api_response.configuration.ui.tos) {
            switchRenderedApp('tos');
          } else {
            switchRenderedApp('routes');
          }
        } else {
          showErrorMessage(t('api.unreachable'), 30000);
          switchRenderedApp('load');
        }
      });
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
            <DrawerProvider>
              <AppLayoutProvider {...layoutProps}>
                <MyApp />
              </AppLayoutProvider>
            </DrawerProvider>
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
