import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { SnackbarProvider } from "notistack";

import AppLayoutProvider from "commons/components/layout/LayoutProvider";
import getXSRFCookie from "helpers/xsrf";
import useMyLayout from "components/hooks/useMyLayout";
import LoginScreen from "components/routes/login";
import LoadingScreen from "components/routes/loading";
import Routes from "components/routes/routes";

type AppProps = {};

const App: React.FC<AppProps> = () => {  
  const [user, setUser] = useState(null);
  const [renderedApp, setRenderedApp] = useState(null);

  const layout = useMyLayout();
  useEffect(()=> {
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
          setRenderedApp(<LoginScreen/>)
        }
      )
      .then(result => {
        if (result === undefined || !result.hasOwnProperty('api_response')){
          setRenderedApp(<LoginScreen/>)
        }
        else{
          setUser(result.api_response);
          setRenderedApp(<Routes/>);
        }
      },
      error => {
          console.log(error);
          setRenderedApp(<LoginScreen/>)
      })
  }, []);
  return (
    <BrowserRouter>
      <AppLayoutProvider value={layout} user={user}>
        <SnackbarProvider>
          {renderedApp ? renderedApp : <LoadingScreen/>}
        </SnackbarProvider>
      </AppLayoutProvider>
    </BrowserRouter>
  );
};

export default App;
