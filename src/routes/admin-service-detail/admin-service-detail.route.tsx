import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, CircularProgress, Paper, Skeleton, Tab, useTheme } from '@mui/material';
import { invalidateApiQuery } from 'core/api';
import { useAppBlocker, useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams } from 'core/routes';
import { AppPageCenter } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { JSONFeedItem } from 'layout/notifications';
import { fetchJSONNotifications } from 'layout/notifications/notifications.utils';
import type { ServiceConstants, Service as ServiceData } from 'models/base/service';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceContainer from 'routes/admin-service-detail/components/container';
import ServiceGeneral from 'routes/admin-service-detail/components/general';
import ServiceParams from 'routes/admin-service-detail/components/parameters';
import ServiceUpdater from 'routes/admin-service-detail/components/updater';
import { getVersionQuery } from 'shared/utils/utils';
import { IconButton } from 'ui/buttons/IconButton';
import ConfirmationDialog from 'ui/ConfirmationDialog';
import CustomChip from 'ui/CustomChip';
import Empty from 'ui/Empty';
import { PageHeader } from 'ui/layouts/PageHeader';

type TabType = 'general' | 'docker' | 'updater' | 'params';

export const AdminServiceDetailPage = memo(() => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const navigate = useAppNavigate();
  const { svc } = useAppPathParams<'/admin/services/:svc'>();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [service, setService] = useState<ServiceData>(null);
  const [serviceDefault, setServiceDefault] = useState<ServiceData>(null);
  const [serviceVersion, setServiceVersion] = useState<string>(null);
  const [serviceGeneralError, setServiceGeneralError] = useState<boolean>(false);
  const [overallError, setOverallError] = useState<boolean>(false);
  const [constants, setConstants] = useState<ServiceConstants>(null);
  const [versions, setVersions] = useState<string[]>(null);
  const [tab, setTab] = useState<TabType>('general');
  const [modified, setModified] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [serviceFeeds, setServiceFeeds] = useState<JSONFeedItem[]>(null);

  const serviceNames = useMemo<string[]>(
    () =>
      (serviceFeeds || [])
        .reduce((prev: string[], item) => (item?.summary ? [...prev, item.summary] : prev), [])
        .sort(),
    [serviceFeeds]
  );

  const nameOrSvc = useMemo<string>(() => svc, [svc]);

  const isSaveDisabled = useMemo<boolean>(
    () => overallError || buttonLoading || !modified,
    [overallError, buttonLoading, modified]
  );

  useAppBlocker(() => (modified ? 'unsaved_changes' : null), [modified]);

  const handleTabChange = useCallback((event, newValue) => {
    setTab(newValue as TabType);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDeleteDialog(false);
  }, []);

  const handleSaveService = useCallback(() => {
    apiCall({
      url: `/api/v4/service/${nameOrSvc}/`,
      method: 'POST',
      body: service,
      onSuccess: () => {
        setModified(false);
        showSuccessMessage(t('save.success'));
        if (svc) setTimeout(() => navigate.here().closePanel(true), 1000);
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadServicesEvent')), 1000);
        invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 3000);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameOrSvc, service, showSuccessMessage, t]);

  const handleExecuteDeleteButtonClick = useCallback(() => {
    handleCloseDialog();
    apiCall({
      url: `/api/v4/service/${nameOrSvc}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        if (svc) setTimeout(() => navigate.here().closePanel(true), 1000);
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadServicesEvent')), 1000);
        invalidateApiQuery(({ url }) => '/api/v4/user/whoami/' === url, 3000);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCloseDialog, nameOrSvc, showSuccessMessage, t, svc]);

  const handleDeleteButtonClick = useCallback(() => {
    setDeleteDialog(true);
  }, []);

  const handleToggleEnabled = useCallback(() => {
    setModified(true);
    setService(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  useEffect(() => {
    // Reset tab because we are using a different service
    setTab('general');
    setModified(false);

    // Load user on start
    if (currentUser.is_admin) {
      apiCall<ServiceData>({
        url: `/api/v4/service/${nameOrSvc}/`,
        onEnter: () => {
          setService(null);
          setServiceVersion(null);
        },
        onSuccess: api_data => {
          setService(api_data.api_response);
          setServiceVersion(api_data.api_response.version);
        }
      });
      apiCall<string[]>({
        url: `/api/v4/service/versions/${nameOrSvc}/`,
        onEnter: () => setVersions(null),
        onSuccess: api_data => setVersions(api_data.api_response)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, nameOrSvc]);

  useEffect(() => {
    // Load user on start
    if (currentUser.is_admin && serviceVersion) {
      apiCall<ServiceData>({
        url: `/api/v4/service/${nameOrSvc}/${serviceVersion}/`,
        onEnter: () => setServiceDefault(null),
        onSuccess: ({ api_response }) => setServiceDefault(api_response)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, service?.name || '', serviceVersion]);

  useEffect(() => {
    // Set the global error flag based on each sub-error value
    setOverallError(serviceGeneralError);
  }, [serviceGeneralError]);

  useEffect(() => {
    // Load constants on page load
    if (!currentUser.is_admin) return;
    apiCall<ServiceConstants>({
      url: '/api/v4/service/constants/',
      onEnter: () => setConstants(null),
      onSuccess: ({ api_response }) => setConstants(api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin]);

  useEffect(() => {
    fetchJSONNotifications({
      urls: configuration?.ui?.services_feed ? [configuration?.ui?.services_feed] : [],
      onSuccess: values => setServiceFeeds(values)
    });
  }, [configuration?.ui?.services_feed, fetchJSONNotifications, setServiceFeeds]);

  return (
    <AppPageCenter>
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={handleExecuteDeleteButtonClick}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={buttonLoading}
      />

      <PageHeader
        primary={() => service.name}
        secondary={t('title.detail')}
        primaryLoading={!service}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          <>
            <IconButton
              loading={!service}
              size="large"
              sx={{ color: theme.palette.action.active }}
              tooltip={t('errors')}
              nav={nav =>
                nav.to().create({
                  route: '/admin/errors',
                  search: { filters: [`response.service_name:${service?.name}`, getVersionQuery(service?.version)] }
                })
              }
              navDeps={[service?.name, service?.version]}
            >
              <ErrorOutlineOutlinedIcon />
            </IconButton>

            <IconButton
              loading={!service}
              size="large"
              sx={{ color: theme.palette.action.active }}
              nav={nav =>
                nav.to().create({
                  route: '/admin/service_review',
                  search: { service: service?.name, v1: service?.version }
                })
              }
              navDeps={[service?.name, service?.version]}
              tooltip={t('compare')}
            >
              <CompareArrowsOutlinedIcon />
            </IconButton>

            <IconButton
              loading={!service}
              size="large"
              tooltip={t('remove')}
              onClick={handleDeleteButtonClick}
              sx={{
                color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
              }}
            >
              <RemoveCircleOutlineOutlinedIcon />
            </IconButton>
          </>
        }
      />

      {service ? (
        <CustomChip
          type="rounded"
          color={service.enabled ? 'primary' : 'default'}
          onClick={handleToggleEnabled}
          label={service.enabled ? t('enabled') : t('disabled')}
          fullWidth
          style={{ marginBottom: theme.spacing(2) }}
        />
      ) : (
        <Skeleton variant="rectangular" height="2.5rem" style={{ marginBottom: theme.spacing(1) }} />
      )}

      {service ? (
        <TabContext value={tab}>
          <Paper
            square
            style={{ backgroundColor: svc ? theme.palette.background.default : theme.palette.background.paper }}
          >
            <TabList
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={t('tab.general')} value="general" />
              <Tab label={t('tab.docker')} value="docker" />
              {service.update_config ? <Tab label={t('tab.updater')} value="updater" /> : <Empty />}
              <Tab label={t('tab.params')} value="params" />
            </TabList>
          </Paper>
          <TabPanel value="general" sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <ServiceGeneral
              constants={constants}
              defaults={serviceDefault}
              service={service}
              serviceNames={serviceNames}
              versions={versions}
              setError={setServiceGeneralError}
              setModified={setModified}
              setService={setService}
              setServiceVersion={setServiceVersion}
            />
          </TabPanel>
          <TabPanel value="docker" sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <ServiceContainer
              service={service}
              defaults={serviceDefault}
              setService={setService}
              setModified={setModified}
            />
          </TabPanel>
          {service.update_config && (
            <TabPanel value="updater" sx={{ paddingLeft: 0, paddingRight: 0 }}>
              <ServiceUpdater
                service={service}
                defaults={serviceDefault}
                setService={setService}
                setModified={setModified}
              />
            </TabPanel>
          )}
          <TabPanel value="params" sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <ServiceParams
              service={service}
              defaults={serviceDefault}
              setService={setService}
              setModified={setModified}
            />
          </TabPanel>
        </TabContext>
      ) : (
        <Skeleton variant="rectangular" height="10rem" />
      )}

      {service && modified ? (
        <div
          style={{
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            textAlign: 'center',
            zIndex: theme.zIndex.drawer - 1,
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[4]
          }}
        >
          <Button variant="contained" color="primary" disabled={isSaveDisabled} onClick={handleSaveService}>
            {t('save')}
            {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
          </Button>
        </div>
      ) : null}
    </AppPageCenter>
  );
});

export const AdminServiceDetailRoute = createAppRoute({
  component: AdminServiceDetailPage,

  path: '/admin/services/:svc',
  params: s => ({
    svc: s.string()
  }),

  ancestor: '/admin/services',
  shortname: location => ({ i18nKey: location?.path?.svc ?? 'breadcrumb.service.detail', ns: 'app' }),
  fullname: () => ({ i18nKey: 'breadcrumb.service.detail', ns: 'app' }),
  shorticon: () => <WebAssetIcon />,
  fullicon: () => <WebAssetIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin
});
