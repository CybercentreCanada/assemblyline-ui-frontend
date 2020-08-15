import NotFoundPage from 'components/routes/404_dl';
import Dashboard from 'components/routes/dashboard';
import Logout from 'components/routes/logout';
import Submissions from 'components/routes/submission';
import Submit from 'components/routes/submit';
import Tos from 'components/routes/tos';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Submit} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/logout" component={Logout} />
      <Route path="/submissions" component={Submissions} />
      <Route exact path="/submit" component={Submit} />
      <Route exact path="/tos" component={Tos} />
      <Route component={NotFoundPage} />
    </Switch>
  );
};

export default Routes;
