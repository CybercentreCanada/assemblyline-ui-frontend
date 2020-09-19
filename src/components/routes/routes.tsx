import NotFoundPage from 'components/routes/404_dl';
import Account from 'components/routes/account';
import Admin from 'components/routes/admin';
import AdminErrorViewer from 'components/routes/admin/error_viewer';
import AdminServices from 'components/routes/admin/services';
import AdminSiteMap from 'components/routes/admin/site_map';
import AdminUsers from 'components/routes/admin/users';
import Dashboard from 'components/routes/dashboard';
import Help from 'components/routes/help';
import HelpApiDoc from 'components/routes/help/api';
import HelpClassification from 'components/routes/help/classification';
import HelpConfiguration from 'components/routes/help/configuration';
import HelpSearch from 'components/routes/help/search';
import HelpServices from 'components/routes/help/services';
import Logout from 'components/routes/logout';
import Manage from 'components/routes/manage';
import ManageHeuristics from 'components/routes/manage/heuristics';
import ManageSignatures from 'components/routes/manage/signatures';
import ManageSignatureSources from 'components/routes/manage/signature_sources';
import ManageWorkflows from 'components/routes/manage/workflows';
import Search from 'components/routes/search';
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
      <Route exact path="/admin/errors" component={AdminErrorViewer} />
      <Route exact path="/admin/services" component={AdminServices} />
      <Route exact path="/admin/sitemap" component={AdminSiteMap} />
      <Route exact path="/admin/users" component={AdminUsers} />
      <Route exact path="/admin/users/:id" component={User} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/help" component={Help} />
      <Route exact path="/help/api" component={HelpApiDoc} />
      <Route exact path="/help/classification" component={HelpClassification} />
      <Route exact path="/help/configuration" component={HelpConfiguration} />
      <Route exact path="/help/search" component={HelpSearch} />
      <Route exact path="/help/services" component={HelpServices} />
      <Route exact path="/logout" component={Logout} />
      <Route exact path="/manage/heuristics" component={ManageHeuristics} />
      <Route exact path="/manage/signatures" component={ManageSignatures} />
      <Route exact path="/manage/sources" component={ManageSignatureSources} />
      <Route exact path="/manage/workflows" component={ManageWorkflows} />
      <Route exact path="/manage" component={Manage} />
      <Route exact path="/search" component={Search} />
      <Route exact path="/search/:id" component={Search} />
      <Route exact path="/settings" component={Settings} />
      <Route exact path="/submit" component={Submit} />
      <Route exact path="/submissions" component={Submissions} />
      <Route exact path="/tos" component={Tos} />
      <Route component={NotFoundPage} />
    </Switch>
  );
};

export default Routes;
