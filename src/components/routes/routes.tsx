import RedirectSubmission from 'commons/components/utils/RedirectSubmission';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import { resetFavicon } from 'helpers/utils';
import { lazy, memo, Suspense, useEffect, useState } from 'react';
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router';
import LoadingScreen from './loading';

const ForbiddenPage = lazy(() => import('components/routes/403'));
const NotFoundPage = lazy(() => import('components/routes/404_dl'));
const Account = lazy(() => import('components/routes/account'));
const Admin = lazy(() => import('components/routes/admin'));
const AdminActions = lazy(() => import('components/routes/admin/actions'));
const AdminErrorDetail = lazy(() => import('components/routes/admin/error_detail'));
const AdminErrorViewer = lazy(() => import('components/routes/admin/error_viewer'));
const AdminIdentify = lazy(() => import('components/routes/admin/identify'));
const AdminServices = lazy(() => import('components/routes/admin/services'));
const Service = lazy(() => import('components/routes/admin/service_detail'));
const ServiceReview = lazy(() => import('components/routes/admin/service_review'));
const AdminSiteMap = lazy(() => import('components/routes/admin/site_map'));
const AdminTagSafelist = lazy(() => import('components/routes/admin/tag_safelist'));
const AdminUsers = lazy(() => import('components/routes/admin/users'));
const AlertDetails = lazy(() => import('components/routes/alerts/alert-details'));
const Alerts = lazy(() => import('components/routes/alerts/alerts'));
const AppRegistration = lazy(() => import('components/routes/authorize'));
const CrashTest = lazy(() => import('components/routes/crash'));
const Dashboard = lazy(() => import('components/routes/dashboard'));
const FileFullDetail = lazy(() => import('components/routes/file/detail'));
const FileViewer = lazy(() => import('components/routes/file/viewer'));
const Help = lazy(() => import('components/routes/help'));
const HelpApiDoc = lazy(() => import('components/routes/help/api'));
const HelpClassification = lazy(() => import('components/routes/help/classification'));
const HelpConfiguration = lazy(() => import('components/routes/help/configuration'));
const HelpSearch = lazy(() => import('components/routes/help/search'));
const HelpServices = lazy(() => import('components/routes/help/services'));
const Logout = lazy(() => import('components/routes/logout'));
const Manage = lazy(() => import('components/routes/manage'));
const ManageHeuristics = lazy(() => import('components/routes/manage/heuristics'));
const HeuristicDetail = lazy(() => import('components/routes/manage/heuristic_detail'));
const ManageSafelist = lazy(() => import('components/routes/manage/safelist'));
const SafelistDetail = lazy(() => import('components/routes/manage/safelist_detail'));
const ManageSignatures = lazy(() => import('components/routes/manage/signatures'));
const SignatureDetail = lazy(() => import('components/routes/manage/signature_detail'));
const ManageSignatureSources = lazy(() => import('components/routes/manage/signature_sources'));
const ManageWorkflows = lazy(() => import('components/routes/manage/workflows'));
const WorkflowDetail = lazy(() => import('components/routes/manage/workflow_detail'));
const Search = lazy(() => import('components/routes/search'));
const Settings = lazy(() => import('components/routes/settings'));
const SubmissionDetail = lazy(() => import('components/routes/submission/detail'));
const SubmissionReport = lazy(() => import('components/routes/submission/report'));
const Submissions = lazy(() => import('components/routes/submissions'));
const Submit = lazy(() => import('components/routes/submit'));
const Tos = lazy(() => import('components/routes/tos'));
const User = lazy(() => import('components/routes/user'));

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
  const { configuration } = useALContext();

  return (
    <Suspense fallback={<LoadingScreen showImage={false} />}>
      <RouteActions />
      <Routes>
        <Route path="/" element={<Submit />} />
        <Route path="/account" element={<Account />} />
        <Route path="/alerts" element={<Alerts />} />
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
        <Route path="/file/viewer/:id/:tab" element={<FileViewer />} />
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
        <Route path="/submission/:id" element={<RedirectSubmission />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/tos" element={<Tos />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/notfound" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/notfound" replace />} />
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
    </Suspense>
  );
};

export default memo(WrappedRoutes);
