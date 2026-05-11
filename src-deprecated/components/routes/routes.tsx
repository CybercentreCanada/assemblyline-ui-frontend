import { Typography } from '@mui/material';
import type { SnackbarEvents } from 'borealis-ui/dist/data/event';
import { SNACKBAR_EVENT_ID } from 'borealis-ui/dist/data/event';
import RedirectSubmission from 'commons/components/utils/RedirectSubmission';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404_dl';
import Account from 'components/routes/account';
import Admin from 'components/routes/admin';
import AdminActions from 'components/routes/admin/actions';
import AdminApikeysDetail from 'components/routes/admin/apikey_detail';
import AdminApikeys from 'components/routes/admin/apikeys';
import AdminErrorDetail from 'components/routes/admin/error_detail';
import AdminErrorViewer from 'components/routes/admin/error_viewer';
import AdminIdentify from 'components/routes/admin/identify';
import Service from 'components/routes/admin/service_detail';
import ServiceReview from 'components/routes/admin/service_review';
import AdminServices from 'components/routes/admin/services';
import AdminSiteMap from 'components/routes/admin/site_map';
import AdminTagSafelist from 'components/routes/admin/tag_safelist';
import AdminUsers from 'components/routes/admin/users';
import Alerts from 'components/routes/alerts';
import AlertDetails from 'components/routes/alerts/detail';
import AlertsRedirect from 'components/routes/alerts/redirect';
import MalwareArchive from 'components/routes/archive';
import ArchiveDetail from 'components/routes/archive/detail';
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
import LoadingScreen from 'components/routes/loading';
import Logout from 'components/routes/logout';
import Manage from 'components/routes/manage';
import ManageBadlist from 'components/routes/manage/badlist';
import BadlistDetail from 'components/routes/manage/badlist_detail';
import HeuristicDetail from 'components/routes/manage/heuristic_detail';
import ManageHeuristics from 'components/routes/manage/heuristics';
import ManageSafelist from 'components/routes/manage/safelist';
import SafelistDetail from 'components/routes/manage/safelist_detail';
import SignatureDetail from 'components/routes/manage/signature_detail';
import ManageSignatureSources from 'components/routes/manage/signature_sources';
import ManageSignatures from 'components/routes/manage/signatures';
import WorkflowCreate from 'components/routes/manage/workflows/create';
import WorkflowDetail from 'components/routes/manage/workflows/detail';
import ManageWorkflows from 'components/routes/manage/workflows/index';
import RetroHunt from 'components/routes/retrohunt';
import RetroHuntDetail from 'components/routes/retrohunt/detail';
import Search from 'components/routes/search';
import Settings from 'components/routes/settings/settings';
import SubmissionDetail from 'components/routes/submission/detail';
import SubmissionReport from 'components/routes/submission/report';
import Submissions from 'components/routes/submissions';
import Submit from 'components/routes/submit/submit';
import Tos from 'components/routes/tos';
import User from 'components/routes/user';
import { resetFavicon } from 'helpers/utils';
import { lazy, memo, Suspense, useEffect, useState } from 'react';
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router';

const DevelopmentAPI = lazy(() => import('components/routes/development/api/development_api.route'));
const DevelopmentCustomize = lazy(() => import('components/routes/development/customize/customize'));
const DevelopmentLibrary = lazy(() => import('components/routes/development/library'));
const DevelopmentTheme = lazy(() => import('components/routes/development/theme'));

const APP_NAME = 'AL4';

