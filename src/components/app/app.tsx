import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

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

// TODO: This should be defined from an outside source
const OAUTH_PROVIDERS = ["azure_ad"]
const ALLOW_USERPASS_LOGIN = true
const ALLOW_SIGNUP = true
const ALLOW_PW_RESET = true
// END TODO

type AppProps = {};

const App: React.FC<AppProps> = () => {  
  const params = new URLSearchParams(window.location.search);
  const [renderedApp, setRenderedApp] = useState(params.get("provider") ? "login" : "load");

  const layoutProps = useMyLayout();
  const userProps = useMyUser();

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
              if (res.ok) return res.json();
          },
          error => {
            console.log(error);
            setRenderedApp("login")
          }
        )
        .then(result => {
          if (result === undefined || !result.hasOwnProperty('api_response')){
            setRenderedApp("login")
          }
          else{
            userProps.setUser(result.api_response);
            if (!result.api_response.agrees_with_tos){
              setRenderedApp("tos");
            }
            else{
              setRenderedApp("routes");
            }
          }
        },
        error => {
            console.log(error);
            setRenderedApp("login")
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
                "tos": <Tos/>,
                "login": <LoginScreen oAuthProviders={OAUTH_PROVIDERS} allowUserPass={ALLOW_USERPASS_LOGIN} 
                                      allowSignup={ALLOW_SIGNUP} allowPWReset={ALLOW_PW_RESET}/>,
                "routes": <Routes/>,
              }[renderedApp]
            }
          </SnackbarProvider>
        </AppLayoutProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
