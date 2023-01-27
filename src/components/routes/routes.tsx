import Redirect from 'commons/components/utils/Redirect';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404_dl';
import Account from 'components/routes/account';
import Admin from 'components/routes/admin';
import AdminActions from 'components/routes/admin/actions';
import AdminErrorDetail from 'components/routes/admin/error_detail';
import AdminErrorViewer from 'components/routes/admin/error_viewer';
import AdminIdentify from 'components/routes/admin/identify';
import AdminServices from 'components/routes/admin/services';
import Service from 'components/routes/admin/service_detail';
import ServiceReview from 'components/routes/admin/service_review';
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
import { memo, useEffect, useState } from 'react';
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router';

const APP_NAME = 'AL4';

function RouteActions() {
  const { pathname } = useLocation();
  const [oldID, setOldID] = useState(null);
  const { closeTemporaryDrawer } = useDrawer();

  useEffect(() => {
    // Scroll to top
    const { params } = { params: { id: null }, ...matchPath(pathname, '/submission/detail/:id') };
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
      <Routes>
        <Route path="/" element={<Submit />} />
        <Route path="/account" element={<Account />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/legacy" element={<AlertsLegacy />} />
        <Route path="/alerts/:id" element={<AlertDetails />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/actions" element={<AdminActions />} />
        <Route path="/admin/errors" element={<AdminErrorViewer />} />
        <Route path="/admin/errors/:key" element={<AdminErrorDetail />} />
        <Route path="/admin/identify" element={<AdminIdentify />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/service_review" element={<ServiceReview />} />
        <Route path="/admin/services/:svc" element={<Service />} />
        <Route path="/admin/sitemap" element={<AdminSiteMap />} />
        <Route path="/admin/tag_safelist" element={<AdminTagSafelist />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<User />} />
        <Route path="/authorize" element={<AppRegistration />} />
        <Route path="/crash" element={<CrashTest />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/file/detail/:id" element={<FileFullDetail />} />
        <Route path="/file/viewer/:id" element={<FileViewer />} />
        <Route path="/help" element={<Help />} />
        <Route path="/help/api" element={<HelpApiDoc />} />
        <Route path="/help/classification" element={<HelpClassification />} />
        <Route path="/help/configuration" element={<HelpConfiguration />} />
        <Route path="/help/search" element={<HelpSearch />} />
        <Route path="/help/services" element={<HelpServices />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/manage/heuristics" element={<ManageHeuristics />} />
        <Route path="/manage/heuristic/:id" element={<HeuristicDetail />} />
        <Route path="/manage/signatures" element={<ManageSignatures />} />
        <Route path="/manage/signature/:id" element={<SignatureDetail />} />
        <Route path="/manage/signature/:type/:source/:name" element={<SignatureDetail />} />
        <Route path="/manage/sources" element={<ManageSignatureSources />} />
        <Route path="/manage/workflow/:id" element={<WorkflowDetail />} />
        <Route path="/manage/workflows" element={<ManageWorkflows />} />
        <Route path="/manage/safelist/:id" element={<SafelistDetail />} />
        <Route path="/manage/safelist" element={<ManageSafelist />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/search/:id" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/submission/detail/:id/:fid" element={<SubmissionDetail />} />
        <Route path="/submission/detail/:id" element={<SubmissionDetail />} />
        <Route path="/submission/report/:id" element={<SubmissionReport />} />
        {settings.submission_view === 'details' ? (
          <Route path="/submission/:id" element={<Redirect to="/submission/detail/:id" />} />
        ) : (
          <Route path="/submission/:id" element={<Redirect to="/submission/report/:id" />} />
        )}
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/tos" element={<Tos />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/notfound" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/notfound" />} />
      </Routes>
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

export default memo(WrappedRoutes);
