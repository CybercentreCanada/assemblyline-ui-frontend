import type { SnackbarEvents } from '@cccsaurora/clue-ui';
import { SNACKBAR_EVENT_ID } from '@cccsaurora/clue-ui';
import { Typography } from '@mui/material';
import useALContext from 'core/config/useALContext';
import { CrashPage } from 'core/error/error.route';
import useMySnackbar from 'core/snackbar/snackbar.hooks';
import { LoadingPage } from 'layout/auth/loading/loading.route';
import { LogoutPage } from 'layout/auth/log-out/log-out.route';
import { ToSPage } from 'layout/auth/terms-of-service/terms-of-service.route';
import useDrawer from 'layout/drawer/drawer.hooks';
import { lazy, memo, Suspense, useEffect, useState } from 'react';
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router';
import { AdminActionsPage } from 'routes/admin-actions/admin-actions.route';
import { AdminAPIKeyDetailPage } from 'routes/admin-api-key-detail/admin-api-key-detail.route';
import { AdminAPIKeysPage } from 'routes/admin-api-keys/admin-api-keys.route';
import { AdminErrorDetailPage } from 'routes/admin-error-detail/admin-error-detail.route';
import { AdminErrorViewerPage } from 'routes/admin-error-viewer/admin-error-viewer.route';
import { AdminIdentifyPage } from 'routes/admin-identify/admin-identify.route';
import { AdminServiceDetailPage } from 'routes/admin-service-detail/admin-service-detail.route';
import { AdminServiceReviewPage } from 'routes/admin-service-review/admin-service-review.route';
import { AdminServicesPage } from 'routes/admin-services/admin-services.route';
import { AdminSiteMapPage } from 'routes/admin-sitemap/admin-sitemap.route';
import { AdminTagSafelistPage } from 'routes/admin-tag-safelist/admin-tag-safelist.route';
import { AdminUsersPage } from 'routes/admin-users/admin-users.route';
import { AdminPage } from 'routes/admin/admin.route';
import { AlertDetailPage } from 'routes/alert-detail/alert-detail.route';
import { AlertRedirectPage } from 'routes/alert-redirect/alert-redirect.route';
import { AlertsPage } from 'routes/alerts/alerts.route';
import { ArchiveDetailPage } from 'routes/archive-detail/archive-detail.route';
import { ArchivesPage } from 'routes/archives/archives.route';
import { AuthorizePage } from 'routes/authorize/authorize.route';
import { DashboardPage } from 'routes/dashboard/dashboard.route';
import { FileDetailPage } from 'routes/file-detail/file-detail.route';
import { FileViewerPage } from 'routes/file-viewer/file-viewer.route';
import { ForbiddenPage } from 'routes/forbidden/forbidden.page';
import { HelpAPIPage } from 'routes/help-api/help-api.route';
import { HelpClassificationPage } from 'routes/help-classification/help-classification.route';
import { HelpConfigurationPage } from 'routes/help-configuration/help-configuration.route';
import { HelpSearchPage } from 'routes/help-search/help-search.route';
import { HelpServicesPage } from 'routes/help-services/help-services.route';
import { HelpPage } from 'routes/help/help.route';
import { ManageBadlistDetailPage } from 'routes/manage-badlist-detail/manage-badlist-detail.route';
import { ManageBadlistsPage } from 'routes/manage-badlists/manage-badlists.route';
import { ManageHeuristicDetailPage } from 'routes/manage-heuristic-detail/manage-heuristic-detail.route';
import { ManageHeuristicsPage } from 'routes/manage-heuristics/manage-heuristics.route';
import { ManageSafelistDetailPage } from 'routes/manage-safelist-detail/manage-safelist-detail.route';
import { ManageSafelistsPage } from 'routes/manage-safelists/manage-safelists.route';
import { ManageSignatureDetailPage } from 'routes/manage-signature-detail/manage-signature-detail.route';
import { ManageSignatureSourcesPage } from 'routes/manage-signature-sources/manage-signature-sources.route';
import { ManageSignaturesPage } from 'routes/manage-signatures/manage-signatures.route';
import { ManageWorkflowCreatePage } from 'routes/manage-workflow-create/manage-workflow-create.route';
import { ManageWorkflowDetailPage } from 'routes/manage-workflow-detail/manage-workflow-detail.route';
import { ManageWorkflowsPage } from 'routes/manage-workflows/manage-workflows.route';
import { ManagePage } from 'routes/manage/manage.route';
import { NotFoundPage } from 'routes/not-found/not-found.route';
import { RetrohuntDetailPage } from 'routes/retrohunt-detail/retrohunt-detail.route';
import { RetrohuntPage } from 'routes/retrohunt/retrohunt.route';
import { SearchPage } from 'routes/search/search.route';
import { SettingsPage } from 'routes/settings/settings.route';
import { SubmissionDetailPage } from 'routes/submission-detail/submission-detail.route';
import { SubmissionRedirectPage } from 'routes/submission-redirect/submission-redirect.route';
import { SubmissionReportPage } from 'routes/submission-report/submission-report.route';
import { SubmissionsPage } from 'routes/submissions/submissions.route';
import { SubmitPage } from 'routes/submit/submit.route';
import { AccountPage, UserPage } from 'routes/user/user.route';
import { resetFavicon } from 'shared/utils/utils';

