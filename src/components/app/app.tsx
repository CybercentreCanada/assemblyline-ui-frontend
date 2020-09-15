import useAppLayout from 'commons/components/hooks/useAppLayout';
import useAppUser from 'commons/components/hooks/useAppUser';
import AppLayoutProvider from 'commons/components/layout/LayoutProvider';
import SiteMapProvider from 'commons/components/sitemap/SitemapProvider';
import UserProvider from 'commons/components/user/UserProvider';
import useMyLayout from 'components/hooks/useMyLayout';
import useMySitemap from 'components/hooks/useMySitemap';
import useMyUser, { CustomUser } from 'components/hooks/useMyUser';
import LoadingScreen from 'components/routes/loading';
import LockedPage from 'components/routes/locked';
import LoginScreen from 'components/routes/login';
import Routes from 'components/routes/routes';
import Tos from 'components/routes/tos';
import getXSRFCookie from 'helpers/xsrf';
import { OptionsObject, SnackbarProvider, useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

type LoginParamsProps = {
  oauth_providers: string[];
  allow_userpass_login: boolean;
  allow_signup: boolean;
  allow_pw_rest: boolean;
};

const MyApp = () => {
  const storedLoginParams = localStorage.getItem('loginParams');
  const defaultLoginParams = storedLoginParams ? JSON.parse(storedLoginParams) : null;

  const params = new URLSearchParams(window.location.search);
  const [renderedApp, setRenderedApp] = useState(params.get('provider') ? 'login' : 'load');
  const [loginParams, setLoginParams] = useState<LoginParamsProps | null>(defaultLoginParams);

  const { t } = useTranslation();
  const { user: currentUser, setUser } = useAppUser<CustomUser>();
  const { setReady } = useAppLayout();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const snackBarOptions: OptionsObject = {
    variant: 'error',
    autoHideDuration: 30000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    onClick: snack => {
      closeSnackbar();
    }
  };

  const switchRenderedApp = (value: 'load' | 'locked' | 'login' | 'routes' | 'tos') => {
    if (renderedApp !== value) {
      setRenderedApp(value);
    }
  };

  useEffect(() => {
    if (params.get('provider')) {
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
          enqueueSnackbar(t('api.unreachable'), snackBarOptions);
          switchRenderedApp('load');
        } else if (api_data.api_status_code === 403) {
          switchRenderedApp('locked');
        } else if (api_data.api_status_code === 401) {
          localStorage.setItem('loginParams', JSON.stringify(api_data.api_response));
          setLoginParams(api_data.api_response);
          switchRenderedApp('login');
        } else if (api_data.api_status_code === 200) {
          setUser(api_data.api_response);
          setReady(true);
          if (!api_data.api_response.agrees_with_tos && api_data.api_response.has_tos) {
            switchRenderedApp('tos');
          } else {
            switchRenderedApp('routes');
          }
        } else {
          enqueueSnackbar(t('api.unreachable'), snackBarOptions);
          switchRenderedApp('load');
        }
      });
    // eslint-disable-next-line
  }, []);
  return {
    load: <LoadingScreen />,
    locked: currentUser ? (
      <LockedPage hasTOS={currentUser.has_tos} autoNotify={currentUser.tos_auto_notify} />
    ) : (
      <LoadingScreen />
    ),
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

const App: React.FC = () => {
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
    <BrowserRouter>
      <SiteMapProvider {...sitemapProps}>
        <UserProvider {...userProps}>
          <AppLayoutProvider {...layoutProps}>
            <SnackbarProvider>
              <MyApp />
            </SnackbarProvider>
          </AppLayoutProvider>
        </UserProvider>
      </SiteMapProvider>
    </BrowserRouter>
  );
};

export default App;
