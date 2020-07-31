import React from "react";
import { Switch, BrowserRouter, Route } from "react-router-dom";

import { SnackbarProvider } from "notistack";

import AppLayoutProvider from "../../commons/components/layout/LayoutProvider";
import Dashboard from "../routes/dashboard";
import LoginScreen from "../routes/login";
import Logout from "../routes/logout";
import NotFoundPage from "../routes/404_dl";
import Submit from "../routes/submit";
import Submissions from "../routes/submission";
import useMyLayout from "../hooks/useMyLayout";

type AppProps = {};

const App: React.FC<AppProps> = () => {
  // This is obviously not where the login user should be fetch from, 
  //   maybe an API call or a checking a secure session cookie
  let user = null;
  const storedUser = localStorage.getItem('currentUser');
  user = storedUser ? JSON.parse(storedUser) : null;

  const renderRoutes = () => {
    return <Switch>
      <Route exact path="/" component={Submit} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/submit" component={Submit} />
      <Route path="/submissions" component={Submissions} />
      <Route exact path="/logout" component={Logout} />
      <Route component={NotFoundPage}/>
    </Switch>
  }

  const layout = useMyLayout();
  return (
    <BrowserRouter>
      <AppLayoutProvider value={layout} user={user}>
        <SnackbarProvider>
          {user ? renderRoutes() : <LoginScreen/>}
        </SnackbarProvider>
      </AppLayoutProvider>
    </BrowserRouter>
  );
};

export default App;