const DevelopmentAPIPage = lazy(() =>
  import('routes/development-api/development-api.route').then(module => ({ default: module.DevelopmentAPIPage }))
);
const DevelopmentCustomizePage = lazy(() =>
  import('routes/development-customize/development-customize.route').then(module => ({
    default: module.DevelopmentCustomizePage
  }))
);
const DevelopmentLibraryPage = lazy(() =>
  import('routes/development-library/development-library.route').then(module => ({
    default: module.DevelopmentLibraryPage
  }))
);
const DevelopmentThemePage = lazy(() =>
  import('routes/development-theme/development-theme.route').then(module => ({ default: module.DevelopmentThemePage }))
);

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
    <Suspense fallback={<LoadingPage showImage={false} />}>
      <RouteActions />
      <Routes>
        <Route path="/" element={<SubmitPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/actions" element={<AdminActionsPage />} />
        <Route path="/admin/apikeys" element={<AdminAPIKeysPage />} />
        <Route path="/admin/apikeys/:id" element={<AdminAPIKeyDetailPage />} />
        <Route path="/admin/errors" element={<AdminErrorViewerPage />} />
        <Route path="/admin/errors/:key" element={<AdminErrorDetailPage />} />
        <Route path="/admin/identify" element={<AdminIdentifyPage />} />
        <Route path="/admin/service_review" element={<AdminServiceReviewPage />} />
        <Route path="/admin/services" element={<AdminServicesPage />} />
        <Route path="/admin/services/:svc" element={<AdminServiceDetailPage />} />
        <Route path="/admin/sitemap" element={<AdminSiteMapPage />} />
        <Route path="/admin/tag_safelist" element={<AdminTagSafelistPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/:id" element={<UserPage />} />
        <Route path="/alerts_redirect" element={<AlertRedirectPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/alerts/:id" element={<AlertDetailPage />} />
        <Route path="/archive" element={<ArchivesPage />} />
        <Route path="/archive/:id" element={<ArchiveDetailPage />} />
        <Route path="/archive/:id/:tab" element={<ArchiveDetailPage />} />
        <Route path="/authorize" element={<AuthorizePage />} />
        <Route path="/crash" element={<CrashPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/development/api" element={<DevelopmentAPIPage />} />
        <Route path="/development/customize" element={<DevelopmentCustomizePage />} />
        <Route path="/development/library" element={<DevelopmentLibraryPage />} />
        <Route path="/development/theme" element={<DevelopmentThemePage />} />
        <Route path="/file/detail/:id" element={<FileDetailPage />} />
        <Route path="/file/viewer/:id" element={<FileViewerPage />} />
        <Route path="/file/viewer/:id/:tab" element={<FileViewerPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/api" element={<HelpAPIPage />} />
        <Route path="/help/classification" element={<HelpClassificationPage />} />
        <Route path="/help/configuration" element={<HelpConfigurationPage />} />
        <Route path="/help/search" element={<HelpSearchPage />} />
        <Route path="/help/services" element={<HelpServicesPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/manage/badlist" element={<ManageBadlistsPage />} />
        <Route path="/manage/badlist/:id" element={<ManageBadlistDetailPage />} />
        <Route path="/manage/heuristic/:id" element={<ManageHeuristicDetailPage />} />
        <Route path="/manage/heuristics" element={<ManageHeuristicsPage />} />
        <Route path="/manage/safelist" element={<ManageSafelistsPage />} />
        <Route path="/manage/safelist/:id" element={<ManageSafelistDetailPage />} />
        <Route path="/manage/signature/:id" element={<ManageSignatureDetailPage />} />
        <Route path="/manage/signature/:type/:source/:name" element={<ManageSignatureDetailPage />} />
        <Route path="/manage/signatures" element={<ManageSignaturesPage />} />
        <Route path="/manage/sources" element={<ManageSignatureSourcesPage />} />
        <Route path="/manage/workflow/create/:id" element={<ManageWorkflowCreatePage />} />
        <Route path="/manage/workflow/detail/:id" element={<ManageWorkflowDetailPage />} />
        <Route path="/manage/workflows" element={<ManageWorkflowsPage />} />
        <Route path="/notfound" element={<NotFoundPage />} />
        <Route path="/retrohunt" element={<RetrohuntPage />} />
        <Route path="/retrohunt/:key" element={<RetrohuntDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/:id" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/:tab" element={<SettingsPage />} />
        <Route path="/submission/:id" element={<SubmissionRedirectPage />} />
        <Route path="/submission/detail/:id" element={<SubmissionDetailPage />} />
        <Route path="/submission/detail/:id/:fid" element={<SubmissionDetailPage />} />
        <Route path="/submission/report/:id" element={<SubmissionReportPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/tos" element={<ToSPage />} />
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
