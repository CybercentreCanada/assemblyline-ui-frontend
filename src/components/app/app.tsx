import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SnackbarProvider } from "notistack";

import AppLayoutProvider from "commons/components/layout/LayoutProvider";
import getXSRFCookie from "helpers/xsrf";
import useMyLayout from "components/hooks/useMyLayout";
import LoginScreen from "components/routes/login";
import LoadingScreen from "components/routes/loading";
import Routes from "components/routes/routes";
import Tos from "components/routes/tos";
import UserProvider from "commons/components/user/UserProvider";
import useMyUser from "components/hooks/useMyUser";
import LockedPage from "components/routes/locked";

// TODO: This should be defined from an outside source
const OAUTH_PROVIDERS = ["azure_ad"]
const ALLOW_USERPASS_LOGIN = true
const ALLOW_SIGNUP = true
const ALLOW_PW_RESET = true
const LOCKOUT_AUTO_NOTIFY = true
const HAS_TOS = true
// END TODO

type AppProps = {};

const App: React.FC<AppProps> = () => {  
  const params = new URLSearchParams(window.location.search);
  const [renderedApp, setRenderedApp] = useState(params.get("provider") ? "login" : "load");

  const layoutProps = useMyLayout();
  const userProps = useMyUser();
  const { t } = useTranslation()

  useEffect(()=> {
      if (params.get("provider")){
        return;
      }
      const requestOptions: RequestInit = {
          method: 'GET',
          headers: {
              'X-XSRF-TOKEN': getXSRFCookie()
          },
          credentials: "same-origin"
      };

      fetch('/api/v4/user/whoami/', requestOptions)
        .then(
          res => {
              return res.json();
          }
        )
        .catch(() => {
            return {
                    api_error_message: t("api.unreachable"),
                    api_response: "",
                    api_server_version: "4.0.0",
                    api_status_code: 400
                }
        })
        .then(api_data => {
          if (api_data === undefined || !api_data.hasOwnProperty('api_response')){
            setRenderedApp("login")
          }
          else if (api_data.api_status_code === 403){
            setRenderedApp("locked")
          }
          else if (api_data.api_status_code !== 200){
            setRenderedApp("login")
          }
          else{
            userProps.setUser(api_data.api_response);
            if (!api_data.api_response.agrees_with_tos){
              setRenderedApp("tos");
            }
            else{
              setRenderedApp("routes");
            }
          }
        })
  // eslint-disable-next-line
  }, []);
  return (
    <BrowserRouter>      
      <UserProvider {...userProps} >
        <AppLayoutProvider {...layoutProps}>
          <SnackbarProvider>
            { 
              {
                "load": <LoadingScreen/>,
                "locked": <LockedPage hasTOS={HAS_TOS} autoNotify={LOCKOUT_AUTO_NOTIFY}/>,
                "login": <LoginScreen oAuthProviders={OAUTH_PROVIDERS} allowUserPass={ALLOW_USERPASS_LOGIN} 
                                      allowSignup={ALLOW_SIGNUP} allowPWReset={ALLOW_PW_RESET}/>,
                "routes": <Routes/>,
                "tos": <Tos/>,
              }[renderedApp]
            }
          </SnackbarProvider>
        </AppLayoutProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
