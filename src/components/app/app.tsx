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
import { SnackbarProvider } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

// TODO: This should be defined from an outside source
const OAUTH_PROVIDERS = ['azure_ad'];
const ALLOW_USERPASS_LOGIN = true;
const ALLOW_SIGNUP = true;
const ALLOW_PW_RESET = true;
const LOCKOUT_AUTO_NOTIFY = true;
// END TODO

const MyApp = () => {
  const params = new URLSearchParams(window.location.search);
  const [renderedApp, setRenderedApp] = useState(params.get('provider') ? 'login' : 'load');

  const { t } = useTranslation();
  const { user: currentUser, setUser } = useAppUser<CustomUser>();
  const { setReady } = useAppLayout();

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
          setRenderedApp('login');
        } else if (api_data.api_status_code === 403) {
          setRenderedApp('locked');
        } else if (api_data.api_status_code !== 200) {
          setRenderedApp('login');
        } else {
          setUser(api_data.api_response);
          setReady(true);
          if (!api_data.api_response.agrees_with_tos && api_data.api_response.has_tos) {
            setRenderedApp('tos');
          } else {
            setRenderedApp('routes');
          }
        }
      });
    // eslint-disable-next-line
  }, []);
  return {
    load: <LoadingScreen />,
    locked: <LockedPage hasTOS={currentUser && currentUser.has_tos} autoNotify={LOCKOUT_AUTO_NOTIFY} />,
    login: (
      <LoginScreen
        oAuthProviders={OAUTH_PROVIDERS}
        allowUserPass={ALLOW_USERPASS_LOGIN}
        allowSignup={ALLOW_SIGNUP}
        allowPWReset={ALLOW_PW_RESET}
      />
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