function RouteActions() {
  const { pathname } = useLocation();
  const [oldID, setOldID] = useState(null);
  const { closeTemporaryDrawer } = useDrawer();

  useEffect(() => {
    // Scroll to top
    const { params } = { params: { id: null }, ...matchPath(pathname, '/submission/detail/:id') };

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

  const { showSuccessMessage, showErrorMessage, showInfoMessage, showWarningMessage } = useMySnackbar();

  useEffect(() => {
    const handleMessage = (event: CustomEvent<SnackbarEvents>) => {
      const { detail } = event;
      if (detail.level === 'success') {
        showSuccessMessage(detail.message);
      } else if (detail.level === 'error') {
        showErrorMessage(detail.message);
      } else if (detail.level === 'info') {
        showInfoMessage(detail.message);
      } else if (detail.level === 'warning') {
        showWarningMessage(detail.message);
      }
    };

    window.addEventListener(SNACKBAR_EVENT_ID, handleMessage);

    return () => {
      window.removeEventListener(SNACKBAR_EVENT_ID, handleMessage);
    };
  }, [showErrorMessage, showInfoMessage, showSuccessMessage, showWarningMessage]);

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
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/actions" element={<AdminActions />} />
        <Route path="/admin/apikeys" element={<AdminApikeys />} />
        <Route path="/admin/apikeys/:id" element={<AdminApikeysDetail />} />
        <Route path="/admin/errors" element={<AdminErrorViewer />} />
        <Route path="/admin/errors/:key" element={<AdminErrorDetail />} />
        <Route path="/admin/identify" element={<AdminIdentify />} />
        <Route path="/admin/service_review" element={<ServiceReview />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/services/:svc" element={<Service />} />
        <Route path="/admin/sitemap" element={<AdminSiteMap />} />
        <Route path="/admin/tag_safelist" element={<AdminTagSafelist />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<User />} />
        <Route path="/alerts_redirect" element={<AlertsRedirect />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:id" element={<AlertDetails />} />
        <Route path="/archive" element={<MalwareArchive />} />
        <Route path="/archive/:id" element={<ArchiveDetail />} />
        <Route path="/archive/:id/:tab" element={<ArchiveDetail />} />
        <Route path="/authorize" element={<AppRegistration />} />
        <Route path="/crash" element={<CrashTest />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/development/api" element={<DevelopmentAPI />} />
        <Route path="/development/customize" element={<DevelopmentCustomize />} />
        <Route path="/development/library" element={<DevelopmentLibrary />} />
        <Route path="/development/theme" element={<DevelopmentTheme />} />
        <Route path="/file/detail/:id" element={<FileFullDetail />} />
        <Route path="/file/viewer/:id" element={<FileViewer />} />
        <Route path="/file/viewer/:id/:tab" element={<FileViewer />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/help/api" element={<HelpApiDoc />} />
        <Route path="/help/classification" element={<HelpClassification />} />
        <Route path="/help/configuration" element={<HelpConfiguration />} />
        <Route path="/help/search" element={<HelpSearch />} />
        <Route path="/help/services" element={<HelpServices />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/manage/badlist" element={<ManageBadlist />} />
        <Route path="/manage/badlist/:id" element={<BadlistDetail />} />
        <Route path="/manage/heuristic/:id" element={<HeuristicDetail />} />
        <Route path="/manage/heuristics" element={<ManageHeuristics />} />
        <Route path="/manage/safelist" element={<ManageSafelist />} />
        <Route path="/manage/safelist/:id" element={<SafelistDetail />} />
        <Route path="/manage/signature/:id" element={<SignatureDetail />} />
        <Route path="/manage/signature/:type/:source/:name" element={<SignatureDetail />} />
        <Route path="/manage/signatures" element={<ManageSignatures />} />
        <Route path="/manage/sources" element={<ManageSignatureSources />} />
        <Route path="/manage/workflow/create/:id" element={<WorkflowCreate />} />
        <Route path="/manage/workflow/detail/:id" element={<WorkflowDetail />} />
        <Route path="/manage/workflows" element={<ManageWorkflows />} />
        <Route path="/notfound" element={<NotFoundPage />} />
        <Route path="/retrohunt" element={<RetroHunt />} />
        <Route path="/retrohunt/:key" element={<RetroHuntDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/search/:id" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/:tab" element={<Settings />} />
        <Route path="/submission/:id" element={<RedirectSubmission />} />
        <Route path="/submission/detail/:id" element={<SubmissionDetail />} />
        <Route path="/submission/detail/:id/:fid" element={<SubmissionDetail />} />
        <Route path="/submission/report/:id" element={<SubmissionReport />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/tos" element={<Tos />} />
        <Route path="*" element={<Navigate to="/notfound" replace />} />
      </Routes>
      {configuration.system && configuration.system.type !== 'production' && (
        <Typography
          className="no-print"
          variant="body2"
          style={{
            position: 'fixed',
            bottom: '8px',
            marginLeft: '32px',
            opacity: '0.4',
            zIndex: 10000,
            marginTop: 'auto',
            marginRight: 'auto',
            pointerEvents: 'none'
          }}
        >
          {`Assemblyline ${configuration.system.version} :: `}
          <span style={{ textTransform: 'capitalize' }}>{configuration.system.type}</span>
        </Typography>
      )}
    </Suspense>
  );
};

export default memo(WrappedRoutes);
