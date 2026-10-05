import type { SnackbarEvents } from '@cccsaurora/clue-ui';
import { SNACKBAR_EVENT_ID } from '@cccsaurora/clue-ui';
import { Typography } from '@mui/material';
import RedirectSubmission from 'deprecated/legacy/commons/components/utils/RedirectSubmission';
import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import useDrawer from 'deprecated/legacy/components/hooks/useDrawer';
import useMySnackbar from 'core/snackbar/snackbar.hooks';
import ForbiddenPage from 'routes/forbidden/forbidden';
import NotFoundPage from 'core/template/components/AppBanner';
import Account from 'deprecated/legacy/components/routes/account';
import Admin from 'deprecated/legacy/components/routes/admin';
import AdminActions from 'routes/admin-actions/admin-actions.route';
import AdminApikeysDetail from 'routes/admin-api-key-detail/admin-api-key-detail.route';
import AdminApikeys from 'routes/admin-api-keys/admin-api-keys.route';
import AdminErrorDetail from 'routes/admin-error-detail/admin-error-detail.route';
import AdminErrorViewer from 'routes/admin-error-viewer/admin-error-viewer.route';
import AdminIdentify from 'routes/admin-identify/admin-identify.route';
import Service from 'routes/admin-service-detail/admin-service-detail.route';
import ServiceReview from 'routes/admin-service-review/admin-service-review.route';
import AdminServices from 'routes/admin-services/admin-services.route';
import AdminSiteMap from 'routes/admin-sitemap/admin-sitemap.route';
import AdminTagSafelist from 'routes/admin-tag-safelist/admin-tag-safelist.route';
import AdminUsers from 'routes/admin-users/admin-users.route';
import Alerts from 'routes/alerts/alerts.route';
import AlertDetails from 'routes/alert-detail/alert-detail.route';
import AlertsRedirect from 'routes/alert-redirect/alert-redirect.route';
import MalwareArchive from 'routes/archives/archives.route';
import ArchiveDetail from 'routes/archive-detail/archive-detail.route';
import AppRegistration from 'routes/authorize/authorize.route';
import CrashTest from 'core/error/error.route';
import Dashboard from 'routes/dashboard/dashboard.route';
import FileFullDetail from 'deprecated/legacy/components/routes/file/detail';
import FileViewer from 'routes/file-viewer/file-viewer.route';
import Help from 'deprecated/legacy/components/routes/help';
import HelpApiDoc from 'routes/help-api/help-api.route';
import HelpClassification from 'routes/help-classification/help-classification.route';
import HelpConfiguration from 'routes/help-configuration/help-configuration.route';
import HelpSearch from 'routes/help-search/help-search.route';
import HelpServices from 'routes/help-services/help-services.route';
import LoadingScreen from 'deprecated/legacy/components/routes/loading';
import Logout from 'layout/auth/log-out/log-out.route';
import Manage from 'deprecated/legacy/components/routes/manage';
import ManageBadlist from 'routes/manage-badlists/manage-badlists.route';
import BadlistDetail from 'routes/manage-badlist-detail/manage-badlist-detail.route';
import HeuristicDetail from 'routes/manage-heuristic-detail/manage-heuristic-detail.route';
import ManageHeuristics from 'routes/manage-heuristics/manage-heuristics.route';
import ManageSafelist from 'routes/manage-safelists/manage-safelists.route';
import SafelistDetail from 'routes/manage-safelist-detail/manage-safelist-detail.route';
import SignatureDetail from 'routes/manage-signature-detail/manage-signature-detail.route';
import ManageSignatureSources from 'routes/manage-signature-sources/manage-signature-sources.route';
import ManageSignatures from 'routes/manage-signatures/manage-signatures.route';
import WorkflowCreate from 'routes/manage-workflow-create/manage-workflow-create.route';
import WorkflowDetail from 'routes/manage-workflow-detail/manage-workflow-detail.route';
import ManageWorkflows from 'routes/manage-workflows/manage-workflows.route';
import RetroHunt from 'routes/retrohunt/retrohunt.route';
import RetroHuntDetail from 'routes/retrohunt-detail/retrohunt-detail.route';
import Search from 'routes/search/search.route';
import Settings from 'deprecated/legacy/components/routes/settings/settings';
import SubmissionDetail from 'routes/submission-detail/submission-detail.route';
import SubmissionReport from 'routes/submission-report/submission-report.route';
import Submissions from 'routes/submissions/submissions.route';
import Submit from 'deprecated/legacy/components/routes/submit/submit';
import Tos from 'layout/auth/terms-of-service/terms-of-service.route';
import User from 'routes/user/user.route';
import { resetFavicon } from 'shared/utils/utils';
import { lazy, memo, Suspense, useEffect, useState } from 'react';
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router';

const DevelopmentAPI = lazy(() => import('routes/development-api/development-api.route.tsx'));
const DevelopmentCustomize = lazy(() => import('deprecated/legacy/components/routes/development/customize/customize'));
const DevelopmentLibrary = lazy(() => import('routes/development-library/development-library.route'));
const DevelopmentTheme = lazy(() => import('deprecated/legacy/components/routes/development/theme'));

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
