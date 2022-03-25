import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404_dl';
import Account from 'components/routes/account';
import Admin from 'components/routes/admin';
import AdminErrorDetail from 'components/routes/admin/error_detail';
import AdminErrorViewer from 'components/routes/admin/error_viewer';
import AdminServices from 'components/routes/admin/services';
import ServicesCompare from 'components/routes/admin/services_compare';
import Service from 'components/routes/admin/service_detail';
import AdminSiteMap from 'components/routes/admin/site_map';
import AdminTagSafelist from 'components/routes/admin/tag_safelist';
import AdminUsers from 'components/routes/admin/users';
import AlertDetails from 'components/routes/alerts/alert-details';
import Alerts from 'components/routes/alerts/alerts';
import AlertsLegacy from 'components/routes/alerts/legacy-alert';
import AppRegistration from 'components/routes/authorize';
import CrashTest from 'components/routes/crash';
import Dashboard from 'components/routes/dashboard';
import FileFullDetail from 'components/routes/file/detail';
import FileViewer from 'components/routes/file/viewer';
import Help from 'components/routes/help';
import HelpApiDoc from 'components/routes/help/api';
import HelpClassification from 'components/routes/help/classification';
import HelpConfiguration from 'components/routes/help/configuration';
import HelpSearch from 'components/routes/help/search';
import HelpServices from 'components/routes/help/services';
import Logout from 'components/routes/logout';
import Manage from 'components/routes/manage';
import ManageHeuristics from 'components/routes/manage/heuristics';
import HeuristicDetail from 'components/routes/manage/heuristic_detail';
import ManageSafelist from 'components/routes/manage/safelist';
import SafelistDetail from 'components/routes/manage/safelist_detail';
import ManageSignatures from 'components/routes/manage/signatures';
import SignatureDetail from 'components/routes/manage/signature_detail';
import ManageSignatureSources from 'components/routes/manage/signature_sources';
import ManageWorkflows from 'components/routes/manage/workflows';
import WorkflowDetail from 'components/routes/manage/workflow_detail';
import Search from 'components/routes/search';
import Settings from 'components/routes/settings';
import SubmissionDetail from 'components/routes/submission/detail';
import SubmissionReport from 'components/routes/submission/report';
import Submissions from 'components/routes/submissions';
import Submit from 'components/routes/submit';
import Tos from 'components/routes/tos';
import User from 'components/routes/user';
import { resetFavicon } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { matchPath, Redirect, Route, Switch, useLocation } from 'react-router-dom';

const APP_NAME = 'AL4';

function RouteActions() {
  const { pathname } = useLocation();
  const [oldID, setOldID] = useState(null);
  const { closeTemporaryDrawer } = useDrawer();

  useEffect(() => {
    // Scroll to top
    const { params } = { params: { id: null }, ...matchPath(pathname, { path: '/submission/detail/:id' }) };
    // eslint-disable-next-line prefer-destructuring, @typescript-eslint/dot-notation
    const id = params['id'];
    if (id === null || id === undefined || id === oldID) {
      window.scrollTo(0, 0);
      setOldID(id);
      resetFavicon();
    }

    // Patch window title
    const currentLocation = pathname.split('/').join(' ').trim();
    document.title = `${APP_NAME} | ${
      currentLocation ? currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1) : 'Submit'
    }`;

    closeTemporaryDrawer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}

const WrappedRoutes = () => {
  const { configuration, settings } = useALContext();
  return (
    <>
      <RouteActions />
      <Switch>
        <Route exact path="/" component={Submit} />
        <Route exact path="/account" component={Account} />
        <Route exact path="/alerts" component={Alerts} />
        <Route exact path="/alerts/legacy" component={AlertsLegacy} />
        <Route exact path="/alerts/:id" component={AlertDetails} />
        <Route exact path="/admin" component={Admin} />
        <Route exact path="/admin/errors" component={AdminErrorViewer} />
        <Route exact path="/admin/errors/:key" component={AdminErrorDetail} />
        <Route exact path="/admin/services" component={AdminServices} />
        <Route exact path="/admin/services_compare" component={ServicesCompare} />
        <Route exact path="/admin/services/:svc" component={Service} />
        <Route exact path="/admin/sitemap" component={AdminSiteMap} />
        <Route exact path="/admin/tag_safelist" component={AdminTagSafelist} />
        <Route exact path="/admin/users" component={AdminUsers} />
        <Route exact path="/admin/users/:id" component={User} />
        <Route exact path="/authorize" component={AppRegistration} />
        <Route exact path="/crash" component={CrashTest} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/file/detail/:id" component={FileFullDetail} />
        <Route exact path="/file/viewer/:id" component={FileViewer} />
        <Route exact path="/help" component={Help} />
        <Route exact path="/help/api" component={HelpApiDoc} />
        <Route exact path="/help/classification" component={HelpClassification} />
        <Route exact path="/help/configuration" component={HelpConfiguration} />
        <Route exact path="/help/search" component={HelpSearch} />
        <Route exact path="/help/services" component={HelpServices} />
        <Route exact path="/logout" component={Logout} />
        <Route exact path="/manage/heuristics" component={ManageHeuristics} />
        <Route exact path="/manage/heuristic/:id" component={HeuristicDetail} />
        <Route exact path="/manage/signatures" component={ManageSignatures} />
        <Route exact path="/manage/signature/:id" component={SignatureDetail} />
        <Route exact path="/manage/signature/:type/:source/:name" component={SignatureDetail} />
        <Route exact path="/manage/sources" component={ManageSignatureSources} />
        <Route exact path="/manage/workflow/:id" component={WorkflowDetail} />
        <Route exact path="/manage/workflows" component={ManageWorkflows} />
        <Route exact path="/manage/safelist/:id" component={SafelistDetail} />
        <Route exact path="/manage/safelist" component={ManageSafelist} />
        <Route exact path="/manage" component={Manage} />
        <Route exact path="/search" component={Search} />
        <Route exact path="/search/:id" component={Search} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/submit" component={Submit} />
        <Route exact path="/submission/detail/:id/:fid" component={SubmissionDetail} />
        <Route exact path="/submission/detail/:id" component={SubmissionDetail} />
        <Route exact path="/submission/report/:id" component={SubmissionReport} />
        {settings.submission_view === 'details' ? (
          <Redirect from="/submission/:id" to="/submission/detail/:id" />
        ) : (
          <Redirect from="/submission/:id" to="/submission/report/:id" />
        )}
        <Route exact path="/submissions" component={Submissions} />
        <Route exact path="/tos" component={Tos} />
        <Route exact path="/forbidden" component={ForbiddenPage} />
        <Route exact path="/notfound" component={NotFoundPage} />
        <Redirect to="/notfound" />
      </Switch>
      {configuration.system && configuration.system.type !== 'production' && (
        <div
          className="no-print"
          style={{
            position: 'sticky',
            bottom: '16px',
            left: '0',
            marginLeft: '16px',
            opacity: '0.4',
            zIndex: 10000,
            marginTop: 'auto',
            marginRight: 'auto',
            pointerEvents: 'none'
          }}
        >
          {`Assemblyline ${configuration.system.version} :: `}
          <span style={{ textTransform: 'capitalize' }}>{configuration.system.type}</span>
        </div>
      )}
    </>
  );
};

const Routes = React.memo(WrappedRoutes);
export default Routes;
