import NotFoundPage from 'components/routes/404_dl';
import Account from 'components/routes/account';
import Admin from 'components/routes/admin';
import Users from 'components/routes/admin/users';
import Dashboard from 'components/routes/dashboard';
import Help from 'components/routes/help';
import Logout from 'components/routes/logout';
import Manage from 'components/routes/manage';
import Settings from 'components/routes/settings';
import Submissions from 'components/routes/submission';
import Submit from 'components/routes/submit';
import Tos from 'components/routes/tos';
import User from 'components/routes/user';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Submit} />
      <Route exact path="/account" component={Account} />
      <Route exact path="/admin" component={Admin} />
      <Route exact path="/admin/users" component={Users} />
      <Route exact path="/admin/users/:id" component={User} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/help" component={Help} />
      <Route exact path="/logout" component={Logout} />
      <Route exact path="/manage" component={Manage} />
      <Route exact path="/settings" component={Settings} />
      <Route exact path="/submit" component={Submit} />
      <Route exact path="/submissions" component={Submissions} />
      <Route exact path="/tos" component={Tos} />
      <Route component={NotFoundPage} />
    </Switch>
  );
};

export default Routes;
